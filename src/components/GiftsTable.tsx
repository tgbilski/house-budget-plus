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
import { Trash2, Plus, ExternalLink, Loader2 } from 'lucide-react';
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
    <Card className="border-[3px] border-black shadow-cartoon">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="text-xl">Gift Ideas</CardTitle>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>
              {purchasedCount}/{gifts.length} purchased
            </span>
            <span>
              Total: {currencySymbol}
              {totalBudget.toFixed(2)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Done</TableHead>
                <TableHead className="min-w-[140px]">Occasion</TableHead>
                <TableHead className="min-w-[120px]">Recipient</TableHead>
                <TableHead className="min-w-[150px]">Gift Idea</TableHead>
                <TableHead className="w-[100px]">Price</TableHead>
                <TableHead className="w-[80px]">Link</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Existing gifts */}
              {gifts.map((gift) => (
                <TableRow
                  key={gift.id}
                  className={gift.purchased ? 'opacity-60 bg-muted/30' : ''}
                >
                  <TableCell>
                    <Checkbox
                      checked={gift.purchased}
                      onCheckedChange={(checked) =>
                        togglePurchased.mutate({ id: gift.id, purchased: !!checked })
                      }
                    />
                  </TableCell>
                  <TableCell className={gift.purchased ? 'line-through' : ''}>
                    {gift.occasion}
                  </TableCell>
                  <TableCell className={gift.purchased ? 'line-through' : ''}>
                    {gift.recipient}
                  </TableCell>
                  <TableCell className={gift.purchased ? 'line-through' : ''}>
                    {gift.gift_idea || '-'}
                  </TableCell>
                  <TableCell>
                    {gift.price ? `${currencySymbol}${gift.price.toFixed(2)}` : '-'}
                  </TableCell>
                  <TableCell>
                    {gift.link ? (
                      <a
                        href={gift.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteGift.mutate(gift.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {/* Add new gift row */}
              <TableRow className="bg-muted/20">
                <TableCell></TableCell>
                <TableCell>
                  <Select
                    value={newGift.occasion}
                    onValueChange={(value) => setNewGift({ ...newGift, occasion: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {US_HOLIDAYS.map((holiday) => (
                        <SelectItem key={holiday} value={holiday}>
                          {holiday}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    placeholder="Recipient"
                    value={newGift.recipient}
                    onChange={(e) => setNewGift({ ...newGift, recipient: e.target.value })}
                    onKeyDown={handleKeyDown}
                    className="w-full"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    placeholder="Gift idea"
                    value={newGift.gift_idea}
                    onChange={(e) => setNewGift({ ...newGift, gift_idea: e.target.value })}
                    onKeyDown={handleKeyDown}
                    className="w-full"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={newGift.price}
                    onChange={(e) => setNewGift({ ...newGift, price: e.target.value })}
                    onKeyDown={handleKeyDown}
                    className="w-full"
                    min="0"
                    step="0.01"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    placeholder="URL"
                    value={newGift.link}
                    onChange={(e) => setNewGift({ ...newGift, link: e.target.value })}
                    onKeyDown={handleKeyDown}
                    className="w-full"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    size="icon"
                    onClick={handleAddGift}
                    disabled={!newGift.occasion || !newGift.recipient || isAdding}
                    className="h-8 w-8"
                  >
                    {isAdding ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {gifts.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No gifts yet. Add your first gift idea above!
          </p>
        )}
      </CardContent>
    </Card>
  );
};
