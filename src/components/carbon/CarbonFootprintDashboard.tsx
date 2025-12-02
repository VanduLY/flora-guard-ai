import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Leaf, Droplets, Sprout, Settings, Plus } from "lucide-react";
import { EmissionsChart } from "./EmissionsChart";
import { ActivityLogDialog } from "./ActivityLogDialog";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EmissionsSummary {
  total: number;
  watering: number;
  fertilizer: number;
  sensor_maintenance: number;
  pruning: number;
  repotting: number;
}

export const CarbonFootprintDashboard = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [summary, setSummary] = useState<EmissionsSummary>({
    total: 0,
    watering: 0,
    fertilizer: 0,
    sensor_maintenance: 0,
    pruning: 0,
    repotting: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchSummary = async () => {
    try {
      setIsLoading(true);
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase.functions.invoke('calculate-carbon-footprint', {
        body: {
          action: 'summary',
          activity: { startDate, endDate },
        },
      });

      if (error) throw error;

      if (data?.success) {
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Error fetching carbon summary:', error);
      toast({
        title: "Error",
        description: "Failed to load carbon footprint data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleActivityLogged = () => {
    fetchSummary();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Carbon Footprint Tracker</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor your plant care environmental impact
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Log Activity
        </Button>
      </div>

      {/* Total Emissions Card */}
      <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Total CO₂ Emissions (30 days)</p>
            <p className="text-4xl font-bold text-green-700 dark:text-green-400">
              {isLoading ? "..." : summary.total.toFixed(2)}
              <span className="text-lg ml-2">kg CO₂</span>
            </p>
            <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <Leaf className="h-3 w-3 mr-1" />
              Eco-Conscious
            </Badge>
          </div>
          <div className="h-20 w-20 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center">
            <Leaf className="h-10 w-10 text-green-700 dark:text-green-300" />
          </div>
        </div>
      </Card>

      {/* Emissions by Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Droplets className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Watering</p>
              <p className="text-lg font-semibold">{summary.watering.toFixed(3)} kg</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Sprout className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fertilizer</p>
              <p className="text-lg font-semibold">{summary.fertilizer.toFixed(3)} kg</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Maintenance</p>
              <p className="text-lg font-semibold">{summary.sensor_maintenance.toFixed(3)} kg</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Leaf className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Other</p>
              <p className="text-lg font-semibold">
                {(summary.pruning + summary.repotting).toFixed(3)} kg
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Emissions Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Monthly Emissions Trend</h3>
        <EmissionsChart key={summary.total} />
      </Card>

      {/* Activity Log Dialog */}
      <ActivityLogDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={handleActivityLogged}
      />
    </div>
  );
};
