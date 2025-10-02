import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";

const Conclusion = () => {
  return (
    <section className="py-20 bg-gradient-hero relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6 animate-scale-in">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-medium">Join the Green Revolution</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in leading-tight">
            Grow Smarter. Care Easier. Live Greener.
          </h2>
          
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto animate-fade-in-up">
            FloraGuard transforms plant care from a chore into a joyful, rewarding experience. 
            Join thousands of plant parents who've already discovered the difference.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <Button 
              size="lg" 
              variant="hero"
              className="group"
            >
              Join FloraGuard Today
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-primary"
            >
              Watch Demo
            </Button>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">10K+</div>
              <div className="text-white/80 text-sm">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">50K+</div>
              <div className="text-white/80 text-sm">Plants Saved</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">95%</div>
              <div className="text-white/80 text-sm">Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Conclusion;
