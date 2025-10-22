import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { themeIconRotate, DURATIONS, EASINGS } from "@/lib/motion-config";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: "system" as const, icon: Monitor, label: "System" },
    { value: "light" as const, icon: Sun, label: "Light" },
    { value: "dark" as const, icon: Moon, label: "Dark" },
  ];

  return (
    <div className="flex items-center gap-1 p-1 bg-muted/80 backdrop-blur-md rounded-xl shadow-sm border border-border/50">
      {themes.map(({ value, icon: Icon, label }) => (
        <motion.div 
          key={value} 
          whileHover={{ scale: 1.08, y: -2 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: DURATIONS.micro, ease: EASINGS.butter }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(value)}
            className={`relative px-3 transition-all ${
              theme === value
                ? "text-primary-foreground hover:text-primary-foreground"
                : "hover:bg-background/50"
            }`}
            title={label}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={`${value}-${theme === value}`}
                variants={themeIconRotate}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Icon className="h-4 w-4" />
              </motion.div>
            </AnimatePresence>
            <span className="sr-only">{label}</span>
            {theme === value && (
              <motion.div
                layoutId="activeTheme"
                className="absolute inset-0 bg-primary/90 rounded-lg -z-10 shadow-lg"
                transition={{ 
                  type: "spring",
                  stiffness: 120,
                  damping: 14,
                }}
              />
            )}
          </Button>
        </motion.div>
      ))}
    </div>
  );
}
