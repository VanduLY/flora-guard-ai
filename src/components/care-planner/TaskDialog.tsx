import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Droplet, Scissors, Leaf, Package, Bug, Sun } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface TaskDialogProps {
  open: boolean;
  onClose: () => void;
  task?: any;
  onSuccess: () => void;
}

const TASK_TYPES = [
  { value: "watering", label: "Watering", icon: Droplet },
  { value: "fertilizing", label: "Fertilizing", icon: Leaf },
  { value: "pruning", label: "Pruning", icon: Scissors },
  { value: "repotting", label: "Repotting", icon: Package },
  { value: "pest_control", label: "Pest Control", icon: Bug },
  { value: "sunlight", label: "Sunlight Adjustment", icon: Sun },
];

const PRIORITY_LEVELS = [
  { value: "low", label: "Low", color: "text-blue-500" },
  { value: "medium", label: "Medium", color: "text-yellow-500" },
  { value: "high", label: "High", color: "text-red-500" },
];

const TaskDialog = ({ open, onClose, task, onSuccess }: TaskDialogProps) => {
  const [plants, setPlants] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    plant_id: "",
    task_type: "watering",
    title: "",
    description: "",
    due_date: new Date(),
    priority: "medium",
    status: "pending",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadPlants();
      if (task) {
        setFormData({
          plant_id: task.plant_id,
          task_type: task.task_type,
          title: task.title,
          description: task.description || "",
          due_date: new Date(task.due_date),
          priority: task.priority,
          status: task.status,
        });
      } else {
        setFormData({
          plant_id: "",
          task_type: "watering",
          title: "",
          description: "",
          due_date: new Date(),
          priority: "medium",
          status: "pending",
        });
      }
    }
  }, [open, task]);

  const loadPlants = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_plants")
        .select("id, nickname, species")
        .eq("user_id", user.id)
        .order("nickname");

      if (error) throw error;
      setPlants(data || []);
    } catch (error) {
      console.error("Error loading plants:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.plant_id || !formData.title) {
      toast({
        title: "Missing information",
        description: "Please select a plant and enter a task title",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (task) {
        // Update existing task
        const { error } = await supabase
          .from("care_tasks")
          .update({
            ...formData,
            due_date: formData.due_date.toISOString(),
          })
          .eq("id", task.id);

        if (error) throw error;
        toast({ title: "Task updated successfully!" });
      } else {
        // Create new task
        const { error } = await supabase
          .from("care_tasks")
          .insert({
            ...formData,
            due_date: formData.due_date.toISOString(),
          });

        if (error) throw error;
        toast({ title: "Task created successfully!" });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving task:", error);
      toast({
        title: "Error",
        description: "Failed to save task",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Create New Task"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Plant Selection */}
          <div className="space-y-2">
            <Label>Plant *</Label>
            <Select
              value={formData.plant_id}
              onValueChange={(value) => setFormData({ ...formData, plant_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a plant" />
              </SelectTrigger>
              <SelectContent>
                {plants.map((plant) => (
                  <SelectItem key={plant.id} value={plant.id}>
                    {plant.nickname} ({plant.species})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Task Type */}
          <div className="space-y-2">
            <Label>Task Type</Label>
            <Select
              value={formData.task_type}
              onValueChange={(value) => {
                setFormData({ 
                  ...formData, 
                  task_type: value,
                  title: formData.title || TASK_TYPES.find(t => t.value === value)?.label || ""
                });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TASK_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Task Title */}
          <div className="space-y-2">
            <Label>Task Title *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Water Monstera"
            />
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.due_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.due_date ? format(formData.due_date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.due_date}
                  onSelect={(date) => date && setFormData({ ...formData, due_date: date })}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => setFormData({ ...formData, priority: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_LEVELS.map((priority) => (
                  <SelectItem key={priority.value} value={priority.value}>
                    <span className={priority.color}>{priority.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add any additional details..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : task ? "Update Task" : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDialog;
