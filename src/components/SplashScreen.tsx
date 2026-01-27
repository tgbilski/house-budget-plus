import calculatorMascot from "@/assets/calculator-mascot.png";

interface SplashScreenProps {
  isLoading: boolean;
}

export const SplashScreen = ({ isLoading }: SplashScreenProps) => {
  if (!isLoading) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-500"
      style={{ backgroundColor: 'hsl(175, 65%, 35%)' }}
    >
      {/* Jazz swoosh pattern overlay */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 50% at 20% 80%, hsl(280, 55%, 50%) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 20%, hsl(280, 55%, 55%) 0%, transparent 40%),
            repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.03) 40px, rgba(255,255,255,0.03) 42px)
          `
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 animate-fade-in">
        {/* Mascot with pulse animation */}
        <div className="relative">
          <img 
            src={calculatorMascot} 
            alt="House Budget Calculator" 
            className="w-24 h-24 sm:w-32 sm:h-32 drop-shadow-2xl animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]"
          />
        </div>
        
        {/* App name */}
        <h1 className="text-2xl sm:text-3xl font-bold text-white text-center">
          House Budget Calculator
        </h1>
        
        {/* Loading indicator - purple dots */}
        <div className="flex items-center gap-2 mt-4">
          <div className="flex gap-1">
            <span 
              className="w-2 h-2 rounded-full animate-bounce"
              style={{ backgroundColor: 'hsl(280, 55%, 60%)', animationDelay: '0ms' }}
            />
            <span 
              className="w-2 h-2 rounded-full animate-bounce"
              style={{ backgroundColor: 'hsl(280, 55%, 60%)', animationDelay: '150ms' }}
            />
            <span 
              className="w-2 h-2 rounded-full animate-bounce"
              style={{ backgroundColor: 'hsl(280, 55%, 60%)', animationDelay: '300ms' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
