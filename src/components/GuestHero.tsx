import React from 'react';
import { ArrowDown, Sparkles, TrendingUp, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import calculatorMascot from '@/assets/calculator-mascot.png';

const GuestHero: React.FC = () => {
  const scrollToCalculator = () => {
    document.getElementById('guest-calculator')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden rounded-2xl border-[3px] border-stroke bg-gradient-to-br from-primary/5 via-card to-teal/5 shadow-cartoon mb-6">
      <div className="relative z-10 px-5 py-6 sm:px-8 sm:py-10">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
          {/* Mascot */}
          <img 
            src={calculatorMascot} 
            alt="Budget Calculator Mascot" 
            className="w-20 h-20 sm:w-28 sm:h-28 object-contain drop-shadow-[2px_2px_0px_hsl(var(--stroke))] flex-shrink-0 animate-bounce-slow"
          />
          
          {/* Copy */}
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
              Where does your money <span className="text-primary">actually</span> go? 🤔
            </h1>
            <p className="mt-2 text-base sm:text-lg text-muted-foreground max-w-lg">
              Plug in your income and expenses below — takes 2 minutes. No signup needed to try it.
            </p>
            
            {/* Quick trust signals */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4 text-xs sm:text-sm font-medium text-muted-foreground">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-success/10 text-success">
                <Shield className="h-3.5 w-3.5" /> 100% Free
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                <TrendingUp className="h-3.5 w-3.5" /> No credit card
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal/10 text-teal">
                <Sparkles className="h-3.5 w-3.5" /> Instant results
              </span>
            </div>
          </div>
        </div>
        
        {/* CTA on mobile to scroll down */}
        <div className="mt-5 flex flex-col sm:flex-row items-center gap-3">
          <Button 
            onClick={scrollToCalculator} 
            size="lg" 
            className="w-full sm:w-auto text-base font-bold shadow-lg"
          >
            Try the Calculator <ArrowDown className="ml-2 h-4 w-4 animate-bounce" />
          </Button>
          <span className="text-xs text-muted-foreground">
            or <Link to="/signup" className="text-primary font-semibold underline underline-offset-2 hover:text-primary/80">sign up to save your data</Link>
          </span>
        </div>
      </div>
      
      {/* Decorative background blobs */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
    </section>
  );
};

export default GuestHero;
