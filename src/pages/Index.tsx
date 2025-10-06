import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Features from "@/components/Features";
import Methodology from "@/components/Methodology";
import TechStack from "@/components/TechStack";
import Comparison from "@/components/Comparison";
import Conclusion from "@/components/Conclusion";
import Footer from "@/components/Footer";
import { useScrollAnimations, useMagneticEffect } from "@/hooks/use-scroll-animations";
import { useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();
  
  useScrollAnimations();
  useMagneticEffect('.magnetic-btn');

  useEffect(() => {
    // Add liquid blur effect to body during scroll
    const style = document.createElement('style');
    style.textContent = `
      body.scrolling * {
        transition: filter 0.3s ease-out;
      }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  return (
    <div className="min-h-screen">
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 glass-morph p-2 rounded-lg">
        <ThemeToggle />
        <Button onClick={() => navigate("/login")} size="lg" className="magnetic-btn">
          <LogIn className="w-4 h-4 mr-2" />
          Sign In
        </Button>
      </div>
      <Hero />
      <About />
      <Features />
      <Methodology />
      <TechStack />
      <Comparison />
      <Conclusion />
      <Footer />
    </div>
  );
};

export default Index;
