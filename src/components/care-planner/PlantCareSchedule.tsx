import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Droplet, Sun, Scissors, Leaf, Bug, Plus, 
  Check, Clock, AlertCircle, Calendar, Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, isPast, isToday, addDays, differenceInDays } from "date-fns";

interface PlantCareScheduleProps {
  plantId: string;
  plantName: string;
  waterFrequency?: number;
}

interface CareSchedule {
  id: string;
  task_type: string;
  frequency_days: number;
  next_due_at: string;
  last_completed_at: string | null;
  priority: string;
  custom_instructions: string | null;
}

interface CareTask {
  id: string;
  task_type: string;
  title: string;
  due_date: string;
  status: string;
  priority: string;
}

const TASK_TYPES = [
  { value: "watering", label: "Watering", icon: Droplet, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  { value: "fertilizing", label: "Fertilizing", icon: Leaf, color: "text-green-500", bgColor: "bg-green-500/10" },
  { value: "pruning", label: "Pruning", icon: Scissors, color: "text-orange-500", bgColor: "bg-orange-500/10" },
  { value: "sunlight", label: "Sunlight Check", icon: Sun, color: "text-yellow-500", bgColor: "bg-yellow-500/10" },
  { value: "pest_check", label: "Pest Check", icon: Bug, color: "text-red-500", bgColor: "bg-red-500/10" },
];

const PlantCareSchedule = ({ plantId, plantName, waterFrequency = 7 }: PlantCareScheduleProps) => {
  const [schedules, setSchedules] = useState<CareSchedule[]>([]);
  const [tasks, setTasks] = useState<CareTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    task_type: "watering",
    frequency_days: waterFrequency,
    priority: "medium",
    custom_instructions: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [plantId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load schedules
      const { data: schedulesData, error: schedulesError } = await supabase
        .from('care_schedules')
        .select('*')
        .eq('plant_id', plantId)
        .order('next_due_at', { ascending: true });

      if (schedulesError) throw schedulesError;
      setSchedules(schedulesData || []);

      // Load upcoming tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('care_tasks')
        .select('*')
        .eq('plant_id', plantId)
        .eq('status', 'pending')
        .order('due_date', { ascending: true })
        .limit(5);

      if (tasksError) throw tasksError;
      setTasks(tasksData || []);
    } catch (error) {
      console.error('Error loading care data:', error);
      toast.error("Failed to load care schedule");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSchedule = async () => {
    setIsSubmitting(true);
    try {
      const nextDue = addDays(new Date(), newSchedule.frequency_days);
      
      const { error } = await supabase
        .from('care_schedules')
        .insert({
          plant_id: plantId,
          task_type: newSchedule.task_type,
          frequency_days: newSchedule.frequency_days,
          priority: newSchedule.priority,
          custom_instructions: newSchedule.custom_instructions || null,
          next_due_at: nextDue.toISOString(),
        });

      if (error) throw error;

      toast.success("Care schedule created!");
      setShowAddForm(false);
      setNewSchedule({
        task_type: "watering",
        frequency_days: waterFrequency,
        priority: "medium",
        custom_instructions: "",
      });
      loadData();
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast.error("Failed to create schedule");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteTask = async (scheduleId: string, taskType: string) => {
    try {
      const schedule = schedules.find(s => s.id === scheduleId);
      if (!schedule) return;

      const nextDue = addDays(new Date(), schedule.frequency_days);
      
      // Update schedule
      const { error: scheduleError } = await supabase
        .from('care_schedules')
        .update({
          last_completed_at: new Date().toISOString(),
          next_due_at: nextDue.toISOString(),
        })
        .eq('id', scheduleId);

      if (scheduleError) throw scheduleError;

      // Create completed task record
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('care_tasks').insert({
          plant_id: plantId,
          task_type: taskType,
          title: `${taskType.charAt(0).toUpperCase() + taskType.slice(1)} - ${plantName}`,
          due_date: new Date().toISOString(),
          status: 'completed',
          completed_at: new Date().toISOString(),
          priority: schedule.priority,
        });
      }

      toast.success(`${taskType} completed! 🎉`);
      loadData();
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error("Failed to mark as complete");
    }
  };

  const getTaskTypeInfo = (type: string) => {
    return TASK_TYPES.find(t => t.value === type) || TASK_TYPES[0];
  };

  const getStatusBadge = (nextDue: string) => {
    const dueDate = new Date(nextDue);
    if (isPast(dueDate) && !isToday(dueDate)) {
      return <Badge variant="destructive" className="text-xs">Overdue</Badge>;
    }
    if (isToday(dueDate)) {
      return <Badge className="text-xs bg-yellow-500/20 text-yellow-600">Due Today</Badge>;
    }
    const daysUntil = differenceInDays(dueDate, new Date());
    if (daysUntil <= 2) {
      return <Badge variant="outline" className="text-xs">In {daysUntil} day{daysUntil > 1 ? 's' : ''}</Badge>;
    }
    return <Badge variant="secondary" className="text-xs">{format(dueDate, 'MMM d')}</Badge>;
  };

  const getProgressValue = (schedule: CareSchedule) => {
    if (!schedule.last_completed_at) return 0;
    const lastCompleted = new Date(schedule.last_completed_at);
    const nextDue = new Date(schedule.next_due_at);
    const total = differenceInDays(nextDue, lastCompleted);
    const elapsed = differenceInDays(new Date(), lastCompleted);
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Active Schedules */}
      {schedules.length > 0 ? (
        <div className="space-y-3">
          {schedules.map((schedule) => {
            const typeInfo = getTaskTypeInfo(schedule.task_type);
            const Icon = typeInfo.icon;
            const isOverdue = isPast(new Date(schedule.next_due_at)) && !isToday(new Date(schedule.next_due_at));
            const isDueToday = isToday(new Date(schedule.next_due_at));
            
            return (
              <Card 
                key={schedule.id} 
                className={`transition-all duration-300 ${isOverdue ? 'border-red-500/50 bg-red-500/5' : isDueToday ? 'border-yellow-500/50 bg-yellow-500/5' : ''}`}
              >
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${typeInfo.bgColor}`}>
                        <Icon className={`w-5 h-5 ${typeInfo.color}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium capitalize">{schedule.task_type.replace('_', ' ')}</p>
                          {getStatusBadge(schedule.next_due_at)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Every {schedule.frequency_days} day{schedule.frequency_days > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => handleCompleteTask(schedule.id, schedule.task_type)}
                      className={isOverdue || isDueToday ? 'bg-primary' : 'bg-primary/80'}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Done
                    </Button>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mt-3">
                    <Progress value={getProgressValue(schedule)} className="h-1.5" />
                  </div>
                  
                  {schedule.custom_instructions && (
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      💡 {schedule.custom_instructions}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : !showAddForm && (
        <Card>
          <CardContent className="pt-6 text-center py-8">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground mb-4">No care schedules yet</p>
            <Button onClick={() => setShowAddForm(true)} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Create First Schedule
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add New Schedule Form */}
      {showAddForm && (
        <Card className="border-primary/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="w-5 h-5" />
              New Care Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Task Type</label>
                <Select 
                  value={newSchedule.task_type} 
                  onValueChange={(v) => setNewSchedule(p => ({ ...p, task_type: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <span className="flex items-center gap-2">
                          <type.icon className={`w-4 h-4 ${type.color}`} />
                          {type.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Frequency (days)</label>
                <Input 
                  type="number" 
                  min={1}
                  value={newSchedule.frequency_days}
                  onChange={(e) => setNewSchedule(p => ({ ...p, frequency_days: parseInt(e.target.value) || 7 }))}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Priority</label>
              <Select 
                value={newSchedule.priority} 
                onValueChange={(v) => setNewSchedule(p => ({ ...p, priority: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Instructions (optional)</label>
              <Textarea 
                placeholder="Add any special care instructions..."
                value={newSchedule.custom_instructions}
                onChange={(e) => setNewSchedule(p => ({ ...p, custom_instructions: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                onClick={handleCreateSchedule} 
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Create Schedule
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add button when schedules exist */}
      {schedules.length > 0 && !showAddForm && (
        <Button 
          variant="outline" 
          onClick={() => setShowAddForm(true)} 
          className="w-full gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Care Schedule
        </Button>
      )}
    </div>
  );
};

export default PlantCareSchedule;
