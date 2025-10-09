import { useEffect } from 'react';
import { gsap } from 'gsap';

// Utility to generate random values
const random = (min: number, max: number) => Math.random() * (max - min) + min;

/**
 * Apply continuous floating animation to elements using GSAP
 */
export const useGsapFloating = (selector: string, type: 'gentle' | 'sway' | 'drift' = 'gentle') => {
  useEffect(() => {
    const elements = gsap.utils.toArray<HTMLElement>(selector);
    
    elements.forEach((element, index) => {
      const delay = index * 0.2;
      
      switch (type) {
        case 'gentle':
          gsap.to(element, {
            y: random(-10, 10),
            x: random(-5, 5),
            rotation: random(-2, 2),
            duration: random(3, 5),
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay,
          });
          break;
          
        case 'sway':
          gsap.to(element, {
            y: random(-15, 15),
            x: random(-20, 20),
            rotation: random(-3, 3),
            duration: random(5, 8),
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay,
          });
          break;
          
        case 'drift':
          // Create a wandering motion path
          const tl = gsap.timeline({ repeat: -1, delay });
          tl.to(element, {
            x: random(-30, 30),
            y: random(-20, 20),
            rotation: random(-5, 5),
            duration: random(4, 7),
            ease: "sine.inOut",
          })
          .to(element, {
            x: random(-20, 20),
            y: random(-30, 30),
            rotation: random(-5, 5),
            duration: random(4, 7),
            ease: "sine.inOut",
          })
          .to(element, {
            x: 0,
            y: 0,
            rotation: 0,
            duration: random(4, 7),
            ease: "sine.inOut",
          });
          break;
      }
    });
    
    return () => {
      gsap.killTweensOf(selector);
    };
  }, [selector, type]);
};

/**
 * Apply breathing/pulsing animation
 */
export const useBreathingAnimation = (selector: string) => {
  useEffect(() => {
    const elements = gsap.utils.toArray<HTMLElement>(selector);
    
    elements.forEach((element, index) => {
      gsap.to(element, {
        scale: random(0.98, 1.02),
        duration: random(2, 4),
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: index * 0.3,
      });
    });
    
    return () => {
      gsap.killTweensOf(selector);
    };
  }, [selector]);
};

/**
 * Apply orbital rotation animation
 */
export const useOrbitalAnimation = (selector: string) => {
  useEffect(() => {
    const elements = gsap.utils.toArray<HTMLElement>(selector);
    
    elements.forEach((element, index) => {
      // Create circular motion around original position
      const radius = random(15, 30);
      const duration = random(10, 15);
      
      gsap.to(element, {
        motionPath: {
          path: [
            { x: radius, y: 0 },
            { x: radius * Math.cos(Math.PI / 2), y: radius * Math.sin(Math.PI / 2) },
            { x: radius * Math.cos(Math.PI), y: radius * Math.sin(Math.PI) },
            { x: radius * Math.cos(3 * Math.PI / 2), y: radius * Math.sin(3 * Math.PI / 2) },
            { x: radius, y: 0 },
          ],
          curviness: 2,
        },
        duration,
        repeat: -1,
        ease: "none",
        delay: index * 0.5,
      });
    });
    
    return () => {
      gsap.killTweensOf(selector);
    };
  }, [selector]);
};

/**
 * Apply magnetic hover effect with floating
 */
export const useMagneticFloat = (selector: string) => {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>(selector);
    
    elements.forEach((element) => {
      // Base floating animation
      gsap.to(element, {
        y: random(-5, 5),
        rotation: random(-1, 1),
        duration: random(3, 5),
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      
      // Magnetic effect on hover
      const handleMouseMove = (e: MouseEvent) => {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = (e.clientX - centerX) * 0.15;
        const deltaY = (e.clientY - centerY) * 0.15;
        
        gsap.to(element, {
          x: deltaX,
          y: deltaY,
          duration: 0.3,
          ease: "power2.out",
        });
      };
      
      const handleMouseLeave = () => {
        gsap.to(element, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: "elastic.out(1, 0.5)",
        });
      };
      
      element.addEventListener('mousemove', handleMouseMove);
      element.addEventListener('mouseleave', handleMouseLeave);
      
      return () => {
        element.removeEventListener('mousemove', handleMouseMove);
        element.removeEventListener('mouseleave', handleMouseLeave);
      };
    });
  }, [selector]);
};

/**
 * Apply random wobble animation to icons
 */
export const useIconWobble = (selector: string) => {
  useEffect(() => {
    const elements = gsap.utils.toArray<HTMLElement>(selector);
    
    elements.forEach((element, index) => {
      gsap.to(element, {
        rotation: random(-5, 5),
        y: random(-3, 3),
        duration: random(2, 4),
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
