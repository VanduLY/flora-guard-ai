import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, Star, Target, Zap } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/motion-config";

const AchievementsDashboard = () => {
  const achievements = [
    { id: 1, icon: Trophy, title: "First Bloom", description: "Witnessed your first flowering", earned: true, color: "text-yellow-500" },
    { id: 2, icon: Zap, title: "30-Day Streak", description: "Consistent care for 30 days", earned: true, color: "text-orange-500" },
    { id: 3, icon: Star, title: "Perfect Week", description: "Completed all tasks on time", earned: false, color: "text-purple-500" },
    { id: 4, icon: Target, title: "Pest Defender", description: "Successfully treated plant disease", earned: false, color: "text-green-500" },
    { id: 5, icon: Award, title: "Green Thumb", description: "Maintained 10 healthy plants", earned: false, color: "text-blue-500" },
  ];

  const weeklyInsights = [
    "🌱 Your Monstera grew 2 new leaves this week!",
    "💧 Perfect watering schedule maintained",
    "☀️ Optimal sunlight hours achieved for all plants",
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={fadeInUp}>
        <h2 className="text-2xl font-bold mb-2">Achievements & Progress</h2>
        <p className="text-muted-foreground">
          Celebrate your plant care journey with badges and insights
        </p>
      </motion.div>

      {/* Weekly Insights */}
      <motion.div variants={fadeInUp}>
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Weekly Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {weeklyInsights.map((insight, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                <span className="text-2xl">{insight.split(" ")[0]}</span>
                <p className="text-sm">{insight.substring(3)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement) => (
          <motion.div
            key={achievement.id}
            variants={fadeInUp}
            whileHover={{ scale: 1.05, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <Card className={`relative overflow-hidden ${!achievement.earned && 'opacity-50'}`}>
              {achievement.earned && (
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-500/20 to-transparent" />
              )}
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`p-4 rounded-full ${achievement.earned ? 'bg-primary/20' : 'bg-muted'}`}>
                    <achievement.icon className={`w-8 h-8 ${achievement.earned ? achievement.color : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{achievement.title}</h3>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                  {achievement.earned && (
                    <Badge variant="secondary" className="gap-1">
                      <Trophy className="w-3 h-3" />
                      Earned
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Progress Stats */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">5</div>
                <p className="text-sm text-muted-foreground">Achievements Earned</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500 mb-2">89%</div>
                <p className="text-sm text-muted-foreground">Task Completion Rate</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500 mb-2">30</div>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default AchievementsDashboard;
