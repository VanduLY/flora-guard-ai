import { UserPlus, Camera, Brain, CalendarCheck, Bell } from "lucide-react";

const steps = [
  { icon: UserPlus, title: "Register Plant", description: "Add your plant to the system" },
  { icon: Camera, title: "Upload Photo", description: "Capture leaf condition" },
  { icon: Brain, title: "AI Analysis", description: "Instant disease detection" },
  { icon: CalendarCheck, title: "Care Planner", description: "Get personalized schedule" },
  { icon: Bell, title: "Reminders & Tips", description: "Never miss care tasks" },
];

const Methodology = () => {
  return (
    <section className="py-20 bg-gradient-soft">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 animate-fade-in">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in-up">
            Five simple steps to transform your plant care journey
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-primary -translate-y-1/2 z-0" />
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative z-10">
              {steps.map((step, index) => (
                <div 
                  key={step.title}
                  className="flex flex-col items-center text-center animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div className="relative">
                    <div className="w-20 h-20 bg-card rounded-full flex items-center justify-center shadow-medium mb-4 group hover:scale-110 transition-transform border-4 border-background">
                      <div className="w-14 h-14 bg-gradient-primary rounded-full flex items-center justify-center">
                        <step.icon className="w-7 h-7 text-white" />
                      </div>
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold shadow-soft">
                      {index + 1}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {step.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Methodology;
