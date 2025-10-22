/**
 * FloraGuard Motion Design System
 * Ultra-smooth, buttery animations with consistent timing
 */

// Premium easing curves
export const EASINGS = {
  butter: [0.45, 0, 0.55, 1], // Primary smooth easing
  silk: [0.25, 0.46, 0.45, 0.94], // Silky smooth
  bounce: [0.68, -0.55, 0.265, 1.55], // Subtle bounce
  magnetic: [0.34, 1.56, 0.64, 1], // Magnetic pull effect
  elastic: [0.68, -0.55, 0.265, 1.55], // Elastic feel
} as const;

// Timing durations (in seconds)
export const DURATIONS = {
  instant: 0.15,
  micro: 0.2,
  fast: 0.3,
  normal: 0.4,
  smooth: 0.5,
  slow: 0.6,
  premium: 0.8,
} as const;

// Spring configurations
export const SPRINGS = {
  butter: { type: "spring", stiffness: 120, damping: 14 },
  smooth: { type: "spring", stiffness: 100, damping: 15 },
  bouncy: { type: "spring", stiffness: 80, damping: 10 },
  gentle: { type: "spring", stiffness: 60, damping: 12 },
} as const;

// Page transition variants
export const pageTransitions = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
    filter: "blur(10px)",
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: DURATIONS.smooth,
      ease: EASINGS.butter,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    filter: "blur(10px)",
    transition: {
      duration: DURATIONS.fast,
      ease: EASINGS.butter,
    },
  },
};

// Stagger container for sequential reveals
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
      when: "beforeChildren",
    },
  },
};

// Card/component entrance animations
export const fadeInUp = {
  hidden: { 
    opacity: 0, 
    y: 30,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: DURATIONS.smooth,
      ease: EASINGS.butter,
    },
  },
};

export const scaleIn = {
  hidden: { 
    opacity: 0, 
    scale: 0.9,
    filter: "blur(5px)",
  },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: DURATIONS.normal,
      ease: EASINGS.butter,
    },
  },
};

export const slideInFromLeft = {
  hidden: { 
    opacity: 0, 
    x: -50,
    filter: "blur(5px)",
  },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: {
      duration: DURATIONS.smooth,
      ease: EASINGS.butter,
    },
  },
};

export const slideInFromRight = {
  hidden: { 
    opacity: 0, 
    x: 50,
    filter: "blur(5px)",
  },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: {
      duration: DURATIONS.smooth,
      ease: EASINGS.butter,
    },
  },
};

// Hover animations - premium micro-interactions
export const hoverLift = {
  scale: 1.03,
  y: -4,
  transition: {
    duration: DURATIONS.micro,
    ease: EASINGS.butter,
  },
};

export const hoverScale = {
  scale: 1.05,
  transition: {
    duration: DURATIONS.micro,
    ease: EASINGS.butter,
  },
};

export const tapScale = {
  scale: 0.97,
  transition: {
    duration: DURATIONS.instant,
    ease: EASINGS.butter,
  },
};

// Magnetic hover effect
export const magneticHover = {
  scale: 1.05,
  transition: {
    duration: DURATIONS.micro,
    ease: EASINGS.magnetic,
  },
};

// Theme toggle animation
export const themeIconRotate = {
  initial: { rotate: -180, opacity: 0, scale: 0.8 },
  animate: { 
    rotate: 0, 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: DURATIONS.normal,
      ease: EASINGS.butter,
    }
  },
  exit: { 
    rotate: 180, 
    opacity: 0, 
    scale: 0.8,
    transition: {
      duration: DURATIONS.fast,
      ease: EASINGS.butter,
    }
  },
};

// Modal/Dialog animations
export const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: DURATIONS.normal,
      ease: EASINGS.butter,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: DURATIONS.fast,
      ease: EASINGS.butter,
    },
  },
};

// Floating/breathing animation
export const floatingBreath = {
  y: [0, -8, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

// Scroll reveal animation
export const scrollReveal = {
  offscreen: {
    opacity: 0,
    y: 40,
    scale: 0.95,
  },
  onscreen: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: DURATIONS.smooth,
      ease: EASINGS.butter,
    },
  },
};
