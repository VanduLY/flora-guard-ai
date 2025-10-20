import { useEffect, useRef } from "react";

interface MagneticHoverOptions {
  strength?: number;
  scale?: number;
}

export const useMagneticHover = (options: MagneticHoverOptions = {}) => {
  const { strength = 0.3, scale = 1.05 } = options;
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = (e.clientX - centerX) * strength;
      const deltaY = (e.clientY - centerY) * strength;
      
      element.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scale})`;
      element.style.transition = "transform 0.2s cubic-bezier(0.45, 0, 0.55, 1)";
    };

    const handleMouseLeave = () => {
      element.style.transform = "translate(0, 0) scale(1)";
      element.style.transition = "transform 0.4s cubic-bezier(0.45, 0, 0.55, 1)";
    };

    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [strength, scale]);

  return ref;
};
