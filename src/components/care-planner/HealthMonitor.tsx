import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, TrendingUp, Activity, Heart } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/motion-config";

const HealthMonitor = () => {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={fadeInUp}>
        <h2 className="text-2xl font-bold mb-2">Health Monitoring</h2>
        <p className="text-muted-foreground">
          Track plant vitality and detect issues early with AI-powered analysis
        </p>
      </motion.div>

      {/* Quick Check-In */}
      <motion.div variants={fadeInUp}>
        <Card className="border-2 border-dashed border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="inline-flex p-4 rounded-full bg-primary/20">
              <Camera className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Daily Check-In</h3>
              <p className="text-muted-foreground mb-6">
                Upload a photo for AI health analysis
              </p>
              <Button size="lg" className="gap-2">
                <Camera className="w-5 h-5" />
                Start Health Scan
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Vitality Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Health</CardTitle>
              <Heart className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87%</div>
              <p className="text-xs text-muted-foreground">+5% from last week</p>
              <div className="mt-4 h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-[87%] transition-all" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12%</div>
              <p className="text-xs text-muted-foreground">This month</p>
              <div className="mt-4 h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[75%] transition-all" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Issues</CardTitle>
              <Activity className="w-4 h-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">Needs attention</p>
              <Button variant="outline" size="sm" className="mt-4 w-full">
                View Details
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Check-Ins */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader>
            <CardTitle>Recent Check-Ins</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-12">
              No health logs yet. Start by uploading your first plant photo! 📸
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default HealthMonitor;
