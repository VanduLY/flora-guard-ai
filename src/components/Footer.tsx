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
              <div className="text-sm text-muted-foreground">Virtual Plant Caretaker</div>
            </div>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap justify-center gap-6 text-sm">
            <a href="#home" className="text-muted-foreground hover:text-primary transition-colors">
              Home
            </a>
            <a href="#about" className="text-muted-foreground hover:text-primary transition-colors">
              About
            </a>
            <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">
              Features
            </a>
            <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors">
              Contact
            </a>
          </nav>

          {/* Credits */}
          <div className="text-center md:text-right text-sm text-muted-foreground">
            <div>© {currentYear} FloraGuard</div>
            <div className="mt-1">Developed by Vandana</div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
