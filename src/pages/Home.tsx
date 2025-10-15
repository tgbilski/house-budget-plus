import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Scale, Target, Plane, Brain, ArrowRight, Gift, ChevronDown, UserCheck, Crown, Store, Home as HomeIcon, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { seoData } from "@/utils/seoData";
import { AdSense } from "@/components/AdSense";
import { BadgeDisplay } from "@/components/BadgeDisplay";
import { RSSFeed } from "@/components/RSSFeed";
import { AIChatPreview } from "@/components/AIChatPreview";
import { LucideIcon } from 'lucide-react';
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";

// Import page preview images
import calculatorPreview from '@/assets/calculator-page-preview.png';
import savingsPreview from '@/assets/savings-goal-preview.png';
import vacationPreview from '@/assets/vacation-page-preview.png';
import vendorPreview from '@/assets/vendor-compare-preview.png';
import giftPreview from '@/assets/gift-page-preview.png';
import aiPreview from '@/assets/ai-page-preview.png';
import marketplacePreview from '@/assets/marketplace-page-preview.png';
import calculatorHeroPreview from '@/assets/calculator-preview-hero.png';

// --- Data for Child Components ---

const featurePreviewsData = [
  {
    title: "Monthly Budget Calculator",
    description: "Track your household income and expenses with our intuitive calculator",
    image: calculatorPreview,
    href: "/budget",
    alt: "Monthly Budget Calculator page showing dual calculators with income and expense tracking",
    icon: Calculator
  },
  {
    title: "Savings Goals Tracker",
    description: "Set and monitor your financial goals with visual progress tracking",
    image: savingsPreview,
    href: "/savings",
    alt: "Savings Goals page showing progress tracker for a new car with monthly entries",
    icon: Target
  },
  {
    title: "Vacation Planner",
    description: "Compare vacation destinations and plan your trips within budget",
    image: vacationPreview,
    href: "/vacation",
    alt: "Vacation Planner page showing comparison of vacation destinations with cost breakdowns",
    icon: Plane
  },
  {
    title: "Vendor Comparison Tool",
    description: "Compare contractor quotes and find the best value for your projects",
    image: vendorPreview,
    href: "/compare-prices",
    alt: "Vendor Comparison page showing project summary and contractor quote comparisons",
    icon: Scale
  },
  {
    title: "Gift Lists",
    description: "Organize your gift ideas for every occasion with budget tracking",
    image: giftPreview,
    href: "/gifts",
    alt: "Gift Lists page showing holiday gifts with budget tracking and gift ideas",
    icon: Gift
  },
  {
    title: "Community Marketplace",
    description: "Discover vendors, vacation rentals, and handmade gifts from our community",
    image: marketplacePreview,
    href: "/marketplace",
    alt: "Community Marketplace page showing vendor, vacation, and gift listings",
    icon: Store
  },
  {
    title: "AI Financial Advisor",
    description: "Get personalized financial insights and advice powered by AI",
    image: aiPreview,
    href: "/ai-insights",
    alt: "AI Financial Advisor page showing personalized financial guidance and analysis",
    icon: Brain
  }
];


// --- Reusable and Page-Specific Components ---

const StepCard: React.FC<{
  to: string;
  icon: LucideIcon;
  iconBgColor: string;
  iconTextColor: string;
  title: string;
  description: React.ReactNode;
}> = ({ to, icon: Icon, iconBgColor, iconTextColor, title, description }) => (
  <Link to={to} className="block w-full h-full">
    <Card className="group relative overflow-hidden transition-all duration-300 border-2 hover:border-primary/40 cursor-pointer h-full animate-fade-in bg-white/80 backdrop-blur-sm hover:shadow-[var(--shadow-elegant)] hover:-translate-y-1">
      <CardHeader className="p-6 flex flex-col justify-center h-full text-center">
        <div className="flex flex-col items-center">
          <div className={`w-14 h-14 ${iconBgColor} ${iconTextColor} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
            <Icon className="h-7 w-7" />
          </div>
          <CardTitle className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors uppercase tracking-wide">{title}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
    </Card>
  </Link>
);

const ScrollIndicator = () => (
  <div className="flex justify-center py-4">
    <ChevronDown className="h-8 w-8 text-muted-foreground animate-bounce opacity-50" />
  </div>
);

const PremiumButton = () => {
  const { user } = useAuth();
  const { subscribed } = useSubscription();

  if (user && subscribed) {
    return null;
  }

  if (!user) {
    return (
      <div className="flex justify-center lg:justify-start mb-4">
        <Link 
          to="/auth" 
          className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-primary to-[hsl(var(--primary-glow))] hover:shadow-[var(--shadow-glow)] rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
        >
          <UserCheck className="h-5 w-5 mr-2" />
          Sign Up for Free
        </Link>
      </div>
    );
  }

  return (
    <div className="flex justify-center lg:justify-start mb-4">
      <Button asChild className="bg-gradient-to-r from-teal to-[hsl(var(--teal-glow))] hover:shadow-[var(--shadow-teal)] text-white px-8 py-4 text-base font-semibold rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:-translate-y-0.5">
        <Link to="/settings">
          <Crown className="h-5 w-5 mr-2" />
          Upgrade to Premium
        </Link>
      </Button>
    </div>
  );
};



const HeroSectionContent = () => (
  <section className="relative py-8 md:py-12 px-4 rounded-3xl mx-4 shadow-2xl overflow-visible bg-gradient-to-br from-white via-white to-sage/20 mt-16 md:mt-20 border border-border/50 animate-scale-in">
    <div className="absolute top-[-60px] left-1/2 -translate-x-1/2 z-20">
      <img
        src="/lovable-uploads/ed809955-ef71-4d81-b072-945082f4380a.png"
        alt="House Budget Calculator mascot - friendly budget planning assistant"
        className="w-28 h-28 md:w-32 md:h-32 object-contain drop-shadow-2xl"
        loading="eager"
        width="128"
        height="128"
      />
    </div>
    <div className="absolute inset-0 rounded-3xl overflow-hidden">
      <img
        src="/lovable-uploads/new-house-background.png"
        alt="House background illustration for budget planning"
        className="w-full h-full object-cover opacity-10"
        loading="eager"
        width="1200"
        height="400"
      />
    </div>

    <div className="w-full max-w-6xl mx-auto relative z-10 pt-12 md:pt-16">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center mb-8">
        
        <div className="lg:col-span-2 flex justify-center lg:justify-start order-2 lg:order-1">
          <div className="w-full max-w-xs animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <img 
              src={calculatorHeroPreview} 
              alt="Monthly budget calculator interface showing income and expense tracking with visual charts"
              className="w-full h-auto rounded-2xl shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-glow)] transition-shadow duration-500 border-2 border-primary/10"
              loading="eager"
              width="320"
              height="240"
            />
          </div>
        </div>
        
        <div className="lg:col-span-3 text-center lg:text-left order-1 lg:order-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-foreground leading-tight">
            Own Your <span className="bg-gradient-to-r from-primary to-[hsl(var(--primary-glow))] bg-clip-text text-transparent">House Budget</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground mb-6 leading-relaxed">
            <strong className="text-foreground">Your data stays yours.</strong> No bank connections required. Our AI helps you develop a personalized financial plan using only the data you choose to share.
          </p>
          
          <div className="mb-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <AIChatPreview />
          </div>
          
          <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <PremiumButton />
          </div>
          
          <p className="text-sm text-muted-foreground">
            Free to use • No credit card required • Anonymous signup available
          </p>
        </div>
      </div>
    </div>
  </section>
);

const MarketplacePromo = () => (
  <section className="py-8 md:py-12 px-4 mx-4 my-8 rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-2xl border-2 border-gray-700/50 relative overflow-hidden animate-slide-up">
    <div className="absolute top-0 right-0 w-64 h-64 bg-teal/10 rounded-full blur-3xl"></div>
    <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
    
    <div className="max-w-6xl mx-auto relative z-10">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Store className="h-8 w-8 md:h-10 md:w-10 text-white flex-shrink-0" />
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            Community Marketplace
          </h2>
          <Store className="h-8 w-8 md:h-10 md:w-10 text-white flex-shrink-0" />
        </div>
        <p className="text-lg md:text-xl text-white font-semibold mb-2 px-2">
          Connect with Local Vendors, Discover Unique Gifts & Find Perfect Vacation Rentals
        </p>
        <p className="text-base md:text-lg text-gray-300 max-w-3xl mx-auto px-2">
          Browse our growing community marketplace to find trusted contractors, beautiful handmade gifts, and affordable vacation rentals—all in one place.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="group bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-teal/20 hover:shadow-[var(--shadow-teal)] transition-all duration-300 hover:-translate-y-1">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-[hsl(var(--primary-glow))] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <HomeIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Local Vendors</h3>
          <p className="text-base text-gray-600 text-center">Find trusted contractors and service providers for your home projects</p>
        </div>

        <div className="group bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-teal/20 hover:shadow-[var(--shadow-teal)] transition-all duration-300 hover:-translate-y-1">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-teal to-[hsl(var(--teal-glow))] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Plane className="h-8 w-8 text-white" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Vacation Rentals</h3>
          <p className="text-base text-gray-600 text-center">Discover affordable and unique stays for your next getaway</p>
        </div>

        <div className="group bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-teal/20 hover:shadow-[var(--shadow-teal)] transition-all duration-300 hover:-translate-y-1">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-success to-success/70 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Heart className="h-8 w-8 text-white" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Handmade Gifts</h3>
          <p className="text-base text-gray-600 text-center">Shop unique, handcrafted items perfect for any occasion</p>
        </div>
      </div>

      <div className="flex justify-center">
        <Button asChild size="lg" className="bg-gradient-to-r from-teal to-[hsl(var(--teal-glow))] hover:shadow-[var(--shadow-teal)] text-white px-8 py-6 text-lg font-bold rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1">
          <Link to="/marketplace" className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Explore Marketplace
            <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    </div>
  </section>
);

const AdvertiseSection = () => (
  <section className="py-8 px-4 mx-4 my-8 rounded-3xl bg-gradient-to-r from-primary/90 to-[hsl(var(--primary-glow))] shadow-2xl border-2 border-primary/30 text-center relative overflow-hidden animate-slide-up">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]"></div>
    <div className="max-w-4xl mx-auto relative z-10">
      <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 text-white">
        Advertise Your Listing With Us
      </h3>
      <p className="text-white/90 mb-6 text-base md:text-lg">
        Reach thousands of homeowners looking for trusted services and products
      </p>
      <Link to="/marketplace">
        <Button 
          size="lg"
          className="bg-white text-primary hover:bg-white/90 font-semibold shadow-2xl px-8 py-6 text-lg rounded-2xl hover:scale-105 transition-all duration-300"
        >
          Start Your Listing Now
        </Button>
      </Link>
    </div>
  </section>
);

const FeaturePreviewsGrid = () => {
  const [inView, setInView] = useState<boolean[]>(new Array(featurePreviewsData.length).fill(false));

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setInView(prev => {
              const newState = [...prev];
              newState[index] = true;
              return newState;
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.feature-card').forEach((card) => {
      observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-12 md:py-16 px-4 bg-gradient-to-br from-white to-secondary/30 rounded-3xl mx-4 my-8 shadow-2xl relative overflow-hidden border border-border/50">
      <div className="absolute top-0 left-0 w-96 h-96 bg-teal/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      
      <div className="w-full max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-12 animate-slide-up">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Explore Our Features</h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Powerful financial planning tools designed to help you save money and achieve your goals
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-8">
          {featurePreviewsData.map((feature, index) => {
            const isEven = index % 2 === 0;
            return (
              <Link 
                to={feature.href} 
                key={index} 
                className="block feature-card"
                data-index={index}
              >
                <Card className={`group relative overflow-hidden transition-all duration-500 border-2 hover:border-primary/40 cursor-pointer h-80 bg-white/80 backdrop-blur-sm hover:shadow-[var(--shadow-elegant)] hover:-translate-y-2 ${inView[index] ? 'animate-slide-up opacity-100' : 'opacity-0'}`} style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className={`flex flex-col md:flex-row items-stretch h-full ${isEven ? '' : 'md:flex-row-reverse'}`}>
                    <div className="w-full md:w-1/2 h-48 md:h-full overflow-hidden flex-shrink-0 relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-teal/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                      <img 
                        src={feature.image} 
                        alt={feature.alt}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                        width="600"
                        height="320"
                      />
                    </div>
                    <div className="w-full md:w-1/2 p-8 bg-gradient-to-br from-white to-sage/10 h-full flex flex-col justify-center">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-[hsl(var(--primary-glow))] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                          <feature.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-2xl md:text-3xl group-hover:text-primary transition-colors text-foreground mb-3 font-bold">{feature.title}</CardTitle>
                          <CardDescription className="text-base md:text-lg text-muted-foreground leading-relaxed">{feature.description}</CardDescription>
                        </div>
                      </div>
                      <div className={`flex items-center text-primary group-hover:translate-x-2 transition-transform duration-300 mt-4 ${isEven ? '' : 'flex-row-reverse'}`}>
                        <span className="font-semibold mr-2">Learn More</span>
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// Floating Action Button
const FloatingChatButton = () => (
  <Link to="/ai-insights">
    <button className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-gradient-to-br from-teal to-[hsl(var(--teal-glow))] text-white rounded-full shadow-2xl hover:shadow-[var(--shadow-teal)] transition-all duration-300 hover:scale-110 flex items-center justify-center animate-glow">
      <Brain className="h-7 w-7" />
    </button>
  </Link>
);

// --- Main Page Component ---

const Home = () => {
  return (
    <>
      <SEO
        title={seoData.home.title}
        description={seoData.home.description}
        keywords={seoData.home.keywords}
        structuredData={seoData.home.structuredData}
        canonical={seoData.home.canonical}
        ogImage={seoData.home.ogImage}
      />
      <div className="min-h-screen overflow-x-hidden relative bg-gradient-to-b from-background to-secondary/20">
        <div className="space-y-4">
          <HeroSectionContent />
          <ScrollIndicator />
          <MarketplacePromo />
          <ScrollIndicator />
          <FeaturePreviewsGrid />
          <ScrollIndicator />
          <AdvertiseSection />
          <ScrollIndicator />

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl mx-4 my-8 shadow-2xl border-2 border-gray-700/50 p-6 md:p-8 overflow-hidden">
            <div className="w-full max-w-7xl mx-auto overflow-hidden">
              <RSSFeed
                feedUrl="https://rss.cnn.com/rss/money_news_international.rss"
                title="Latest Financial News"
              />
            </div>
          </div>
          <ScrollIndicator />

          <div className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12">
            <BadgeDisplay />
          </div>
        </div>
        
        <FloatingChatButton />
      </div>
    </>
  );
};

export default Home;
