import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { AlertCircle, Sparkles } from "lucide-react";

const About = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" ref={ref} className="py-20 bg-gradient-soft relative overflow-hidden">
      {/* Animated gradient orbs with perpetual floating */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl float-sway float-slow" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl float-drift float-glacial float-delay-3" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, ease: [0.6, 0.05, 0.01, 0.9] }}
        >
          <div className="text-center mb-12">
            <motion.div 
              className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6 float-breathing"
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : { scale: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Sparkles className="w-8 h-8 text-primary float-bob float-delay-2" />
            </motion.div>
            
            <motion.h2 
              className="text-4xl md:text-5xl font-bold text-foreground mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              About FloraGuard
            </motion.h2>
          </div>

          <motion.div 
            className="bg-card rounded-2xl p-8 md:p-12 shadow-large glass-morph border border-border/30 float-gentle float-slow"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center float-bob float-delay-1">
                <AlertCircle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-3">The Problem</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  In today's fast-paced world, many people struggle to care for their indoor plants. 
                  Busy schedules, lack of knowledge, and forgetfulness lead to neglected plants, 
                  disease outbreaks, and ultimately, plant loss.
                </p>
              </div>
            </div>

            <div className="h-px bg-border my-8" />

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center float-bob float-delay-3">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-3">The Solution</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-primary">FloraGuard</span> is an AI-powered
                  plant caretaker that helps you nurture healthy, thriving plants. With 
                  intelligent disease detection, personalized care schedules, weather integration, 
                  and gamification, we make plant care simple, engaging, and sustainable. Never 
                  forget to water again, detect problems early, and watch your green companions flourish.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
