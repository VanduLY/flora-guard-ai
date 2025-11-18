import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, Mail } from 'lucide-react';
import { useNotificationGenerator, NotificationType } from '@/hooks/useNotificationGenerator';
import { toast } from 'sonner';

export const NotificationDemo = () => {
  const { generateNotification, isGenerating } = useNotificationGenerator();
  const [notificationType, setNotificationType] = useState<NotificationType>('watering_overdue');
  const [userName, setUserName] = useState('Alex');
  const [plantName, setPlantName] = useState('Spike');
  const [plantType, setPlantType] = useState('Snake Plant');
  const [generatedContent, setGeneratedContent] = useState<string>('');

  const notificationTypes: { value: NotificationType; label: string }[] = [
    { value: 'watering_overdue', label: '💧 Watering (Overdue)' },
    { value: 'watering_scheduled', label: '💦 Watering (Scheduled)' },
    { value: 'fertilizer', label: '🌱 Fertilizer Reminder' },
    { value: 'sunlight_low', label: '☀️ Needs More Sun' },
    { value: 'sunlight_high', label: '🌞 Too Much Sun' },
    { value: 'milestone', label: '🌸 Plant Milestone' },
    { value: 'pruning', label: '✂️ Pruning/Maintenance' },
    { value: 'general_tip', label: '💡 General Tip' },
  ];

  const handleGeneratePush = async () => {
    const result = await generateNotification({
      notificationType,
      format: 'push',
      userName,
      plantName,
      plantType,
    });

    if (result?.content) {
      setGeneratedContent(result.content);
      toast.success(result.content, {
        duration: 6000,
        position: 'top-center',
      });
    }
  };

  const handleGenerateEmail = async () => {
    const result = await generateNotification({
      notificationType,
      format: 'email',
      userName,
      plantName,
      plantType,
    });

    if (result?.subject && result?.body) {
      const emailContent = `${result.subject}\n\n${result.body}`;
      setGeneratedContent(emailContent);
      toast.success('Email generated! Check below.', {
        duration: 3000,
      });
    }
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">AI Notification Generator</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="userName">Your Name</Label>
            <Input
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Alex"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="plantName">Plant Name</Label>
            <Input
              id="plantName"
              value={plantName}
              onChange={(e) => setPlantName(e.target.value)}
              placeholder="Spike"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="plantType">Plant Type</Label>
            <Input
              id="plantType"
              value={plantType}
              onChange={(e) => setPlantType(e.target.value)}
              placeholder="Snake Plant"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notificationType">Notification Type</Label>
            <Select value={notificationType} onValueChange={(value) => setNotificationType(value as NotificationType)}>
              <SelectTrigger id="notificationType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {notificationTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleGeneratePush}
            disabled={isGenerating}
            className="flex-1"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Push Notification
              </>
            )}
          </Button>

          <Button
            onClick={handleGenerateEmail}
            disabled={isGenerating}
            variant="outline"
            className="flex-1"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Generate Email
              </>
            )}
          </Button>
        </div>

        {generatedContent && (
          <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
            <Label className="text-sm font-medium text-muted-foreground mb-2 block">
              Generated Content:
            </Label>
            <p className="text-sm text-foreground whitespace-pre-wrap">{generatedContent}</p>
          </div>
        )}
      </div>
    </Card>
  );
};
