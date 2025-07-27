import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/components/BudgetApp';
import { supabase } from '@/integrations/supabase/client';

interface TakeoutOrder {
  id: string;
  restaurant: string;
  items: string;
  cost: number;
  date: string;
}

const Takeout: React.FC = () => {
  const [orders, setOrders] = useState<TakeoutOrder[]>([]);
  const [newOrder, setNewOrder] = useState({ restaurant: '', items: '', cost: '', date: '' });
  const { user } = useAuth();
  const { currency } = useCurrency();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    setNewOrder(prev => ({ ...prev, date: today }));
  }, []);

  const loadData = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('budget_data')
      .select('*')
      .eq('user_id', user.id)
      .eq('page_type', 'takeout')
      .order('created_at', { ascending: false });

    if (data && data.length > 0) {
      const expenses = data[0].expenses as any;
      if (expenses.orders) {
        setOrders(expenses.orders);
      }
    }
  };

  const saveData = async () => {
    if (!user || orders.length === 0) return;

    const { error } = await supabase
      .from('budget_data')
      .upsert({
        user_id: user.id,
        page_type: 'takeout',
        calculator_id: 'takeout',
        expenses: { orders } as any
      });

    if (error) {
      console.error('Error saving data:', error);
    }
  };

  const addOrder = () => {
    if (newOrder.restaurant && newOrder.items && newOrder.cost && newOrder.date) {
      const order: TakeoutOrder = {
        id: Date.now().toString(),
        restaurant: newOrder.restaurant,
        items: newOrder.items,
        cost: parseFloat(newOrder.cost),
        date: newOrder.date
      };
      setOrders([...orders, order]);
      setNewOrder({ restaurant: '', items: '', cost: '', date: newOrder.date });
    }
  };

  const removeOrder = (id: string) => {
    setOrders(orders.filter(order => order.id !== id));
  };

  useEffect(() => {
    if (user && orders.length > 0) {
      saveData();
    }
  }, [orders, user]);

  const totalSpent = orders.reduce((sum, order) => sum + order.cost, 0);
  const thisMonthOrders = orders.filter(order => {
    const orderDate = new Date(order.date);
    const now = new Date();
    return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
  });
  const thisMonthTotal = thisMonthOrders.reduce((sum, order) => sum + order.cost, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Takeout Tracker</h1>
          <p className="text-muted-foreground">
            Track your takeout and delivery orders to manage dining expenses
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold">This Month</h3>
                  <p className="text-2xl font-bold text-primary">
                    {currency.symbol}{thisMonthTotal.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {thisMonthOrders.length} orders
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold">Total Tracked</h3>
                  <p className="text-2xl font-bold text-primary">
                    {currency.symbol}{totalSpent.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {orders.length} orders
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Add New Order */}
          <Card>
            <CardHeader>
              <CardTitle>Add Takeout Order</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="restaurant">Restaurant</Label>
                  <Input
                    id="restaurant"
                    value={newOrder.restaurant}
                    onChange={(e) => setNewOrder({ ...newOrder, restaurant: e.target.value })}
                    placeholder="Restaurant name"
                  />
                </div>
                <div>
                  <Label htmlFor="items">Items</Label>
                  <Input
                    id="items"
                    value={newOrder.items}
                    onChange={(e) => setNewOrder({ ...newOrder, items: e.target.value })}
                    placeholder="What you ordered"
                  />
                </div>
                <div>
                  <Label htmlFor="cost">Cost ({currency.symbol})</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={newOrder.cost}
                    onChange={(e) => setNewOrder({ ...newOrder, cost: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newOrder.date}
                    onChange={(e) => setNewOrder({ ...newOrder, date: e.target.value })}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={addOrder} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orders List */}
          {orders.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {orders
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(order => (
                      <div
                        key={order.id}
                        className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:items-center gap-2">
                            <h3 className="font-semibold">{order.restaurant}</h3>
                            <span className="text-sm text-muted-foreground">
                              {new Date(order.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{order.items}</p>
                        </div>
                        <div className="flex items-center gap-4 mt-2 md:mt-0">
                          <span className="font-semibold">
                            {currency.symbol}{order.cost.toFixed(2)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOrder(order.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  No takeout orders tracked yet. Add your first order above!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Takeout;