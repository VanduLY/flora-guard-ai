import { useState } from "react";
import { Upload, Camera, History, Cloud } from "lucide-react";
import { motion } from "framer-motion";
import KanUploadZone from "./kan-upload-zone";
import KanCameraFeed from "./kan-camera-feed";
import KanDiseaseResults from "./kan-disease-results";
import KanPlantHistory from "./kan-plant-history";
import KanWeatherAlerts from "./kan-weather-alerts";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

const KanApp = () => {
  const [activeTab, setActiveTab] = useState<"upload" | "camera" | "history">("upload");
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      {/* Header */}
      <motion.header 
        className="bg-card/80 backdrop-blur-md border-b border-border shadow-soft sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Flora Guard AI</h1>
                <p className="text-sm text-muted-foreground">AI-Powered Plant Protection</p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.section 
        className="py-12 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-foreground mb-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Protect Your Plants with AI
          </motion.h2>
          <motion.p 
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Upload or capture a photo of your plant to get instant AI-powered disease detection, 
            treatment recommendations, and care tips
          </motion.p>
        </div>
      </motion.section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload
                </TabsTrigger>
                <TabsTrigger value="camera" className="flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Camera
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-6">
                <KanUploadZone 
                  onAnalysisComplete={setAnalysisResult}
                  onAnalyzing={setIsAnalyzing}
                />
                {analysisResult && (
                  <KanDiseaseResults result={analysisResult} isAnalyzing={isAnalyzing} />
                )}
              </TabsContent>

              <TabsContent value="camera" className="space-y-6">
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

          {/* Sidebar */}
          <div className="space-y-6">
            <KanWeatherAlerts />
          </div>
        </div>
      </div>
    </div>
  );
};

export default KanApp;
