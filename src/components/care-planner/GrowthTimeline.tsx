import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Sprout, Leaf, Flower, Camera } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/motion-config";

const GrowthTimeline = () => {
  const milestones = [
    { 
      id: 1, 
      date: "2 weeks ago", 
      type: "new_growth", 
      title: "New Leaf Emerged", 
      plant: "Monstera Delicious",
      icon: Leaf,
      color: "text-green-500"
    },
    { 
      id: 2, 
      date: "1 month ago", 
      type: "repotted", 
      title: "Repotted Successfully", 
      plant: "Peace Lily",
      icon: Sprout,
      color: "text-blue-500"
    },
    { 
      id: 3, 
      date: "2 months ago", 
      type: "flowering", 
      title: "First Bloom! 🌸", 
      plant: "Orchid Beauty",
      icon: Flower,
      color: "text-pink-500"
    },
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={fadeInUp}>
        <h2 className="text-2xl font-bold mb-2">Growth Timeline</h2>
        <p className="text-muted-foreground">
          Track your plants' journey from seedling to full bloom
        </p>
      </motion.div>

      {/* Growth Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Milestones</CardTitle>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">+3 this month</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Leaves</CardTitle>
              <Leaf className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Across all plants</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Blooms</CardTitle>
              <Flower className="w-4 h-4 text-pink-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">Beautiful flowers</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Timeline */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader>
            <CardTitle>Recent Milestones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <div key={milestone.id} className="relative pl-8 pb-8 last:pb-0">
                  {/* Timeline line */}
                  {index !== milestones.length - 1 && (
                    <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-border" />
                  )}
                  
                  {/* Timeline dot */}
                  <div className={`absolute left-0 top-1 p-2 rounded-full bg-background border-2 border-primary ${milestone.color}`}>
                    <milestone.icon className="w-4 h-4" />
                  </div>

                  {/* Content */}
                  <div className="bg-accent/50 rounded-lg p-4 hover:bg-accent transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{milestone.title}</h4>
                        <p className="text-sm text-muted-foreground">{milestone.plant}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {milestone.date}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Growth Montage */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Growth Progress Photos</span>
              <Camera className="w-5 h-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-12">
              Upload plant photos to track visual growth over time 📸
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default GrowthTimeline;
