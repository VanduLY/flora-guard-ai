import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const CarbonSettings = () => {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPreference();
  }, []);

  const loadPreference = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_care_preferences")
        .select("carbon_tracking_enabled")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setEnabled(data.carbon_tracking_enabled || false);
      }
    } catch (error) {
      console.error("Error loading carbon tracking preference:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (checked: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if preferences exist
      const { data: existing } = await supabase
        .from("user_care_preferences")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from("user_care_preferences")
          .update({ carbon_tracking_enabled: checked })
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from("user_care_preferences")
          .insert({
            user_id: user.id,
            carbon_tracking_enabled: checked,
          });

        if (error) throw error;
      }

      setEnabled(checked);
      toast({
        title: checked ? "Carbon Tracking Enabled" : "Carbon Tracking Disabled",
        description: checked 
          ? "You can now track your plant care carbon footprint" 
          : "Carbon tracking has been disabled",
      });

      // Reload page to show/hide dashboard
      window.location.reload();
    } catch (error) {
      console.error("Error updating carbon tracking preference:", error);
      toast({
        title: "Error",
        description: "Failed to update carbon tracking preference",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return null;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label htmlFor="carbon-tracking" className="text-base font-semibold">
            Carbon Footprint Tracking
          </Label>
          <p className="text-sm text-muted-foreground">
            Monitor the environmental impact of your plant care activities
          </p>
        </div>
        <Switch
          id="carbon-tracking"
          checked={enabled}
          onCheckedChange={handleToggle}
        />
      </div>
    </Card>
  );
};
