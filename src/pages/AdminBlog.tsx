import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BlogPostForm } from "@/components/BlogPostForm";
import { BlogPost } from "@/hooks/useBlogPosts";
import { SEO } from "@/components/SEO";
import { PenSquare, Loader2, Shield } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function AdminBlog() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        const adminStatus = data?.role === 'admin';
        setIsAdmin(adminStatus);

        if (!adminStatus) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to access this page.",
            variant: "destructive",
          });
          navigate('/');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, navigate]);

  const handleSave = async (postData: Partial<BlogPost>) => {
    setSaving(true);
    try {
      // Generate slug from title
      const slug = postData.title
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const { error } = await supabase
        .from('blog_posts')
        .insert({
          title: postData.title,
          content: postData.content,
          excerpt: postData.excerpt,
          published: postData.published,
          featured_image_url: postData.featured_image_url,
          read_time: postData.read_time,
          tags: postData.tags,
          slug: slug,
          user_id: user!.id,
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Blog post created successfully.",
      });

      // Optionally navigate to the blog page
      navigate('/blog');
    } catch (error) {
      console.error('Error creating blog post:', error);
      toast({
        title: "Error",
        description: "Failed to create blog post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/blog');
  };

  if (loading || isAdmin === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Admin - Blog Management"
        description="Manage blog posts for House Budget Calculator"
        keywords="admin, blog management, content management"
      />

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Blog Management</h1>
            <p className="text-muted-foreground">Create and publish blog posts</p>
          </div>
        </div>

        {/* Admin Notice */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center gap-3 p-4">
            <PenSquare className="h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold text-foreground">Admin Access</p>
              <p className="text-sm text-muted-foreground">
                You can create and manage blog posts that will be visible to all users on the blog page.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Blog Post Form */}
        <Card>
          <CardHeader>
            <CardTitle>Create New Blog Post</CardTitle>
          </CardHeader>
          <CardContent>
            <BlogPostForm onSave={handleSave} onCancel={handleCancel} loading={saving} />
          </CardContent>
        </Card>

        {/* Quick Link to Blog */}
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="font-semibold text-foreground">View Published Posts</p>
              <p className="text-sm text-muted-foreground">
                See how your posts appear to users
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate('/blog')}>
              Go to Blog
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
