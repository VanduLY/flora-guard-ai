import { Droplet, Scissors, Leaf, Package, Bug, Sun, CheckCircle2, Edit2, Calendar, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, isPast } from "date-fns";
import { cn } from "@/lib/utils";

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

interface CalendarTaskListProps {
  tasks: Task[];
  onTaskComplete: (taskId: string) => void;
  onTaskEdit: (task: Task) => void;
  onTaskReschedule: (taskId: string, newDate: Date) => void;
  loading?: boolean;
}

const TASK_ICONS: Record<string, any> = {
  watering: Droplet,
  fertilizing: Leaf,
  pruning: Scissors,
  repotting: Package,
  pest_control: Bug,
  sunlight: Sun,
};

const CalendarTaskList = ({
  tasks,
  onTaskComplete,
  onTaskEdit,
  onTaskReschedule,
  loading,
}: CalendarTaskListProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No tasks for this selection</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const Icon = TASK_ICONS[task.task_type] || Leaf;
        const isOverdue = isPast(new Date(task.due_date)) && task.status !== "completed";
        const isCompleted = task.status === "completed";

        return (
          <div
            key={task.id}
            className={cn(
              "p-4 rounded-lg border bg-card transition-all hover:shadow-md",
              isCompleted && "opacity-60",
              isOverdue && "border-red-500/50 bg-red-500/5"
            )}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div
                className={cn(
                  "p-2 rounded-lg",
                  task.priority === "high" && !isCompleted
                    ? "bg-red-500/10"
                    : task.priority === "medium" && !isCompleted
                    ? "bg-yellow-500/10"
                    : "bg-primary/10"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4",
                    task.priority === "high" && !isCompleted
                      ? "text-red-500"
                      : task.priority === "medium" && !isCompleted
                      ? "text-yellow-500"
                      : "text-primary"
                  )}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4
                      className={cn(
                        "font-medium",
                        isCompleted && "line-through text-muted-foreground"
                      )}
                    >
                      {task.title}
                    </h4>
                    {task.plant && (
                      <p className="text-sm text-muted-foreground">
                        {task.plant.nickname} • {task.plant.species}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {isOverdue && !isCompleted && (
                      <Badge variant="destructive" className="text-xs gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Overdue
                      </Badge>
                    )}
                    <Badge
                      variant={
                        task.priority === "high"
                          ? "destructive"
                          : task.priority === "medium"
                          ? "secondary"
                          : "outline"
                      }
                      className="text-xs"
                    >
                      {task.priority}
                    </Badge>
                  </div>
                </div>

                {task.description && (
                  <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                )}

                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(task.due_date), "MMM d, yyyy")}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {!isCompleted && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onTaskComplete(task.id)}
                      className="gap-2"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      Complete
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onTaskEdit(task)}
                    className="gap-2"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CalendarTaskList;
