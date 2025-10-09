import { Scan, Calendar, BarChart3, Cloud, Leaf } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const features = [
  {
    icon: Scan,
    title: "AI Disease Detection",
    description: "Upload a leaf photo and get instant diagnosis with remedies. Our AI identifies issues before they spread.",
  },
  {
    icon: Calendar,
    title: "Personalized Care Planner",
    description: "Smart watering and fertilizing schedules tailored to each plant's needs and your local climate.",
  },
  {
    icon: BarChart3,
    title: "Growth Tracker & Gamification",
    description: "Keep a plant diary, track happiness scores, and earn rewards as your plants flourish.",
  },
  {
    icon: Cloud,
    title: "Weather Integration",
    description: "Automatically skip watering if rain is forecast tomorrow. Smart care that adapts to nature.",
  },
  {
    icon: Leaf,
    title: "Carbon Footprint Tracker",
    description: "See your environmental impact and celebrate your contribution to a greener planet.",
  },
];

const Features = () => {
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

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <section ref={ref} className="py-20 bg-background relative overflow-hidden">
      {/* Gradient background blob with floating */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl float-combo-1 float-slow" />
      <div className="absolute bottom-20 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl float-combo-2 float-glacial float-delay-4" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Proposed System Features
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to become the best plant parent, powered by cutting-edge technology
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              whileHover={{ 
                y: -8, 
                scale: 1.02,
                transition: { duration: 0.3 } 
              }}
              className="bg-card rounded-2xl p-8 shadow-soft hover:shadow-large transition-all duration-300 group cursor-pointer glass-morph border border-border/50 feature-card float-gentle float-medium"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <motion.div 
                className="inline-flex items-center justify-center w-14 h-14 bg-gradient-primary rounded-xl mb-6 float-breathing"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <feature.icon className="w-7 h-7 text-white float-bob float-delay-1" />
              </motion.div>
              
              <h3 className="text-xl font-bold text-foreground mb-3">
                {feature.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
