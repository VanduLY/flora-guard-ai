import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Features from "@/components/Features";
import Methodology from "@/components/Methodology";
import TechStack from "@/components/TechStack";
import Comparison from "@/components/Comparison";
import Conclusion from "@/components/Conclusion";
import Footer from "@/components/Footer";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <div className="fixed top-4 right-4 z-50">
        <Button onClick={() => navigate("/login")} size="lg">
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
