import { useState, useRef, useEffect } from "react";
import { Camera, Loader2, X, CameraOff } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface KanCameraFeedProps {
  onAnalysisComplete: (result: any) => void;
  onAnalyzing: (analyzing: boolean) => void;
}

const KanCameraFeed = ({ onAnalysisComplete, onAnalyzing }: KanCameraFeedProps) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error("Camera error:", err);
      setError("Failed to access camera. Please check permissions.");
      toast({
        title: "Camera Error",
        description: "Failed to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL("image/jpeg", 0.8);
    setCapturedImage(imageData);
    setCapturing(true);
    stopCamera();
  };

  const analyzeImage = async () => {
    if (!capturedImage) return;

    try {
      setAnalyzing(true);
      onAnalyzing(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to analyze plants",
          variant: "destructive",
        });
        return;
      }

      // Convert base64 to blob
      const base64Data = capturedImage.split(",")[1];
      const blob = await fetch(capturedImage).then((r) => r.blob());
      
      // Upload to storage
      const fileName = `${user.id}/${Date.now()}-camera-capture.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("plant-images")
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("plant-images")
        .getPublicUrl(fileName);

      // Analyze with AI
      const { data, error } = await supabase.functions.invoke("kan-analyze-plant", {
        body: { imageUrl: publicUrl },
      });

      if (error) throw error;

      // Save scan to database
      await supabase.from("plant_scans").insert({
        user_id: user.id,
        image_url: publicUrl,
        plant_type: data.plantType,
        health_status: data.healthStatus,
        disease_detected: data.diseaseDetected,
        confidence_score: data.confidenceScore,
        diagnosis: data.diagnosis,
        recommendations: data.recommendations,
      });

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
      setAnalyzing(false);
      onAnalyzing(false);
    }
  };

  const retake = () => {
    setCapturedImage(null);
    setCapturing(false);
    startCamera();
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-8 shadow-soft"
    >
      <div className="space-y-4">
        {error ? (
          <div className="flex flex-col items-center gap-4 p-12 border-2 border-dashed border-border rounded-xl">
            <CameraOff className="w-16 h-16 text-muted-foreground" />
            <p className="text-foreground font-medium">{error}</p>
            <Button onClick={startCamera}>
              <Camera className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        ) : !stream && !capturedImage ? (
          <div className="flex flex-col items-center gap-4 p-12 border-2 border-dashed border-border rounded-xl">
            <Camera className="w-16 h-16 text-primary" />
            <p className="text-foreground font-medium">Start your camera to capture plant photos</p>
            <Button onClick={startCamera} size="lg">
              <Camera className="w-5 h-5 mr-2" />
              Start Camera
            </Button>
          </div>
        ) : capturedImage ? (
          <div className="space-y-4">
            <div className="relative rounded-xl overflow-hidden">
              <img src={capturedImage} alt="Captured" className="w-full" />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={analyzeImage}
                disabled={analyzing}
                className="flex-1"
                size="lg"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5 mr-2" />
                    Analyze Plant
                  </>
                )}
              </Button>
              <Button onClick={retake} variant="outline" size="lg">
                <X className="w-5 h-5 mr-2" />
                Retake
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-xl overflow-hidden bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full"
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={captureImage} className="flex-1" size="lg">
                <Camera className="w-5 h-5 mr-2" />
                Capture Photo
              </Button>
              <Button onClick={stopCamera} variant="outline" size="lg">
                <X className="w-5 h-5 mr-2" />
                Stop Camera
              </Button>
            </div>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </motion.div>
  );
};

export default KanCameraFeed;
