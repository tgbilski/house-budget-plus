import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { voiceExpenseTrackingPost } from '@/utils/blogPosts/voiceExpenseTracking';
import { toast } from 'sonner';
import { Loader2, CheckCircle } from 'lucide-react';

export const AddBlogPost: React.FC = () => {
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
      await createPost(voiceExpenseTrackingPost);
      setIsAdded(true);
      toast.success('Blog post added successfully!');
      setTimeout(() => {
        navigate('/blog');
      }, 2000);
    } catch (error) {
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
              Add New Blog Post
            </CardTitle>
            <CardDescription className="text-lg">
              AI-Powered Voice Expense Tracking Article
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
              <h3 className="text-xl font-semibold text-foreground">
                {voiceExpenseTrackingPost.title}
              </h3>
              <p className="text-muted-foreground">
                {voiceExpenseTrackingPost.excerpt}
              </p>
              <div className="flex flex-wrap gap-2">
                {voiceExpenseTrackingPost.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-teal/10 text-teal rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>📖 {voiceExpenseTrackingPost.read_time} min read</span>
                <span>✅ Ready to publish</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                SEO Optimized Content
              </h4>
              <ul className="text-sm text-blue-800 space-y-1 ml-7">
                <li>✓ Keyword-rich title and headings</li>
                <li>✓ 2,500+ word comprehensive guide</li>
                <li>✓ Internal links to relevant pages</li>
                <li>✓ Engaging subheadings and structure</li>
                <li>✓ Real-world examples and actionable tips</li>
                <li>✓ Multiple AdSense-friendly sections</li>
                <li>✓ Voice expense tracking feature showcase</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleAddPost}
                disabled={isAdding || isAdded}
                className="flex-1"
                size="lg"
              >
                {isAdding ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Adding Post...
                  </>
                ) : isAdded ? (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Post Added!
                  </>
                ) : (
                  'Add Blog Post'
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

export default AddBlogPost;
