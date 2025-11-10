import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Download } from 'lucide-react';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { Navigate } from 'react-router-dom';

const UpdateSitemap = () => {
  const [loading, setLoading] = useState(false);
  const [sitemapContent, setSitemapContent] = useState<string>('');
  const { toast } = useToast();
  const { isAdmin } = useAdminStatus();

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const generateSitemap = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-sitemap');

      if (error) throw error;

      setSitemapContent(data);
      
      toast({
        title: "Sitemap generated!",
        description: "Click 'Download Sitemap' to save it, then upload it to /public/sitemap.xml",
      });
    } catch (error) {
      console.error('Error generating sitemap:', error);
      toast({
        title: "Error",
        description: "Failed to generate sitemap. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadSitemap = () => {
    const blob = new Blob([sitemapContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Sitemap Generator</CardTitle>
          <CardDescription>
            Generate an updated sitemap with all published blog posts. After downloading, 
            replace the contents of <code className="bg-muted px-1 py-0.5 rounded">public/sitemap.xml</code> with the generated content.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={generateSitemap} 
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Generate Sitemap
            </Button>
            
            {sitemapContent && (
              <Button 
                onClick={downloadSitemap}
                variant="secondary"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download Sitemap
              </Button>
            )}
          </div>

          {sitemapContent && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Preview:</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96 text-xs">
                {sitemapContent}
              </pre>
            </div>
          )}

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Instructions:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Click "Generate Sitemap" to create an updated sitemap</li>
              <li>Click "Download Sitemap" to save the file</li>
              <li>Replace the contents of <code className="bg-background px-1 py-0.5 rounded">public/sitemap.xml</code> with the downloaded content</li>
              <li>Publish your changes</li>
              <li>Submit the sitemap URL to Google Search Console: <code className="bg-background px-1 py-0.5 rounded">https://www.housebudgetcalculator.com/sitemap.xml</code></li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpdateSitemap;
