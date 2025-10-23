import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Droplet, Scissors, Leaf, CheckCircle2 } from "lucide-react";
import { fadeInUp } from "@/lib/motion-config";
import { useState } from "react";

const CareCalendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const upcomingTasks = [
    { id: 1, plant: "Monstera", task: "Watering", dueIn: "Today", icon: Droplet, urgent: true },
    { id: 2, plant: "Peace Lily", task: "Fertilizing", dueIn: "Tomorrow", icon: Leaf, urgent: false },
    { id: 3, plant: "Fiddle Leaf Fig", task: "Pruning", dueIn: "In 3 days", icon: Scissors, urgent: false },
  ];

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold mb-2">Care Calendar</h2>
        <p className="text-muted-foreground">
          AI-powered care schedules adapted to weather and plant needs
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              Monthly Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-lg border shadow-sm"
            />
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingTasks.map((task) => (
              <div
                key={task.id}
                className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${task.urgent ? 'bg-red-500/10' : 'bg-primary/10'}`}>
                      <task.icon className={`w-4 h-4 ${task.urgent ? 'text-red-500' : 'text-primary'}`} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{task.plant}</p>
                      <p className="text-xs text-muted-foreground">{task.task}</p>
                    </div>
                  </div>
                  <Badge variant={task.urgent ? "destructive" : "secondary"} className="text-xs">
                    {task.dueIn}
                  </Badge>
                </div>
                <Button size="sm" variant="outline" className="w-full gap-2 mt-2">
                  <CheckCircle2 className="w-3 h-3" />
                  Mark Complete
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Today's Tasks Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Full task management system coming soon! ✨
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CareCalendar;
