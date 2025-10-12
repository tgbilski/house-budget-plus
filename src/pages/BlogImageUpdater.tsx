import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

// This is a one-time utility page to update blog post images
const BlogImageUpdater = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const updates = [
    {
      id: '93585b21-0e40-4466-865f-f5b7fcbfbfdd',
      title: 'Stop Overpaying',
      featured_image_url: '/src/assets/blog-stop-overpaying-vendors.png',
      tags: ['home improvement', 'vendor comparison', 'contractors', 'renovation tips', 'cost savings', 'home projects', 'budget planning', 'contractor quotes']
    },
    {
      id: 'e1c6c14f-8db8-4d07-83d9-95191a2b4363',
      title: 'Holiday Gift Ideas 2025',
      featured_image_url: '/src/assets/blog-holiday-gifts-2025.png',
    },
    {
      id: '6b408682-461a-4edd-a217-bfcd46f3fbd1',
      title: 'Community Marketplace',
      featured_image_url: '/src/assets/blog-community-marketplace.png',
    },
    {
      id: '7c03211e-f56a-4c1b-8141-e3705b65f71b',
      title: 'Financial Toolkit',
      featured_image_url: '/src/assets/blog-financial-toolkit.png',
    },
    {
      id: 'e414f103-6768-467e-9a53-713e7eeef135',
      title: 'House Budget Beginners',
      featured_image_url: '/src/assets/blog-house-budget-beginners.png',
    }
  ];

  const handleUpdate = async () => {
    setIsUpdating(true);
    
    try {
      for (const update of updates) {
        const updateData: any = {
          featured_image_url: update.featured_image_url
        };
        
        if (update.tags) {
          updateData.tags = update.tags;
        }
        
        const { error } = await supabase
          .from('blog_posts')
          .update(updateData)
          .eq('id', update.id);
          
        if (error) {
          console.error(`Error updating ${update.title}:`, error);
          toast({
            title: "Error",
            description: `Failed to update ${update.title}`,
            variant: "destructive",
          });
          setIsUpdating(false);
          return;
        }
      }
      
      toast({
        title: "Success!",
        description: "All blog posts updated with images and tags",
      });
      
      // Navigate to blog after successful update
      setTimeout(() => navigate('/blog'), 1000);
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: "Error",
        description: "Failed to update blog posts",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Update Blog Post Images & Tags</h1>
        <p className="mb-4">
          This will update all blog posts with their featured images and add SEO tags to the "Stop Overpaying" post.
        </p>
        
        <div className="space-y-2 mb-6">
          {updates.map((update) => (
            <div key={update.id} className="text-sm">
              ✓ {update.title} → {update.featured_image_url.split('/').pop()}
              {update.tags && <span className="text-muted-foreground ml-2">+ {update.tags.length} tags</span>}
            </div>
          ))}
        </div>
        
        <Button 
          onClick={handleUpdate} 
          disabled={isUpdating}
          className="w-full"
        >
          {isUpdating ? "Updating..." : "Update All Blog Posts"}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => navigate('/blog')}
          className="w-full mt-2"
        >
          Cancel
        </Button>
      </Card>
    </div>
  );
};

export default BlogImageUpdater;
