import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { Camera, History, BookOpen, Activity, Leaf, Heart, AlertCircle, Scan, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import PerpetualBackground from "@/components/PerpetualBackground";
import { staggerContainer, fadeInUp } from "@/components/PageTransition";
import { DURATIONS, EASINGS, SPRINGS } from "@/lib/motion-config";
import { CarbonFootprintDashboard } from "@/components/carbon/CarbonFootprintDashboard";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useUser();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [stats, setStats] = useState({
    totalScans: 0,
    healthyPlants: 0,
    needsCare: 0,
  });
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [carbonTrackingEnabled, setCarbonTrackingEnabled] = useState(false);

  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, amount: 0.1 });

  useEffect(() => {
    checkAuthAndLoadData();
  }, [profile]);

  const checkAuthAndLoadData = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
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

      // Use profile from context if available
      const displayName = profile?.full_name || profile?.username || session.user.email?.split("@")[0] || "User";
      setUserName(displayName);

      // Check carbon tracking preference
      const { data: preferences } = await supabase
        .from("user_care_preferences")
        .select("carbon_tracking_enabled")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (preferences) {
        setCarbonTrackingEnabled(preferences.carbon_tracking_enabled || false);
      }

      // Get scan statistics with error handling
      const { data: scans, error: scansError } = await supabase
        .from("plant_scans")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (scansError) {
        console.error("Error loading scans:", scansError);
        toast({
          title: "Error loading data",
          description: "Could not load your plant scans. Please refresh the page.",
          variant: "destructive",
        });
      } else if (scans) {
        setStats({
          totalScans: scans.length,
          healthyPlants: scans.filter(s => s.health_status === "healthy").length,
          needsCare: scans.filter(s => s.health_status === "unhealthy" || s.disease_detected).length,
        });
        setRecentScans(scans.slice(0, 3));
      }
    } catch (error) {
      console.error("Unexpected error in checkAuthAndLoadData:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully",
    });
    navigate("/");
  };

  return (
    <>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
    <motion.div 
      className="min-h-screen relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: DURATIONS.smooth, ease: EASINGS.butter }}
    >
      <PerpetualBackground />
      
      {/* Header */}
      <motion.header 
        ref={headerRef}
        className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border shadow-soft"
        initial={{ y: -100, opacity: 0 }}
        animate={headerInView ? { y: 0, opacity: 1 } : {}}
        transition={SPRINGS.butter}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center overflow-hidden">
                <img 
                  src="/favicon.ico" 
                  alt="Flora Guard Logo" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Flora Guard AI</h1>
                <p className="text-sm text-muted-foreground">Plant Care Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button onClick={() => navigate("/profile")} variant="outline" className="flex items-center gap-2 px-2 pr-3">
                <Avatar className="w-8 h-8">
                  {profile?.avatar_url ? (
                    <AvatarImage src={profile.avatar_url} alt={profile.username || "User"} />
                  ) : null}
                  <AvatarFallback className="bg-primary/10">
                    <User className="w-4 h-4 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline">
                  {profile?.username || "Profile"}
                </span>
              </Button>
              <Button onClick={handleSignOut} variant="outline">
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Welcome Section */}
          <motion.div variants={fadeInUp} className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Avatar className="w-12 h-12">
                {profile?.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} alt={profile.username || "User"} />
                ) : null}
                <AvatarFallback className="bg-primary/10">
                  <User className="w-8 h-8 text-primary" />
                </AvatarFallback>
              </Avatar>
              <h2 className="text-4xl font-bold text-foreground">Welcome back, {userName}!</h2>
            </div>
            <p className="text-muted-foreground text-lg">Manage your plants and track their health</p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              variants={fadeInUp}
              whileHover={{ scale: 1.03, y: -6 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: DURATIONS.micro, ease: EASINGS.butter }}
            >
              <Card className="glass-morph border-primary/20 hover:border-primary/40 hover:shadow-xl transition-all cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Plants Tracked</CardTitle>
                <Leaf className="w-5 h-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stats.totalScans}</div>
              </CardContent>
            </Card>
            </motion.div>

            <motion.div 
              variants={fadeInUp}
              whileHover={{ scale: 1.03, y: -6 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: DURATIONS.micro, ease: EASINGS.butter }}
            >
              <Card className="glass-morph border-green-500/20 hover:border-green-500/40 hover:shadow-xl transition-all cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Healthy Plants</CardTitle>
                <Heart className="w-5 h-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">{stats.healthyPlants}</div>
              </CardContent>
            </Card>
            </motion.div>

            <motion.div 
              variants={fadeInUp}
              whileHover={{ scale: 1.03, y: -6 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: DURATIONS.micro, ease: EASINGS.butter }}
            >
              <Card className="glass-morph border-orange-500/20 hover:border-orange-500/40 hover:shadow-xl transition-all cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Needs Care</CardTitle>
                <AlertCircle className="w-5 h-5 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-500">{stats.needsCare}</div>
              </CardContent>
            </Card>
            </motion.div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-2xl font-bold text-foreground mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <motion.div 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: DURATIONS.micro, ease: EASINGS.butter }}
              >
                <Button size="lg" onClick={() => navigate("/detect")} className="gap-2">
                  <Camera className="w-5 h-5" />
                  Scan New Plant
                </Button>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: DURATIONS.micro, ease: EASINGS.butter }}
              >
                <Button size="lg" variant="outline" onClick={() => navigate("/history")} className="gap-2">
                  <History className="w-5 h-5" />
                  View History
                </Button>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: DURATIONS.micro, ease: EASINGS.butter }}
              >
                <Button size="lg" variant="outline" onClick={() => navigate("/careguide")} className="gap-2">
                  <BookOpen className="w-5 h-5" />
                  Care Guide
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Main Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-2xl font-bold text-foreground mb-4">Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <motion.div 
                variants={fadeInUp}
                whileHover={{ scale: 1.03, y: -6 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: DURATIONS.micro, ease: EASINGS.butter }}
              >
                <Card 
                  className="glass-morph hover:shadow-lg transition-all cursor-pointer group border-primary/20 hover:border-primary/40"
                  onClick={() => navigate("/detect")}
                >
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Camera className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Plant Scanner</CardTitle>
                  <CardDescription>
                    Upload or capture plant images for instant AI-powered disease detection
                  </CardDescription>
                </CardHeader>
              </Card>
              </motion.div>

              <motion.div 
                variants={fadeInUp}
                whileHover={{ scale: 1.03, y: -6 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: DURATIONS.micro, ease: EASINGS.butter }}
              >
                <Card 
                  className="glass-morph hover:shadow-lg transition-all cursor-pointer group border-primary/20 hover:border-primary/40"
                  onClick={() => navigate("/history")}
                >
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <History className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Scan History</CardTitle>
                  <CardDescription>
                    Access previous scans, results, and track your plant health over time
                  </CardDescription>
                </CardHeader>
              </Card>
              </motion.div>

              <motion.div 
                variants={fadeInUp}
                whileHover={{ scale: 1.03, y: -6 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: DURATIONS.micro, ease: EASINGS.butter }}
              >
                <Card 
                  className="glass-morph hover:shadow-lg transition-all cursor-pointer group border-primary/20 hover:border-primary/40"
                  onClick={() => navigate("/careguide")}
                >
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Care Guide</CardTitle>
                  <CardDescription>
                    Comprehensive plant care tips and disease information library
                  </CardDescription>
                </CardHeader>
              </Card>
              </motion.div>

              <motion.div 
                variants={fadeInUp}
                whileHover={{ scale: 1.03, y: -6 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: DURATIONS.micro, ease: EASINGS.butter }}
              >
                <Card 
                  className="glass-morph hover:shadow-lg transition-all cursor-pointer group border-primary/20 hover:border-primary/40"
                  onClick={() => navigate("/recoverytracker")}
                >
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Activity className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Recovery Tracker</CardTitle>
                  <CardDescription>
                    Monitor plant recovery progress with detailed timelines and care stages
                  </CardDescription>
                </CardHeader>
              </Card>
              </motion.div>

              <motion.div 
                variants={fadeInUp}
                whileHover={{ scale: 1.03, y: -6 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: DURATIONS.micro, ease: EASINGS.butter }}
              >
                <Card 
                  className="glass-morph hover:shadow-lg transition-all cursor-pointer group border-primary/20 hover:border-primary/40"
                  onClick={() => navigate("/care-planner")}
                >
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Leaf className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Care Planner</CardTitle>
                  <CardDescription>
                    Manage your plant collection with personalized care schedules and growth tracking
                  </CardDescription>
                </CardHeader>
              </Card>
              </motion.div>
            </div>
          </motion.div>

          {/* Carbon Footprint Tracker */}
          {carbonTrackingEnabled && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="mb-8"
            >
              <CarbonFootprintDashboard />
            </motion.div>
          )}

          {/* Recent Activity */}
          {recentScans.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h3 className="text-2xl font-bold text-foreground mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {recentScans.map((scan, index) => (
                  <motion.div
                    key={scan.id}
                    variants={fadeInUp}
                    whileHover={{ scale: 1.02, x: 6 }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ duration: DURATIONS.micro, ease: EASINGS.butter }}
                  >
                    <Card 
                      className="glass-morph hover:shadow-md transition-all cursor-pointer"
                      onClick={() => navigate(`/scan/${scan.id}`)}
                    >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                          <img 
                            src={scan.image_url} 
                            alt="Plant scan" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Scan className="w-4 h-4 text-primary" />
                            <p className="font-semibold text-foreground">
                              {scan.disease_detected || "Health Check"}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(scan.created_at).toLocaleDateString()} at{" "}
                            {new Date(scan.created_at).toLocaleTimeString()}
                          </p>
                          <p className="text-sm">
                            Status: <span className={scan.health_status === "healthy" ? "text-green-500" : "text-orange-500"}>
                              {scan.health_status}
                            </span>
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
      )}
    </>
  );
};

export default Dashboard;
