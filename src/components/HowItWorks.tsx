import React from 'react';
import { Calculator, Target, TrendingUp, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const steps = [
  {
    icon: Calculator,
    title: 'Track Your Budget',
    description: 'Start by entering your monthly income and expenses in our intuitive calculator. See exactly where your money goes.',
    color: 'from-primary to-primary/60',
  },
  {
    icon: Target,
    title: 'Set Your Goals',
    description: 'Define your financial goals—whether it\'s saving for a vacation, emergency fund, or a major purchase.',
    color: 'from-teal to-teal/60',
  },
  {
    icon: TrendingUp,
    title: 'Monitor Progress',
    description: 'Watch your savings grow with visual progress trackers and monthly comparisons. Stay motivated with badges and milestones.',
    color: 'from-success to-success/70',
  },
  {
    icon: Sparkles,
    title: 'Get AI Insights',
    description: 'Receive personalized financial advice and spending insights powered by AI. Discover opportunities to save more.',
    color: 'from-accent to-accent/60',
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section className="py-12 md:py-16 px-4 bg-gradient-to-br from-gray-50 to-white rounded-3xl mx-4 my-8 shadow-2xl border border-border/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">How It Works</h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Start managing your finances in four simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Card className="group h-full border-2 border-border hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white">
                <CardContent className="p-6 text-center">
                  <div className="flex flex-col items-center">
                    {/* Step number badge */}
                    <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      {index + 1}
                    </div>
                    
                    {/* Icon */}
                    <div className={`w-16 h-16 mb-4 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <step.icon className="h-8 w-8 text-white" />
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {step.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Connection lines for larger screens */}
        <div className="hidden lg:block relative -mt-48 pointer-events-none">
          <svg className="w-full h-12" viewBox="0 0 1000 50" preserveAspectRatio="none">
            <path
              d="M 250 25 L 375 25"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="5,5"
              fill="none"
              className="text-primary/20"
            />
            <path
              d="M 500 25 L 625 25"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="5,5"
              fill="none"
              className="text-primary/20"
            />
            <path
              d="M 750 25 L 875 25"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="5,5"
              fill="none"
              className="text-primary/20"
            />
          </svg>
        </div>
      </div>
    </section>
  );
};
