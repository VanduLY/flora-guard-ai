import { Leaf } from "lucide-react";
import { motion } from "framer-motion";

const PerpetualBackground = () => {
  return (
    <div className="perpetual-motion-bg">
      {/* Drifting leaf particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`drift-${i}`}
          className="absolute drift-particles"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, -200, -100, 0],
            x: [0, 50, -30, 40, 0],
            rotate: [0, 180, 360, 180, 0],
            opacity: [0.1, 0.3, 0.2, 0.3, 0.1],
          }}
          transition={{
            duration: 25 + i * 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 1.5,
          }}
        >
          <Leaf className="w-8 h-8 text-primary/20" />
        </motion.div>
      ))}

      {/* Orbiting gradient blobs */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`orbit-${i}`}
          className="absolute w-64 h-64 rounded-full orbit-slow pulse-glow"
          style={{
            top: `${20 + i * 15}%`,
            left: `${10 + i * 20}%`,
            background: `radial-gradient(circle, hsl(var(--primary) / ${0.2 + i * 0.05}), transparent)`,
          }}
          animate={{
            scale: [1, 1.2, 0.9, 1.1, 1],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{
            duration: 20 + i * 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 2,
          }}
        />
      ))}

      {/* Pulsating rings */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`ring-${i}`}
          className="absolute"
          style={{
            top: '50%',
            left: '50%',
            width: `${200 + i * 200}px`,
            height: `${200 + i * 200}px`,
            marginLeft: `-${100 + i * 100}px`,
            marginTop: `-${100 + i * 100}px`,
            border: `2px solid hsl(var(--primary) / ${0.1 - i * 0.02})`,
            borderRadius: '50%',
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.1, 0.3],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 15 + i * 5,
            repeat: Infinity,
            ease: "linear",
            delay: i * 1,
          }}
        />
      ))}

      {/* Floating geometric shapes */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`geo-${i}`}
          className="absolute"
          style={{
            top: `${10 + i * 12}%`,
            left: `${5 + i * 11}%`,
            width: `${30 + i * 10}px`,
            height: `${30 + i * 10}px`,
            background: `linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--secondary) / 0.1))`,
          }}
          animate={{
            borderRadius: ['20%', '50%', '30%', '50%', '20%'],
            rotate: [0, 180, 360, 180, 0],
            scale: [1, 1.3, 0.8, 1.2, 1],
            x: [0, 50, -30, 20, 0],
            y: [0, -40, -80, -40, 0],
          }}
          transition={{
            duration: 18 + i * 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.8,
          }}
        />
      ))}
    </div>
  );
};

export default PerpetualBackground;
