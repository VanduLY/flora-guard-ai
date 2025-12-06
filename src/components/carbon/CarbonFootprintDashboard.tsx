import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Leaf, Droplets, Sprout, Settings, Plus, TreeDeciduous } from "lucide-react";
import { EmissionsChart } from "./EmissionsChart";
import { ActivityLogDialog } from "./ActivityLogDialog";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Emission factors for estimation (kg CO2)
const EMISSION_FACTORS = {
  watering: 0.0003, // per liter
  fertilizer: 0.95, // per kg
  maintenance: 0.05, // per session
  scan: 0.001, // per scan (device/network usage)
};

interface EmissionsSummary {
  total: number;
  watering: number;
  fertilizer: number;
  maintenance: number;
  other: number;
}

interface PlantStats {
  totalPlants: number;
  healthyPlants: number;
  scansThisMonth: number;
  tasksCompleted: number;
}

export const CarbonFootprintDashboard = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [summary, setSummary] = useState<EmissionsSummary>({
    total: 0,
    watering: 0,
    fertilizer: 0,
    maintenance: 0,
    other: 0,
  });
  const [plantStats, setPlantStats] = useState<PlantStats>({
    totalPlants: 0,
    healthyPlants: 0,
    scansThisMonth: 0,
    tasksCompleted: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchSummary = async () => {
    try {
      setIsLoading(true);
      const endDate = new Date();
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      // Fetch plant scans from the last 30 days
      const { data: scans } = await supabase
        .from('plant_scans')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // Fetch user plants
      const { data: plants } = await supabase
        .from('user_plants')
        .select('*');

      // Fetch completed care tasks from the last 30 days
      const { data: tasks } = await supabase
        .from('care_tasks')
        .select('*')
        .eq('status', 'completed')
        .gte('completed_at', startDate.toISOString())
        .lte('completed_at', endDate.toISOString());

      // Fetch logged carbon activities
      const { data: activities } = await supabase
        .from('carbon_activities')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // Calculate estimates based on plant data
      const numPlants = (plants?.length || 0) + (scans?.length || 0);
      const numScans = scans?.length || 0;
      const completedTasks = tasks?.length || 0;
      const healthyCount = (scans?.filter(s => s.health_status === 'healthy')?.length || 0) +
        (plants?.filter(p => p.health_status === 'healthy')?.length || 0);

      // Estimate watering: assume each plant watered 2x per week = 8x per month, 0.5L each
      const estimatedWateringLiters = numPlants * 8 * 0.5;
      const estimatedWateringEmissions = estimatedWateringLiters * EMISSION_FACTORS.watering;

      // Estimate fertilizing: assume 1 application per plant per month, 0.1kg
      const estimatedFertilizerKg = numPlants * 0.1;
      const estimatedFertilizerEmissions = estimatedFertilizerKg * EMISSION_FACTORS.fertilizer;

      // Maintenance from completed tasks
      const maintenanceTasks = tasks?.filter(t => 
        ['pruning', 'repotting', 'pest_treatment'].includes(t.task_type)
      )?.length || 0;
      const estimatedMaintenanceEmissions = maintenanceTasks * EMISSION_FACTORS.maintenance;

      // Other: scans and device usage
      const otherEmissions = numScans * EMISSION_FACTORS.scan;

      // Add any logged activities
      let loggedWatering = 0;
      let loggedFertilizer = 0;
      let loggedMaintenance = 0;
      let loggedOther = 0;

      activities?.forEach((act) => {
        const emissions = Number(act.co2_emissions) || 0;
        if (act.activity_type === 'watering') loggedWatering += emissions;
        else if (act.activity_type === 'fertilizer') loggedFertilizer += emissions;
        else if (['sensor_maintenance', 'pruning'].includes(act.activity_type)) loggedMaintenance += emissions;
        else loggedOther += emissions;
      });

      const totalWatering = estimatedWateringEmissions + loggedWatering;
      const totalFertilizer = estimatedFertilizerEmissions + loggedFertilizer;
      const totalMaintenance = estimatedMaintenanceEmissions + loggedMaintenance;
      const totalOther = otherEmissions + loggedOther;

      setSummary({
        total: totalWatering + totalFertilizer + totalMaintenance + totalOther,
        watering: totalWatering,
        fertilizer: totalFertilizer,
        maintenance: totalMaintenance,
        other: totalOther,
      });

      setPlantStats({
        totalPlants: numPlants,
        healthyPlants: healthyCount,
        scansThisMonth: numScans,
        tasksCompleted: completedTasks,
      });

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

      {/* Plant Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200/50 dark:border-green-800/50">
          <div className="flex items-center gap-3">
            <TreeDeciduous className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">{plantStats.totalPlants}</p>
              <p className="text-xs text-muted-foreground">Plants Tracked</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-200/50 dark:border-emerald-800/50">
          <div className="flex items-center gap-3">
            <Leaf className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{plantStats.healthyPlants}</p>
              <p className="text-xs text-muted-foreground">Healthy Plants</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200/50 dark:border-blue-800/50">
          <div className="flex items-center gap-3">
            <Settings className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{plantStats.scansThisMonth}</p>
              <p className="text-xs text-muted-foreground">Scans This Month</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border-purple-200/50 dark:border-purple-800/50">
          <div className="flex items-center gap-3">
            <Sprout className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            <div>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{plantStats.tasksCompleted}</p>
              <p className="text-xs text-muted-foreground">Tasks Done</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Total Emissions Card */}
      <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Estimated CO₂ Emissions (30 days)</p>
            <p className="text-4xl font-bold text-green-700 dark:text-green-400">
              {isLoading ? "..." : summary.total.toFixed(3)}
              <span className="text-lg ml-2">kg CO₂</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Based on {plantStats.totalPlants} plants × estimated care activities
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
              <p className="text-xs text-muted-foreground">~{plantStats.totalPlants * 8} sessions/mo</p>
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
              <p className="text-xs text-muted-foreground">~{plantStats.totalPlants} applications</p>
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
              <p className="text-lg font-semibold">{summary.maintenance.toFixed(3)} kg</p>
              <p className="text-xs text-muted-foreground">{plantStats.tasksCompleted} tasks done</p>
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
              <p className="text-lg font-semibold">{summary.other.toFixed(3)} kg</p>
              <p className="text-xs text-muted-foreground">{plantStats.scansThisMonth} scans</p>
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
