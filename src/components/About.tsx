import { Leaf } from "lucide-react";

const About = () => {
  return (
    <section className="py-20 bg-gradient-soft">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6 animate-scale-in">
            <Leaf className="w-8 h-8 text-primary" />
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 animate-fade-in">
            The Problem We Solve
          </h2>
          
          <p className="text-lg text-muted-foreground mb-8 animate-fade-in-up">
            In today's fast-paced world, people often neglect their plants due to busy schedules, 
            lack of knowledge, or simply forgetting about their care needs. Plants wither, diseases 
            go unnoticed, and the joy of nurturing green life fades away.
          </p>
          
          <div className="bg-card rounded-2xl p-8 shadow-medium animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-2xl font-bold text-primary mb-4">
              Introducing FloraGuard
            </h3>
            <p className="text-foreground leading-relaxed">
              FloraGuard is your intelligent companion for plant care, combining AI-powered disease 
              detection, personalized care plans, climate integration, and gamification to make 
              plant parenting effortless and engaging. From watering reminders to tracking your 
              carbon footprint, FloraGuard ensures your plants thrive while you grow as a caretaker.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
