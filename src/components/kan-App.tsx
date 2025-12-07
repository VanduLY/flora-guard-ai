import { useState } from "react";
import { Upload, Camera, History, LogOut, Home, User } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { ThemeToggle } from "./ThemeToggle";
import KanUploadZone from "./kan-upload-zone";
import KanCameraFeed from "./kan-camera-feed";
import KanDiseaseResults from "./kan-disease-results";
import KanPlantHistory from "./kan-plant-history";
import KanWeatherAlerts from "./kan-weather-alerts";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface KanAppProps {
  defaultTab?: "upload" | "camera" | "history";
}

const KanApp = ({ defaultTab = "upload" }: KanAppProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useUser();
  const [activeTab, setActiveTab] = useState<"upload" | "camera" | "history">(defaultTab);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully",
    });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      {/* Header */}
      <motion.header 
        className="bg-card/80 backdrop-blur-md border-b border-border shadow-soft sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <motion.div 
              className="flex items-center gap-2 sm:gap-3 cursor-pointer flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate("/detect")}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-primary rounded-xl flex items-center justify-center overflow-hidden">
                <img 
                  src="/favicon.ico" 
                  alt="Flora Guard Logo" 
                  className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
                />
              </div>
              <div className="hidden xs:block">
                <h1 className="text-lg sm:text-2xl font-bold text-foreground">Flora Guard AI</h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">AI-Powered Plant Protection</p>
              </div>
            </motion.div>
            
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <ThemeToggle />
              <Button 
                onClick={() => navigate("/dashboard")} 
                variant="outline"
                size="sm"
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3"
              >
                <Home className="w-4 h-4" />
                <span className="hidden md:inline">Dashboard</span>
              </Button>
              
              {/* Profile Avatar Button */}
              <Button 
                onClick={() => navigate("/profile")} 
                variant="outline"
                size="sm"
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3"
              >
                <Avatar className="w-6 h-6 sm:w-8 sm:h-8">
                  {profile?.avatar_url ? (
                    <AvatarImage src={profile.avatar_url} alt={profile.username || "User"} />
                  ) : null}
                  <AvatarFallback className="bg-primary/10">
                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline">
                  {profile?.username || "Profile"}
                </span>
              </Button>
              
              <Button 
                onClick={handleSignOut} 
                variant="outline"
                size="sm"
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.section 
        className="py-6 sm:py-12 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-3 sm:px-4 text-center">
          <motion.h2 
            className="text-2xl sm:text-4xl md:text-5xl font-bold text-foreground mb-2 sm:mb-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Protect Your Plants with AI
          </motion.h2>
          <motion.p 
            className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Upload or capture a photo of your plant to get instant AI-powered disease detection, 
            treatment recommendations, and care tips
          </motion.p>
        </div>
      </motion.section>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6">
                <TabsTrigger value="upload" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
                  <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Upload</span>
                </TabsTrigger>
                <TabsTrigger value="camera" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
                  <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Camera</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
                  <History className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">History</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-4 sm:space-y-6">
                <KanUploadZone 
                  onAnalysisComplete={setAnalysisResult}
                  onAnalyzing={setIsAnalyzing}
                />
                {analysisResult && (
                  <KanDiseaseResults result={analysisResult} isAnalyzing={isAnalyzing} />
                )}
              </TabsContent>

              <TabsContent value="camera" className="space-y-4 sm:space-y-6">
                <KanCameraFeed 
                  onAnalysisComplete={setAnalysisResult}
                  onAnalyzing={setIsAnalyzing}
                />
                {analysisResult && (
                  <KanDiseaseResults result={analysisResult} isAnalyzing={isAnalyzing} />
                )}
              </TabsContent>

              <TabsContent value="history">
                <KanPlantHistory />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - stacks below on mobile */}
          <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 space-y-4 sm:space-y-6">
            <KanWeatherAlerts />
          </div>
        </div>
      </div>
    </div>
  );
};

export default KanApp;
