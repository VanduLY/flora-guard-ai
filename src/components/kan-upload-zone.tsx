import { useState, useCallback } from "react";
import { Upload, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface KanUploadZoneProps {
  onAnalysisComplete: (result: any) => void;
  onAnalyzing: (analyzing: boolean) => void;
}

const KanUploadZone = ({ onAnalysisComplete, onAnalyzing }: KanUploadZoneProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const analyzeImage = async (imageUrl: string) => {
    try {
      onAnalyzing(true);
      
      const { data, error } = await supabase.functions.invoke("kan-analyze-plant", {
        body: { imageUrl },
      });

      if (error) throw error;

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
      toast({
        title: "Analysis Complete",
        description: "Your plant has been analyzed successfully",
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
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid File",
          description: "Please upload an image file",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      setUploading(true);
      const reader = new FileReader();

      reader.onload = async (e) => {
        const preview = e.target?.result as string;
        setPreview(preview);

        try {
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

          // Upload to storage
          const fileName = `${user.id}/${Date.now()}-${file.name}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("plant-images")
            .upload(fileName, file);

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
        }
      };

      reader.readAsDataURL(file);
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
            ? "border-primary bg-primary/5 scale-105"
            : "border-border hover:border-primary/50 hover:bg-primary/5"
        } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center gap-4">
          {uploading ? (
            <>
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
              <p className="text-lg font-medium text-foreground">
                Analyzing your plant...
              </p>
              <p className="text-sm text-muted-foreground">
                This may take a few moments
              </p>
            </>
          ) : preview ? (
            <>
              <img
                src={preview}
                alt="Preview"
                className="max-w-full max-h-64 rounded-lg shadow-medium"
              />
              <p className="text-sm text-muted-foreground">
                Click or drag to upload a different image
              </p>
            </>
          ) : (
            <>
              <Upload className="w-16 h-16 text-primary" />
              <div>
                <p className="text-lg font-medium text-foreground mb-2">
                  {isDragActive
                    ? "Drop your plant image here"
                    : "Upload a plant image"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Drag & drop or click to select (Max 5MB)
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
            <p className="font-medium text-foreground mb-1">Best Results Tips:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Take clear, well-lit photos</li>
              <li>Focus on affected leaves or areas</li>
              <li>Include multiple angles if possible</li>
              <li>Avoid blurry or dark images</li>
            </ul>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default KanUploadZone;
