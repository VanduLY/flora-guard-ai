import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, TrendingUp, Ruler, Plus, ArrowUpRight, Loader2 } from "lucide-react";
import { format } from "date-fns";
import AddMilestoneDialog from "./AddMilestoneDialog";
import PhotoComparison from "./PhotoComparison";
import GrowthChart from "./GrowthChart";

interface Milestone {
  id: string;
  plant_id: string;
  milestone_type: string;
  title: string;
  description?: string;
  measurement_value?: number;
  measurement_unit?: string;
  photo_url?: string;
  created_at: string;
}

interface PhotoTimelineProps {
  plantId: string;
  plantName: string;
}

const PhotoTimeline = ({ plantId, plantName }: PhotoTimelineProps) => {
  const { toast } = useToast();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedComparison, setSelectedComparison] = useState<[Milestone, Milestone] | null>(null);

  useEffect(() => {
    loadMilestones();
  }, [plantId]);

  const loadMilestones = async () => {
    try {
      const { data, error } = await supabase
        .from("growth_milestones")
        .select("*")
        .eq("plant_id", plantId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMilestones(data || []);
    } catch (error: any) {
      console.error("Error loading milestones:", error);
      toast({
        title: "Error loading timeline",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getMilestoneIcon = (type: string) => {
    switch (type) {
      case "measurement":
        return <Ruler className="w-4 h-4" />;
      case "photo":
        return <Camera className="w-4 h-4" />;
      case "growth":
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <ArrowUpRight className="w-4 h-4" />;
    }
  };

  const getMilestoneColor = (type: string) => {
    switch (type) {
      case "measurement":
        return "bg-blue-500/20 text-blue-600 dark:text-blue-400";
      case "photo":
        return "bg-purple-500/20 text-purple-600 dark:text-purple-400";
      case "growth":
        return "bg-green-500/20 text-green-600 dark:text-green-400";
      default:
        return "bg-gray-500/20 text-gray-600 dark:text-gray-400";
    }
  };

  const milestonesWithPhotos = milestones.filter(m => m.photo_url);
  const measurementMilestones = milestones.filter(m => m.measurement_value);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Growth Journey</h2>
          <p className="text-muted-foreground">Track {plantName}'s progress over time</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Milestone
        </Button>
      </div>

      {/* Growth Chart */}
      {measurementMilestones.length > 0 && (
        <GrowthChart milestones={measurementMilestones} />
      )}

      {/* Photo Comparison */}
      {milestonesWithPhotos.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Compare Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <PhotoComparison
              milestones={milestonesWithPhotos}
              onCompare={(m1, m2) => setSelectedComparison([m1, m2])}
            />
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Timeline</h3>
        {milestones.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No milestones yet</p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Milestone
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <Card key={milestone.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Photo */}
                    {milestone.photo_url && (
                      <div className="md:w-1/3 relative">
                        <img
                          src={milestone.photo_url}
                          alt={milestone.title}
                          className="w-full h-48 md:h-full object-cover"
                        />
                        {index === 0 && (
                          <Badge className="absolute top-3 left-3 bg-primary">
                            Latest
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-lg font-semibold mb-1">
                            {milestone.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(milestone.created_at), "MMMM d, yyyy")}
                          </p>
                        </div>
                        <Badge className={getMilestoneColor(milestone.milestone_type)}>
                          <span className="flex items-center gap-1">
                            {getMilestoneIcon(milestone.milestone_type)}
                            {milestone.milestone_type}
                          </span>
                        </Badge>
                      </div>

                      {milestone.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {milestone.description}
                        </p>
                      )}

                      {milestone.measurement_value && (
                        <div className="flex items-center gap-2 text-sm">
                          <Ruler className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">
                            {milestone.measurement_value} {milestone.measurement_unit}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Milestone Dialog */}
      <AddMilestoneDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        plantId={plantId}
        plantName={plantName}
        onMilestoneAdded={loadMilestones}
      />
    </div>
  );
};

export default PhotoTimeline;
