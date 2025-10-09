import { CheckCircle, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const advantages = [
  "Early disease detection prevents plant loss",
  "Personalized care schedules improve plant health",
  "Weather-aware watering saves water and effort",
  "Gamification makes plant care fun and engaging",
  "Track environmental impact and carbon offset",
  "Smart reminders ensure you never forget care tasks",
];

const limitations = [
  "AI accuracy depends on training dataset quality",
  "Requires internet connection for full functionality",
  "Initial development requires significant AI/ML expertise",
  "May need regular model updates for new diseases",
  "Camera quality affects disease detection accuracy",
];

const Comparison = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <section ref={ref} className="py-20 bg-gradient-soft relative overflow-hidden">
      {/* Floating gradient orbs with perpetual motion */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl float-drift float-slow" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl float-sway float-glacial float-delay-4" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Advantages & Limitations
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Understanding what FloraGuard can and cannot do
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Advantages */}
          <motion.div 
            className="bg-card rounded-2xl p-8 shadow-large glass-morph border border-border/30 hover:border-primary/30 transition-all duration-500 float-gentle float-medium"
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center float-breathing">
                <CheckCircle className="w-6 h-6 text-primary float-bob float-delay-1" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Advantages</h3>
            </div>
            
            <motion.ul 
              className="space-y-4"
              variants={containerVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
            >
              {advantages.map((advantage, index) => (
                <motion.li
                  key={index}
                  variants={itemVariants}
                  className="flex items-start gap-3 group"
                >
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <span className="text-muted-foreground">{advantage}</span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          {/* Limitations */}
          <motion.div 
            className="bg-card rounded-2xl p-8 shadow-large glass-morph border border-border/30 hover:border-destructive/30 transition-all duration-500 float-gentle float-medium float-delay-2"
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center float-breathing">
                <AlertTriangle className="w-6 h-6 text-destructive float-bob float-delay-3" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Limitations</h3>
            </div>
            
            <motion.ul 
              className="space-y-4"
              variants={containerVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
            >
              {limitations.map((limitation, index) => (
                <motion.li
                  key={index}
                  variants={itemVariants}
                  className="flex items-start gap-3 group"
                >
                  <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <span className="text-muted-foreground">{limitation}</span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Comparison;
