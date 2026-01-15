import React, { useState } from 'react';
import { Gift, US_HOLIDAYS, useGifts } from '@/hooks/useGifts';
import { useCurrency } from '@/hooks/useCurrency';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, Plus, ExternalLink, Loader2, Gift as GiftIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface NewGiftForm {
  occasion: string;
  recipient: string;
  gift_idea: string;
  price: string;
  link: string;
}

const emptyForm: NewGiftForm = {
  occasion: '',
  recipient: '',
  gift_idea: '',
  price: '',
  link: '',
};

export const GiftsTable: React.FC = () => {
  const { gifts, isLoading, addGift, deleteGift, togglePurchased } = useGifts();
  const { currency } = useCurrency();
  const currencySymbol = currency.symbol;
  
  const [newGift, setNewGift] = useState<NewGiftForm>(emptyForm);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddGift = async () => {
    if (!newGift.occasion || !newGift.recipient) return;

    setIsAdding(true);
    try {
      await addGift.mutateAsync({
        occasion: newGift.occasion,
        recipient: newGift.recipient,
        gift_idea: newGift.gift_idea || null,
        price: newGift.price ? parseFloat(newGift.price) : null,
        link: newGift.link || null,
        notes: null,
        purchased: false,
      });
      setNewGift(emptyForm);
    } finally {
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newGift.occasion && newGift.recipient) {
      handleAddGift();
    }
  };

  const totalBudget = gifts.reduce((sum, gift) => sum + (gift.price || 0), 0);
  const purchasedCount = gifts.filter((g) => g.purchased).length;

  if (isLoading) {
    return (
      <Card className="border-[3px] border-black shadow-cartoon">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. Add New Gift Section - Spacious Form */}
      <Card className="border-[3px] border-black shadow-cartoon bg-white">
        <CardHeader className="pb-2 border-b-2 border-dashed border-gray-200">
          <CardTitle className="text-xl flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Gift
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Row 1: Who and When */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Occasion *</label>
              <Select
                value={newGift.occasion}
                onValueChange={(value) => setNewGift({ ...newGift, occasion: value })}
              >
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder="Select occasion..." />
                </SelectTrigger>
                <SelectContent>
                  {US_HOLIDAYS.map((holiday) => (
                    <SelectItem key={holiday} value={holiday}>
                      {holiday}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Recipient *</label>
              <Input
                placeholder="e.g. Mom, Bestie, John"
                value={newGift.recipient}
                onChange={(e) => setNewGift({ ...newGift, recipient: e.target.value })}
                onKeyDown={handleKeyDown}
              />
            </div>

            {/* Row 2: What */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Gift Idea</label>
              <Input
                placeholder="e.g. Wireless Headphones"
                value={newGift.gift_idea}
                onChange={(e) => setNewGift({ ...newGift, gift_idea: e.target.value })}
                onKeyDown={handleKeyDown}
              />
            </div>

            {/* Row 3: Price and Link */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Est. Price</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">{currencySymbol}</span>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newGift.price}
                  onChange={(e) => setNewGift({ ...newGift, price: e.target.value })}
                  onKeyDown={handleKeyDown}
                  className="pl-8"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Link (Optional)</label>
              <Input
                placeholder="https://..."
                value={newGift.link}
                onChange={(e) => setNewGift({ ...newGift, link: e.target.value })}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>

          <Button
            onClick={handleAddGift}
            disabled={!newGift.occasion || !newGift.recipient || isAdding}
            className="w-full mt-6 font-bold"
            size="lg"
          >
            {isAdding ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <GiftIcon className="h-5 w-5 mr-2" />
            )}
            Add to List
          </Button>
        </CardContent>
      </Card>

      {/* 2. The List Section - Clean Table */}
      <Card className="border-[3px] border-black shadow-cartoon">
        <CardHeader className="pb-4 bg-muted/20 border-b-2 border-black">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle className="text-xl">Your List</CardTitle>
            <div className="flex gap-4 text-sm font-medium">
              <span className="bg-white px-3 py-1 rounded-full border border-black shadow-sm">
                Purchased: {purchasedCount}/{gifts.length}
              </span>
              <span className="bg-green-100 px-3 py-1 rounded-full border border-black shadow-sm text-green-800">
                Total: {currencySymbol}{totalBudget.toFixed(2)}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/10">
                  <TableHead className="w-[50px] text-center">Status</TableHead>
                  <TableHead className="min-w-[140px]">Occasion</TableHead>
                  <TableHead className="min-w-[120px]">Recipient</TableHead>
                  <TableHead className="min-w-[150px]">Gift Idea</TableHead>
                  <TableHead className="w-[100px]">Price</TableHead>
                  <TableHead className="w-[80px] text-center">Link</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gifts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      No gifts added yet. Use the form above to start planning!
                    </TableCell>
                  </TableRow>
                ) : (
                  gifts.map((gift) => (
                    <TableRow
                      key={gift.id}
                      className={`transition-colors hover:bg-muted/5 ${
                        gift.purchased ? 'bg-muted/20' : ''
                      }`}
                    >
                      <TableCell className="text-center">
                        <Checkbox
                          checked={gift.purchased}
                          onCheckedChange={(checked) =>
                            togglePurchased.mutate({ id: gift.id, purchased: !!checked })
                          }
                          className="h-5 w-5"
                        />
                      </TableCell>
                      <TableCell className={gift.purchased ? 'line-through text-muted-foreground' : 'font-medium'}>
                        {gift.occasion}
                      </TableCell>
                      <TableCell className={gift.purchased ? 'line-through text-muted-foreground' : ''}>
                        {gift.recipient}
                      </TableCell>
                      <TableCell className={gift.purchased ? 'line-through text-muted-foreground' : ''}>
                        {gift.gift_idea || '-'}
                      </TableCell>
                      <TableCell className={gift.purchased ? 'text-muted-foreground' : ''}>
                        {gift.price ? `${currencySymbol}${gift.price.toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        {gift.link ? (
                          <a
                            href={gift.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 inline-flex items-center justify-center p-2 rounded-md hover:bg-primary/10 transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground/30">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteGift.mutate(gift.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
