import { Leaf } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Logo and tagline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center float-breathing">
              <Leaf className="w-6 h-6 text-white float-bob float-delay-1" />
            </div>
            <div>
              <div className="font-bold text-xl text-foreground">FloraGuard</div>
              <div className="text-sm text-muted-foreground">Your Plant Caretaker</div>
            </div>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap justify-center gap-6 text-sm">
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              Home
            </a>
            <a href="#about" className="text-muted-foreground hover:text-primary transition-colors">
              About
            </a>
            <a 
              href="#features"
              onClick={(e) => { 
                e.preventDefault(); 
                document.querySelector('h2')?.closest('section')?.scrollIntoView({ behavior: 'smooth' });
                const featuresSection = Array.from(document.querySelectorAll('h2')).find(h2 => h2.textContent?.includes('Proposed System Features'))?.closest('section');
                if (featuresSection) featuresSection.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              Features
            </a>
            <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors">
              Contact
            </a>
          </nav>

          {/* Credits */}
          <div className="text-center md:text-right text-sm text-muted-foreground">
            <div>© {currentYear} FloraGuard</div>
            <div className="mt-1">Developed by Vandana, Varsha, Vibha and Vinutha</div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
