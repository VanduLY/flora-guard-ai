import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Play, X } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const Conclusion = () => {
  const navigate = useNavigate();
  const ref = useRef(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const statsVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 15,
      },
    },
  };

  return (
    <section ref={ref} className="py-20 bg-gradient-hero animate-gradient relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-40 h-40 bg-white/5 rounded-full blur-3xl"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-medium">Join the Green Revolution</span>
          </motion.div>

          <motion.h2 
            className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Grow Smarter. Care Easier. Live Greener.
          </motion.h2>
          
          <motion.p 
            className="text-xl text-white/90 mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            FloraGuard transforms plant care from a chore into a joyful, rewarding experience. 
            Join thousands of plant parents who've already discovered the difference.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button 
              size="lg" 
              variant="hero"
              className="group magnetic-btn"
              onClick={() => navigate("/login?signup=true")}
            >
              Join FloraGuard Today
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-primary magnetic-btn flex items-center gap-2"
              onClick={() => setShowVideoModal(true)}
            >
              <Play className="w-5 h-5" />
              Watch Demo
            </Button>
          </motion.div>

          {/* Video Demo Modal */}
          <Dialog open={showVideoModal} onOpenChange={setShowVideoModal}>
            <DialogContent className="max-w-4xl w-full p-0 bg-background/95 backdrop-blur-xl border-border overflow-hidden">
              <DialogTitle className="sr-only">FloraGuard Demo Video</DialogTitle>
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 z-10 bg-background/80 hover:bg-background"
                  onClick={() => setShowVideoModal(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
                <div className="aspect-video w-full bg-muted">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0&rel=0"
                    title="FloraGuard Demo"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="p-4 sm:p-6">
                  <h3 className="text-xl font-bold text-foreground mb-2">FloraGuard AI Demo</h3>
                  <p className="text-muted-foreground">
                    See how FloraGuard uses AI to detect plant diseases, provide care recommendations, 
                    and help you grow healthier plants. Upload a photo and get instant insights!
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <motion.div 
            className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {[
              { value: "10K+", label: "Active Users", delay: 0.6 },
              { value: "50K+", label: "Plants Saved", delay: 0.7 },
              { value: "95%", label: "Satisfaction", delay: 0.8 },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                className="text-center"
                variants={statsVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                transition={{ delay: stat.delay }}
              >
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-white/80 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Conclusion;
