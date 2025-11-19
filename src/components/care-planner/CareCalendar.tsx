import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Plus, Cloud, TrendingUp, Filter } from "lucide-react";
import { fadeInUp } from "@/lib/motion-config";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import TaskDialog from "./TaskDialog";
import SmartScheduleSuggestions from "./SmartScheduleSuggestions";
import TaskFilters from "./TaskFilters";
import CalendarTaskList from "./CalendarTaskList";
import { format, startOfMonth, endOfMonth, isToday, isSameDay } from "date-fns";

interface Task {
  id: string;
  title: string;
  task_type: string;
  due_date: string;
  status: string;
  priority: string;
  plant_id: string;
  description?: string;
  notes?: string;
  schedule_id?: string;
  completed_at?: string;
  created_at?: string;
  plant?: {
    nickname: string;
    species: string;
    image_url?: string;
  };
}

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  alerts?: any[];
  careTips?: any[];
}

const CareCalendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [filters, setFilters] = useState({
    plantId: null,
    taskType: null,
    priority: null,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadTasks();
    loadWeather();
  }, [date]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const start = startOfMonth(date || new Date());
      const end = endOfMonth(date || new Date());

      const { data, error } = await supabase
        .from("care_tasks")
        .select(`
          *,
          plant:user_plants!care_tasks_plant_id_fkey (
            nickname,
            species,
            image_url
          )
        `)
        .gte("due_date", start.toISOString())
        .lte("due_date", end.toISOString())
        .order("due_date", { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error("Error loading tasks:", error);
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadWeather = async () => {
    try {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const { data, error } = await supabase.functions.invoke("get-weather", {
              body: { latitude, longitude },
            });
            if (!error && data) setWeather(data);
          },
          () => console.log("Geolocation denied")
        );
      }
    } catch (error) {
      console.error("Weather fetch error:", error);
    }
  };

  const handleTaskComplete = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from("care_tasks")
        .update({ 
          status: "completed", 
          completed_at: new Date().toISOString() 
        })
        .eq("id", taskId);

      if (error) throw error;

      toast({
        title: "Task completed!",
        description: "Great job taking care of your plants 🌱",
      });
      loadTasks();
    } catch (error) {
      console.error("Error completing task:", error);
      toast({
        title: "Error",
        description: "Failed to complete task",
        variant: "destructive",
      });
    }
  };

  const handleTaskReschedule = async (taskId: string, newDate: Date) => {
    try {
      const { error } = await supabase
        .from("care_tasks")
        .update({ due_date: newDate.toISOString() })
        .eq("id", taskId);

      if (error) throw error;
      toast({ title: "Task rescheduled successfully" });
      loadTasks();
    } catch (error) {
      console.error("Error rescheduling task:", error);
      toast({
        title: "Error",
        description: "Failed to reschedule task",
        variant: "destructive",
      });
    }
  };

  const getTasksForDate = (checkDate: Date) => {
    return tasks.filter((task) =>
      isSameDay(new Date(task.due_date), checkDate)
    );
  };

  const getTodaysTasks = () => {
    return tasks.filter((task) => isToday(new Date(task.due_date)));
  };

  const getUpcomingTasks = () => {
    return tasks
      .filter((task) => new Date(task.due_date) > new Date() && task.status !== "completed")
      .slice(0, 5);
  };

  const getOverdueTasks = () => {
    return tasks.filter(
      (task) => new Date(task.due_date) < new Date() && task.status !== "completed"
    );
  };

  const applyFilters = (taskList: Task[]) => {
    let filtered = taskList;
    if (filters.plantId) {
      filtered = filtered.filter((t) => t.plant_id === filters.plantId);
    }
    if (filters.taskType) {
      filtered = filtered.filter((t) => t.task_type === filters.taskType);
    }
    if (filters.priority) {
      filtered = filtered.filter((t) => t.priority === filters.priority);
    }
    return filtered;
  };

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Smart Care Calendar</h2>
          <p className="text-muted-foreground">
            AI-powered care schedules adapted to weather and plant needs
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setSelectedTask(null);
              setShowTaskDialog(true);
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </Button>
        </div>
      </div>

      {/* If no tasks, show getting started */}
      {tasks.length === 0 && !loading ? (
        <Card className="border-dashed border-2 bg-card">
          <CardContent className="flex flex-col items-center justify-center py-16 px-4">
            <CalendarDays className="w-16 h-16 text-primary mb-4" />
            <h3 className="text-2xl font-bold mb-2 text-foreground">Your calendar is empty</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Create your first care task to start building a schedule for your plants. Add watering reminders, fertilizing schedules, and more!
            </p>
            <Button 
              onClick={() => {
                setSelectedTask(null);
                setShowTaskDialog(true);
              }} 
              className="gap-2" 
              size="lg"
            >
              <Plus className="w-4 h-4" />
              Create First Task
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Weather Card */}
          {weather && (
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Cloud className="w-10 h-10 text-primary" />
                <div>
                  <div className="text-2xl font-bold">{weather.temperature}°C</div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {weather.condition}
                  </div>
                </div>
              </div>
              {weather.alerts && weather.alerts.length > 0 && (
                <Badge variant="destructive" className="gap-1">
                  {weather.alerts.length} Alert{weather.alerts.length > 1 ? "s" : ""}
                </Badge>
              )}
            </div>
            {weather.careTips && weather.careTips.length > 0 && (
              <div className="mt-3 pt-3 border-t border-primary/20">
                <p className="text-sm text-muted-foreground">
                  💡 {weather.careTips[0].message}
                </p>
              </div>
            )}
          </CardContent>
          </Card>
        )}

        {/* Smart Suggestions */}
        <SmartScheduleSuggestions 
          weather={weather} 
          onScheduleCreated={loadTasks}
        />

        {/* Filters */}
        <TaskFilters filters={filters} onFiltersChange={setFilters} />

        <Tabs defaultValue="calendar" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="today">
              Today {getTodaysTasks().length > 0 && `(${getTodaysTasks().length})`}
            </TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="overdue">
              Overdue {getOverdueTasks().length > 0 && `(${getOverdueTasks().length})`}
            </TabsTrigger>
          </TabsList>

          {/* Calendar View */}
          <TabsContent value="calendar" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5" />
                  {format(date || new Date(), "MMMM yyyy")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-lg border shadow-sm pointer-events-auto"
                  modifiers={{
                    hasTask: (date) => getTasksForDate(date).length > 0,
                  }}
                  modifiersStyles={{
                    hasTask: {
                      fontWeight: "bold",
                      textDecoration: "underline",
                      color: "hsl(var(--primary))",
                    },
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  Tasks for {format(date || new Date(), "MMM d")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CalendarTaskList
                  tasks={applyFilters(getTasksForDate(date || new Date()))}
                  onTaskComplete={handleTaskComplete}
                  onTaskEdit={(task) => {
                    setSelectedTask(task);
                    setShowTaskDialog(true);
                  }}
                  onTaskReschedule={handleTaskReschedule}
                  loading={loading}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Today View */}
        <TabsContent value="today">
          <Card>
            <CardHeader>
              <CardTitle>Today's Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <CalendarTaskList
                tasks={applyFilters(getTodaysTasks())}
                onTaskComplete={handleTaskComplete}
                onTaskEdit={(task) => {
                  setSelectedTask(task);
                  setShowTaskDialog(true);
                }}
                onTaskReschedule={handleTaskReschedule}
                loading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Upcoming View */}
        <TabsContent value="upcoming">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <CalendarTaskList
                tasks={applyFilters(getUpcomingTasks())}
                onTaskComplete={handleTaskComplete}
                onTaskEdit={(task) => {
                  setSelectedTask(task);
                  setShowTaskDialog(true);
                }}
                onTaskReschedule={handleTaskReschedule}
                loading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Overdue View */}
        <TabsContent value="overdue">
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Overdue Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <CalendarTaskList
                tasks={applyFilters(getOverdueTasks())}
                onTaskComplete={handleTaskComplete}
                onTaskEdit={(task) => {
                  setSelectedTask(task);
                  setShowTaskDialog(true);
                }}
                onTaskReschedule={handleTaskReschedule}
                loading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </>
      )}

      {/* Task Dialog */}
      <TaskDialog
        open={showTaskDialog}
        onClose={() => {
          setShowTaskDialog(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onSuccess={loadTasks}
      />
    </motion.div>
  );
};

export default CareCalendar;
