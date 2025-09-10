import React from 'react';
import { SEO } from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Target, Heart, TrendingUp } from 'lucide-react';
import { AdSense } from '@/components/AdSense';

const AboutUs: React.FC = () => {
  return (
    <>
      <SEO 
        title="About Us - House Budget Calculator"
        description="Learn about our mission to help families manage their finances better with our comprehensive budgeting tools and calculators."
        keywords="about us, budget calculator team, financial planning mission, household budgeting help"
      />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About House Budget Calculator</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Empowering families to take control of their finances through smart budgeting tools and insights.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Target className="h-8 w-8 text-primary" />
                <CardTitle>Our Mission</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                To make financial planning accessible and simple for every household. We believe that everyone deserves the tools and knowledge to build a secure financial future.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Heart className="h-8 w-8 text-primary" />
                <CardTitle>Our Values</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-600">
                <li>• Transparency in financial planning</li>
                <li>• User-friendly design for all skill levels</li>
                <li>• Privacy and security of your data</li>
                <li>• Continuous improvement and innovation</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-12">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-primary" />
              <CardTitle>What We Offer</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">Budget Tracking</Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">Savings Goals</Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">Expense Analysis</Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">Vendor Comparison</Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">AI Insights</Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">Vacation Planning</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-primary" />
              <CardTitle>Our Story</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              House Budget Calculator was born from the simple idea that managing household finances shouldn't be complicated. 
              We noticed that many families struggle with budgeting not because they lack the desire to save, but because they 
              lack the right tools to visualize and manage their money effectively.
            </p>
            <p className="text-gray-600">
              Today, we're proud to help thousands of families make informed financial decisions, reach their savings goals, 
              and build more secure financial futures. Our platform continues to evolve based on user feedback and the 
              changing needs of modern households.
            </p>
          </CardContent>
        </Card>

        <div className="mt-8">
          <AdSense adSlot="1234567890" />
        </div>
      </div>
    </>
  );
};

export default AboutUs;