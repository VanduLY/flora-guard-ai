import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Loader2,
  TrendingUp,
  Leaf,
  Droplet,
} from "lucide-react";
import { Progress } from "./ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Badge } from "./ui/badge";

interface KanDiseaseResultsProps {
  result: {
    healthStatus: "healthy" | "diseased" | "unknown";
    plantType?: string;
    diseaseDetected?: string | null;
    confidenceScore: number;
    diagnosis: string;
    symptoms?: string[];
    recommendations: string[];
  };
  isAnalyzing: boolean;
}

const KanDiseaseResults = ({ result, isAnalyzing }: KanDiseaseResultsProps) => {
  if (isAnalyzing) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-2xl p-8 shadow-soft"
      >
        <div className="flex flex-col items-center gap-4 py-12">
          <Loader2 className="w-16 h-16 text-primary animate-spin" />
          <p className="text-lg font-medium text-foreground">
            Analyzing your plant...
          </p>
          <p className="text-sm text-muted-foreground">
            AI is examining the image for diseases and health issues
          </p>
        </div>
      </motion.div>
    );
  }

  const getStatusIcon = () => {
    switch (result.healthStatus) {
      case "healthy":
        return <CheckCircle className="w-12 h-12 text-green-500" />;
      case "diseased":
        return <AlertTriangle className="w-12 h-12 text-destructive" />;
      default:
        return <HelpCircle className="w-12 h-12 text-muted-foreground" />;
    }
  };

  const getStatusColor = () => {
    switch (result.healthStatus) {
      case "healthy":
        return "text-green-500";
      case "diseased":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusBg = () => {
    switch (result.healthStatus) {
      case "healthy":
        return "bg-green-500/10";
      case "diseased":
        return "bg-destructive/10";
      default:
        return "bg-muted";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-8 shadow-soft space-y-6"
    >
      {/* Status Header */}
      <div className={`flex items-center gap-4 p-6 rounded-xl ${getStatusBg()}`}>
        {getStatusIcon()}
        <div className="flex-1">
          <h3 className={`text-2xl font-bold ${getStatusColor()} capitalize`}>
            {result.healthStatus}
          </h3>
          {result.plantType && (
            <p className="text-muted-foreground">Plant Type: {result.plantType}</p>
          )}
          {result.diseaseDetected && (
            <Badge variant="destructive" className="mt-2">
              {result.diseaseDetected}
            </Badge>
          )}
        </div>
      </div>

      {/* Confidence Score */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            Confidence Score
          </span>
          <span className="text-sm font-bold text-primary">
            {result.confidenceScore}%
          </span>
        </div>
        <Progress value={result.confidenceScore} className="h-3" />
      </div>

      {/* Diagnosis */}
      <div className="space-y-2">
        <h4 className="font-semibold text-foreground flex items-center gap-2">
          <Leaf className="w-5 h-5 text-primary" />
          Diagnosis
        </h4>
        <p className="text-muted-foreground leading-relaxed">{result.diagnosis}</p>
      </div>

      {/* Symptoms */}
      {result.symptoms && result.symptoms.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Observed Symptoms
          </h4>
          <ul className="space-y-2">
            {result.symptoms.map((symptom, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-muted-foreground"
              >
                <span className="text-primary mt-1">•</span>
                <span>{symptom}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="recommendations">
          <AccordionTrigger className="text-foreground font-semibold">
            <div className="flex items-center gap-2">
              <Droplet className="w-5 h-5 text-primary" />
              Treatment & Care Recommendations
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              {result.recommendations.map((recommendation, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg"
                >
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <p className="text-muted-foreground">{recommendation}</p>
                </motion.div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </motion.div>
  );
};

export default KanDiseaseResults;
