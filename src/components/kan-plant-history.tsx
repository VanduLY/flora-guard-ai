import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Calendar, Leaf, AlertTriangle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "./ui/badge";

interface PlantScan {
  id: string;
  image_url: string;
  plant_type: string | null;
  health_status: string;
  disease_detected: string | null;
  confidence_score: number;
  diagnosis: string | null;
  created_at: string;
}

const KanPlantHistory = () => {
  const navigate = useNavigate();
  const [scans, setScans] = useState<PlantScan[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("plant_scans")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      setScans(data || []);
    } catch (error: any) {
      console.error("Error loading history:", error);
      toast({
        title: "Error",
        description: "Failed to load scan history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-card rounded-2xl p-8 shadow-soft">
        <div className="flex flex-col items-center gap-4 py-12">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading scan history...</p>
        </div>
      </div>
    );
  }

  if (scans.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl p-8 shadow-soft"
      >
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <Leaf className="w-16 h-16 text-muted-foreground" />
          <h3 className="text-xl font-semibold text-foreground">No Scans Yet</h3>
          <p className="text-muted-foreground max-w-md">
            Upload or capture your first plant image to start building your scan history
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-6 shadow-soft"
    >
      <h3 className="text-2xl font-bold text-foreground mb-6">Scan History</h3>
      
      <div className="space-y-4">
        {scans.map((scan, index) => (
          <motion.div
            key={scan.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => navigate(`/scan/${scan.id}`)}
            className="flex gap-4 p-4 bg-background rounded-xl hover:shadow-soft transition-all cursor-pointer hover:bg-accent/50 hover:scale-[1.01]"
          >
            <img
              src={scan.image_url}
              alt="Plant scan"
              className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  {scan.plant_type && (
                    <h4 className="font-semibold text-foreground">{scan.plant_type}</h4>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {scan.health_status === "healthy" ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : scan.health_status === "diseased" ? (
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                    ) : null}
                    <Badge
                      variant={
                        scan.health_status === "healthy"
                          ? "secondary"
                          : scan.health_status === "diseased"
                          ? "destructive"
                          : "outline"
                      }
                      className="capitalize"
                    >
                      {scan.health_status}
                    </Badge>
                    {scan.disease_detected && (
                      <Badge variant="outline">{scan.disease_detected}</Badge>
                    )}
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground flex-shrink-0">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  {new Date(scan.created_at).toLocaleDateString()}
                </div>
              </div>
              
              {scan.diagnosis && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {scan.diagnosis}
                </p>
              )}
              
              {scan.confidence_score && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Confidence: {scan.confidence_score}%
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default KanPlantHistory;
