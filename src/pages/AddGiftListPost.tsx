import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { giftListChristmasShoppingPost } from '@/utils/blogPosts/giftListChristmasShopping';
import { toast } from 'sonner';
import { Loader2, CheckCircle, Gift, Calendar, DollarSign, Bell } from 'lucide-react';

export const AddGiftListPost: React.FC = () => {
  const navigate = useNavigate();
  const { createPost } = useBlogPosts();
  const { isAdmin } = useAdminStatus();
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      toast.error('Admin access required');
      navigate('/blog');
    }
  }, [isAdmin, navigate]);

  const handleAddPost = async () => {
    try {
      setIsAdding(true);
      await createPost(giftListChristmasShoppingPost);
      setIsAdded(true);
      toast.success('Christmas Gift List blog post published!');
      setTimeout(() => {
        navigate('/blog/christmas-gift-list-organizer-2025');
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add blog post');
      setIsAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-teal/5 to-sage/10 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-xl border-teal/20">
          <CardHeader>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-teal bg-clip-text text-transparent">
              Publish Christmas Gift List Article
            </CardTitle>
            <CardDescription className="text-lg">
              SEO-Optimized Holiday Shopping Guide
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
              <h3 className="text-xl font-semibold text-foreground">
                {giftListChristmasShoppingPost.title}
              </h3>
              <p className="text-muted-foreground">
                {giftListChristmasShoppingPost.excerpt}
              </p>
              <div className="flex flex-wrap gap-2">
                {giftListChristmasShoppingPost.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-teal/10 text-teal rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>📖 {giftListChristmasShoppingPost.read_time} min read</span>
                <span>✅ Ready to publish</span>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="h-5 w-5 text-amber-600" />
                  <h4 className="font-semibold text-amber-900 dark:text-amber-100">Gift Tracking</h4>
                </div>
                <p className="text-sm text-amber-800 dark:text-amber-200">Status tracking for ideas, purchased, and wrapped gifts</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100">Event Calendar</h4>
                </div>
                <p className="text-sm text-blue-800 dark:text-blue-200">Countdown timer to your event date</p>
              </div>
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-green-900 dark:text-green-100">Budget Tracking</h4>
                </div>
                <p className="text-sm text-green-800 dark:text-green-200">Real-time spending vs budget visualization</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="h-5 w-5 text-purple-600" />
                  <h4 className="font-semibold text-purple-900 dark:text-purple-100">Smart Reminders</h4>
                </div>
                <p className="text-sm text-purple-800 dark:text-purple-200">One-week alert before your event</p>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-green-900 dark:text-green-100 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                SEO & AdSense Optimized
              </h4>
              <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 ml-7">
                <li>✓ Christmas shopping keywords throughout</li>
                <li>✓ 2,000+ word comprehensive guide</li>
                <li>✓ Multiple internal links to /gifts, /budget, /savings</li>
                <li>✓ Step-by-step how-to sections</li>
                <li>✓ Pro tips and common mistakes sections</li>
                <li>✓ Clear CTAs with links to the tool</li>
                <li>✓ Featured image included</li>
                <li>✓ Multiple AdSense-friendly content breaks</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleAddPost}
                disabled={isAdding || isAdded}
                className="flex-1 bg-teal hover:bg-teal/90"
                size="lg"
              >
                {isAdding ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Publishing...
                  </>
                ) : isAdded ? (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Published!
                  </>
                ) : (
                  <>
                    <Gift className="mr-2 h-5 w-5" />
                    Publish Christmas Gift List Article
                  </>
                )}
              </Button>
              <Button
                onClick={() => navigate('/blog')}
                variant="outline"
                size="lg"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddGiftListPost;