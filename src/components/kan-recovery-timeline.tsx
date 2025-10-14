import { motion } from "framer-motion";
import { Calendar, CheckCircle, Clock, Droplets, Sun, AlertCircle } from "lucide-react";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";

interface RecoveryStage {
  day: number;
  stage: string;
  description: string;
  careActions: string[];
  icon: React.ReactNode;
  status: "completed" | "current" | "upcoming";
}

interface KanRecoveryTimelineProps {
  diseaseType: string;
  severity: "mild" | "moderate" | "severe";
}

const KanRecoveryTimeline = ({ diseaseType, severity }: KanRecoveryTimelineProps) => {
  // Calculate recovery duration based on severity
  const getRecoveryDuration = () => {
    switch (severity) {
      case "mild":
        return { days: 7, weeks: 1 };
      case "moderate":
        return { days: 21, weeks: 3 };
      case "severe":
        return { days: 42, weeks: 6 };
      default:
        return { days: 14, weeks: 2 };
    }
  };

  const recovery = getRecoveryDuration();
  const currentDay = 1; // This would be calculated based on scan date in production
  const progress = (currentDay / recovery.days) * 100;

  // Generate recovery stages based on severity
  const getRecoveryStages = (): RecoveryStage[] => {
    const stages: RecoveryStage[] = [
      {
        day: 1,
        stage: "Treatment Started",
        description: "Begin immediate treatment protocol",
        careActions: [
          "Remove affected leaves if necessary",
          "Isolate plant from healthy plants",
          "Apply recommended treatment solution",
          "Adjust watering schedule"
        ],
        icon: <AlertCircle className="w-5 h-5" />,
        status: currentDay >= 1 ? "completed" : "upcoming"
      },
      {
        day: Math.floor(recovery.days * 0.25),
        stage: "Early Response",
        description: "Monitor initial treatment response",
        careActions: [
          "Check for spread of disease",
          "Maintain consistent treatment schedule",
          "Ensure proper light exposure",
          "Monitor soil moisture levels"
        ],
        icon: <Sun className="w-5 h-5" />,
        status: currentDay >= Math.floor(recovery.days * 0.25) ? "completed" : currentDay === Math.floor(recovery.days * 0.25) ? "current" : "upcoming"
      },
      {
        day: Math.floor(recovery.days * 0.5),
        stage: "Active Recovery",
        description: "Visible improvement expected",
        careActions: [
          "Continue treatment regimen",
          "Increase nutrient supplementation",
          "Prune any dead tissue",
          "Maintain optimal humidity"
        ],
        icon: <Droplets className="w-5 h-5" />,
        status: currentDay >= Math.floor(recovery.days * 0.5) ? "completed" : currentDay === Math.floor(recovery.days * 0.5) ? "current" : "upcoming"
      },
      {
        day: Math.floor(recovery.days * 0.75),
        stage: "Late Recovery",
        description: "Gradual reduction of symptoms",
        careActions: [
          "Begin tapering treatment intensity",
          "Resume normal watering schedule",
          "Fertilize with balanced nutrients",
          "Monitor for any relapse signs"
        ],
        icon: <Clock className="w-5 h-5" />,
        status: currentDay >= Math.floor(recovery.days * 0.75) ? "completed" : currentDay === Math.floor(recovery.days * 0.75) ? "current" : "upcoming"
      },
      {
        day: recovery.days,
        stage: "Full Recovery",
        description: "Plant returns to healthy state",
        careActions: [
          "Resume normal care routine",
          "Continue preventive measures",
          "Monitor for 2 weeks post-recovery",
          "Document successful treatment"
        ],
        icon: <CheckCircle className="w-5 h-5" />,
        status: currentDay >= recovery.days ? "completed" : "upcoming"
      }
    ];

    return stages;
  };

  const stages = getRecoveryStages();

  const getSeverityColor = () => {
    switch (severity) {
      case "mild":
        return "text-green-500";
      case "moderate":
        return "text-yellow-500";
      case "severe":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-500 border-green-500/50";
      case "current":
        return "bg-primary/20 text-primary border-primary/50";
      case "upcoming":
        return "bg-muted text-muted-foreground border-border";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Recovery Timeline</h3>
            <p className="text-muted-foreground">
              Estimated recovery time for {diseaseType}
            </p>
          </div>
          <Badge variant="outline" className={getSeverityColor()}>
            {severity.charAt(0).toUpperCase() + severity.slice(1)} Severity
          </Badge>
        </div>

        {/* Overall Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Overall Progress</span>
            <span className="text-sm text-muted-foreground">
              Day {currentDay} of {recovery.days} ({recovery.weeks} weeks)
            </span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Timeline Stages */}
        <div className="space-y-4">
          {stages.map((stage, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative pl-8 pb-6 ${index !== stages.length - 1 ? 'border-l-2 border-border ml-3' : ''}`}
            >
              {/* Timeline dot */}
              <div className={`absolute left-0 -ml-3.5 w-6 h-6 rounded-full flex items-center justify-center border-2 ${getStatusColor(stage.status)}`}>
                {stage.status === "completed" && (
                  <CheckCircle className="w-4 h-4" />
                )}
                {stage.status === "current" && (
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                )}
              </div>

              {/* Stage Content */}
              <div className={`p-4 rounded-lg border ${getStatusColor(stage.status)}`}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-muted-foreground mt-1">
                    {stage.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-foreground">{stage.stage}</h4>
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="w-3 h-3 mr-1" />
                        Day {stage.day}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{stage.description}</p>
                  </div>
                </div>

                {/* Care Actions */}
                <div className="ml-8">
                  <p className="text-xs font-medium text-foreground mb-2">Care Actions:</p>
                  <ul className="space-y-1">
                    {stage.careActions.map((action, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
};

export default KanRecoveryTimeline;
