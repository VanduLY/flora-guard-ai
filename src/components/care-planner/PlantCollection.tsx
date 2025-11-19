import { useEffect, useState } from "react";
import { Plus, Heart, AlertCircle, Droplet, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AddPlantDialog from "./AddPlantDialog";
import PlantDetailsDialog from "./PlantDetailsDialog";

interface Plant {
  id: string;
  nickname: string;
  species: string;
  plant_type?: string;
  health_status: string;
  growth_stage: string;
  image_url?: string;
  location?: string;
  water_frequency_days: number;
  source?: 'tracked' | 'scan';
  created_at?: string;
  disease_detected?: string;
}

const PlantCollection = () => {
  const { toast } = useToast();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);

  useEffect(() => {
    loadPlants();
  }, []);

  const loadPlants = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("Error getting user:", userError);
        toast({
          title: "Authentication Error",
          description: "Failed to verify user. Please sign in again.",
          variant: "destructive",
        });
        return;
      }

      if (!user) {
        console.warn("No user found");
        return;
      }

      // Load tracked plants
      const { data: trackedPlants, error: trackedError } = await supabase
        .from("user_plants")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (trackedError) {
        console.error("Error loading tracked plants:", trackedError);
      }

      // Load scanned plants
      const { data: scannedPlants, error: scannedError } = await supabase
        .from("plant_scans")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (scannedError) {
        console.error("Error loading scanned plants:", scannedError);
      }

      // Combine both sources
      const allPlants: Plant[] = [];

      // Add tracked plants
      if (trackedPlants) {
        allPlants.push(...trackedPlants.map(p => ({
          ...p,
          source: 'tracked' as const
        })));
      }

      // Add scanned plants (convert to Plant format)
      if (scannedPlants) {
        allPlants.push(...scannedPlants.map(scan => ({
          id: scan.id,
          nickname: scan.custom_name || scan.plant_type || "Scanned Plant",
          species: scan.plant_type || "Unknown",
          plant_type: scan.plant_type,
          health_status: scan.health_status,
          growth_stage: "unknown",
          image_url: scan.image_url,
          location: scan.location,
          water_frequency_days: 7,
          source: 'scan' as const,
          created_at: scan.created_at,
          disease_detected: scan.disease_detected
        })));
      }

      setPlants(allPlants);
    } catch (error) {
      console.error("Unexpected error loading plants:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading your plants.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case "healthy": return "bg-green-500/20 text-green-600 dark:text-green-400";
      case "needs_attention": return "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400";
      case "recovering": return "bg-blue-500/20 text-blue-600 dark:text-blue-400";
      case "critical": return "bg-red-500/20 text-red-600 dark:text-red-400";
      default: return "bg-gray-500/20 text-gray-600 dark:text-gray-400";
    }
  };

  const getGrowthStageIcon = (stage: string) => {
    switch (stage) {
      case "seedling": return "🌱";
      case "vegetative": return "🌿";
      case "mature": return "🪴";
      case "flowering": return "🌸";
      case "dormant": return "💤";
      default: return "🌱";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">My Plant Collection</h2>
          <p className="text-muted-foreground">Manage your green family</p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="gap-2 hover:scale-105 transition-transform"
        >
          <Plus className="w-4 h-4" />
          Add Plant
        </Button>
      </div>

      {/* Plants Grid */}
      {plants.length === 0 ? (
        <Card className="border-dashed border-2 bg-card">
          <CardContent className="flex flex-col items-center justify-center py-16 px-4">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-2xl font-bold mb-2 text-foreground">No plants yet</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Start your plant care journey by adding your first plant! Track growth, set reminders, and watch your green family flourish.
            </p>
            <Button onClick={() => setShowAddDialog(true)} className="gap-2" size="lg">
              <Plus className="w-4 h-4" />
              Add Your First Plant
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plants.map((plant) => (
            <div key={plant.id}>
              <Card
                className="overflow-hidden cursor-pointer group hover:shadow-lg transition-all"
                onClick={() => setSelectedPlant(plant)}
              >
                {/* Plant Image */}
                <div className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden">
                  {plant.image_url ? (
                    <img
                      src={plant.image_url}
                      alt={plant.nickname}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      {getGrowthStageIcon(plant.growth_stage)}
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex gap-2">
                    {plant.source === 'scan' && (
                      <Badge variant="secondary" className="bg-blue-500/20 text-blue-600 dark:text-blue-400">
                        Scan
                      </Badge>
                    )}
                    <Badge className={getHealthColor(plant.health_status)}>
                      {plant.health_status === "needs_attention" && (
                        <AlertCircle className="w-3 h-3 mr-1" />
                      )}
                      {plant.health_status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>

                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{plant.nickname}</span>
                    <Heart className="w-5 h-5 text-muted-foreground hover:text-red-500 transition-colors" />
                  </CardTitle>
                  <p className="text-sm text-muted-foreground italic">{plant.species}</p>
                </CardHeader>

                <CardContent className="space-y-3">
                  {plant.disease_detected && (
                    <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                      <AlertCircle className="w-4 h-4" />
                      <span className="font-medium">{plant.disease_detected}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Droplet className="w-4 h-4 text-blue-500" />
                      <span>Every {plant.water_frequency_days} days</span>
                    </div>
                  </div>

                  {plant.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Sun className="w-4 h-4" />
                      <span>{plant.location}</span>
                    </div>
                  )}

                  {plant.growth_stage && plant.growth_stage !== "unknown" && (
                    <Badge variant="outline" className="capitalize">
                      {getGrowthStageIcon(plant.growth_stage)} {plant.growth_stage}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Dialogs */}
      <AddPlantDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSuccess={loadPlants}
      />

      {selectedPlant && (
        <PlantDetailsDialog
          plant={selectedPlant}
          onClose={() => setSelectedPlant(null)}
          onUpdate={loadPlants}
        />
      )}
    </div>
  );
};

export default PlantCollection;
