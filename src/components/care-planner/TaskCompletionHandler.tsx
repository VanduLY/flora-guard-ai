import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGamificationContext } from '@/contexts/GamificationContext';

export const TaskCompletionHandler = () => {
  const { addXp, updateStreak, incrementStat, checkAndAwardAchievement, stats } = useGamificationContext();

  useEffect(() => {
    const channel = supabase
      .channel('task_completions')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'care_tasks',
          filter: 'status=eq.completed',
        },
        async (payload: any) => {
          // Award XP for task completion
          await addXp(25, 'Task completed');
          await updateStreak();
          await incrementStat('tasks_completed', 1);

          // Check for task-based achievements
          if (stats) {
            const newTaskCount = stats.tasks_completed + 1;
            
            if (newTaskCount === 1) {
              await checkAndAwardAchievement('first_task');
            } else if (newTaskCount === 10) {
              await checkAndAwardAchievement('ten_tasks');
            } else if (newTaskCount === 50) {
              await checkAndAwardAchievement('fifty_tasks');
            }

            // Check for time-based achievements
            const completedAt = new Date(payload.new.completed_at);
            const hour = completedAt.getHours();
            
            if (hour < 8) {
              await checkAndAwardAchievement('early_bird');
            } else if (hour >= 22) {
              await checkAndAwardAchievement('night_owl');
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [stats]);

  return null;
};
