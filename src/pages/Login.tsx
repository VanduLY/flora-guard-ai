import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Leaf, Mail, Lock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Separator } from "@/components/ui/separator";
import { z } from "zod";

// Input validation schemas
const emailSchema = z.string().trim().email("Please enter a valid email address").max(255, "Email must be less than 255 characters");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters").max(100, "Password must be less than 100 characters");

const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

const Login = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(searchParams.get("signup") === "true");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Update isSignUp when URL params change
  useEffect(() => {
    if (searchParams.get("signup") === "true") {
      setIsSignUp(true);
    }
  }, [searchParams]);

  // Clear errors when inputs change
  useEffect(() => {
    setEmailError("");
  }, [email]);

  useEffect(() => {
    setPasswordError("");
  }, [password]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs before sending to auth
    const validationResult = loginSchema.safeParse({ email, password });
    
    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      if (errors.email?.[0]) {
        setEmailError(errors.email[0]);
      }
      if (errors.password?.[0]) {
        setPasswordError(errors.password[0]);
      }
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: validationResult.data.email,
          password: validationResult.data.password,
        });

        if (error) throw error;

        toast({
          title: "Account created!",
          description: "You can now sign in to access the plant detection system",
        });
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: validationResult.data.email,
          password: validationResult.data.password,
        });

        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "Redirecting to dashboard...",
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive",
      });
      setGoogleLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <motion.div 
      className="min-h-screen relative overflow-hidden flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5 animate-gradient" />
      
      {/* Parallax Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 15, 0],
              rotate: [0, 180, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          >
            <Leaf className="w-16 h-16 text-primary/20" />
          </motion.div>
        ))}
      </div>

      <motion.div className="fixed top-4 right-4 z-50" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
        <ThemeToggle />
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md relative z-10"
      >
        <motion.div 
          variants={itemVariants}
          className="bg-card/80 backdrop-blur-xl rounded-2xl shadow-large p-8 border border-border/50"
        >
          <motion.div variants={itemVariants}>
            <Button
              onClick={() => navigate("/")}
              variant="ghost"
              className="mb-4 group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
              Back to Home
            </Button>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="flex items-center justify-center mb-6"
          >
            <motion.div 
              className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 180 }}
              transition={{ duration: 0.5 }}
            >
              <Leaf className="w-9 h-9 text-white" />
            </motion.div>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-3xl font-bold text-center text-foreground mb-2"
          >
            {isSignUp ? "Create Account" : "Welcome Back"}
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-center text-muted-foreground mb-8"
          >
            {isSignUp
              ? "Sign up to start protecting your plants with AI"
              : "Sign in to access plant disease detection"}
          </motion.p>

          <motion.form 
            variants={itemVariants}
            onSubmit={handleAuth} 
            className="space-y-4"
          >
            <motion.div 
              className="space-y-2"
              whileFocus={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={255}
                className={`transition-all focus:scale-[1.02] ${emailError ? 'border-destructive' : ''}`}
              />
              {emailError && <p className="text-sm text-destructive">{emailError}</p>}
            </motion.div>

            <motion.div 
              className="space-y-2"
              whileFocus={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                maxLength={100}
                className={`transition-all focus:scale-[1.02] ${passwordError ? 'border-destructive' : ''}`}
              />
              {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                className="w-full relative overflow-hidden group"
                size="lg"
                disabled={loading}
              >
                <span className="relative z-10">
                  {loading
                    ? "Loading..."
                    : isSignUp
                    ? "Create Account"
                    : "Sign In"}
                </span>
                <motion.div 
                  className="absolute inset-0 bg-primary-foreground/10"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </Button>
            </motion.div>
          </motion.form>

          <motion.div variants={itemVariants} className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-4">
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center gap-2"
                size="lg"
                onClick={handleGoogleAuth}
                disabled={googleLoading}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {googleLoading ? "Connecting..." : "Google"}
              </Button>
            </motion.div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="mt-6 text-center"
          >
            <motion.button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-primary hover:underline"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Login;
