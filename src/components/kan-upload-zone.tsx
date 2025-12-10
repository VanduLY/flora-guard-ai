import { useState, useCallback } from "react";
import { Upload, Loader2, AlertCircle, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface KanUploadZoneProps {
  onAnalysisComplete: (result: any) => void;
  onAnalyzing: (analyzing: boolean) => void;
}

// Compress image for faster upload and processing
const compressImage = (file: File, maxWidth = 1200, quality = 0.85): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      let { width, height } = img;
      
      // Scale down if needed
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error('Compression failed')),
        'image/jpeg',
        quality
      );
    };
    
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = URL.createObjectURL(file);
  });
};

const KanUploadZone = ({ onAnalysisComplete, onAnalyzing }: KanUploadZoneProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const { toast } = useToast();

  const analyzeImage = async (imageUrl: string) => {
    try {
      setStatus("Detecting diseases...");
      onAnalyzing(true);
      
      const startTime = Date.now();
      const { data, error } = await supabase.functions.invoke("kan-analyze-plant", {
        body: { imageUrl },
      });

      if (error) throw error;

      const clientTime = Date.now() - startTime;

      // Save scan to database
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase.from("plant_scans").insert({
          user_id: user.id,
          image_url: imageUrl,
          plant_type: data.plantType,
          health_status: data.healthStatus,
          disease_detected: data.diseaseDetected,
          confidence_score: data.confidenceScore,
          diagnosis: data.diagnosis,
          recommendations: data.recommendations,
        });
      }

      onAnalysisComplete(data);
      
      const totalTime = (data.processingTimeMs || clientTime) / 1000;
      toast({
        title: "Analysis Complete",
        description: `Scan completed in ${totalTime.toFixed(1)}s`,
      });
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze image",
        variant: "destructive",
      });
    } finally {
      onAnalyzing(false);
      setStatus("");
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid File",
          description: "Please upload an image file",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload an image smaller than 10MB",
          variant: "destructive",
        });
        return;
      }

      setUploading(true);
      setStatus("Optimizing image...");

      try {
        // Compress image for faster upload
        const compressedBlob = await compressImage(file);
        const compressedFile = new File([compressedBlob], file.name, { type: 'image/jpeg' });
        
        // Show preview
        const previewUrl = URL.createObjectURL(compressedBlob);
        setPreview(previewUrl);

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast({
            title: "Authentication Required",
            description: "Please sign in to analyze plants",
            variant: "destructive",
          });
          setUploading(false);
          return;
        }

        setStatus("Uploading...");

        // Upload compressed image
        const fileName = `${user.id}/${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from("plant-images")
          .upload(fileName, compressedFile);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from("plant-images")
          .getPublicUrl(fileName);

        // Analyze the image
        await analyzeImage(publicUrl);
      } catch (error: any) {
        console.error("Upload error:", error);
        toast({
          title: "Upload Failed",
          description: error.message || "Failed to upload image",
          variant: "destructive",
        });
      } finally {
        setUploading(false);
        setStatus("");
      }
    },
    [toast, onAnalysisComplete, onAnalyzing]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
    disabled: uploading,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-8 shadow-soft"
    >
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
          isDragActive
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border hover:border-primary/50 hover:bg-primary/5"
        } ${uploading ? "opacity-70 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center gap-4">
          {uploading ? (
            <>
              <div className="relative">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                <Zap className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-lg font-medium text-foreground">
                {status || "Processing..."}
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <p className="text-sm text-muted-foreground">
                  AI-powered disease detection
                </p>
              </div>
            </>
          ) : preview ? (
            <>
              <img
                src={preview}
                alt="Preview"
                className="max-w-full max-h-64 rounded-lg shadow-medium"
              />
              <p className="text-sm text-muted-foreground">
                Click or drag to scan a different plant
              </p>
            </>
          ) : (
            <>
              <Upload className="w-16 h-16 text-primary" />
              <div>
                <p className="text-lg font-medium text-foreground mb-2">
                  {isDragActive
                    ? "Drop your plant image here"
                    : "Scan your plant for diseases"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Drag & drop or click to select
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {!uploading && (
        <div className="mt-6 flex items-start gap-3 p-4 bg-primary/5 rounded-lg">
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">For best detection:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Clear, well-lit photos work best</li>
              <li>Focus on affected leaves or areas</li>
              <li>Avoid blurry or dark images</li>
            </ul>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default KanUploadZone;
