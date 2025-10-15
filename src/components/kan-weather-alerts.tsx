import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Cloud, CloudRain, Sun, Wind, Droplet, AlertTriangle, MapPin, Loader2 } from "lucide-react";
import { Badge } from "./ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const KanWeatherAlerts = () => {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    getLocationAndWeather();
    
    // Update weather every 30 minutes
    const interval = setInterval(() => {
      if (location) {
        fetchWeather(location.lat, location.lon);
      }
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const getLocationAndWeather = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lon: longitude });
          fetchWeather(latitude, longitude);
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast({
            title: "Location access denied",
            description: "Using default location for weather data",
            variant: "destructive",
          });
          // Fallback to a default location (London)
          fetchWeather(51.5074, -0.1278);
        }
      );
    } else {
      toast({
        title: "Geolocation not supported",
        description: "Using default location for weather data",
      });
      fetchWeather(51.5074, -0.1278);
    }
  };

  const fetchWeather = async (latitude: number, longitude: number) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('get-weather', {
        body: { latitude, longitude }
      });

      if (error) throw error;

      setWeather(data);
    } catch (error) {
      console.error("Error fetching weather:", error);
      toast({
        title: "Weather fetch failed",
        description: "Unable to load weather data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl p-6 shadow-soft flex items-center justify-center min-h-[300px]"
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </motion.div>
    );
  }

  if (!weather) return null;

  const getWeatherIcon = () => {
    const condition = weather.condition.toLowerCase();
    if (condition.includes('rain') || condition.includes('drizzle')) return <CloudRain className="w-12 h-12 text-primary" />;
    if (condition.includes('cloud')) return <Cloud className="w-12 h-12 text-primary" />;
    return <Sun className="w-12 h-12 text-primary" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-6 shadow-soft space-y-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Cloud className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-bold text-foreground">Weather & Alerts</h3>
        </div>
        {weather.location && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            {weather.location}
          </div>
        )}
      </div>

      {/* Current Weather */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-4xl font-bold text-foreground">
              {weather.temperature}°C
            </div>
            <div className="text-muted-foreground capitalize">{weather.description || weather.condition}</div>
          </div>
          {getWeatherIcon()}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Droplet className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">
              Humidity: {weather.humidity}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">
              Wind: {weather.windSpeed} km/h
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
      {weather.careTips && weather.careTips.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-foreground text-sm">Today's Care Tips</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            {weather.careTips.map((tip: any, index: number) => {
              const IconComponent = tip.icon === 'droplet' ? Droplet : tip.icon === 'wind' ? Wind : tip.icon === 'cloud-rain' ? CloudRain : Sun;
              return (
                <div key={index} className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg">
                  <IconComponent className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <p>{tip.message}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default KanWeatherAlerts;
