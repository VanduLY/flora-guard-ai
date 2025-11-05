import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera, Upload, Loader2, Sparkles } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface AddMilestoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plantId: string;
  plantName: string;
  onMilestoneAdded: () => void;
}

const AddMilestoneDialog = ({
  open,
  onOpenChange,
  plantId,
  plantName,
  onMilestoneAdded,
}: AddMilestoneDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    milestone_type: "photo",
    title: "",
    description: "",
    measurement_value: "",
    measurement_unit: "cm",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const uploadPhoto = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${plantId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("plant-images")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from("plant-images").getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let photoUrl = null;
      if (selectedFile) {
        photoUrl = await uploadPhoto(selectedFile);
      }

      const { error } = await supabase.from("growth_milestones").insert({
        plant_id: plantId,
        milestone_type: formData.milestone_type,
        title: formData.title || `${formData.milestone_type} milestone`,
        description: formData.description || null,
        measurement_value: formData.measurement_value
          ? parseFloat(formData.measurement_value)
          : null,
        measurement_unit: formData.measurement_value
          ? formData.measurement_unit
          : null,
        photo_url: photoUrl,
      });

      if (error) throw error;

      // Show celebration
      toast({
        title: "🎉 Milestone Added!",
        description: `Added to ${plantName}'s growth journey`,
      });

      onMilestoneAdded();
      onOpenChange(false);

      // Reset form
      setFormData({
        milestone_type: "photo",
        title: "",
        description: "",
        measurement_value: "",
        measurement_unit: "cm",
      });
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error: any) {
      console.error("Error adding milestone:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Growth Milestone</DialogTitle>
          <DialogDescription>
            Document {plantName}'s progress with photos and measurements
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Milestone Type */}
          <div className="space-y-2">
            <Label>Milestone Type</Label>
            <Select
              value={formData.milestone_type}
              onValueChange={(value) =>
                setFormData({ ...formData, milestone_type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="photo">Photo Update</SelectItem>
                <SelectItem value="measurement">Measurement</SelectItem>
                <SelectItem value="growth">Growth Event</SelectItem>
                <SelectItem value="flowering">Flowering</SelectItem>
                <SelectItem value="repotting">Repotting</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label>Photo (Optional)</Label>
            {previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                <Camera className="w-8 h-8 mb-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Click to upload photo
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </label>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label>Title (Optional)</Label>
            <Input
              placeholder="e.g., First flower bloom!"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Textarea
              placeholder="Add any observations or notes..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
          </div>

          {/* Measurement */}
          <div className="space-y-2">
            <Label>Measurement (Optional)</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                step="0.1"
                placeholder="Value"
                value={formData.measurement_value}
                onChange={(e) =>
                  setFormData({ ...formData, measurement_value: e.target.value })
                }
                className="flex-1"
              />
              <Select
                value={formData.measurement_unit}
                onValueChange={(value) =>
                  setFormData({ ...formData, measurement_unit: value })
                }
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cm">cm</SelectItem>
                  <SelectItem value="inches">inches</SelectItem>
                  <SelectItem value="leaves">leaves</SelectItem>
                  <SelectItem value="flowers">flowers</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Add Milestone
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMilestoneDialog;
