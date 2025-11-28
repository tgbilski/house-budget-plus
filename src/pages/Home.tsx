import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { trackButtonClick } from "@/utils/analytics";
import { User, CheckCircle2, PiggyBank, Target, Gift, Plane } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import calculatorMascot from "@/assets/calculator-mascot.png";
import calculatorPreview from "@/assets/calculator-use-preview.png";

export default function Home() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignupClick = () => {
    trackButtonClick('hero_signup', 'home_page');
  };

  const handleExploreClick = () => {
    trackButtonClick('explore_calculator', 'home_page');
  };

  const handleQuickSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      trackButtonClick('quick_signup', 'home_page');
      toast({
        title: "Account created!",
        description: "Check your email to verify your account, then sign in.",
      });
      navigate("/features");
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEO 
        title="House Budget - Stop Overspending, Start Saving"
        description="Take control of your finances with our simple house budget calculator. Track expenses, set goals, and save more money."
        keywords="house budget, budget calculator, expense tracker, savings goals, financial planning"
        ogImage="https://www.housebudgetcalculator.com/lovable-uploads/og-image-social.png"
      />
      
      <div className="min-h-screen w-full relative overflow-hidden">
        {/* Top Section - Blue Background */}
        <div className="relative" style={{ backgroundColor: 'hsl(213, 50%, 22%)' }}>
          {/* Subtle pattern overlay */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.02) 40px, rgba(255,255,255,0.02) 42px)'
            }}
          />

          {/* Top Bar with Logo */}
          <div className="relative z-10 flex items-center justify-between gap-3 px-4 sm:px-8 py-4">
            <Link to="/features" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <img 
                src={calculatorMascot} 
                alt="House Budget Calculator mascot" 
                className="w-12 h-12 sm:w-16 sm:h-16 drop-shadow-lg"
              />
              <h2 className="text-white text-xl sm:text-2xl font-bold">House Budget Calculator</h2>
            </Link>
            <Link to="/auth?mode=signin">
              <Button 
                variant="outline"
                size="sm"
                className="bg-white/10 hover:bg-white/20 text-white border-white/30 hover:border-white/50 backdrop-blur-sm transition-all"
              >
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            </Link>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6 py-12 sm:py-16 max-w-4xl mx-auto">
            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold text-white leading-tight mb-6 sm:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <span className="sm:whitespace-nowrap">Stop Overspending,</span>
              <br />
              <span className="text-sage sm:whitespace-nowrap">
                Start Saving
              </span>
            </h1>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-6 sm:mt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 w-full sm:w-auto">
              <Link to="/features" onClick={handleExploreClick} className="w-full sm:w-auto">
                <Button 
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto h-14 sm:h-16 px-6 sm:px-10 text-base sm:text-xl font-semibold bg-white/10 hover:bg-white/20 text-white border-white/30 hover:border-white/50 backdrop-blur-sm transition-all duration-300 hover:scale-105"
                >
                  Explore Features
                </Button>
              </Link>

              <Link to="/auth" onClick={handleSignupClick} className="w-full sm:w-auto">
                <Button 
                  size="lg"
                  className="w-full sm:w-auto h-14 sm:h-16 px-8 sm:px-12 text-base sm:text-xl font-bold bg-sage text-sage-foreground hover:bg-sage/90 shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-[hsl(213,50%,22%)]"
                >
                  Get Started (Free)
                </Button>
              </Link>
            </div>
          </div>

          {/* Diagonal Cut */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-white" 
            style={{ 
              clipPath: 'polygon(0 100%, 100% 0, 100% 100%, 0 100%)'
            }}
          />
        </div>

        {/* Bottom Section - Sign Up Form & Value Props */}
        <div className="bg-white py-12 sm:py-16 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Preview Image */}
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
                Own Your Budget
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground mb-8">
                Our powerful budget calculators make managing your finances simple, fun and intuitive
              </p>
              <div className="rounded-lg overflow-hidden shadow-2xl max-w-4xl mx-auto">
                <img 
                  src={calculatorPreview} 
                  alt="Budget calculator interface showing multiple household budget calculators with income and expense tracking" 
                  className="w-full h-auto object-contain"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Sign Up Form & Value Props Grid */}
            <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-start mt-16">
              {/* Sign Up Form - Left Side */}
              <div className="bg-gradient-to-br from-background to-sage/10 rounded-2xl p-6 sm:p-8 border shadow-lg">
                <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  Start Saving Today
                </h3>
                <p className="text-muted-foreground mb-6">
                  Create your free account in seconds
                </p>
                
                <form onSubmit={handleQuickSignup} className="space-y-4">
                  <div>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 text-base"
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 text-base"
                      minLength={6}
                      required
                    />
                  </div>
                  <Button 
                    type="submit"
                    size="lg"
                    disabled={isLoading}
                    className="w-full h-14 text-lg font-bold bg-sage text-sage-foreground hover:bg-sage/90 shadow-lg transition-all duration-300 hover:scale-[1.02]"
                  >
                    {isLoading ? "Creating Account..." : "Get Started (Free)"}
                  </Button>
                </form>
                
                <p className="text-sm text-muted-foreground text-center mt-4">
                  Already have an account?{" "}
                  <Link to="/auth?mode=signin" className="text-teal font-medium hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>

              {/* Value Props - Right Side */}
              <div className="space-y-6">
                <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">
                  Everything You Need to Take Control
                </h3>
                
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center">
                      <PiggyBank className="w-6 h-6 text-teal" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-lg">Monthly Budget Tracking</h4>
                      <p className="text-muted-foreground">Track income and expenses across multiple budget categories</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-sage/20 flex items-center justify-center">
                      <Target className="w-6 h-6 text-sage-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-lg">Savings Goals</h4>
                      <p className="text-muted-foreground">Set and track progress toward your financial dreams</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Gift className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-lg">Gift List Management</h4>
                      <p className="text-muted-foreground">Organize gift ideas and track spending for every occasion</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <Plane className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-lg">Vacation Planning</h4>
                      <p className="text-muted-foreground">Compare destinations and budget your dream trips</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-lg">Vendor Comparison</h4>
                      <p className="text-muted-foreground">Compare contractor quotes to get the best value</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
