import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { 
  Activity, Plus, Heart, Thermometer, 
  Loader2, Smile, Meh, Frown, AlertTriangle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface PlantHealthLogProps {
  plantId: string;
  plantName: string;
}

interface HealthLog {
  id: string;
  health_rating: number | null;
  mood: string | null;
  notes: string | null;
  detected_issues: string[] | null;
  created_at: string;
}

const MOODS = [
  { value: "thriving", label: "Thriving", icon: Smile, color: "text-green-500" },
  { value: "healthy", label: "Healthy", icon: Smile, color: "text-emerald-500" },
  { value: "okay", label: "Okay", icon: Meh, color: "text-yellow-500" },
  { value: "struggling", label: "Struggling", icon: Frown, color: "text-orange-500" },
  { value: "critical", label: "Critical", icon: AlertTriangle, color: "text-red-500" },
];

const PlantHealthLog = ({ plantId, plantName }: PlantHealthLogProps) => {
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newLog, setNewLog] = useState({
    health_rating: 7,
    mood: "healthy",
    notes: "",
  });

  useEffect(() => {
    loadLogs();
  }, [plantId]);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('plant_health_logs')
        .select('*')
        .eq('plant_id', plantId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error loading health logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLog = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to log health");
        return;
      }

      const { error } = await supabase
        .from('plant_health_logs')
        .insert({
          plant_id: plantId,
          user_id: user.id,
          health_rating: newLog.health_rating,
          mood: newLog.mood,
          notes: newLog.notes || null,
        });

      if (error) throw error;

      toast.success("Health log recorded! 🌿");
      setShowAddForm(false);
      setNewLog({ health_rating: 7, mood: "healthy", notes: "" });
      loadLogs();
    } catch (error) {
      console.error('Error creating log:', error);
      toast.error("Failed to save health log");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMoodInfo = (mood: string) => {
    return MOODS.find(m => m.value === mood) || MOODS[1];
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return "text-green-500";
    if (rating >= 6) return "text-emerald-500";
    if (rating >= 4) return "text-yellow-500";
    if (rating >= 2) return "text-orange-500";
    return "text-red-500";
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add Log Form */}
      {showAddForm ? (
        <Card className="border-primary/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5" />
              New Health Check
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Health Rating */}
            <div>
              <label className="text-sm font-medium mb-3 flex items-center justify-between">
                <span>Health Rating</span>
                <span className={`font-bold text-lg ${getRatingColor(newLog.health_rating)}`}>
                  {newLog.health_rating}/10
                </span>
              </label>
              <Slider
                value={[newLog.health_rating]}
                onValueChange={([v]) => setNewLog(p => ({ ...p, health_rating: v }))}
                min={1}
                max={10}
                step={1}
                className="mt-2"
              />
            </div>

            {/* Mood Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">How does it look?</label>
              <div className="flex gap-2 flex-wrap">
                {MOODS.map(mood => {
                  const Icon = mood.icon;
                  return (
                    <Button
                      key={mood.value}
                      type="button"
                      variant={newLog.mood === mood.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNewLog(p => ({ ...p, mood: mood.value }))}
                      className="gap-1.5"
                    >
                      <Icon className={`w-4 h-4 ${newLog.mood === mood.value ? '' : mood.color}`} />
                      {mood.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium mb-2 block">Notes (optional)</label>
              <Textarea
                placeholder="Any observations about your plant..."
                value={newLog.notes}
                onChange={(e) => setNewLog(p => ({ ...p, notes: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleCreateLog} disabled={isSubmitting} className="flex-1">
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Save Health Check
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button onClick={() => setShowAddForm(true)} className="w-full gap-2">
          <Plus className="w-4 h-4" />
          Log Health Check
        </Button>
      )}

      {/* Health Logs List */}
      {logs.length > 0 ? (
        <div className="space-y-3">
          {logs.map((log) => {
            const moodInfo = getMoodInfo(log.mood || 'healthy');
            const MoodIcon = moodInfo.icon;
            
            return (
              <Card key={log.id}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MoodIcon className={`w-5 h-5 ${moodInfo.color}`} />
                      <span className="font-medium capitalize">{moodInfo.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {log.health_rating && (
                        <Badge variant="outline" className={getRatingColor(log.health_rating)}>
                          <Heart className="w-3 h-3 mr-1" />
                          {log.health_rating}/10
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(log.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                  {log.notes && (
                    <p className="text-sm text-muted-foreground">{log.notes}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : !showAddForm && (
        <Card>
          <CardContent className="pt-6 text-center py-8">
            <Activity className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No health logs yet</p>
            <p className="text-sm text-muted-foreground">Start tracking your plant's health over time</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PlantHealthLog;
