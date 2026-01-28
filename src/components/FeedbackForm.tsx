import React, { useState } from 'react';
import { MessageSquare, Send, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const CATEGORIES = [
  { value: 'suggestion', label: '💡 Suggestion' },
  { value: 'bug', label: '🐛 Bug Report' },
  { value: 'praise', label: '🎉 Praise' },
  { value: 'question', label: '❓ Question' },
];

interface FeedbackFormProps {
  pageSource?: string;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ pageSource = 'budget' }) => {
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('suggestion');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast({
        title: "Oops!",
        description: "Please enter your feedback before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (message.trim().length < 10) {
      toast({
        title: "Too short!",
        description: "Please provide a bit more detail (at least 10 characters).",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          message: message.trim(),
          category,
          page_source: pageSource,
          user_id: user?.id || null,
        });

      if (error) throw error;

      setSubmitted(true);
      setMessage('');
      toast({
        title: "Thanks for the feedback! 🎉",
        description: "We really appreciate you taking the time to share your thoughts.",
      });

      // Reset after 5 seconds so they can submit again if needed
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Something went wrong",
        description: "We couldn't submit your feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="bg-success/10 border-success">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <div className="p-3 rounded-full bg-success/20 mb-3">
            <Check className="h-8 w-8 text-success" />
          </div>
          <p className="text-lg font-semibold text-foreground">Thanks for sharing!</p>
          <p className="text-sm text-muted-foreground mt-1">Your feedback helps us improve.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5 text-primary" />
          Tell Us What You Think
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Selection */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all touch-manipulation ${
                  category === cat.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground [@media(hover:hover)]:hover:bg-muted/80'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Message Input */}
          <Textarea
            placeholder="Share your thoughts, ideas, or report an issue..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[100px] resize-none"
            maxLength={1000}
          />
          
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {message.length}/1000 characters
            </p>
            <Button 
              type="submit" 
              disabled={isSubmitting || !message.trim()}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Feedback
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default FeedbackForm;
