import { useState, useCallback } from "react";
import { MotionValue, useMotionValue, useSpring } from "framer-motion";

/**
 * Premium hover effect with magnetic attraction and smooth spring physics
 */
export const usePremiumHover = () => {
  const [isHovered, setIsHovered] = useState(false);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springConfig = { stiffness: 120, damping: 14 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) * 0.15;
    const deltaY = (e.clientY - centerY) * 0.15;
    
    x.set(deltaX);
    y.set(deltaY);
  }, [x, y]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  }, [x, y]);

  return {
    isHovered,
    springX,
    springY,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave,
  };
};

/**
 * Simple smooth hover with scale and lift effect
 */
export const useHoverLift = () => {
  const [isHovered, setIsHovered] = useState(false);
  
  const scale = useMotionValue(1);
  const y = useMotionValue(0);
  
  const springScale = useSpring(scale, { stiffness: 120, damping: 14 });
  const springY = useSpring(y, { stiffness: 120, damping: 14 });

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    scale.set(1.03);
    y.set(-4);
  }, [scale, y]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    scale.set(1);
    y.set(0);
  }, [scale, y]);

  return {
    isHovered,
    scale: springScale,
    y: springY,
    handleMouseEnter,
    handleMouseLeave,
  };
};

/**
 * Smooth tilt effect on hover (3D perspective)
 */
export const useHoverTilt = (intensity: number = 10) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  
  const springConfig = { stiffness: 120, damping: 14 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    const tiltX = (y - 0.5) * intensity * -1;
    const tiltY = (x - 0.5) * intensity;
    
    rotateX.set(tiltX);
    rotateY.set(tiltY);
  }, [rotateX, rotateY, intensity]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    rotateX.set(0);
    rotateY.set(0);
  }, [rotateX, rotateY]);

  return {
    isHovered,
    rotateX: springRotateX,
    rotateY: springRotateY,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave,
  };
};
