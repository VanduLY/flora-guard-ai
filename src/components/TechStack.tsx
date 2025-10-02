import { Code2 } from "lucide-react";

const techCategories = [
  {
    category: "Frontend",
    tech: "React + Tailwind CSS",
    color: "from-blue-500 to-cyan-500",
  },
  {
    category: "Backend",
    tech: "Flask / FastAPI / Node.js",
    color: "from-green-500 to-emerald-500",
  },
  {
    category: "Database",
    tech: "Firebase / Supabase",
    color: "from-orange-500 to-yellow-500",
  },
  {
    category: "AI/ML",
    tech: "TensorFlow + OpenCV",
    color: "from-purple-500 to-pink-500",
  },
  {
    category: "APIs",
    tech: "OpenWeather + Notifications",
    color: "from-indigo-500 to-blue-500",
  },
  {
    category: "Deployment",
    tech: "Vercel + Heroku/AWS",
    color: "from-red-500 to-orange-500",
  },
];

const TechStack = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6 animate-scale-in">
            <Code2 className="w-8 h-8 text-primary" />
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 animate-fade-in">
            System Specifications
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in-up">
            Built with modern, scalable technologies for reliability and performance
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {techCategories.map((item, index) => (
            <div
              key={item.category}
              className="bg-card rounded-xl p-6 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 animate-fade-in-up group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-full h-1 bg-gradient-to-r ${item.color} rounded-full mb-4 group-hover:h-2 transition-all`} />
              
              <h3 className="text-lg font-bold text-foreground mb-2">
                {item.category}
              </h3>
              
              <p className="text-muted-foreground">
                {item.tech}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechStack;
