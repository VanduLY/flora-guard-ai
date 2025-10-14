import { useEffect } from 'react';
import { gsap } from 'gsap';

// Ultra-premium easing curves
const LUXURY_EASE = "cubic-bezier(0.25, 0.46, 0.45, 0.94)";
const EXPO_EASE = "expo.out";

// Utility for elegant random values
const elegantRandom = (min: number, max: number) => Math.random() * (max - min) + min;

/**
 * Depth-based cinematic floating - closer elements move more
 */
export const useDepthFloating = (selector: string, depth: 'foreground' | 'midground' | 'background' = 'midground') => {
  useEffect(() => {
    const elements = gsap.utils.toArray<HTMLElement>(selector);
    
    // Movement scale based on depth
    const depthScale = {
      foreground: { move: 8, rotate: 0.5, duration: [8, 12] },
      midground: { move: 5, rotate: 0.3, duration: [10, 15] },
      background: { move: 2, rotate: 0.2, duration: [30, 60] }
    }[depth];
    
    elements.forEach((element, index) => {
      const delay = index * 0.2; // Orchestral staggering
      const movementRange = depthScale.move;
      const rotationRange = depthScale.rotate;
      const duration = elegantRandom(depthScale.duration[0], depthScale.duration[1]);
      
      // Ultra-smooth floating motion
      gsap.to(element, {
        y: elegantRandom(-movementRange, movementRange),
        x: elegantRandom(-movementRange * 0.5, movementRange * 0.5),
        rotation: elegantRandom(-rotationRange, rotationRange),
        duration: duration,
        repeat: -1,
        yoyo: true,
        ease: LUXURY_EASE,
        delay,
      });
    });
    
    return () => {
      gsap.killTweensOf(selector);
    };
  }, [selector, depth]);
};

/**
 * Atmospheric drift - Brownian motion patterns
 */
export const useAtmosphericDrift = (selector: string) => {
  useEffect(() => {
    const elements = gsap.utils.toArray<HTMLElement>(selector);
    
    elements.forEach((element, index) => {
      const createDriftPath = () => {
        const tl = gsap.timeline({ 
          repeat: -1,
          delay: index * 0.3 
        });
        
        // Create smooth, random drift path with 4 waypoints
        for (let i = 0; i < 4; i++) {
          tl.to(element, {
            x: elegantRandom(-6, 6),
            y: elegantRandom(-6, 6),
            rotation: elegantRandom(-0.3, 0.3),
            duration: elegantRandom(10, 15),
            ease: LUXURY_EASE,
          });
        }
        
        // Return to origin smoothly
        tl.to(element, {
          x: 0,
          y: 0,
          rotation: 0,
          duration: elegantRandom(10, 15),
          ease: LUXURY_EASE,
        });
      };
      
      createDriftPath();
    });
    
    return () => {
      gsap.killTweensOf(selector);
    };
  }, [selector]);
};

/**
 * Weighted floating - larger elements move slower
 */
export const useWeightedFloating = (selector: string) => {
  useEffect(() => {
    const elements = gsap.utils.toArray<HTMLElement>(selector);
    
    elements.forEach((element, index) => {
      const rect = element.getBoundingClientRect();
      const area = rect.width * rect.height;
      
      // Larger elements = slower, smaller movements
      const weight = Math.min(area / 10000, 5);
      const movementScale = Math.max(8 - weight, 2);
      const duration = Math.min(15 + weight * 3, 45);
      
      gsap.to(element, {
        y: elegantRandom(-movementScale, movementScale),
        x: elegantRandom(-movementScale * 0.6, movementScale * 0.6),
        rotation: elegantRandom(-0.4 / weight, 0.4 / weight),
        scale: elegantRandom(0.995, 1.005),
        duration: duration,
        repeat: -1,
        yoyo: true,
        ease: LUXURY_EASE,
        delay: index * 0.2,
      });
    });
    
    return () => {
      gsap.killTweensOf(selector);
    };
  }, [selector]);
};

/**
 * Orchestral staggering - coordinated wave effects
 */
export const useOrchestralFloat = (selector: string) => {
  useEffect(() => {
    const elements = gsap.utils.toArray<HTMLElement>(selector);
    
    // Create wave motion across elements
    gsap.to(elements, {
      y: (i) => Math.sin(i * 0.5) * 4,
      x: (i) => Math.cos(i * 0.3) * 3,
      rotation: (i) => Math.sin(i * 0.4) * 0.3,
      duration: 12,
      stagger: {
        each: 0.2,
        repeat: -1,
        yoyo: true,
      },
      ease: LUXURY_EASE,
    });
    
    return () => {
      gsap.killTweensOf(selector);
    };
  }, [selector]);
};

/**
 * Micro-breathing animation - barely perceptible scale
 */
export const useMicroBreathing = (selector: string) => {
  useEffect(() => {
    const elements = gsap.utils.toArray<HTMLElement>(selector);
    
    elements.forEach((element, index) => {
      gsap.to(element, {
        scale: elegantRandom(0.998, 1.002),
        duration: elegantRandom(8, 12),
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: index * 0.15,
      });
    });
    
    return () => {
      gsap.killTweensOf(selector);
    };
  }, [selector]);
};

/**
 * Elliptical background motion - smooth continuous paths
 */
export const useEllipticalFloat = (selector: string) => {
  useEffect(() => {
    const elements = gsap.utils.toArray<HTMLElement>(selector);
    
    elements.forEach((element, index) => {
      const radiusX = elegantRandom(30, 60);
      const radiusY = elegantRandom(20, 40);
      const duration = elegantRandom(40, 60);
      
      // Create elliptical motion path
      const tl = gsap.timeline({ repeat: -1 });
      
      for (let angle = 0; angle <= 360; angle += 45) {
        const rad = (angle * Math.PI) / 180;
        tl.to(element, {
          x: Math.cos(rad) * radiusX,
          y: Math.sin(rad) * radiusY,
          rotation: angle / 360,
          duration: duration / 8,
          ease: "none",
        }, angle === 0 ? index * 0.5 : ">");
      }
    });
    
    return () => {
      gsap.killTweensOf(selector);
    };
  }, [selector]);
};

/**
 * Magnetic cursor repulsion - subtle avoidance
 */
export const useMagneticRepulsion = (selector: string, strength: number = 0.5) => {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>(selector);
    
    const handleMouseMove = (e: MouseEvent) => {
      elements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const distance = Math.sqrt(
          Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
        );
        
        // Only repel within 200px radius
        if (distance < 200) {
          const angle = Math.atan2(centerY - e.clientY, centerX - e.clientX);
          const force = (200 - distance) / 200 * strength;
          
          gsap.to(element, {
            x: Math.cos(angle) * force,
            y: Math.sin(angle) * force,
            duration: 0.6,
            ease: EXPO_EASE,
          });
        } else {
          gsap.to(element, {
            x: 0,
            y: 0,
            duration: 0.8,
            ease: LUXURY_EASE,
          });
        }
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      gsap.killTweensOf(selector);
    };
  }, [selector, strength]);
};

/**
 * Liquid icon rotation - micro-rotations
 */
export const useLiquidIconFloat = (selector: string) => {
  useEffect(() => {
    const elements = gsap.utils.toArray<HTMLElement>(selector);
    
    elements.forEach((element, index) => {
      // Subtle rotation + vertical float
      gsap.to(element, {
        rotation: elegantRandom(-0.4, 0.4),
        y: elegantRandom(-3, 3),
        duration: elegantRandom(10, 14),
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: index * 0.1,
      });
    });
    
    return () => {
      gsap.killTweensOf(selector);
    };
  }, [selector]);
};
