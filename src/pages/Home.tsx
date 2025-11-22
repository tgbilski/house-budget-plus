import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { trackButtonClick } from "@/utils/analytics";
import calculatorMascot from "@/assets/calculator-mascot.png";

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
      
      <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: 'hsl(213, 50%, 22%)' }}>
        {/* Subtle pattern overlay */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.02) 40px, rgba(255,255,255,0.02) 42px)'
          }}
        />

        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6 py-8 sm:py-12 max-w-4xl w-full">
          {/* Mascot Icon */}
          <div className="mb-8 sm:mb-12 animate-in fade-in zoom-in duration-700">
            <img 
              src={calculatorMascot} 
              alt="House Budget Calculator mascot - friendly calculator character" 
              className="w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 drop-shadow-2xl"
            />
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold text-white leading-tight mb-6 sm:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
            <span className="sm:whitespace-nowrap">Stop Overspending,</span>
            <br />
            <span className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent sm:whitespace-nowrap">
              Start Saving
            </span>
          </h1>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-6 sm:mt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 w-full sm:w-auto">
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
                className="w-full sm:w-auto h-14 sm:h-16 px-8 sm:px-12 text-base sm:text-xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
              >
                Sign Up For Free
              </Button>
            </Link>
          </div>

          {/* Small trust signal */}
          <p className="mt-12 text-white/60 text-sm animate-in fade-in duration-1000 delay-700">
            Join 10,000+ families taking control of their finances
          </p>
        </div>
      </div>
    </>
  );
}
