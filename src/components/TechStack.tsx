import { Code2 } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const techCategories = [
  {
    category: "Frontend",
    tech: "React + Tailwind CSS",
    color: "from-blue-500 to-cyan-500",
  },
  {
    category: "Backend",
    tech: "Flask / FastAPI / Node.js",
    color: "from-green-500 to-emerald-500",
  },
  {
    category: "Database",
    tech: "Firebase / Supabase",
    color: "from-orange-500 to-yellow-500",
  },
  {
    category: "AI/ML",
    tech: "TensorFlow + OpenCV",
    color: "from-purple-500 to-pink-500",
  },
  {
    category: "APIs",
    tech: "OpenWeather + Notifications",
    color: "from-indigo-500 to-blue-500",
  },
  {
    category: "Deployment",
    tech: "Vercel + Heroku/AWS",
    color: "from-red-500 to-orange-500",
  },
];

const TechStack = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.45, 0, 0.55, 1] as const,
      },
    },
  };

  return (
    <section ref={ref} className="py-20 bg-background relative overflow-hidden">
      {/* Animated gradient mesh background with floating */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 right-10 w-96 h-96 gradient-mesh rounded-full blur-3xl float-drift float-glacial" />
        <div className="absolute bottom-10 left-10 w-96 h-96 gradient-mesh rounded-full blur-3xl float-sway float-slow float-delay-5" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.45, 0, 0.55, 1] }}
          >
            <Code2 className="w-8 h-8 text-primary" />
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            System Specifications
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built with modern, scalable technologies for reliability and performance
          </p>
        </motion.div>

        <motion.div 
          className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {techCategories.map((item, index) => (
            <motion.div
              key={item.category}
              variants={cardVariants}
              whileHover={{ 
                y: -3, 
                transition: { duration: 0.4, ease: [0.45, 0, 0.55, 1] } 
              }}
              className="bg-card rounded-xl p-6 shadow-soft hover:shadow-medium transition-all duration-500 cursor-pointer glass-morph border border-border/30 group"
              style={{ animationDelay: `${index * 0.3}s` }}
            >
              <motion.div 
                className={`w-full h-1 bg-gradient-to-r ${item.color} rounded-full mb-4 group-hover:h-1.5 transition-all duration-300`}
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ duration: 0.8, delay: 0.3 + index * 0.08 }}
                style={{ transformOrigin: "left" }}
              />
              
              <h3 className="text-lg font-bold text-foreground mb-2">
                {item.category}
              </h3>
              
              <p className="text-muted-foreground">
                {item.tech}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TechStack;
