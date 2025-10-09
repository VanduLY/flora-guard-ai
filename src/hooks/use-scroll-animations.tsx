import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollAnimationOptions {
  stagger?: number;
  duration?: number;
  ease?: string;
}

export const useScrollAnimations = () => {
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    // Detect fast scrolling for liquid blur effect
    let scrollTimeout: NodeJS.Timeout;
    let isScrolling = false;
    
    const handleScroll = () => {
      if (!isScrolling) {
        document.body.classList.add('scrolling');
        isScrolling = true;
      }
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        document.body.classList.remove('scrolling');
        isScrolling = false;
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Parallax effects with different speeds
    const parallaxSlow = document.querySelectorAll('.parallax-slow');
    const parallaxFast = document.querySelectorAll('.parallax-fast');

    parallaxSlow.forEach((element) => {
      gsap.to(element, {
        yPercent: 30,
        ease: 'none',
        scrollTrigger: {
          trigger: element,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });
    });

    parallaxFast.forEach((element) => {
      gsap.to(element, {
        yPercent: -50,
        ease: 'none',
        scrollTrigger: {
          trigger: element,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.5,
        },
      });
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);
};

export const useStaggeredReveal = (
  selector: string,
  options: ScrollAnimationOptions = {}
) => {
  useEffect(() => {
    const elements = document.querySelectorAll(selector);
    if (!elements.length) return;

    const { stagger = 0.15, duration = 0.8, ease = 'back.out(1.7)' } = options;

    elements.forEach((element, index) => {
      ScrollTrigger.create({
        trigger: element,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play reverse play reverse',
        onEnter: () => {
          gsap.to(element, {
            opacity: 1,
            y: 0,
            scale: 1,
            rotationX: 0,
            duration,
            ease,
            delay: index * stagger,
          });
        },
        onLeave: () => {
          gsap.to(element, {
            opacity: 0,
            y: -50,
            scale: 0.95,
            duration: duration * 0.6,
            ease: 'power2.in',
          });
        },
        onEnterBack: () => {
          gsap.to(element, {
            opacity: 1,
            y: 0,
            scale: 1,
            rotationX: 0,
            duration,
            ease,
            delay: index * stagger,
          });
        },
        onLeaveBack: () => {
          gsap.to(element, {
            opacity: 0,
            y: 100,
            scale: 0.8,
            rotationX: -20,
            duration: duration * 0.6,
            ease: 'power2.in',
          });
        },
      });
      
      // Set initial state
      gsap.set(element, {
        opacity: 0,
        y: 100,
        scale: 0.8,
        rotationX: -20,
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [selector, options.stagger, options.duration, options.ease]);
};

export const useTextGradientReveal = (selector: string) => {
  useEffect(() => {
    const elements = document.querySelectorAll(selector);
    if (!elements.length) return;

    elements.forEach((element) => {
      const words = (element.textContent || '').split(' ');
      element.innerHTML = words
        .map(
          (word) =>
            `<span class="inline-block">${word}</span>`
        )
        .join(' ');

      const wordElements = element.querySelectorAll('span');

      ScrollTrigger.create({
        trigger: element,
        start: 'top 85%',
        end: 'bottom 15%',
        toggleActions: 'play reverse play reverse',
        onEnter: () => {
          gsap.to(wordElements, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power3.out',
            stagger: 0.05,
          });
        },
        onLeave: () => {
          gsap.to(wordElements, {
            opacity: 0,
            y: -20,
            duration: 0.4,
            ease: 'power2.in',
            stagger: 0.03,
          });
        },
        onEnterBack: () => {
          gsap.to(wordElements, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power3.out',
            stagger: 0.05,
          });
        },
        onLeaveBack: () => {
          gsap.to(wordElements, {
            opacity: 0,
            y: 20,
            duration: 0.4,
            ease: 'power2.in',
            stagger: 0.03,
          });
        },
      });

      // Set initial state
      gsap.set(wordElements, { opacity: 0, y: 20 });
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [selector]);
};

export const useMorphingShapes = (selector: string) => {
  useEffect(() => {
    const elements = document.querySelectorAll(selector);
    if (!elements.length) return;

    elements.forEach((element) => {
      gsap.timeline({
        scrollTrigger: {
          trigger: element,
          start: 'top 75%',
          end: 'bottom 25%',
          scrub: 1,
          toggleActions: 'play reverse play reverse',
        },
      })
      .fromTo(
        element,
        { borderRadius: '50%', rotation: 0, scale: 0.5, opacity: 0.5 },
        { borderRadius: '0%', rotation: 180, scale: 1, opacity: 1, duration: 0.5 }
      )
      .to(element, {
        borderRadius: '30%',
        rotation: 360,
        scale: 1.1,
        opacity: 0.8,
        duration: 0.5,
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [selector]);
};

export const useScrollUpAnimation = (selector: string) => {
  useEffect(() => {
    const elements = document.querySelectorAll(selector);
    if (!elements.length) return;

    elements.forEach((element) => {
      ScrollTrigger.create({
        trigger: element,
        start: 'top 85%',
        end: 'bottom 15%',
        toggleActions: 'play reverse play reverse',
        onEnter: () => {
          gsap.to(element, {
            opacity: 1,
            y: 0,
            scale: 1,
            rotationY: 0,
            duration: 0.8,
            ease: 'back.out(1.7)',
          });
        },
        onLeave: () => {
          gsap.to(element, {
            opacity: 0,
            y: -50,
            scale: 0.95,
            rotationY: -15,
            duration: 0.5,
            ease: 'power2.in',
          });
        },
        onEnterBack: () => {
          gsap.to(element, {
            opacity: 1,
            y: 0,
            scale: 1,
            rotationY: 0,
            duration: 0.8,
            ease: 'back.out(1.7)',
          });
        },
        onLeaveBack: () => {
          gsap.to(element, {
            opacity: 0,
            y: 100,
            scale: 0.9,
            rotationY: 15,
            duration: 0.5,
            ease: 'power2.in',
          });
        },
      });

      // Set initial state
      gsap.set(element, { opacity: 0, y: 100, scale: 0.9, rotationY: 15 });
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [selector]);
};

export const useMagneticEffect = (selector: string) => {
  useEffect(() => {
    const elements = document.querySelectorAll(selector);

    elements.forEach((element) => {
      const el = element as HTMLElement;
      
      const handleMouseMove = (e: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        gsap.to(el, {
          x: x * 0.3,
          y: y * 0.3,
          duration: 0.3,
          ease: 'power2.out',
        });
      };

      const handleMouseLeave = () => {
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: 'elastic.out(1, 0.5)',
        });
      };

      el.addEventListener('mousemove', handleMouseMove);
      el.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        el.removeEventListener('mousemove', handleMouseMove);
        el.removeEventListener('mouseleave', handleMouseLeave);
      };
    });
  }, [selector]);
};

export const useGradientBloom = (selector: string) => {
  useEffect(() => {
    const elements = document.querySelectorAll(selector);
    if (!elements.length) return;

    elements.forEach((element) => {
      ScrollTrigger.create({
        trigger: element,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play reverse play reverse',
        onEnter: () => {
          gsap.to(element, {
            opacity: 1,
            backgroundSize: '200% 200%',
            duration: 1.5,
            ease: 'power2.out',
          });
        },
        onLeave: () => {
          gsap.to(element, {
            opacity: 0.3,
            backgroundSize: '100% 100%',
            duration: 0.8,
            ease: 'power2.in',
          });
        },
        onEnterBack: () => {
          gsap.to(element, {
            opacity: 1,
            backgroundSize: '200% 200%',
            duration: 1.5,
            ease: 'power2.out',
          });
        },
        onLeaveBack: () => {
          gsap.to(element, {
            opacity: 0,
            backgroundSize: '0% 100%',
            duration: 0.8,
            ease: 'power2.in',
          });
        },
      });

      // Set initial state
      gsap.set(element, { opacity: 0, backgroundSize: '0% 100%' });
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [selector]);
};

// New hook for perpetual rotation based on scroll velocity
export const useScrollVelocityRotation = (selector: string) => {
  useEffect(() => {
    const elements = document.querySelectorAll(selector);
    if (!elements.length) return;

    elements.forEach((element) => {
      let rotation = 0;
      
      ScrollTrigger.create({
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.5,
        onUpdate: (self) => {
          const velocity = self.getVelocity() / 100;
          rotation += velocity;
          gsap.to(element, {
            rotation: rotation,
            duration: 0.3,
            ease: 'none',
          });
        },
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [selector]);
};

// New hook for scale pulsation based on scroll momentum
export const useScrollMomentumScale = (selector: string) => {
  useEffect(() => {
    const elements = document.querySelectorAll(selector);
    if (!elements.length) return;

    elements.forEach((element) => {
      ScrollTrigger.create({
        trigger: element,
        start: 'top 80%',
        end: 'bottom 20%',
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          const scale = 0.8 + Math.sin(progress * Math.PI) * 0.4;
          gsap.to(element, {
            scale: scale,
            duration: 0.1,
            ease: 'none',
          });
        },
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [selector]);
};
