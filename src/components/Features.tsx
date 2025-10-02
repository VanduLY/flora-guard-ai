import { Scan, Calendar, BarChart3, Cloud, Leaf } from "lucide-react";

const features = [
  {
    icon: Scan,
    title: "AI Disease Detection",
    description: "Upload a leaf photo and get instant diagnosis with remedies. Our AI identifies issues before they spread.",
  },
  {
    icon: Calendar,
    title: "Personalized Care Planner",
    description: "Smart watering and fertilizing schedules tailored to each plant's needs and your local climate.",
  },
  {
    icon: BarChart3,
    title: "Growth Tracker & Gamification",
    description: "Keep a plant diary, track happiness scores, and earn rewards as your plants flourish.",
  },
  {
    icon: Cloud,
    title: "Weather Integration",
    description: "Automatically skip watering if rain is forecast tomorrow. Smart care that adapts to nature.",
  },
  {
    icon: Leaf,
    title: "Carbon Footprint Tracker",
    description: "See your environmental impact and celebrate your contribution to a greener planet.",
  },
];

const Features = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 animate-fade-in">
            Proposed System Features
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in-up">
            Everything you need to become the best plant parent, powered by cutting-edge technology
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="bg-card rounded-2xl p-8 shadow-soft hover:shadow-large transition-all duration-300 hover:-translate-y-2 animate-fade-in-up group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-primary rounded-xl mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-foreground mb-3">
                {feature.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
