import { Leaf, Sparkles, Circle } from "lucide-react";
import { motion } from "framer-motion";
import { useEllipticalFloat } from "@/hooks/use-cinematic-float";

const PerpetualBackground = () => {
  const random = (min: number, max: number) => Math.random() * (max - min) + min;

  // Apply cinematic elliptical floating to background elements - must be at top level
  useEllipticalFloat('.bg-elliptical');

  return (
    <div className="perpetual-motion-bg">
      {/* Drifting leaf particles with varied motion */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`drift-${i}`}
          className="absolute"
          style={{
            top: `${random(0, 100)}%`,
            left: `${random(0, 100)}%`,
          }}
          animate={{
            y: [0, random(-150, -50), random(-250, -150), random(-150, -50), 0],
            x: [0, random(-30, 50), random(-50, 30), random(-30, 50), 0],
            rotate: [0, random(90, 180), random(270, 360), random(90, 180), 0],
            scale: [1, random(0.8, 1.2), random(0.9, 1.1), random(0.8, 1.2), 1],
            opacity: [0.1, random(0.2, 0.4), random(0.15, 0.3), random(0.2, 0.4), 0.1],
          }}
          transition={{
            duration: random(20, 35) + i * 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * random(0.5, 2),
          }}
        >
          <Leaf className="w-6 h-6 md:w-8 md:h-8 text-primary/20" />
        </motion.div>
      ))}

      {/* Floating sparkles with random paths */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute"
          style={{
            top: `${random(10, 90)}%`,
            left: `${random(10, 90)}%`,
          }}
          animate={{
            y: [0, random(-40, 40), random(-60, 60), random(-40, 40), 0],
            x: [0, random(-40, 40), random(-60, 60), random(-40, 40), 0],
            rotate: [0, random(90, 180), random(270, 360), random(90, 180), 0],
            scale: [0.8, random(1, 1.3), random(0.9, 1.2), random(1, 1.3), 0.8],
            opacity: [0.2, random(0.4, 0.6), random(0.3, 0.5), random(0.4, 0.6), 0.2],
          }}
          transition={{
            duration: random(8, 16) + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * random(0.3, 1.5),
          }}
        >
          <Sparkles className="w-4 h-4 text-primary/30" />
        </motion.div>
      ))}

      {/* Orbiting gradient blobs with morphing - Elliptical paths */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`orbit-${i}`}
          className="absolute rounded-full bg-elliptical cinematic-float"
          style={{
            top: `${random(10, 80)}%`,
            left: `${random(10, 80)}%`,
            width: `${random(150, 300)}px`,
            height: `${random(150, 300)}px`,
            background: `radial-gradient(circle, hsl(var(--primary) / ${random(0.08, 0.15)}), hsl(var(--secondary) / ${random(0.05, 0.1)}), transparent)`,
            filter: `blur(${random(35, 50)}px)`,
          }}
          animate={{
            scale: [1, random(1.05, 1.15), random(0.95, 1.05), random(1.02, 1.12), 1],
            opacity: [0.4, random(0.5, 0.7), random(0.3, 0.5), random(0.5, 0.7), 0.4],
            borderRadius: ['50%', `${random(45, 55)}%`, `${random(40, 60)}%`, `${random(45, 55)}%`, '50%'],
          }}
          transition={{
            duration: random(40, 60),
            repeat: Infinity,
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: i * random(2, 5),
          }}
        />
      ))}

      {/* Pulsating concentric rings with varied patterns */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={`ring-${i}`}
          className="absolute"
          style={{
            top: '50%',
            left: '50%',
            width: `${180 + i * 180}px`,
            height: `${180 + i * 180}px`,
            marginLeft: `-${90 + i * 90}px`,
            marginTop: `-${90 + i * 90}px`,
            border: `${random(1, 3)}px solid hsl(var(--primary) / ${random(0.05, 0.15)})`,
            borderRadius: '50%',
          }}
          animate={{
            scale: [1, random(1.3, 1.6), random(0.9, 1.1), random(1.2, 1.5), 1],
            opacity: [0.3, random(0.05, 0.15), random(0.2, 0.3), random(0.08, 0.18), 0.3],
            rotate: [0, random(120, 180), random(240, 300), random(180, 240), 360],
          }}
          transition={{
            duration: random(12, 20) + i * 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * random(0.5, 1.5),
          }}
        />
      ))}

      {/* Floating geometric shapes with morphing */}
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={`geo-${i}`}
          className="absolute"
          style={{
            top: `${random(5, 95)}%`,
            left: `${random(5, 95)}%`,
            width: `${random(25, 60)}px`,
            height: `${random(25, 60)}px`,
            background: `linear-gradient(${random(0, 360)}deg, hsl(var(--primary) / ${random(0.08, 0.15)}), hsl(var(--secondary) / ${random(0.05, 0.12)}))`,
          }}
          animate={{
            borderRadius: [
              `${random(10, 30)}%`,
              `${random(40, 60)}%`,
              `${random(20, 40)}%`,
              `${random(45, 65)}%`,
              `${random(10, 30)}%`,
            ],
            rotate: [0, random(120, 240), random(240, 360), random(120, 240), 0],
            scale: [1, random(1.2, 1.5), random(0.7, 1), random(1.1, 1.4), 1],
            x: [0, random(-60, 60), random(-40, 40), random(-50, 50), 0],
            y: [0, random(-50, 50), random(-80, 80), random(-50, 50), 0],
            opacity: [random(0.3, 0.5), random(0.2, 0.4), random(0.3, 0.5), random(0.2, 0.4), random(0.3, 0.5)],
          }}
          transition={{
            duration: random(15, 25) + i * 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * random(0.5, 1.5),
          }}
        />
      ))}

      {/* Floating dots/circles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`dot-${i}`}
          className="absolute"
          style={{
            top: `${random(0, 100)}%`,
            left: `${random(0, 100)}%`,
          }}
          animate={{
            y: [0, random(-100, 100), random(-150, 150), random(-100, 100), 0],
            x: [0, random(-80, 80), random(-120, 120), random(-80, 80), 0],
            scale: [0.5, random(0.8, 1.2), random(0.6, 1), random(0.9, 1.3), 0.5],
            opacity: [0.2, random(0.4, 0.6), random(0.3, 0.5), random(0.4, 0.6), 0.2],
          }}
          transition={{
            duration: random(10, 18) + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * random(0.2, 1),
          }}
        >
          <Circle className="w-2 h-2 text-primary/40 fill-current" />
        </motion.div>
      ))}
    </div>
  );
};

export default PerpetualBackground;
