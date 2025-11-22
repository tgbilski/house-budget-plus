import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { trackButtonClick } from "@/utils/analytics";
import logoImage from "@/assets/logo.png";

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
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-12 max-w-4xl">
          {/* Mascot Icon */}
          <div className="mb-12 animate-in fade-in zoom-in duration-700">
            <img 
              src={logoImage} 
              alt="House Budget mascot" 
              className="w-48 h-48 md:w-64 md:h-64 drop-shadow-2xl"
            />
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white leading-tight mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
            Stop Overspending,
            <br />
            <span className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
              Start Saving
            </span>
          </h1>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
            <Link to="/features" onClick={handleExploreClick}>
              <Button 
                variant="outline"
                size="lg"
                className="h-16 px-10 text-xl font-semibold bg-white/10 hover:bg-white/20 text-white border-white/30 hover:border-white/50 backdrop-blur-sm transition-all duration-300 hover:scale-105"
              >
                Explore House Budget Calculator
              </Button>
            </Link>

            <Link to="/auth" onClick={handleSignupClick}>
              <Button 
                size="lg"
                className="h-16 px-12 text-xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
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
