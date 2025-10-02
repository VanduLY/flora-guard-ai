import { CheckCircle2, AlertCircle } from "lucide-react";

const advantages = [
  "Early disease detection prevents plant loss",
  "Personalized care based on species and climate",
  "Gamification increases user engagement",
  "Weather integration saves water and effort",
  "Carbon tracking promotes sustainability",
  "Reduces plant maintenance anxiety",
];

const limitations = [
  "AI accuracy depends on training dataset quality",
  "Requires stable internet connection",
  "High initial development effort",
  "May need periodic model retraining",
  "Camera quality affects detection accuracy",
  "Limited offline functionality",
];

const Comparison = () => {
  return (
    <section className="py-20 bg-gradient-soft">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 animate-fade-in">
            Advantages & Limitations
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in-up">
            Understanding both strengths and considerations
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Advantages */}
          <div className="bg-card rounded-2xl p-8 shadow-medium animate-fade-in-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Advantages</h3>
            </div>
            
            <ul className="space-y-4">
              {advantages.map((advantage, index) => (
                <li 
                  key={index}
                  className="flex items-start gap-3 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{advantage}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Limitations */}
          <div className="bg-card rounded-2xl p-8 shadow-medium animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Limitations</h3>
            </div>
            
            <ul className="space-y-4">
              {limitations.map((limitation, index) => (
                <li 
                  key={index}
                  className="flex items-start gap-3 animate-fade-in"
                  style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                >
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{limitation}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Comparison;
