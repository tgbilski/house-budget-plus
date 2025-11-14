import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Image, CheckCircle2, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ImageResult {
  post_id: string;
  title: string;
  success: boolean;
  image_url?: string;
  error?: string;
}

const GenerateBlogImages = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<ImageResult[]>([]);
  const [progress, setProgress] = useState(0);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setProgress(10);
      
      toast.info("Starting AI image generation for blog posts...");
      
      const { data, error } = await supabase.functions.invoke('generate-blog-images', {
        body: {}
      });

      if (error) throw error;

      setProgress(100);
      setResults(data.results || []);
      
      const successCount = data.results?.filter((r: ImageResult) => r.success).length || 0;
      const failCount = data.results?.length - successCount || 0;
      
      if (successCount > 0) {
        toast.success(`Successfully generated ${successCount} images!`);
      }
      if (failCount > 0) {
        toast.error(`Failed to generate ${failCount} images. Check the results below.`);
      }
      
    } catch (error) {
      console.error('Error generating images:', error);
      toast.error('Failed to generate images. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-6 w-6" />
            Generate Blog Post Images with AI
          </CardTitle>
          <CardDescription>
            Automatically generate professional, realistic images for all blog posts using AI.
            This will create unique images optimized for each post's topic and update the sitemap.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isGenerating && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                Generating images... This may take a few minutes.
              </p>
            </div>
          )}
          
          {results.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Results:</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {results.map((result, index) => (
                  <div
                    key={result.post_id}
                    className="flex items-start gap-2 p-3 rounded-lg bg-muted"
                  >
                    {result.success ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{result.title}</p>
                      {result.success && result.image_url && (
                        <p className="text-sm text-green-600">Image generated successfully</p>
                      )}
                      {!result.success && result.error && (
                        <p className="text-sm text-red-600">{result.error}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating}
            className="flex-1"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Images...
              </>
            ) : (
              <>
                <Image className="mr-2 h-4 w-4" />
                Generate All Images
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate("/blog")}
            disabled={isGenerating}
          >
            Back to Blog
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default GenerateBlogImages;
