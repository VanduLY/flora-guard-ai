import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import KanDiseaseResults from "@/components/kan-disease-results";
import KanRecoveryTimeline from "@/components/kan-recovery-timeline";

interface PlantScan {
  id: string;
  image_url: string;
  plant_type: string | null;
  health_status: string;
  disease_detected: string | null;
  confidence_score: number;
  diagnosis: string | null;
  recommendations: string[] | null;
  created_at: string;
}

const ScanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [scan, setScan] = useState<PlantScan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScan();
  }, [id]);

  const loadScan = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from("plant_scans")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      if (!data) {
        toast({
          title: "Not Found",
          description: "Scan not found",
          variant: "destructive",
        });
        navigate("/detect");
        return;
      }

      setScan(data);
    } catch (error: any) {
      console.error("Error loading scan:", error);
      toast({
        title: "Error",
        description: "Failed to load scan details",
        variant: "destructive",
      });
      navigate("/detect");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading scan details...</p>
        </div>
      </div>
    );
  }

  if (!scan) {
    return null;
  }

  // Transform scan data to match KanDiseaseResults format
  const resultData = {
    plantType: scan.plant_type || "Unknown",
    healthStatus: (scan.health_status as "healthy" | "diseased" | "unknown") || "unknown",
    diseaseDetected: scan.disease_detected || undefined,
    confidenceScore: scan.confidence_score,
    diagnosis: scan.diagnosis || "No diagnosis available",
    recommendations: scan.recommendations || [],
    imageUrl: scan.image_url,
  };

  // Determine severity based on health status and confidence
  const getSeverity = (): "mild" | "moderate" | "severe" => {
    if (scan.health_status === "healthy") return "mild";
    if (scan.confidence_score >= 80) return "severe";
    if (scan.confidence_score >= 50) return "moderate";
    return "mild";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button onClick={() => navigate("/detect")} variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Detection
            </Button>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {new Date(scan.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Results */}
            <div>
              <KanDiseaseResults result={resultData} isAnalyzing={false} />
            </div>

            {/* Recovery Timeline */}
            {scan.disease_detected && (
              <div>
                <KanRecoveryTimeline
                  diseaseType={scan.disease_detected}
                  severity={getSeverity()}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanDetail;
