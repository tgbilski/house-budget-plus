import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, ExternalLink, Edit2, Check, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GiftData {
  id?: string;
  list_title: string;
  gift_idea: string;
  price: number | string;
  url: string;
}

interface GiftCardProps {
  initialData?: GiftData;
  onDelete?: (id: string) => void;
}

export function GiftCard({ initialData, onDelete }: GiftCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditingTitle, setIsEditingTitle] = useState(!initialData?.id);
  const [giftData, setGiftData] = useState<GiftData>({
    list_title: initialData?.list_title || 'Holiday Gifts',
    gift_idea: initialData?.gift_idea || '',
    price: initialData?.price || '',
    url: initialData?.url || '',
    ...initialData
  });

  useEffect(() => {
    const handleAutofill = (event: CustomEvent) => {
      const { list_title, gift_idea, price, url } = event.detail;
      setGiftData(prev => ({
        ...prev,
        ...(list_title && { list_title }),
        ...(gift_idea && { gift_idea }),
        ...(price && { price }),
        ...(url && { url })
      }));
    };

    window.addEventListener('giftAutofill' as any, handleAutofill);
    return () => window.removeEventListener('giftAutofill' as any, handleAutofill);
  }, []);

  const saveData = async () => {
    if (!user) return;

    try {
      if (giftData.id) {
        // Update existing
        const { error } = await supabase
          .from('gift_lists')
          .update({
            list_title: giftData.list_title,
            gift_idea: giftData.gift_idea,
            price: giftData.price ? Number(giftData.price) : null,
            url: giftData.url
          })
          .eq('id', giftData.id);

        if (error) throw error;
      } else {
        // Create new
        const { data, error } = await supabase
          .from('gift_lists')
          .insert({
            user_id: user.id,
            list_title: giftData.list_title,
            gift_idea: giftData.gift_idea,
            price: giftData.price ? Number(giftData.price) : null,
            url: giftData.url
          })
          .select()
          .single();

        if (error) throw error;
        setGiftData(prev => ({ ...prev, id: data.id }));
      }

      toast({
        title: "Gift saved",
        description: "Your gift idea has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving gift:', error);
      toast({
        title: "Error",
        description: "Failed to save gift idea. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!giftData.id) return;

    try {
      const { error } = await supabase
        .from('gift_lists')
        .delete()
        .eq('id', giftData.id);

      if (error) throw error;

      onDelete?.(giftData.id);
      toast({
        title: "Gift deleted",
        description: "The gift idea has been removed.",
      });
    } catch (error) {
      console.error('Error deleting gift:', error);
      toast({
        title: "Error",
        description: "Failed to delete gift idea. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: keyof GiftData, value: string | number) => {
    setGiftData(prev => ({ ...prev, [field]: value }));
  };

  const openUrl = () => {
    if (giftData.url) {
      const url = giftData.url.startsWith('http') ? giftData.url : `https://${giftData.url}`;
      window.open(url, '_blank');
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        {isEditingTitle ? (
          <div className="flex items-center gap-2 flex-1">
            <Input
              value={giftData.list_title}
              onChange={(e) => handleInputChange('list_title', e.target.value)}
              className="text-lg font-semibold"
              placeholder="Gift list title"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditingTitle(false)}
            >
              <Check className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-1">
            <CardTitle className="text-lg">{giftData.list_title}</CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditingTitle(true)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {giftData.id && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="gift-idea">Gift Idea</Label>
          <Textarea
            id="gift-idea"
            value={giftData.gift_idea}
            onChange={(e) => handleInputChange('gift_idea', e.target.value)}
            placeholder="Enter a gift idea..."
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={giftData.price}
            onChange={(e) => handleInputChange('price', e.target.value)}
            placeholder="0.00"
          />
        </div>

        <div>
          <Label htmlFor="url">URL</Label>
          <div className="flex gap-2">
            <Input
              id="url"
              value={giftData.url}
              onChange={(e) => handleInputChange('url', e.target.value)}
              placeholder="https://example.com"
              className="flex-1"
            />
            {giftData.url && (
              <Button
                size="sm"
                variant="outline"
                onClick={openUrl}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <Button onClick={saveData} className="w-full">
          Save Gift
        </Button>
      </CardContent>
    </Card>
  );
}