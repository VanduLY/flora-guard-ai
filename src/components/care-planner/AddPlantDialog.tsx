import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";

interface AddPlantDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddPlantDialog = ({ open, onClose, onSuccess }: AddPlantDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nickname: "",
    species: "",
    plant_type: "",
    location: "",
    climate_zone: "",
    growth_stage: "seedling",
    soil_type: "",
    light_requirement: "",
    water_frequency_days: 7,
    custom_notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add a plant",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("user_plants").insert({
      ...formData,
      user_id: user.id,
    });

    if (error) {
      toast({
        title: "Error adding plant",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Plant added successfully! 🌱",
        description: `${formData.nickname} has been added to your collection`,
      });
      onSuccess();
      onClose();
      setFormData({
        nickname: "",
        species: "",
        plant_type: "",
        location: "",
        climate_zone: "",
        growth_stage: "seedling",
        soil_type: "",
        light_requirement: "",
        water_frequency_days: 7,
        custom_notes: "",
      });
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Plant</DialogTitle>
          <DialogDescription>
            Add a new plant to your collection and start tracking its care
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nickname */}
            <div className="space-y-2">
              <Label htmlFor="nickname">Plant Nickname *</Label>
              <Input
                id="nickname"
                placeholder="e.g., Monstera Delicious"
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                required
              />
            </div>

            {/* Species */}
            <div className="space-y-2">
              <Label htmlFor="species">Species *</Label>
              <Input
                id="species"
                placeholder="e.g., Monstera deliciosa"
                value={formData.species}
                onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                required
              />
            </div>

            {/* Plant Type */}
            <div className="space-y-2">
              <Label htmlFor="plant_type">Plant Type</Label>
              <Input
                id="plant_type"
                placeholder="e.g., Tropical, Succulent"
                value={formData.plant_type}
                onChange={(e) => setFormData({ ...formData, plant_type: e.target.value })}
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., Living room window"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            {/* Growth Stage */}
            <div className="space-y-2">
              <Label htmlFor="growth_stage">Growth Stage</Label>
              <Select
                value={formData.growth_stage}
                onValueChange={(value) => setFormData({ ...formData, growth_stage: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seedling">🌱 Seedling</SelectItem>
                  <SelectItem value="vegetative">🌿 Vegetative</SelectItem>
                  <SelectItem value="mature">🪴 Mature</SelectItem>
                  <SelectItem value="flowering">🌸 Flowering</SelectItem>
                  <SelectItem value="dormant">💤 Dormant</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Water Frequency */}
            <div className="space-y-2">
              <Label htmlFor="water_frequency">Watering Frequency (days)</Label>
              <Input
                id="water_frequency"
                type="number"
                min="1"
                max="90"
                value={formData.water_frequency_days}
                onChange={(e) => setFormData({ ...formData, water_frequency_days: parseInt(e.target.value) })}
              />
            </div>

            {/* Light Requirement */}
            <div className="space-y-2">
              <Label htmlFor="light_requirement">Light Requirement</Label>
              <Select
                value={formData.light_requirement}
                onValueChange={(value) => setFormData({ ...formData, light_requirement: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select light needs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">☁️ Low Light</SelectItem>
                  <SelectItem value="medium">⛅ Medium Light</SelectItem>
                  <SelectItem value="bright_indirect">🌤️ Bright Indirect</SelectItem>
                  <SelectItem value="direct">☀️ Direct Sunlight</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Soil Type */}
            <div className="space-y-2">
              <Label htmlFor="soil_type">Soil Type</Label>
              <Input
                id="soil_type"
                placeholder="e.g., Well-draining potting mix"
                value={formData.soil_type}
                onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
              />
            </div>
          </div>

          {/* Custom Notes */}
          <div className="space-y-2">
            <Label htmlFor="custom_notes">Care Notes</Label>
            <Textarea
              id="custom_notes"
              placeholder="Any special care instructions or observations..."
              value={formData.custom_notes}
              onChange={(e) => setFormData({ ...formData, custom_notes: e.target.value })}
              rows={4}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>Add Plant</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPlantDialog;
