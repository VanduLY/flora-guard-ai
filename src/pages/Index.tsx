import Hero from "@/components/Hero";
import About from "@/components/About";
import Features from "@/components/Features";
import Methodology from "@/components/Methodology";
import TechStack from "@/components/TechStack";
import Comparison from "@/components/Comparison";
import Conclusion from "@/components/Conclusion";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
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
