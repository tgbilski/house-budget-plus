import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, Loader2, CheckCircle, XCircle, CalendarDays } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function PDFProcessor() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { subscribed, createCheckout } = useSubscription();
  const { session } = useAuth();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setResult(null);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a PDF file",
        variant: "destructive",
      });
    }
  };

  const processFile = async () => {
    if (!file || !session) return;

    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data, error } = await supabase.functions.invoke('process-pdf', {
        body: formData,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        // Check for various limit-related error messages
        if (error.message?.includes('Monthly limit reached') || 
            error.message?.includes('free PDF') || 
            error.message?.includes('Upgrade to Premium') ||
            error.message?.includes('limit') ||
            error.status === 403) {
          toast({
            title: "PDF Processing Limit Reached",
            description: "You've used your free PDF processing. Upgrade to Premium for unlimited PDF processing with AI categorization and automatic takeout calendar integration.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      setResult(data);
      toast({
        title: "Success!",
        description: data.message || "PDF processed successfully. Food transactions added to your calendar!",
      });
      
      // Force reload the page to show updated calendar data
      window.location.reload();
    } catch (error) {
      console.error('Error processing PDF:', error);
      toast({
        title: "Error",
        description: "Failed to process PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          PDF Expense Processor
          {!subscribed && (
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded dark:bg-amber-900 dark:text-amber-200">
              1 free PDF
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="pdf-upload">Upload PDF Receipt/Invoice</Label>
          <Input
            id="pdf-upload"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="mt-1"
          />
        </div>

        {file && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <FileText className="h-4 w-4" />
            <span className="text-sm">{file.name}</span>
            <span className="text-xs text-muted-foreground">
              ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </span>
          </div>
        )}

        <Button
          onClick={processFile}
          disabled={!file || processing}
          className="w-full"
        >
          {processing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Process PDF
            </>
          )}
        </Button>

        {!subscribed && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-950/20 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              You get 1 free PDF. After that, 
              <Button variant="link" className="h-auto p-0 ml-1 text-amber-800 dark:text-amber-200" onClick={() => createCheckout('monthly')}>
                Upgrade to Premium
              </Button> for unlimited processing with AI categorization.
            </p>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">Processing Complete</span>
            </div>

            {result.foodTransactions && result.foodTransactions.length > 0 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg dark:bg-green-950/20 dark:border-green-800">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-2">
                  <CalendarDays className="h-4 w-4" />
                  <span className="font-medium">
                    {result.foodTransactions.length} food transaction{result.foodTransactions.length !== 1 ? 's' : ''} added to takeout calendar
                  </span>
                </div>
                <div className="space-y-1">
                  {result.foodTransactions.slice(0, 3).map((transaction: any, index: number) => (
                    <div key={index} className="text-sm text-green-600 dark:text-green-400">
                      {transaction.date}: ${transaction.amount.toFixed(2)} at {transaction.merchant}
                    </div>
                  ))}
                  {result.foodTransactions.length > 3 && (
                    <div className="text-sm text-green-600 dark:text-green-400">
                      ...and {result.foodTransactions.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="extracted-text">Extracted Text</Label>
              <Textarea
                id="extracted-text"
                value={result.extracted_text || ''}
                readOnly
                className="mt-1 min-h-32"
              />
            </div>

            {result.categorization && (
              <div>
                <Label>AI Categorization</Label>
                <div className="mt-1 p-3 bg-muted rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap">
                    {JSON.stringify(result.categorization, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}