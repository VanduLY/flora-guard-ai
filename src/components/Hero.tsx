import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Leaf, UserPlus } from "lucide-react";
import heroImage from "@/assets/hero-plants.jpg";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useDepthFloating, useMicroBreathing, useLiquidIconFloat } from "@/hooks/use-cinematic-float";

const Hero = () => {
  const navigate = useNavigate();
  
  // Apply cinematic floating animations
  useDepthFloating('.hero-title', 'foreground');
  useDepthFloating('.hero-subtitle', 'midground');
  useDepthFloating('.hero-badge', 'background');
  useMicroBreathing('.hero-button');
  useLiquidIconFloat('.hero-icon');
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero animate-gradient">
      {/* Background image with overlay - parallax effect */}
      <div 
        className="absolute inset-0 z-0 parallax-slow"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.15
        }}
      />
      
      {/* Floating leaf particles with parallax */}
      <div className="absolute inset-0 z-0 overflow-hidden parallax-fast">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -50, 0],
              x: [0, 20, 0],
              rotate: [0, 360, 0],
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 15 + i * 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.7,
            }}
          >
            <Leaf className="w-12 h-12 text-white/30" />
          </motion.div>
        ))}
      </div>

      <motion.div 
        className="container mx-auto px-4 z-10 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6 cinematic-float hero-badge"
            variants={itemVariants}
          >
            <Sparkles className="w-4 h-4 text-white hero-icon" />
            <span className="text-white text-sm font-medium">AI-Powered Plant Care</span>
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight gradient-text-reveal cinematic-float depth-layer-2 hero-title"
            variants={itemVariants}
          >
            FloraGuard – Your Plant Caretaker
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto cinematic-float depth-layer-1 hero-subtitle"
            variants={itemVariants}
          >
            AI-powered plant care made simple, sustainable, and engaging. Never let your green friends down again.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            variants={itemVariants}
          >
            <Button 
              size="lg" 
              variant="hero"
              className="group cinematic-float hero-button"
              onClick={() => navigate("/login?signup=true")}
            >
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform hero-icon" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-primary cinematic-float hero-button flex items-center gap-2"
              onClick={() => navigate("/login?signup=true")}
            >
              <UserPlus className="w-5 h-5" />
              Sign Up
            </Button>
          </motion.div>
        </div>
      </motion.div>


      {/* Scroll indicator - Leaf */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        animate={{ 
          y: [0, 15, 0],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Leaf className="w-8 h-8 text-white/70" />
      </motion.div>
    </section>
  );
};

export default Hero;
