import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { emergencyFundGuidePost } from "@/utils/blogPosts/emergencyFundGuide";
import { Check, Loader2 } from "lucide-react";

const AddEmergencyFundPost = () => {
  const navigate = useNavigate();
  const { createPost } = useBlogPosts();
  const { isAdmin, loading: adminLoading } = useAdminStatus();
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      toast.error("You must be an admin to publish blog posts");
      navigate("/blog");
    }
  }, [isAdmin, adminLoading, navigate]);

  const handleAddPost = useCallback(async () => {
    try {
      setIsAdding(true);
      await createPost(emergencyFundGuidePost);
      setIsAdded(true);
      toast.success("Blog post published successfully!");
      setTimeout(() => navigate("/blog"), 2000);
    } catch (error) {
      toast.error("Failed to publish blog post");
      console.error(error);
    } finally {
      setIsAdding(false);
    }
  }, [createPost, navigate]);

  useEffect(() => {
    if (!adminLoading && isAdmin) {
      handleAddPost();
    }
  }, [adminLoading, isAdmin, handleAddPost]);

  useEffect(() => {
    if (isAdded) {
      const timer = setTimeout(() => {
        navigate("/blog");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAdded, navigate]);

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Publishing New Blog Post</CardTitle>
          <CardDescription>
            How to Build an Emergency Fund: A Complete Guide for Families
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              <strong>Title:</strong> {emergencyFundGuidePost.title}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Excerpt:</strong> {emergencyFundGuidePost.excerpt}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Tags:</strong> {emergencyFundGuidePost.tags.join(", ")}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Read Time:</strong> {emergencyFundGuidePost.read_time} minutes
            </p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm">
              This comprehensive 8-minute guide covers emergency fund basics, saving strategies, 
              common mistakes, and actionable steps families can take to build financial security.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
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
                <Check className="mr-2 h-4 w-4" />
                Published!
              </>
            ) : (
              "Publish Blog Post"
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate("/blog")}
            disabled={isAdding}
          >
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AddEmergencyFundPost;
