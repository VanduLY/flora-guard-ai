import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Zap } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/motion-config";
import { useGamification } from "@/hooks/useGamification";
import * as LucideIcons from "lucide-react";
import LevelProgressBar from "./LevelProgressBar";
import { Skeleton } from "@/components/ui/skeleton";

const AchievementsDashboard = () => {
  const { achievements, definitions, stats, loading } = useGamification();

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Get earned achievement IDs
  const earnedIds = achievements.map(a => a.achievement_type || a.title.toLowerCase().replace(/\s+/g, '_'));

  // Generate insights based on actual stats
  const weeklyInsights = [
    stats && stats.tasks_completed > 0 
      ? `✅ Completed ${stats.tasks_completed} care tasks!` 
      : "🌱 Start completing tasks to track progress",
    stats && stats.current_streak_days > 0 
      ? `🔥 ${stats.current_streak_days} day streak - keep it going!` 
      : "💪 Build a streak by caring for your plants daily",
    stats && stats.plants_added > 0 
      ? `🪴 Managing ${stats.plants_added} plants in your collection` 
      : "🌿 Add your first plant to get started",
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

      {/* Level Progress */}
      <motion.div variants={fadeInUp}>
        <LevelProgressBar />
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
        {definitions.map((definition) => {
          const isEarned = earnedIds.includes(definition.id);
          const IconComponent = (LucideIcons as any)[definition.icon] || Trophy;
          
          return (
            <motion.div
              key={definition.id}
              variants={fadeInUp}
              whileHover={{ scale: isEarned ? 1.05 : 1.02, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <Card className={`relative overflow-hidden ${!isEarned && 'opacity-50'}`}>
                {isEarned && (
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-500/20 to-transparent" />
                )}
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className={`p-4 rounded-full ${isEarned ? 'bg-primary/20' : 'bg-muted'}`}>
                      <IconComponent className={`w-8 h-8 ${isEarned ? definition.color : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{definition.title}</h3>
                      <p className="text-sm text-muted-foreground">{definition.description}</p>
                      {definition.requirement_count && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Requires: {definition.requirement_count}x
                        </p>
                      )}
                    </div>
                    {isEarned ? (
                      <Badge variant="secondary" className="gap-1">
                        <Trophy className="w-3 h-3" />
                        +{definition.xp_reward} XP
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        {definition.xp_reward} XP
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Progress Stats */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{stats?.achievements_earned || 0}</div>
                <p className="text-sm text-muted-foreground">Achievements</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500 mb-2">{stats?.tasks_completed || 0}</div>
                <p className="text-sm text-muted-foreground">Tasks Completed</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500 mb-2">{stats?.longest_streak_days || 0}</div>
                <p className="text-sm text-muted-foreground">Longest Streak</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500 mb-2">{stats?.plants_added || 0}</div>
                <p className="text-sm text-muted-foreground">Plants Added</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default AchievementsDashboard;
