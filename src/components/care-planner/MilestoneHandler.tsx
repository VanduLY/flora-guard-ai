import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGamificationContext } from '@/contexts/GamificationContext';

export const MilestoneHandler = () => {
  const { addXp, checkAndAwardAchievement } = useGamificationContext();

  useEffect(() => {
    const channel = supabase
      .channel('milestone_additions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'growth_milestones',
        },
        async (payload: any) => {
          // Award XP for logging a milestone
          await addXp(20, 'Growth milestone recorded');

          // Check for flowering milestone
          if (payload.new.milestone_type === 'flowering' || 
              payload.new.title.toLowerCase().includes('bloom') || 
              payload.new.title.toLowerCase().includes('flower')) {
            await checkAndAwardAchievement('first_bloom', payload.new.plant_id);
          }

          // Count total milestones for growth tracker achievement
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { count } = await supabase
              .from('growth_milestones')
              .select('*', { count: 'exact', head: true })
              .eq('plant_id', payload.new.plant_id);

            if (count === 10) {
              await checkAndAwardAchievement('growth_tracker', payload.new.plant_id);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return null;
};
