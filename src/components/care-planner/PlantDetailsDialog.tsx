import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Calendar, Activity, TrendingUp, Settings, 
  Droplet, Sun, Thermometer, MapPin, Heart,
  Edit, Trash2, CheckCircle2
} from "lucide-react";

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
  custom_notes?: string;
  light_requirement?: string;
  soil_type?: string;
}

interface PlantDetailsDialogProps {
  plant: Plant;
  onClose: () => void;
  onUpdate: () => void;
}

const PlantDetailsDialog = ({ plant, onClose, onUpdate }: PlantDetailsDialogProps) => {
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

  const getHealthColor = (status: string) => {
    switch (status) {
      case "healthy": return "bg-green-500/20 text-green-600 dark:text-green-400";
      case "needs_attention": return "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400";
      case "recovering": return "bg-blue-500/20 text-blue-600 dark:text-blue-400";
      case "critical": return "bg-red-500/20 text-red-600 dark:text-red-400";
      default: return "bg-gray-500/20 text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">{plant.nickname}</DialogTitle>
              <p className="text-sm text-muted-foreground italic mt-1">{plant.species}</p>
            </div>
            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
          </div>
        </DialogHeader>

        {/* Plant Image */}
        {plant.image_url && (
          <div className="w-full h-64 rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
            <img
              src={plant.image_url}
              alt={plant.nickname}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Status Badges */}
        <div className="flex gap-2 flex-wrap">
          <Badge className={getHealthColor(plant.health_status)}>
            {plant.health_status.replace("_", " ")}
          </Badge>
          <Badge variant="outline">
            {getGrowthStageIcon(plant.growth_stage)} {plant.growth_stage}
          </Badge>
          {plant.plant_type && (
            <Badge variant="secondary">{plant.plant_type}</Badge>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="care">Care Schedule</TabsTrigger>
            <TabsTrigger value="health">Health Log</TabsTrigger>
            <TabsTrigger value="growth">Growth</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Watering */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Droplet className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Watering</p>
                      <p className="font-medium">Every {plant.water_frequency_days} days</p>
                    </div>
                  </div>

                  {/* Light */}
                  {plant.light_requirement && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-500/10 rounded-lg">
                        <Sun className="w-5 h-5 text-yellow-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Light</p>
                        <p className="font-medium capitalize">{plant.light_requirement.replace("_", " ")}</p>
                      </div>
                    </div>
                  )}

                  {/* Location */}
                  {plant.location && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/10 rounded-lg">
                        <MapPin className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium">{plant.location}</p>
                      </div>
                    </div>
                  )}

                  {/* Soil */}
                  {plant.soil_type && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-500/10 rounded-lg">
                        <Thermometer className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Soil</p>
                        <p className="font-medium">{plant.soil_type}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {plant.custom_notes && (
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-2">Care Notes</p>
                    <p className="text-sm text-muted-foreground">{plant.custom_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="care">
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center py-8">
                  Care schedule coming soon! 📅
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health">
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center py-8">
                  Health monitoring coming soon! 🌡️
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="growth">
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center py-8">
                  Growth timeline coming soon! 📈
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-between gap-3 pt-4 border-t">
          <Button variant="outline" className="gap-2">
            <Edit className="w-4 h-4" />
            Edit Plant
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 text-destructive hover:bg-destructive/10">
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlantDetailsDialog;
