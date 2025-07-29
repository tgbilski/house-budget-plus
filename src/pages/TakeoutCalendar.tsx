import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/components/BudgetApp';
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionBanner } from '@/components/SubscriptionBanner';
import { PDFProcessor } from '@/components/PDFProcessor';

interface DaySpending {
  date: string;
  amount: number;
  notes?: string;
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const monthAbbr = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const TakeoutCalendar: React.FC = () => {
  const [spendingData, setSpendingData] = useState<DaySpending[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedAmount, setSelectedAmount] = useState<string>('');
  const [selectedNotes, setSelectedNotes] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeMonth, setActiveMonth] = useState(new Date().getMonth());
  const { user } = useAuth();
  const { currency } = useCurrency();

  // Generate array of available years (current year + past 4 years)
  const availableYears = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, selectedYear]);

  const loadData = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('budget_data')
      .select('*')
      .eq('user_id', user.id)
      .eq('page_type', 'takeout')
      .order('created_at', { ascending: false });

    if (data && data.length > 0) {
      const budgetData = data[0];
      const expensesData = budgetData.expenses as any;
      if (expensesData.spendingData) {
        setSpendingData(expensesData.spendingData);
      }
    }
  };

  const saveData = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('budget_data')
      .upsert({
        user_id: user.id,
        page_type: 'takeout',
        calculator_id: 'takeout',
        income: 0,
        expenses: { spendingData } as any
      });

    if (error) {
      console.error('Error saving data:', error);
    }
  };

  useEffect(() => {
    if (user && spendingData.length > 0) {
      saveData();
    }
  }, [spendingData, user]);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getSpendingForDate = (date: string) => {
    return spendingData.find(spending => spending.date === date);
  };

  const handleDayClick = (year: number, month: number, day: number) => {
    const date = formatDate(year, month, day);
    const existingSpending = getSpendingForDate(date);
    
    setSelectedDate(date);
    setSelectedAmount(existingSpending?.amount.toString() || '');
    setSelectedNotes(existingSpending?.notes || '');
    setIsDialogOpen(true);
  };

  const handleSaveSpending = () => {
    if (selectedDate && selectedAmount) {
      const amount = parseFloat(selectedAmount);
      const existingIndex = spendingData.findIndex(spending => spending.date === selectedDate);
      
      if (amount === 0) {
        // Remove spending entry if amount is 0
        if (existingIndex >= 0) {
          const newSpendingData = [...spendingData];
          newSpendingData.splice(existingIndex, 1);
          setSpendingData(newSpendingData);
        }
      } else {
        // Add or update spending entry
        const newSpending: DaySpending = {
          date: selectedDate,
          amount: amount,
          notes: selectedNotes
        };

        if (existingIndex >= 0) {
          const newSpendingData = [...spendingData];
          newSpendingData[existingIndex] = newSpending;
          setSpendingData(newSpendingData);
        } else {
          setSpendingData([...spendingData, newSpending]);
        }
      }
      
      setIsDialogOpen(false);
      setSelectedDate('');
      setSelectedAmount('');
      setSelectedNotes('');
    }
  };

  const getMonthTotal = (month: number) => {
    const monthStr = String(month + 1).padStart(2, '0');
    return spendingData
      .filter(spending => spending.date.includes(`${selectedYear}-${monthStr}`))
      .reduce((sum, spending) => sum + spending.amount, 0);
  };

  const getYearTotal = () => {
    return spendingData
      .filter(spending => spending.date.startsWith(selectedYear.toString()))
      .reduce((sum, spending) => sum + spending.amount, 0);
  };

  const renderCalendarGrid = (month: number) => {
    const daysInMonth = getDaysInMonth(selectedYear, month);
    const firstDay = getFirstDayOfMonth(selectedYear, month);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = formatDate(selectedYear, month, day);
      const spending = getSpendingForDate(date);
      const isToday = date === new Date().toISOString().split('T')[0];

      days.push(
        <div
          key={day}
          onClick={() => handleDayClick(selectedYear, month, day)}
          className={`h-24 border border-border cursor-pointer hover:bg-muted/50 transition-colors p-2 relative ${
            isToday ? 'bg-primary/10 border-primary' : ''
          }`}
        >
          <div className="font-semibold text-sm">{day}</div>
          {spending && (
            <div className="text-xs text-primary font-medium mt-1">
              {currency.symbol}{spending.amount.toFixed(2)}
            </div>
          )}
          {spending?.notes && (
            <div className="text-xs text-muted-foreground truncate mt-1">
              {spending.notes}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-7 gap-0 border border-border">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 bg-muted text-center font-semibold text-sm border-b border-border">
            {day}
          </div>
        ))}
        {days}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Takeout Calendar {selectedYear}</h1>
          <p className="text-muted-foreground">
            Track your daily takeout spending throughout the year{!user && ' (sign up to save)'}
          </p>
        </div>

        {/* Year Summary Card */}
        <div className="max-w-md mx-auto mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Year {selectedYear} Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {currency.symbol}{getYearTotal().toFixed(2)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {spendingData.filter(s => s.date.startsWith(selectedYear.toString())).length} days with spending
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-6xl mx-auto space-y-6">
          {/* Subscription Banner */}
          {user && <SubscriptionBanner />}

          {/* Year Dropdown */}
          <div className="flex justify-center">
            <div className="flex items-center gap-4">
              <Label htmlFor="year-select" className="text-sm font-medium">
                Select Year:
              </Label>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Monthly Spending Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-lg">Monthly Spending Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={monthAbbr.map((month, index) => ({
                      month,
                      amount: getMonthTotal(index)
                    }))}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis 
                      tickFormatter={(value) => `${currency.symbol}${value}`}
                      tick={{ fontSize: 10 }}
                    />
                    <Tooltip 
                      formatter={(value) => [`${currency.symbol}${Number(value).toFixed(2)}`, 'Spending']}
                      labelFormatter={(label) => `${label} ${selectedYear}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Tabs value={monthNames[activeMonth]} onValueChange={(value) => {
            const monthIndex = monthNames.indexOf(value);
            setActiveMonth(monthIndex);
          }}>
            {/* Month Tabs */}
            <div className="mb-6 overflow-x-auto">
              <TabsList className="grid w-full grid-cols-12 h-auto">
                {monthAbbr.map((month, index) => (
                  <TabsTrigger 
                    key={month} 
                    value={monthNames[index]}
                    className="text-xs p-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <div className="text-center">
                      <div>{month}</div>
                      <div className="text-xs font-normal">
                        {currency.symbol}{getMonthTotal(index).toFixed(0)}
                      </div>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Calendar Grids */}
            {monthNames.map((monthName, monthIndex) => (
              <TabsContent key={monthName} value={monthName}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-center flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveMonth(monthIndex > 0 ? monthIndex - 1 : 11)}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span>{monthName} {selectedYear}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveMonth(monthIndex < 11 ? monthIndex + 1 : 0)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderCalendarGrid(monthIndex)}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
          
          {/* PDF Processor - After manual entry experience */}
          {user && (
            <div className="max-w-2xl mx-auto mt-12">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold mb-2">Tired of Manual Entry?</h2>
                <p className="text-muted-foreground">Upload your receipts and let AI do the work</p>
              </div>
              <PDFProcessor />
            </div>
          )}
        </div>

        {/* Spending Input Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedDate ? `Add spending for ${new Date(selectedDate + 'T12:00:00').toLocaleDateString()}` : 'Add Spending'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount ({currency.symbol})</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={selectedAmount}
                  onChange={(e) => setSelectedAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Input
                  id="notes"
                  value={selectedNotes}
                  onChange={(e) => setSelectedNotes(e.target.value)}
                  placeholder="What did you order?"
                />
              </div>
              <Button onClick={handleSaveSpending} className="w-full">
                Save Spending
              </Button>
              {getSpendingForDate(selectedDate) && (
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    setSelectedAmount('0');
                    handleSaveSpending();
                  }}
                  className="w-full"
                >
                  Remove Spending
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default TakeoutCalendar;