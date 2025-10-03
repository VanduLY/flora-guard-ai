import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Cloud, CloudRain, Sun, Wind, Droplet, AlertTriangle } from "lucide-react";
import { Badge } from "./ui/badge";

const KanWeatherAlerts = () => {
  const [weather, setWeather] = useState<any>(null);

  // Mock weather data for demonstration
  useEffect(() => {
    // In production, this would fetch real weather data
    setWeather({
      temperature: 24,
      condition: "Partly Cloudy",
      humidity: 65,
      rainfall: 40,
      alerts: [
        {
          type: "High Humidity",
          message: "Increased risk of fungal diseases",
          severity: "medium",
        },
      ],
    });
  }, []);

  if (!weather) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-6 shadow-soft space-y-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <Cloud className="w-6 h-6 text-primary" />
        <h3 className="text-xl font-bold text-foreground">Weather & Alerts</h3>
      </div>

      {/* Current Weather */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-4xl font-bold text-foreground">
              {weather.temperature}°C
            </div>
            <div className="text-muted-foreground">{weather.condition}</div>
          </div>
          <Sun className="w-12 h-12 text-primary" />
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Droplet className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">
              Humidity: {weather.humidity}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CloudRain className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">
              Rain: {weather.rainfall}%
            </span>
          </div>
        </div>
      </div>

      {/* Disease Risk Alerts */}
      {weather.alerts && weather.alerts.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-foreground text-sm">Disease Risk Alerts</h4>
          {weather.alerts.map((alert: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
            >
              <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-foreground text-sm">
                    {alert.type}
                  </span>
                  <Badge
                    variant={
                      alert.severity === "high"
                        ? "destructive"
                        : alert.severity === "medium"
                        ? "secondary"
                        : "outline"
                    }
                    className="text-xs"
                  >
                    {alert.severity}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{alert.message}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Plant Care Tips */}
      <div className="space-y-2">
        <h4 className="font-semibold text-foreground text-sm">Today's Care Tips</h4>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg">
            <Droplet className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <p>Morning watering recommended due to high afternoon temperatures</p>
          </div>
          <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg">
            <Wind className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <p>Ensure good air circulation to prevent fungal growth</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default KanWeatherAlerts;
