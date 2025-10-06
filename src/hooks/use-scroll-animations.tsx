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

    gsap.fromTo(
      elements,
      {
        opacity: 0,
        y: 100,
        scale: 0.8,
        rotationX: -20,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        rotationX: 0,
        duration,
        ease,
        stagger: {
          each: stagger,
          from: 'start',
        },
        scrollTrigger: {
          trigger: elements[0],
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === elements[0]) {
          trigger.kill();
        }
      });
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
            `<span class="inline-block" style="opacity: 0; transform: translateY(20px);">${word}</span>`
        )
        .join(' ');

      const wordElements = element.querySelectorAll('span');

      gsap.to(wordElements, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
        stagger: 0.05,
        scrollTrigger: {
          trigger: element,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });
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
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: element,
          start: 'top 75%',
          end: 'bottom 25%',
          scrub: 1,
        },
      });

      tl.fromTo(
        element,
        { borderRadius: '50%', rotation: 0, scale: 0.5 },
        { borderRadius: '0%', rotation: 180, scale: 1, duration: 1 }
      ).to(element, {
        borderRadius: '30%',
        rotation: 360,
        scale: 1.1,
        duration: 1,
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
        start: 'top bottom',
        end: 'top top',
        onEnter: () => {
          gsap.fromTo(
            element,
            { opacity: 0, y: 100, scale: 0.9 },
            { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'back.out(1.7)' }
          );
        },
        onLeaveBack: () => {
          gsap.to(element, {
            opacity: 0,
            y: -50,
            scale: 0.95,
            duration: 0.5,
            ease: 'power2.in',
          });
        },
      });
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
      gsap.fromTo(
        element,
        {
          opacity: 0,
          backgroundSize: '0% 100%',
        },
        {
          opacity: 1,
          backgroundSize: '100% 100%',
          duration: 1.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [selector]);
};
