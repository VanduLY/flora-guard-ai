import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sprout, Calendar, Trophy, Sparkles } from "lucide-react";
import PerpetualBackground from "@/components/PerpetualBackground";
import PlantCollection from "@/components/care-planner/PlantCollection";
import CareCalendar from "@/components/care-planner/CareCalendar";
import AchievementsDashboard from "@/components/care-planner/AchievementsDashboard";
import { NotificationDemo } from "@/components/care-planner/NotificationDemo";
import { fadeInUp, staggerContainer, DURATIONS, EASINGS } from "@/lib/motion-config";
import { GamificationProvider } from "@/contexts/GamificationContext";
import { TaskCompletionHandler } from "@/components/care-planner/TaskCompletionHandler";
import { PlantAdditionHandler } from "@/components/care-planner/PlantAdditionHandler";
import { MilestoneHandler } from "@/components/care-planner/MilestoneHandler";

const CarePlanner = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("plants");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Session error:", error);
        toast({
          title: "Authentication Error",
          description: "Failed to verify session. Please sign in again.",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      if (!session) {
        navigate("/login");
        return;
      }
    } catch (error) {
      console.error("Unexpected error in checkAuth:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please refresh the page.",
        variant: "destructive",
      });
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <GamificationProvider>
      <TaskCompletionHandler />
      <PlantAdditionHandler />
      <MilestoneHandler />
      <motion.div
        className="min-h-screen relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: DURATIONS.smooth, ease: EASINGS.butter }}
      >
        <PerpetualBackground />
        
        <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8 flex items-center justify-between"
          >
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
                <TabsTrigger value="plants" className="gap-2">
                  <Sprout className="w-4 h-4" />
                  <span className="hidden sm:inline">Plants</span>
                </TabsTrigger>
                <TabsTrigger value="calendar" className="gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline">Calendar</span>
                </TabsTrigger>
                <TabsTrigger value="achievements" className="gap-2">
                  <Trophy className="w-4 h-4" />
                  <span className="hidden sm:inline">Rewards</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">Notifications</span>
                </TabsTrigger>
              </TabsList>

              <div className="mt-8">
                <TabsContent value="plants" className="space-y-6">
                  <PlantCollection />
                </TabsContent>

                <TabsContent value="calendar" className="space-y-6">
                  <CareCalendar />
                </TabsContent>

                <TabsContent value="achievements" className="space-y-6">
                  <AchievementsDashboard />
                </TabsContent>

                <TabsContent value="notifications" className="space-y-6">
                  <NotificationDemo />
                </TabsContent>
              </div>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </motion.div>
    </GamificationProvider>
  );
};

export default CarePlanner;
