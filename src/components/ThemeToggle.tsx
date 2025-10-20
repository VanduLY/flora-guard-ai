import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: "system" as const, icon: Monitor, label: "System" },
    { value: "light" as const, icon: Sun, label: "Light" },
    { value: "dark" as const, icon: Moon, label: "Dark" },
  ];

  return (
    <div className="flex items-center gap-1 p-1 bg-muted rounded-lg backdrop-blur-sm">
      {themes.map(({ value, icon: Icon, label }) => (
        <motion.div key={value} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(value)}
            className={`relative px-3 transition-all duration-300 ${
              theme === value
                ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                : "hover:bg-background"
            }`}
            title={label}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={value}
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 180, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.45, 0, 0.55, 1] }}
              >
                <Icon className="h-4 w-4" />
              </motion.div>
            </AnimatePresence>
            <span className="sr-only">{label}</span>
            {theme === value && (
              <motion.div
                layoutId="activeTheme"
                className="absolute inset-0 bg-primary rounded-md -z-10"
                transition={{ duration: 0.3, ease: [0.45, 0, 0.55, 1] }}
              />
            )}
          </Button>
        </motion.div>
      ))}
    </div>
  );
}
