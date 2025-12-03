import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Plus, Loader2, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { addDays, format } from "date-fns";

interface SmartScheduleSuggestionsProps {
  weather: any;
  onScheduleCreated: () => void;
}

const SmartScheduleSuggestions = ({ weather, onScheduleCreated }: SmartScheduleSuggestionsProps) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (weather) {
      generateSuggestions();
    }
  }, [weather]);

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's plants from both tables
      const [userPlantsResult, scansResult] = await Promise.all([
        supabase.from("user_plants").select("*").eq("user_id", user.id),
        supabase.from("plant_scans").select("*").eq("user_id", user.id)
      ]);

      // Combine plants from both sources
      const userPlants = (userPlantsResult.data || []).map(p => ({
        ...p,
        source: 'user_plants'
      }));
      const scannedPlants = (scansResult.data || [])
        .filter(s => s.plant_type)
        .map(s => ({
          id: s.id,
          nickname: s.custom_name || s.plant_type || 'Unknown',
          species: s.plant_type || 'Unknown',
          source: 'plant_scans'
        }));
      
      const plants = [...userPlants, ...scannedPlants];

      if (plants.length === 0) {
        setSuggestions([]);
        return;
      }

      // Generate AI-powered suggestions based on weather and plant data
      const newSuggestions = [];

      // Weather-based watering suggestions
      if (weather.temperature > 25 || weather.humidity < 40) {
        for (const plant of plants.slice(0, 3)) {
          newSuggestions.push({
            plant_id: plant.id,
            plant_name: plant.nickname,
            task_type: "watering",
            title: `Water ${plant.nickname}`,
            description: `High temperature (${weather.temperature}°C) detected. Increase watering frequency.`,
            suggested_date: new Date(),
            priority: "high",
            reason: "Weather-adjusted",
          });
        }
      }

      // Humidity-based air circulation
      if (weather.humidity > 70) {
        for (const plant of plants.slice(0, 2)) {
          newSuggestions.push({
            plant_id: plant.id,
            plant_name: plant.nickname,
            task_type: "pest_control",
            title: `Check ${plant.nickname} for fungal issues`,
            description: "High humidity increases fungal disease risk. Ensure good air circulation.",
            suggested_date: addDays(new Date(), 1),
            priority: "medium",
            reason: "Humidity alert",
          });
        }
      }

      // Regular maintenance suggestions
      for (const plant of plants) {
        // Fertilizing schedule (monthly)
        newSuggestions.push({
          plant_id: plant.id,
          plant_name: plant.nickname,
          task_type: "fertilizing",
          title: `Fertilize ${plant.nickname}`,
          description: "Monthly fertilization for optimal growth",
          suggested_date: addDays(new Date(), 7),
          priority: "low",
          reason: "Routine care",
        });
      }

      setSuggestions(newSuggestions.slice(0, 5));
    } catch (error) {
      console.error("Error generating suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  const createTaskFromSuggestion = async (suggestion: any) => {
    setCreating(suggestion.plant_id + suggestion.task_type);
    try {
      const { error } = await supabase
        .from("care_tasks")
        .insert({
          plant_id: suggestion.plant_id,
          task_type: suggestion.task_type,
          title: suggestion.title,
          description: suggestion.description,
          due_date: suggestion.suggested_date.toISOString(),
          priority: suggestion.priority,
          status: "pending",
        });

      if (error) throw error;

      toast({
        title: "Task added to calendar!",
        description: `${suggestion.title} has been scheduled`,
      });

      // Remove suggestion from list
      setSuggestions(suggestions.filter((s) => 
        s.plant_id !== suggestion.plant_id || s.task_type !== suggestion.task_type
      ));

      onScheduleCreated();
    } catch (error) {
      console.error("Error creating task:", error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    } finally {
      setCreating(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0) return null;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          AI Care Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="flex items-start justify-between p-4 bg-card rounded-lg border hover:shadow-md transition-shadow"
          >
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{suggestion.title}</h4>
                <Badge
                  variant={
                    suggestion.priority === "high"
                      ? "destructive"
                      : suggestion.priority === "medium"
                      ? "secondary"
                      : "outline"
                  }
                  className="text-xs"
                >
                  {suggestion.priority}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {suggestion.reason}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {suggestion.description}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                Suggested: {format(suggestion.suggested_date, "MMM d, yyyy")}
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => createTaskFromSuggestion(suggestion)}
              disabled={creating === suggestion.plant_id + suggestion.task_type}
              className="ml-4 gap-2"
            >
              {creating === suggestion.plant_id + suggestion.task_type ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add
                </>
              )}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SmartScheduleSuggestions;
