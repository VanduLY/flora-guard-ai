import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, Zap, Sprout, TreeDeciduous, Leaf, CheckCircle, 
  Flame, Shield, Flower, TrendingUp, ScanLine, Heart,
  Target, Calendar, Star
} from "lucide-react";
import { useGamification } from "@/hooks/useGamification";
import * as LucideIcons from "lucide-react";
import LevelProgressBar from "./LevelProgressBar";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface PlantStats {
  totalScans: number;
  healthyPlants: number;
  diseasesDetected: number;
  tasksCompleted: number;
  totalPlants: number;
}

const AchievementsDashboard = () => {
  const { achievements, definitions, stats, loading, checkAndAwardAchievement } = useGamification();
  const [plantStats, setPlantStats] = useState<PlantStats>({
    totalScans: 0,
    healthyPlants: 0,
    diseasesDetected: 0,
    tasksCompleted: 0,
    totalPlants: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    loadPlantStats();
  }, []);

  const loadPlantStats = async () => {
    try {
      // Fetch scanned plants
      const { data: scans } = await supabase
        .from('plant_scans')
        .select('*');

      // Fetch tracked plants  
      const { data: plants } = await supabase
        .from('user_plants')
        .select('*');

      // Fetch completed tasks
      const { data: tasks } = await supabase
        .from('care_tasks')
        .select('*')
        .eq('status', 'completed');

      const totalScans = scans?.length || 0;
      const totalPlants = (scans?.length || 0) + (plants?.length || 0);
      const healthyPlants = (scans?.filter(s => s.health_status === 'healthy')?.length || 0) +
        (plants?.filter(p => p.health_status === 'healthy')?.length || 0);
      const diseasesDetected = scans?.filter(s => s.disease_detected)?.length || 0;
      const tasksCompleted = tasks?.length || 0;

      setPlantStats({
        totalScans,
        healthyPlants,
        diseasesDetected,
        tasksCompleted,
        totalPlants,
      });

      // Auto-check achievements based on stats
      if (totalPlants >= 1) checkAndAwardAchievement('first_plant');
      if (totalPlants >= 5) checkAndAwardAchievement('five_plants');
      if (totalPlants >= 10) checkAndAwardAchievement('ten_plants');
      if (tasksCompleted >= 1) checkAndAwardAchievement('first_task');
      if (tasksCompleted >= 10) checkAndAwardAchievement('ten_tasks');
      if (diseasesDetected >= 1) checkAndAwardAchievement('disease_defender');

    } catch (error) {
      console.error('Error loading plant stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  if (loading || loadingStats) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
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

  // Progress tracking for achievements
  const achievementProgress = {
    first_plant: { current: plantStats.totalPlants, target: 1 },
    five_plants: { current: plantStats.totalPlants, target: 5 },
    ten_plants: { current: plantStats.totalPlants, target: 10 },
    first_task: { current: plantStats.tasksCompleted, target: 1 },
    ten_tasks: { current: plantStats.tasksCompleted, target: 10 },
    fifty_tasks: { current: plantStats.tasksCompleted, target: 50 },
    seven_day_streak: { current: stats?.current_streak_days || 0, target: 7 },
    thirty_day_streak: { current: stats?.current_streak_days || 0, target: 30 },
    disease_defender: { current: plantStats.diseasesDetected, target: 1 },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Achievements & Progress</h2>
        <p className="text-muted-foreground">
          Celebrate your plant care journey with badges and rewards
        </p>
      </div>

      {/* Level Progress */}
      <LevelProgressBar />

      {/* Plant Stats from Scans */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200/50 dark:border-green-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/50">
              <ScanLine className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">{plantStats.totalScans}</p>
              <p className="text-xs text-muted-foreground">Plants Scanned</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200/50 dark:border-emerald-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
              <Heart className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{plantStats.healthyPlants}</p>
              <p className="text-xs text-muted-foreground">Healthy Plants</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-orange-200/50 dark:border-orange-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/50">
              <Flame className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">{stats?.current_streak_days || 0}</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200/50 dark:border-blue-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
              <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{plantStats.tasksCompleted}</p>
              <p className="text-xs text-muted-foreground">Tasks Done</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Weekly Insights */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="w-5 h-5 text-primary" />
            Your Journey
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
              <span className="text-2xl">🌱</span>
              <div>
                <p className="text-sm font-medium">{plantStats.totalPlants} plants in collection</p>
                <p className="text-xs text-muted-foreground">Keep growing!</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
              <span className="text-2xl">🔬</span>
              <div>
                <p className="text-sm font-medium">{plantStats.diseasesDetected} issues detected</p>
                <p className="text-xs text-muted-foreground">Via AI scanning</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
              <span className="text-2xl">⭐</span>
              <div>
                <p className="text-sm font-medium">{stats?.total_xp || 0} XP earned</p>
                <p className="text-xs text-muted-foreground">Level {stats?.level || 1}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Achievement Badges</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {definitions.map((definition) => {
            const isEarned = earnedIds.includes(definition.id) || earnedIds.includes(definition.achievement_type);
            const IconComponent = (LucideIcons as any)[definition.icon] || Trophy;
            const progress = achievementProgress[definition.id as keyof typeof achievementProgress];
            const progressPercent = progress 
              ? Math.min((progress.current / progress.target) * 100, 100)
              : 0;
            
            return (
              <motion.div
                key={definition.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <Card className={`relative overflow-hidden transition-all ${
                  isEarned 
                    ? 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 border-yellow-300 dark:border-yellow-700' 
                    : 'opacity-70 hover:opacity-90'
                }`}>
                  {isEarned && (
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-yellow-400/20 to-transparent" />
                  )}
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className={`p-4 rounded-full ${
                        isEarned 
                          ? 'bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/50 dark:to-amber-900/50' 
                          : 'bg-muted'
                      }`}>
                        <IconComponent className={`w-8 h-8 ${isEarned ? definition.color : 'text-muted-foreground'}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{definition.title}</h3>
                        <p className="text-xs text-muted-foreground">{definition.description}</p>
                      </div>
                      
                      {/* Progress bar for unearned achievements */}
                      {!isEarned && progress && (
                        <div className="w-full space-y-1">
                          <Progress value={progressPercent} className="h-2" />
                          <p className="text-xs text-muted-foreground">
                            {progress.current} / {progress.target}
                          </p>
                        </div>
                      )}

                      {isEarned ? (
                        <Badge className="gap-1 bg-yellow-500 hover:bg-yellow-600 text-yellow-950">
                          <Trophy className="w-3 h-3" />
                          +{definition.xp_reward} XP
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1">
                          <Target className="w-3 h-3" />
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
      </div>

      {/* Overall Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Overall Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 rounded-lg bg-primary/5">
              <div className="text-3xl font-bold text-primary mb-1">{achievements.length}</div>
              <p className="text-sm text-muted-foreground">Achievements</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-blue-500/5">
              <div className="text-3xl font-bold text-blue-500 mb-1">{plantStats.tasksCompleted}</div>
              <p className="text-sm text-muted-foreground">Tasks Done</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-orange-500/5">
              <div className="text-3xl font-bold text-orange-500 mb-1">{stats?.longest_streak_days || 0}</div>
              <p className="text-sm text-muted-foreground">Best Streak</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-500/5">
              <div className="text-3xl font-bold text-green-500 mb-1">{plantStats.totalPlants}</div>
              <p className="text-sm text-muted-foreground">Total Plants</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AchievementsDashboard;