import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useExpenses } from '@/hooks/useExpenses';
import { useCurrency } from '@/hooks/useCurrency';
import { useHouseholdContext } from '@/providers/HouseholdProvider';
import { useIsMobile } from '@/hooks/use-mobile';
import { Mic, MicOff, Calendar as CalendarIcon, Trash2, TrendingUp, Edit2, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--teal))',
  'hsl(var(--success))',
  'hsl(var(--sage))',
  'hsl(var(--primary-glow))',
  'hsl(var(--teal-glow))',
  'hsl(var(--accent))',
  'hsl(var(--secondary))',
];

const ExpensesSection: React.FC = () => {
  const { user } = useAuth();
  const { currency } = useCurrency();
  const { currentHousehold } = useHouseholdContext();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { expenses, loading, addExpense, deleteExpense, updateExpense } = useExpenses(selectedDate);
  const [expanded, setExpanded] = useState(!isMobile);

  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [parsedExpense, setParsedExpense] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiStatus, setAiStatus] = useState('');
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [editForm, setEditForm] = useState({ amount: '', merchant: '', category: '' });
  const [yearlyExpenses, setYearlyExpenses] = useState<any[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const fetchYearlyExpenses = async () => {
      if (!user || !currentHousehold) return;
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .eq('household_id', currentHousehold.id)
        .eq('year', selectedDate.getFullYear())
        .order('date', { ascending: true });
      if (!error && data) setYearlyExpenses(data);
    };
    fetchYearlyExpenses();
  }, [user, currentHousehold, selectedDate.getFullYear(), expenses]);

  const totalSpent = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const yearlyTotal = yearlyExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

  const categoryData = React.useMemo(() => {
    const breakdown = expenses.reduce((acc, expense) => {
      const cat = expense.category || 'Other';
      if (!acc[cat]) acc[cat] = 0;
      acc[cat] += Number(expense.amount);
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(breakdown).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const chartData = React.useMemo(() => {
    const monthlyTotals: Record<number, number> = {};
    yearlyExpenses.forEach((expense) => {
      const month = new Date(expense.date).getMonth();
      monthlyTotals[month] = (monthlyTotals[month] || 0) + Number(expense.amount);
    });
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames.map((name, index) => ({ month: name, amount: monthlyTotals[index] || 0 }));
  }, [yearlyExpenses]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
      setTranscription('');
      setParsedExpense(null);
    } catch {
      toast({ title: 'Error', description: 'Could not access microphone', variant: 'destructive' });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setAiStatus('Transcribing audio...');
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        setAiStatus('Analyzing expense details...');
        const { data, error } = await supabase.functions.invoke('voice-expense', { body: { audio: base64Audio } });
        if (error) throw error;
        setTranscription(data.transcription);
        setParsedExpense(data.expense);
        setAiStatus('Expense parsed! Review and save below.');
      };
    } catch {
      setAiStatus('');
      toast({ title: 'Error', description: 'Failed to process voice recording', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const saveExpense = async () => {
    if (!parsedExpense) return;
    try {
      const result = await addExpense({
        date: format(selectedDate, 'yyyy-MM-dd'),
        amount: parsedExpense.amount,
        merchant: parsedExpense.merchant === 'Unknown' ? null : parsedExpense.merchant,
        category: parsedExpense.category,
        notes: transcription,
        year: selectedDate.getFullYear(),
      });
      if (result) {
        setTranscription('');
        setParsedExpense(null);
        setAiStatus('');
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to save expense', variant: 'destructive' });
    }
  };

  const handleEditSave = async () => {
    if (!editingExpense) return;
    await updateExpense(editingExpense.id, {
      amount: parseFloat(editForm.amount),
      merchant: editForm.merchant || null,
      category: editForm.category,
    });
    setEditingExpense(null);
  };

  if (!user) return null;

  const selectedDateExpenses = expenses.filter(exp => 
    format(new Date(exp.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
  );

  // Mobile: card-based compact view
  if (isMobile) {
    return (
      <section className="animate-fade-in" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
        <button onClick={() => setExpanded(!expanded)} className="w-full touch-manipulation">
          <div className="bg-card border-[3px] border-stroke rounded-xl p-4 shadow-cartoon">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal/10 flex items-center justify-center">
                  <span className="text-lg">🧾</span>
                </div>
                <div className="text-left">
                  <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">Expenses</h2>
                  <p className="text-lg font-bold text-teal">
                    {currency.symbol}{totalSpent.toFixed(2)} <span className="text-xs font-normal text-muted-foreground">this month</span>
                  </p>
                </div>
              </div>
              {expanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
            </div>
            {!expanded && expenses.length > 0 && (
              <div className="mt-3 text-xs text-muted-foreground">
                {expenses.length} transactions • Yearly: {currency.symbol}{yearlyTotal.toFixed(2)}
              </div>
            )}
          </div>
        </button>

        {expanded && (
          <div className="mt-3 space-y-4 animate-fade-in">
            {/* Date picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between text-left font-normal text-sm">
                  <span className="flex items-center">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedDate, 'PPP')}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={selectedDate} onSelect={(d) => d && setSelectedDate(d)} initialFocus />
              </PopoverContent>
            </Popover>

            {/* Voice input */}
            <Card className="border-2 border-sage/30 shadow-cartoon">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-center">
                  <Button
                    size="lg"
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isProcessing}
                    className={cn(
                      "w-20 h-20 rounded-full transition-all",
                      isRecording ? "bg-destructive hover:bg-destructive/90 animate-pulse" : "bg-gradient-to-br from-primary to-primary-glow"
                    )}
                  >
                    {isRecording ? <MicOff style={{ width: 24, height: 24 }} /> : <Mic style={{ width: 24, height: 24 }} />}
                  </Button>
                </div>
                <p className="text-center text-xs text-muted-foreground">
                  {isRecording ? "Listening..." : isProcessing ? "Processing..." : "Tap to record expense"}
                </p>
                {aiStatus && (
                  <Alert className="bg-primary/5 border-primary/30">
                    <AlertDescription className="text-xs flex items-center gap-2">
                      <div className="animate-pulse w-2 h-2 bg-primary rounded-full" />
                      {aiStatus}
                    </AlertDescription>
                  </Alert>
                )}
                {parsedExpense && (
                  <div className="p-3 border-2 border-success/40 bg-success/5 rounded-lg space-y-1">
                    <p className="text-lg font-bold">{currency.symbol}{parsedExpense.amount.toFixed(2)}</p>
                    <p className="text-xs">{parsedExpense.merchant} • {parsedExpense.category}</p>
                    <Button onClick={saveExpense} className="w-full mt-2" size="sm">Save</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent expenses */}
            {selectedDateExpenses.length > 0 && (
              <div className="space-y-2">
                {selectedDateExpenses.slice(0, 5).map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-3 bg-card border-2 border-border/50 rounded-lg">
                    <div>
                      <p className="text-sm font-semibold">{currency.symbol}{Number(expense.amount).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{expense.merchant || expense.category}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { setEditingExpense(expense); setEditForm({ amount: expense.amount.toString(), merchant: expense.merchant || '', category: expense.category }); }}>
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => deleteExpense(expense.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingExpense} onOpenChange={(open) => !open && setEditingExpense(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Expense</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input type="number" step="0.01" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Merchant</Label>
                <Input value={editForm.merchant} onChange={(e) => setEditForm({ ...editForm, merchant: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={editForm.category} onValueChange={(v) => setEditForm({ ...editForm, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Groceries', 'Dining Out', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Other'].map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingExpense(null)}>Cancel</Button>
              <Button onClick={handleEditSave}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>
    );
  }

  // Desktop: full section
  return (
    <section className="animate-fade-in" style={{ animationDelay: '0.15s', animationFillMode: 'both' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-foreground tracking-wide">EXPENSES</h2>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[240px] justify-start text-left font-normal text-sm">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(selectedDate, 'PPP')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar mode="single" selected={selectedDate} onSelect={(d) => d && setSelectedDate(d)} initialFocus />
          </PopoverContent>
        </Popover>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-primary/10 to-primary-glow/10 border-primary/20">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Year Total</p>
            <p className="text-2xl font-bold text-primary">{currency.symbol}{yearlyTotal.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-teal/10 to-teal-glow/10 border-teal/20">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">This Month</p>
            <p className="text-2xl font-bold text-teal">{currency.symbol}{totalSpent.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-sage/10 to-success/10 border-sage/20">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Monthly Avg</p>
            <p className="text-2xl font-bold text-sage-foreground">{currency.symbol}{(yearlyTotal / (selectedDate.getMonth() + 1)).toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Transactions</p>
            <p className="text-2xl font-bold text-foreground">{yearlyExpenses.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Voice Input */}
        <Card className="border-2 border-sage/30 shadow-cartoon">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Mic className="h-5 w-5" />Record Expense</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={cn(
                  "w-24 h-24 rounded-full transition-all",
                  isRecording ? "bg-destructive hover:bg-destructive/90 animate-pulse" : "bg-gradient-to-br from-primary to-primary-glow [@media(hover:hover)]:hover:scale-110"
                )}
              >
                {isRecording ? <MicOff style={{ width: 28, height: 28 }} /> : <Mic style={{ width: 28, height: 28 }} />}
              </Button>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              {isRecording ? "Listening... (Tap to stop)" : isProcessing ? "Processing..." : "Tap to start recording"}
            </p>
            {aiStatus && (
              <Alert className="bg-primary/5 border-primary/30">
                <AlertDescription className="flex items-center gap-2 text-sm">
                  <div className="animate-pulse w-2 h-2 bg-primary rounded-full" />
                  {aiStatus}
                </AlertDescription>
              </Alert>
            )}
            {transcription && <Alert className="border-2"><AlertDescription><strong>You said:</strong> "{transcription}"</AlertDescription></Alert>}
            {parsedExpense && (
              <Card className="border-2 border-success/40 bg-success/5">
                <CardContent className="pt-4 space-y-2">
                  <p className="text-lg font-bold">{currency.symbol}{parsedExpense.amount.toFixed(2)}</p>
                  <p className="text-sm"><strong>Merchant:</strong> {parsedExpense.merchant || 'Unknown'}</p>
                  <p className="text-sm"><strong>Category:</strong> {parsedExpense.category}</p>
                  <Button onClick={saveExpense} className="w-full mt-4">Save Expense</Button>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Expense Log */}
        <Card className="border-2 border-border/50 shadow-cartoon">
          <CardHeader>
            <CardTitle>Expense Log — {format(selectedDate, 'MMMM d, yyyy')}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : selectedDateExpenses.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No expenses for this date.</p>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {selectedDateExpenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg [@media(hover:hover)]:hover:bg-background/80 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="text-lg font-semibold">{currency.symbol}{Number(expense.amount).toFixed(2)}</p>
                        <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">{expense.category}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {expense.merchant && <span className="font-medium">{expense.merchant} • </span>}
                        {format(new Date(expense.date), 'h:mm a')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setEditingExpense(expense); setEditForm({ amount: expense.amount.toString(), merchant: expense.merchant || '', category: expense.category }); }}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteExpense(expense.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {(categoryData.length > 0 || chartData.some(d => d.amount > 0)) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {categoryData.length > 0 && (
            <Card className="border-2 border-border/50 shadow-cartoon">
              <CardHeader><CardTitle>Spending by Category</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={90} dataKey="value">
                        {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => `${currency.symbol}${v.toFixed(2)}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
          {chartData.some(d => d.amount > 0) && (
            <Card className="border-2 border-border/50 shadow-cartoon">
              <CardHeader><CardTitle>Monthly Spending — {selectedDate.getFullYear()}</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} width={40} tickFormatter={(v) => `${currency.symbol}${v}`} />
                      <Tooltip formatter={(v: number) => [`${currency.symbol}${v.toFixed(2)}`, 'Spent']} />
                      <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))', r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingExpense} onOpenChange={(open) => !open && setEditingExpense(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Expense</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input type="number" step="0.01" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Merchant</Label>
              <Input value={editForm.merchant} onChange={(e) => setEditForm({ ...editForm, merchant: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={editForm.category} onValueChange={(v) => setEditForm({ ...editForm, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['Groceries', 'Dining Out', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Other'].map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingExpense(null)}>Cancel</Button>
            <Button onClick={handleEditSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ExpensesSection;
