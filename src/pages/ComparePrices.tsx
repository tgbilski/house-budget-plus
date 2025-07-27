import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/components/BudgetApp';
import { supabase } from '@/integrations/supabase/client';

interface ComparisonItem {
  id: string;
  store: string;
  item: string;
  price: number;
}

const ComparePrices: React.FC = () => {
  const [items, setItems] = useState<ComparisonItem[]>([]);
  const [newItem, setNewItem] = useState({ store: '', item: '', price: '' });
  const { user } = useAuth();
  const { currency } = useCurrency();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('budget_data')
      .select('*')
      .eq('user_id', user.id)
      .eq('page_type', 'compare_prices')
      .order('created_at', { ascending: false });

    if (data && data.length > 0) {
      const expenses = data[0].expenses as any;
      if (expenses.items) {
        setItems(expenses.items);
      }
    }
  };

  const saveData = async () => {
    if (!user || items.length === 0) return;

    const { error } = await supabase
      .from('budget_data')
      .upsert({
        user_id: user.id,
        page_type: 'compare_prices',
        calculator_id: 'compare',
        expenses: { items } as any
      });

    if (error) {
      console.error('Error saving data:', error);
    }
  };

  const addItem = () => {
    if (newItem.store && newItem.item && newItem.price) {
      const item: ComparisonItem = {
        id: Date.now().toString(),
        store: newItem.store,
        item: newItem.item,
        price: parseFloat(newItem.price)
      };
      setItems([...items, item]);
      setNewItem({ store: '', item: '', price: '' });
    }
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  useEffect(() => {
    if (user && items.length > 0) {
      saveData();
    }
  }, [items, user]);

  const getLowestPrice = (itemName: string) => {
    const itemPrices = items.filter(item => 
      item.item.toLowerCase() === itemName.toLowerCase()
    );
    if (itemPrices.length === 0) return null;
    return Math.min(...itemPrices.map(item => item.price));
  };

  const uniqueItems = [...new Set(items.map(item => item.item.toLowerCase()))];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Compare Prices</h1>
          <p className="text-muted-foreground">
            Track and compare prices across different stores to find the best deals
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Add New Item */}
          <Card>
            <CardHeader>
              <CardTitle>Add Price Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="store">Store</Label>
                  <Input
                    id="store"
                    value={newItem.store}
                    onChange={(e) => setNewItem({ ...newItem, store: e.target.value })}
                    placeholder="Store name"
                  />
                </div>
                <div>
                  <Label htmlFor="item">Item</Label>
                  <Input
                    id="item"
                    value={newItem.item}
                    onChange={(e) => setNewItem({ ...newItem, item: e.target.value })}
                    placeholder="Item name"
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price ({currency.symbol})</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={addItem} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Price Comparison Results */}
          {uniqueItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Best Prices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {uniqueItems.map(itemName => {
                    const lowestPrice = getLowestPrice(itemName);
                    const itemEntries = items.filter(item => 
                      item.item.toLowerCase() === itemName.toLowerCase()
                    );
                    
                    return (
                      <div key={itemName} className="border border-border rounded-lg p-4">
                        <h3 className="font-semibold capitalize mb-2">{itemName}</h3>
                        <div className="text-sm text-muted-foreground mb-2">
                          Best price: {currency.symbol}{lowestPrice?.toFixed(2)}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {itemEntries.map(item => (
                            <div
                              key={item.id}
                              className={`flex justify-between items-center p-2 rounded ${
                                item.price === lowestPrice
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-muted'
                              }`}
                            >
                              <span>{item.store}</span>
                              <div className="flex items-center gap-2">
                                <span>{currency.symbol}{item.price.toFixed(2)}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeItem(item.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  ×
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {items.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  No price comparisons yet. Add items above to get started!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComparePrices;