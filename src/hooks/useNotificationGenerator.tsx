import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type NotificationType = 
  | 'watering_overdue'
  | 'watering_scheduled'
  | 'fertilizer'
  | 'sunlight_low'
  | 'sunlight_high'
  | 'milestone'
  | 'pruning'
  | 'general_tip';

interface GenerateNotificationParams {
  notificationType: NotificationType;
  format: 'push' | 'email';
  userName: string;
  plantName: string;
  plantType: string;
  context?: string;
}

interface NotificationResult {
  content?: string;
  subject?: string;
  body?: string;
}

export const useNotificationGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateNotification = async (params: GenerateNotificationParams): Promise<NotificationResult | null> => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-plant-notification', {
        body: params
      });

      if (error) throw error;

      return data as NotificationResult;
    } catch (error) {
      console.error('Error generating notification:', error);
      toast.error('Failed to generate notification');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAndShowNotification = async (params: Omit<GenerateNotificationParams, 'format'>) => {
    const result = await generateNotification({ ...params, format: 'push' });
    
    if (result?.content) {
      toast.success(result.content, {
        duration: 6000,
        position: 'top-center',
      });
    }
  };

  return {
    generateNotification,
    generateAndShowNotification,
    isGenerating,
  };
};
