import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";
import { 
  pageTransitions, 
  staggerContainer as staggerConfig,
  fadeInUp as fadeInUpConfig,
  scaleIn as scaleInConfig,
  slideInFromLeft as slideInFromLeftConfig,
  slideInFromRight as slideInFromRightConfig,
} from "@/lib/motion-config";

interface PageTransitionProps {
  children: ReactNode;
  key?: string;
}

export const PageTransition = ({ children, key }: PageTransitionProps) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        variants={pageTransitions}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Export animation configs from motion-config
export const staggerContainer = staggerConfig;
export const fadeInUp = fadeInUpConfig;
export const scaleIn = scaleInConfig;
export const slideInFromLeft = slideInFromLeftConfig;
export const slideInFromRight = slideInFromRightConfig;
