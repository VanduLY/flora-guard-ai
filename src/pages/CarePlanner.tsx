import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sprout, Calendar, Activity, Trophy, TrendingUp } from "lucide-react";
import PerpetualBackground from "@/components/PerpetualBackground";
import PlantCollection from "@/components/care-planner/PlantCollection";
import CareCalendar from "@/components/care-planner/CareCalendar";
import HealthMonitor from "@/components/care-planner/HealthMonitor";
import AchievementsDashboard from "@/components/care-planner/AchievementsDashboard";
import GrowthTimeline from "@/components/care-planner/GrowthTimeline";
import { fadeInUp, staggerContainer, DURATIONS, EASINGS } from "@/lib/motion-config";

const CarePlanner = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("plants");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: DURATIONS.smooth, ease: EASINGS.butter }}
    >
      <PerpetualBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <motion.div variants={fadeInUp} className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/dashboard")}
                className="hover:scale-105 transition-transform"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Care Planner
                </h1>
                <p className="text-muted-foreground mt-1">
                  Your personalized plant wellness ecosystem
                </p>
              </div>
            </div>
          </motion.div>

          {/* Tabs Navigation */}
          <motion.div variants={fadeInUp}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
                <TabsTrigger value="plants" className="gap-2">
                  <Sprout className="w-4 h-4" />
                  <span className="hidden sm:inline">Plants</span>
                </TabsTrigger>
                <TabsTrigger value="calendar" className="gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline">Calendar</span>
                </TabsTrigger>
                <TabsTrigger value="health" className="gap-2">
                  <Activity className="w-4 h-4" />
                  <span className="hidden sm:inline">Health</span>
                </TabsTrigger>
                <TabsTrigger value="growth" className="gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="hidden sm:inline">Growth</span>
                </TabsTrigger>
                <TabsTrigger value="achievements" className="gap-2">
                  <Trophy className="w-4 h-4" />
                  <span className="hidden sm:inline">Rewards</span>
                </TabsTrigger>
              </TabsList>

              <div className="mt-8">
                <TabsContent value="plants" className="space-y-6">
                  <PlantCollection />
                </TabsContent>

                <TabsContent value="calendar" className="space-y-6">
                  <CareCalendar />
                </TabsContent>

                <TabsContent value="health" className="space-y-6">
                  <HealthMonitor />
                </TabsContent>

                <TabsContent value="growth" className="space-y-6">
                  <GrowthTimeline />
                </TabsContent>

                <TabsContent value="achievements" className="space-y-6">
                  <AchievementsDashboard />
                </TabsContent>
              </div>
            </Tabs>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CarePlanner;
