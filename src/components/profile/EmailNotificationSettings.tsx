import { useState, useEffect } from "react";
import { Mail, Bell, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const EmailNotificationSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [preferences, setPreferences] = useState({
    email_enabled: true,
    daily_digest_enabled: true,
    care_reminders_enabled: true,
    health_alerts_enabled: true,
    carbon_updates_enabled: true,
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_email_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setPreferences({
          email_enabled: data.email_enabled,
          daily_digest_enabled: data.daily_digest_enabled,
          care_reminders_enabled: data.care_reminders_enabled,
          health_alerts_enabled: data.health_alerts_enabled,
          carbon_updates_enabled: data.carbon_updates_enabled,
        });
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
      toast({
        title: "Error",
        description: "Failed to load email preferences",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<typeof preferences>) => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newPreferences = { ...preferences, ...updates };
      setPreferences(newPreferences);

      const { error } = await supabase
        .from("user_email_preferences")
        .upsert({
          user_id: user.id,
          ...newPreferences,
        });

      if (error) throw error;

      toast({
        title: "Preferences saved",
        description: "Your email notification preferences have been updated",
      });
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast({
        title: "Error",
        description: "Failed to update email preferences",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const sendTestEmail = async () => {
    setTestingEmail(true);
    try {
      const { error } = await supabase.functions.invoke("send-daily-email");

      if (error) throw error;

      toast({
        title: "Test email sent!",
        description: "Check your inbox for the test email",
      });
    } catch (error) {
      console.error("Error sending test email:", error);
      toast({
        title: "Error",
        description: "Failed to send test email",
        variant: "destructive",
      });
    } finally {
      setTestingEmail(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Mail className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Email Notifications</h2>
          <p className="text-sm text-muted-foreground">
            Manage your email notification preferences
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Master Toggle */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              <Label htmlFor="email-enabled" className="font-semibold text-foreground">
                Enable Email Notifications
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Receive all email notifications from FloraGuard
            </p>
          </div>
          <Switch
            id="email-enabled"
            checked={preferences.email_enabled}
            onCheckedChange={(checked) =>
              updatePreferences({ email_enabled: checked })
            }
            disabled={saving}
          />
        </div>

        {/* Individual Toggles */}
        <div className="space-y-4 opacity-100 transition-opacity">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="space-y-1">
              <Label htmlFor="daily-digest" className="text-foreground">
                Daily Plant Digest
              </Label>
              <p className="text-xs text-muted-foreground">
                Get daily plant care tips and reminders
              </p>
            </div>
            <Switch
              id="daily-digest"
              checked={preferences.daily_digest_enabled}
              onCheckedChange={(checked) =>
                updatePreferences({ daily_digest_enabled: checked })
              }
              disabled={saving || !preferences.email_enabled}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="space-y-1">
              <Label htmlFor="care-reminders" className="text-foreground">
                Care Reminders
              </Label>
              <p className="text-xs text-muted-foreground">
                Watering, fertilizing, and care task reminders
              </p>
            </div>
            <Switch
              id="care-reminders"
              checked={preferences.care_reminders_enabled}
              onCheckedChange={(checked) =>
                updatePreferences({ care_reminders_enabled: checked })
              }
              disabled={saving || !preferences.email_enabled}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="space-y-1">
              <Label htmlFor="health-alerts" className="text-foreground">
                Health Alerts
              </Label>
              <p className="text-xs text-muted-foreground">
                Plant health issues and threshold alerts
              </p>
            </div>
            <Switch
              id="health-alerts"
              checked={preferences.health_alerts_enabled}
              onCheckedChange={(checked) =>
                updatePreferences({ health_alerts_enabled: checked })
              }
              disabled={saving || !preferences.email_enabled}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="space-y-1">
              <Label htmlFor="carbon-updates" className="text-foreground">
                Carbon Footprint Updates
              </Label>
              <p className="text-xs text-muted-foreground">
                Weekly carbon footprint summaries
              </p>
            </div>
            <Switch
              id="carbon-updates"
              checked={preferences.carbon_updates_enabled}
              onCheckedChange={(checked) =>
                updatePreferences({ carbon_updates_enabled: checked })
              }
              disabled={saving || !preferences.email_enabled}
            />
          </div>
        </div>

        {/* Test Email Button */}
        <div className="pt-4 border-t border-border">
          <Button
            onClick={sendTestEmail}
            disabled={testingEmail || !preferences.email_enabled}
            variant="outline"
            className="w-full"
          >
            {testingEmail ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending Test Email...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Send Test Email
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Test emails are sent to your registered email address
          </p>
        </div>
      </div>
    </Card>
  );
};