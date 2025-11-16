import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGamificationContext } from '@/contexts/GamificationContext';

export const PlantAdditionHandler = () => {
  const { addXp, incrementStat, checkAndAwardAchievement, stats } = useGamificationContext();

  useEffect(() => {
    const channel = supabase
      .channel('plant_additions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_plants',
        },
        async (payload: any) => {
          // Award XP for adding a plant
          await addXp(30, 'Plant added to collection');
          await incrementStat('plants_added', 1);

          // Check for plant collection achievements
          if (stats) {
            const newPlantCount = stats.plants_added + 1;
            
            if (newPlantCount === 1) {
              await checkAndAwardAchievement('first_plant', payload.new.id);
            } else if (newPlantCount === 5) {
              await checkAndAwardAchievement('five_plants');
            } else if (newPlantCount === 10) {
              await checkAndAwardAchievement('ten_plants');
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
