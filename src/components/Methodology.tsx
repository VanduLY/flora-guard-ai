import { UserPlus, Camera, Brain, CalendarCheck, Bell } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const steps = [
  { icon: UserPlus, title: "Register Plant", description: "Add your plant to the system" },
  { icon: Camera, title: "Upload Photo", description: "Capture leaf condition" },
  { icon: Brain, title: "AI Analysis", description: "Instant disease detection" },
  { icon: CalendarCheck, title: "Care Planner", description: "Get personalized schedule" },
  { icon: Bell, title: "Reminders & Tips", description: "Never miss care tasks" },
];

const Methodology = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 bg-gradient-soft">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Five simple steps to transform your plant care journey
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <div className="relative">
            {/* Animated connection line */}
            <motion.div 
              className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-primary -translate-y-1/2 z-0"
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
              style={{ transformOrigin: "left" }}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative z-10">
              {steps.map((step, index) => (
                <motion.div 
                  key={step.title}
                  className="flex flex-col items-center text-center"
                  initial={{ opacity: 0, y: 50, scale: 0.8 }}
                  animate={isInView ? { 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                  } : { 
                    opacity: 0, 
                    y: 50, 
                    scale: 0.8 
                  }}
                  transition={{ 
                    duration: 0.6, 
                    delay: 0.6 + index * 0.15,
                    type: "spring",
                    stiffness: 100,
                  }}
                >
                  <motion.div 
                    className="relative"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="w-20 h-20 bg-card rounded-full flex items-center justify-center shadow-medium mb-4 border-4 border-background">
                      <motion.div 
                        className="w-14 h-14 bg-gradient-primary rounded-full flex items-center justify-center"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <step.icon className="w-7 h-7 text-white" />
                      </motion.div>
                    </div>
                    <motion.div 
                      className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold shadow-soft"
                      initial={{ scale: 0 }}
                      animate={isInView ? { scale: 1 } : { scale: 0 }}
                      transition={{ 
                        duration: 0.4, 
                        delay: 0.8 + index * 0.15,
                        type: "spring",
                        stiffness: 200,
                      }}
                    >
                      {index + 1}
                    </motion.div>
                  </motion.div>
                  
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {step.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Methodology;
