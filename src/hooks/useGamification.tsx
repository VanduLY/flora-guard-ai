import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import * as LucideIcons from 'lucide-react';

export interface UserStats {
  id: string;
  user_id: string;
  total_xp: number;
  level: number;
  current_streak_days: number;
  longest_streak_days: number;
  last_activity_date: string | null;
  tasks_completed: number;
  plants_added: number;
  achievements_earned: number;
  perfect_weeks: number;
  diseases_treated: number;
}

export interface Achievement {
  id: string;
  user_id: string;
  plant_id: string | null;
  achievement_type: string;
  title: string;
  description: string | null;
  icon: string | null;
  earned_at: string;
  metadata: any;
}

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  achievement_type: string;
  color: string;
  xp_reward: number;
  requirement_count: number | null;
}

export const useGamification = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [definitions, setDefinitions] = useState<AchievementDefinition[]>([]);
  const [loading, setLoading] = useState(true);

  const calculateLevel = (xp: number): number => {
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  };

  const getXpForNextLevel = (currentLevel: number): number => {
    return Math.pow(currentLevel, 2) * 100;
  };

  const initializeStats = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_stats')
      .insert({
        user_id: userId,
        total_xp: 0,
        level: 1,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const fetchStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let { data: statsData, error: statsError } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (statsError) {
      console.error('Error fetching stats:', statsError);
      return;
    }

    if (!statsData) {
      statsData = await initializeStats(user.id);
    }

    setStats(statsData);
  };

  const fetchAchievements = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('plant_achievements')
      .select('*')
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false });

    if (error) {
      console.error('Error fetching achievements:', error);
      return;
    }

    setAchievements(data || []);
  };

  const fetchDefinitions = async () => {
    const { data, error } = await supabase
      .from('achievement_definitions')
      .select('*')
      .order('xp_reward', { ascending: true });

    if (error) {
      console.error('Error fetching definitions:', error);
      return;
    }

    setDefinitions(data || []);
  };

  const addXp = async (amount: number, reason?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !stats) return;

    const newXp = stats.total_xp + amount;
    const newLevel = calculateLevel(newXp);
    const leveledUp = newLevel > stats.level;

    const { error } = await supabase
      .from('user_stats')
      .update({
        total_xp: newXp,
        level: newLevel,
      })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error adding XP:', error);
      return;
    }

    setStats({ ...stats, total_xp: newXp, level: newLevel });

    if (leveledUp) {
      toast.success(`🎉 Level Up! You're now level ${newLevel}!`);
    } else if (reason) {
      toast.success(`+${amount} XP: ${reason}`);
    }
  };

  const updateStreak = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !stats) return;

    const today = new Date().toISOString().split('T')[0];
    const lastActivity = stats.last_activity_date;

    let newStreak = stats.current_streak_days;

    if (!lastActivity || lastActivity !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastActivity === yesterdayStr) {
        newStreak += 1;
      } else if (!lastActivity) {
        newStreak = 1;
      } else {
        newStreak = 1;
      }

      const longestStreak = Math.max(stats.longest_streak_days, newStreak);

      await supabase
        .from('user_stats')
        .update({
          current_streak_days: newStreak,
          longest_streak_days: longestStreak,
          last_activity_date: today,
        })
        .eq('user_id', user.id);

      setStats({
        ...stats,
        current_streak_days: newStreak,
        longest_streak_days: longestStreak,
        last_activity_date: today,
      });

      if (newStreak === 7 || newStreak === 30) {
        checkAndAwardAchievement(newStreak === 7 ? 'seven_day_streak' : 'thirty_day_streak');
      }
    }
  };

  const incrementStat = async (statName: keyof UserStats, amount: number = 1) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !stats) return;

    const newValue = (stats[statName] as number) + amount;

    await supabase
      .from('user_stats')
      .update({ [statName]: newValue })
      .eq('user_id', user.id);

    setStats({ ...stats, [statName]: newValue });
  };

  const checkAndAwardAchievement = async (achievementId: string, plantId?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check if already earned
    const existing = achievements.find(a => a.id === achievementId);
    if (existing) return;

    const definition = definitions.find(d => d.id === achievementId);
    if (!definition) return;

    // Award achievement
    const { error } = await supabase
      .from('plant_achievements')
      .insert({
        user_id: user.id,
        plant_id: plantId || null,
        achievement_type: definition.achievement_type,
        title: definition.title,
        description: definition.description,
        icon: definition.icon,
        metadata: {},
      });

    if (error) {
      console.error('Error awarding achievement:', error);
      return;
    }

    // Add XP reward
    await addXp(definition.xp_reward);
    await incrementStat('achievements_earned', 1);

    // Show toast with icon
    const IconComponent = (LucideIcons as any)[definition.icon] || LucideIcons.Trophy;
    toast.success(
      <div className="flex items-center gap-2">
        <IconComponent className="w-5 h-5" />
        <div>
          <div className="font-semibold">Achievement Unlocked!</div>
          <div className="text-sm">{definition.title}</div>
        </div>
      </div>
    );

    fetchAchievements();
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchAchievements(), fetchDefinitions()]);
      setLoading(false);
    };

    loadData();

    // Subscribe to stats changes
    const channel = supabase
      .channel('user_stats_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_stats',
        },
        () => fetchStats()
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'plant_achievements',
        },
        () => fetchAchievements()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    stats,
    achievements,
    definitions,
    loading,
    addXp,
    updateStreak,
    incrementStat,
    checkAndAwardAchievement,
    calculateLevel,
    getXpForNextLevel,
    refresh: () => {
      fetchStats();
      fetchAchievements();
    },
  };
};
