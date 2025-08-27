import React from 'react';
import { SEO } from '@/components/SEO';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { useAuth } from '@/hooks/useAuth';
import { useBadges } from '@/hooks/useBadges';
import { InternalLinks } from '@/components/InternalLinks';
import { SocialShare } from '@/components/SocialShare';
import { DailyCheckin } from '@/components/DailyCheckin';
import { ChallengesCard } from '@/components/ChallengesCard';
import { InsightsDashboard } from '@/components/InsightsDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Target, Brain, Trophy, TrendingUp } from 'lucide-react';

export default function Engagement() {
  const { user } = useAuth();
  const { earnBadge } = useBadges();

  React.useEffect(() => {
    // Earn engagement badge when visiting this page
    earnBadge('ai_insights');
  }, [earnBadge]);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Engagement Hub', href: '/engagement' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <SEO 
        title="Engagement Hub - Daily Check-ins, Challenges & Insights"
        description="Build better financial habits with daily check-ins, goal-based challenges, and personalized insights. Track your progress and stay motivated with our engagement features."
        keywords="financial habits, daily check-ins, budget challenges, savings goals, financial insights, money tracking, personal finance engagement"
      />

      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs />
        
        {/* Hero Section with Light Background */}
        <div className="relative bg-white text-gray-900 py-8 mb-8 rounded-2xl mx-4 mt-4 shadow-xl">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center">
              <Trophy className="h-10 w-10 mx-auto mb-4 text-primary" />
              <h1 className="text-xl md:text-2xl font-bold mb-2 text-gray-900">Engagement Hub</h1>
              <p className="text-sm md:text-base text-gray-600 mb-4 max-w-2xl mx-auto">
                Build lasting financial habits with daily check-ins, exciting challenges, and personalized insights
              </p>
            </div>
          </div>
        </div>

        {!user ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="text-center py-12">
              <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
              <h2 className="text-2xl font-semibold mb-4">Start Your Financial Journey</h2>
              <p className="text-muted-foreground mb-6">
                Sign up to access daily check-ins, challenges, and personalized insights that will help you build better financial habits.
              </p>
              <a 
                href="/auth" 
                className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                Get Started Today
              </a>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="checkin" className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="checkin" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Daily Check-in
              </TabsTrigger>
              <TabsTrigger value="challenges" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Challenges
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Insights
              </TabsTrigger>
            </TabsList>

            <TabsContent value="checkin" className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold mb-2 flex items-center justify-center gap-2">
                  <Calendar className="h-6 w-6 text-primary" />
                  Daily Financial Check-in
                </h2>
                <p className="text-muted-foreground">
                  Build consistency by checking in daily with your financial activities and mood
                </p>
              </div>
              <DailyCheckin />
            </TabsContent>

            <TabsContent value="challenges" className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold mb-2 flex items-center justify-center gap-2">
                  <Target className="h-6 w-6 text-primary" />
                  Financial Challenges
                </h2>
                <p className="text-muted-foreground">
                  Set and achieve financial goals with our structured challenge system
                </p>
              </div>
              <ChallengesCard />
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold mb-2 flex items-center justify-center gap-2">
                  <Brain className="h-6 w-6 text-primary" />
                  Personalized Insights
                </h2>
                <p className="text-muted-foreground">
                  Get AI-powered insights about your spending patterns and opportunities
                </p>
              </div>
              <InsightsDashboard />
            </TabsContent>
          </Tabs>
        )}

        {/* Features Overview */}
        <section className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-8">Why Use the Engagement Hub?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Build Habits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Daily check-ins help you develop consistent financial tracking habits that compound over time.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Achieve Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Structured challenges make it easier to reach specific financial milestones and savings targets.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Learn & Improve
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Personalized insights reveal spending patterns and suggest actionable improvements to your budget.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <SocialShare 
          title="Check out this Engagement Hub for building better financial habits!"
          description="Build lasting financial habits with daily check-ins, exciting challenges, and personalized insights. Track your progress and stay motivated!"
          url="https://housebudgetcalculator.com/engagement"
        />
        
        <InternalLinks currentPage="/engagement" category="engagement" />
      </div>
    </div>
  );
}