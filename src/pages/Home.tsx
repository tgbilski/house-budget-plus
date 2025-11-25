import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { trackButtonClick } from "@/utils/analytics";
import { User } from "lucide-react";
import calculatorMascot from "@/assets/calculator-mascot.png";
import calculatorPreview from "@/assets/calculator-use-preview.png";

export default function Home() {
  const handleSignupClick = () => {
    trackButtonClick('hero_signup', 'home_page');
  };

  const handleExploreClick = () => {
    trackButtonClick('explore_calculator', 'home_page');
  };

  return (
    <>
      <SEO 
        title="House Budget - Stop Overspending, Start Saving"
        description="Take control of your finances with our simple house budget calculator. Track expenses, set goals, and save more money."
        keywords="house budget, budget calculator, expense tracker, savings goals, financial planning"
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
            <div className="flex items-center gap-3">
              <img 
                src={calculatorMascot} 
                alt="House Budget Calculator mascot" 
                className="w-12 h-12 sm:w-16 sm:h-16 drop-shadow-lg"
              />
              <h2 className="text-white text-xl sm:text-2xl font-bold">House Budget Calculator</h2>
            </div>
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
                  Explore Calculator
                </Button>
              </Link>

              <Link to="/auth" onClick={handleSignupClick} className="w-full sm:w-auto">
                <Button 
                  size="lg"
                  className="w-full sm:w-auto h-14 sm:h-16 px-8 sm:px-12 text-base sm:text-xl font-bold bg-sage text-sage-foreground hover:bg-sage/90 shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  Sign Up For Free
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

        {/* Bottom Section - White Background with Calculator Preview */}
        <div className="bg-white py-6 sm:py-10 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
                See It In Action
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground">
                Our powerful budget calculators make managing your finances, projects, vacations and gift lists simple, fun and intuitive
              </p>
            </div>
            <div className="rounded-lg overflow-hidden shadow-2xl">
              <img 
                src={calculatorPreview} 
                alt="Budget calculator interface showing multiple household budget calculators with income and expense tracking" 
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
