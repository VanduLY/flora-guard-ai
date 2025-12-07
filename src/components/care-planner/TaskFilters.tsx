import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TaskFiltersProps {
  filters: {
    plantId: string | null;
    taskType: string | null;
    priority: string | null;
  };
  onFiltersChange: (filters: any) => void;
}

const TASK_TYPES = [
  { value: "watering", label: "Watering" },
  { value: "fertilizing", label: "Fertilizing" },
  { value: "pruning", label: "Pruning" },
  { value: "repotting", label: "Repotting" },
  { value: "pest_control", label: "Pest Control" },
  { value: "sunlight", label: "Sunlight" },
];

const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const TaskFilters = ({ filters, onFiltersChange }: TaskFiltersProps) => {
  const [plants, setPlants] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    loadPlants();
  }, []);

  const loadPlants = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load from both user_plants and plant_scans
      const [userPlantsResult, scansResult] = await Promise.all([
        supabase
          .from("user_plants")
          .select("id, nickname, species")
          .eq("user_id", user.id)
          .order("nickname"),
        supabase
          .from("plant_scans")
          .select("id, custom_name, plant_type")
          .eq("user_id", user.id)
      ]);

      const userPlants = userPlantsResult.data || [];
      const scannedPlants = (scansResult.data || [])
        .filter(s => s.plant_type)
        .map(s => ({
          id: s.id,
          nickname: s.custom_name || s.plant_type || 'Unknown',
          species: s.plant_type || 'Unknown'
        }));

      setPlants([...userPlants, ...scannedPlants]);
    } catch (error) {
      console.error("Error loading plants:", error);
    }
  };

  const hasActiveFilters = filters.plantId || filters.taskType || filters.priority;

  const clearFilters = () => {
    onFiltersChange({
      plantId: null,
      taskType: null,
      priority: null,
    });
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 px-2 py-0.5 bg-primary text-primary-foreground rounded-full text-xs">
                {[filters.plantId, filters.taskType, filters.priority].filter(Boolean).length}
              </span>
            )}
          </Button>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
              Clear
            </Button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Plant Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Plant</label>
              <Select
                value={filters.plantId || "all"}
                onValueChange={(value) =>
                  onFiltersChange({ ...filters, plantId: value === "all" ? null : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All plants" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All plants</SelectItem>
                  {plants.map((plant) => (
                    <SelectItem key={plant.id} value={plant.id}>
                      {plant.nickname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Task Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Task Type</label>
              <Select
                value={filters.taskType || "all"}
                onValueChange={(value) =>
                  onFiltersChange({ ...filters, taskType: value === "all" ? null : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {TASK_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select
                value={filters.priority || "all"}
                onValueChange={(value) =>
                  onFiltersChange({ ...filters, priority: value === "all" ? null : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  {PRIORITIES.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskFilters;
