import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Zap } from "lucide-react";
import { useGamification } from "@/hooks/useGamification";

const LevelProgressBar = () => {
  const { stats, getXpForNextLevel } = useGamification();

  if (!stats) return null;

  const xpForCurrentLevel = stats.level === 1 ? 0 : Math.pow(stats.level - 1, 2) * 100;
  const xpForNextLevel = getXpForNextLevel(stats.level);
  const xpInCurrentLevel = stats.total_xp - xpForCurrentLevel;
  const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
  const progress = (xpInCurrentLevel / xpNeededForLevel) * 100;

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/20">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Level</div>
              <div className="text-2xl font-bold">{stats.level}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Total XP
            </div>
            <div className="text-lg font-semibold">{stats.total_xp.toLocaleString()}</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Progress value={progress} className="h-3" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{xpInCurrentLevel} / {xpNeededForLevel} XP</span>
            <span>{Math.round(progress)}% to Level {stats.level + 1}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border/50">
          <div className="text-center">
            <div className="text-lg font-bold text-orange-500">{stats.current_streak_days}</div>
            <div className="text-xs text-muted-foreground">Day Streak</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-500">{stats.tasks_completed}</div>
            <div className="text-xs text-muted-foreground">Tasks Done</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-500">{stats.achievements_earned}</div>
            <div className="text-xs text-muted-foreground">Achievements</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LevelProgressBar;
