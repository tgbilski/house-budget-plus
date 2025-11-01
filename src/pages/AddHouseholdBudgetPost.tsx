import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { toast } from 'sonner';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { householdBudgetSplittingPost } from '@/utils/blogPosts/householdBudgetSplitting';

const AddHouseholdBudgetPost = () => {
  const navigate = useNavigate();
  const { createPost } = useBlogPosts();
  const { isAdmin, loading: adminLoading } = useAdminStatus();
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddPost = useCallback(async () => {
    try {
      setIsAdding(true);
      await createPost(householdBudgetSplittingPost);
      setIsAdded(true);
      toast.success('Blog post published successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add blog post');
      setIsAdding(false);
    }
  }, [createPost]);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      toast.error('Admin access required');
      navigate('/blog');
      return;
    }

    // Auto-publish on mount
    if (!adminLoading && isAdmin && !isAdding && !isAdded) {
      handleAddPost();
    }
  }, [isAdmin, adminLoading, navigate, isAdding, isAdded, handleAddPost]);

  useEffect(() => {
    // Redirect after successful publish
    if (isAdded) {
      const timer = setTimeout(() => {
        navigate('/blog');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAdded, navigate]);

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Add New Blog Post</CardTitle>
          <CardDescription>
            Publish: {householdBudgetSplittingPost.title}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Title:</h3>
            <p className="text-muted-foreground">{householdBudgetSplittingPost.title}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Excerpt:</h3>
            <p className="text-muted-foreground">{householdBudgetSplittingPost.excerpt}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Tags:</h3>
            <div className="flex flex-wrap gap-2">
              {householdBudgetSplittingPost.tags?.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Read Time:</h3>
            <p className="text-muted-foreground">{householdBudgetSplittingPost.read_time} min read</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">SEO Optimized Content:</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Target keywords: household budget splitting, shared expenses, expense tracking</li>
              <li>Comprehensive 3000+ word guide</li>
              <li>Multiple H2 and H3 headings for structure</li>
              <li>Internal linking opportunities</li>
              <li>AdSense-friendly long-form content</li>
              <li>Natural keyword placement throughout</li>
            </ul>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleAddPost}
              disabled={isAdding || isAdded}
              className="flex-1"
            >
              {isAdding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : isAdded ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Published!
                </>
              ) : (
                'Publish Blog Post'
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/blog')}
              disabled={isAdding}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddHouseholdBudgetPost;
