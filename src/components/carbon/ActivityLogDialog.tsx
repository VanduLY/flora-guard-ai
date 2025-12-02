import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Droplets, Sprout, Settings, Scissors, PackagePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Plant {
  id: string;
  nickname: string;
  species: string;
}

interface ActivityLogDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ACTIVITY_TYPES = [
  { value: 'watering', label: 'Watering', icon: Droplets, unit: 'liters' },
  { value: 'fertilizer', label: 'Fertilizer', icon: Sprout, unit: 'grams' },
  { value: 'sensor_maintenance', label: 'Sensor Maintenance', icon: Settings, unit: 'sessions' },
  { value: 'pruning', label: 'Pruning', icon: Scissors, unit: 'sessions' },
  { value: 'repotting', label: 'Repotting', icon: PackagePlus, unit: 'sessions' },
];

export const ActivityLogDialog = ({ open, onClose, onSuccess }: ActivityLogDialogProps) => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    plantId: '',
    activityType: '',
    quantity: '',
    notes: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadPlants();
    }
  }, [open]);

  const loadPlants = async () => {
    try {
      const { data, error } = await supabase
        .from('user_plants')
        .select('id, nickname, species')
        .order('nickname');

      if (error) throw error;
      setPlants(data || []);
    } catch (error) {
      console.error('Error loading plants:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.activityType || !formData.quantity) {
      toast({
        title: "Missing Information",
        description: "Please select an activity type and enter a quantity",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const activityTypeData = ACTIVITY_TYPES.find(t => t.value === formData.activityType);
      
      const { data, error } = await supabase.functions.invoke('calculate-carbon-footprint', {
        body: {
          action: 'log',
          activity: {
            activityType: formData.activityType,
            quantity: parseFloat(formData.quantity),
            unit: activityTypeData?.unit || '',
            plantId: formData.plantId && formData.plantId !== 'none' ? formData.plantId : null,
            notes: formData.notes,
          },
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Activity Logged",
          description: `${data.co2Emissions.toFixed(4)} kg CO₂ emissions recorded`,
        });
        
        setFormData({ plantId: '', activityType: '', quantity: '', notes: '' });
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Error logging activity:', error);
      toast({
        title: "Error",
        description: "Failed to log activity",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedActivity = ACTIVITY_TYPES.find(t => t.value === formData.activityType);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log Care Activity</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Plant Selection */}
          <div className="space-y-2">
            <Label htmlFor="plant">Plant (Optional)</Label>
            <Select value={formData.plantId} onValueChange={(value) => setFormData({ ...formData, plantId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a plant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No specific plant</SelectItem>
                {plants.map((plant) => (
                  <SelectItem key={plant.id} value={plant.id}>
                    {plant.nickname} ({plant.species})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Activity Type */}
          <div className="space-y-2">
            <Label htmlFor="activityType">Activity Type *</Label>
            <Select
              value={formData.activityType}
              onValueChange={(value) => setFormData({ ...formData, activityType: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select activity type" />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">
              Quantity * {selectedActivity && `(${selectedActivity.unit})`}
            </Label>
            <Input
              id="quantity"
              type="number"
              step="0.01"
              min="0"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              placeholder="Enter quantity"
              required
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional details..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Logging..." : "Log Activity"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
