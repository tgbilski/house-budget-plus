import React, { useState, useRef, useEffect } from 'react';
import { SEO } from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useExpenses } from '@/hooks/useExpenses';
import { useCurrency } from '@/hooks/useCurrency';
import { useHouseholdContext } from '@/providers/HouseholdProvider';
import { Mic, MicOff, Calendar as CalendarIcon, Trash2, TrendingUp, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { Download, AlertCircle, TrendingDown } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { isNativeApp } from '@/utils/capacitor';

export default function Expenses() {
  const { user } = useAuth();
  const { subscribed } = useSubscription();
  const isMobileApp = isNativeApp();
  const { currency } = useCurrency();
  const { currentHousehold } = useHouseholdContext();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { expenses, loading, addExpense, deleteExpense, updateExpense } = useExpenses(selectedDate);
  
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [parsedExpense, setParsedExpense] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiStatus, setAiStatus] = useState('');
  
  // Edit dialog state
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [editForm, setEditForm] = useState({ amount: '', merchant: '', category: '' });
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Calculate chart data - monthly aggregation
  const chartData = React.useMemo(() => {
    const monthlyTotals: Record<number, number> = {};
    
    // Get all expenses for the entire year
    expenses.forEach((expense) => {
      const expenseDate = new Date(expense.date);
      const month = expenseDate.getMonth(); // 0-11
      if (!monthlyTotals[month]) {
        monthlyTotals[month] = 0;
      }
      monthlyTotals[month] += Number(expense.amount);
    });

    // Create array with all 12 months
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames.map((name, index) => ({
      month: name,
      amount: monthlyTotals[index] || 0,
    }));
  }, [expenses]);

  const totalSpent = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

  // Calculate category breakdown
  const categoryData = React.useMemo(() => {
    const breakdown = expenses.reduce((acc, expense) => {
      const cat = expense.category || 'Other';
      if (!acc[cat]) {
        acc[cat] = 0;
      }
      acc[cat] += Number(expense.amount);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(breakdown).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const COLORS = [
    'hsl(var(--primary))',      // Primary blue
    'hsl(var(--teal))',         // Teal
    'hsl(var(--success))',      // Green
    'hsl(var(--sage))',         // Sage green
    'hsl(var(--primary-glow))', // Light blue
    'hsl(var(--teal-glow))',    // Light teal
    'hsl(var(--accent))',       // Accent
    'hsl(var(--secondary))',    // Secondary
  ];

  // Budget alert threshold (example: warn if over $1000/month)
  const budgetThreshold = 1000;
  const isOverBudget = totalSpent > budgetThreshold;

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Expense Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`Month: ${format(selectedDate, 'MMMM yyyy')}`, 20, 30);
    doc.text(`Total Spent: ${currency.symbol}${totalSpent.toFixed(2)}`, 20, 40);
    
    let yPos = 55;
    doc.text('Expenses:', 20, yPos);
    yPos += 10;
    
    expenses.forEach((expense, idx) => {
      if (yPos > 280) {
        doc.addPage();
        yPos = 20;
      }
      const line = `${format(new Date(expense.date), 'MMM d')} - ${expense.merchant || expense.category} - ${currency.symbol}${Number(expense.amount).toFixed(2)}`;
      doc.text(line, 20, yPos);
      yPos += 7;
    });
    
    doc.save(`expenses-${format(selectedDate, 'yyyy-MM')}.pdf`);
    toast({
      title: 'Success',
      description: 'Expense report downloaded',
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setTranscription('');
      setParsedExpense(null);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: 'Error',
        description: 'Could not access microphone',
        variant: 'destructive',
      });
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
      // Convert audio to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];

        setAiStatus('Analyzing expense details...');
        const { data, error } = await supabase.functions.invoke('voice-expense', {
          body: { audio: base64Audio },
        });

        if (error) throw error;

        setTranscription(data.transcription);
        setParsedExpense(data.expense);
        setAiStatus('Expense parsed successfully! Review and save below.');
        
        toast({
          title: 'Success',
          description: 'Expense details extracted',
        });
      };
    } catch (error) {
      console.error('Error processing audio:', error);
      setAiStatus('');
      toast({
        title: 'Error',
        description: 'Failed to process voice recording',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const saveExpense = async () => {
    if (!parsedExpense) return;

    console.log('Saving expense:', {
      parsedExpense,
      selectedDate,
      user: user?.id,
      household: currentHousehold?.id
    });

    try {
      const expenseData = {
        date: format(selectedDate, 'yyyy-MM-dd'),
        amount: parsedExpense.amount,
        merchant: parsedExpense.merchant === 'Unknown' ? null : parsedExpense.merchant,
        category: parsedExpense.category,
        notes: transcription,
        year: selectedDate.getFullYear(),
      };

      console.log('Expense data to save:', expenseData);

      const result = await addExpense(expenseData);

      console.log('Save result:', result);

      if (result) {
        setTranscription('');
        setParsedExpense(null);
        setAiStatus('');
        
        toast({
          title: 'Saved!',
          description: `${currency.symbol}${parsedExpense.amount} expense added`,
        });
      } else {
        throw new Error('Failed to save expense');
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      toast({
        title: 'Error',
        description: 'Failed to save expense',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (expense: any) => {
    setEditingExpense(expense);
    setEditForm({
      amount: expense.amount.toString(),
      merchant: expense.merchant || '',
      category: expense.category,
    });
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

  // If not logged in, show auth prompt
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-background to-sage/10 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-2 shadow-[var(--shadow-elegant)]">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-full flex items-center justify-center mx-auto">
              <Mic className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Welcome to Voice Expense Tracker</h2>
            <p className="text-muted-foreground">
              Please sign in to start tracking your expenses with voice input.
            </p>
            <Link to="/auth">
              <Button size="lg" className="w-full">
                Sign In / Sign Up
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mobile app subscription check
  if (isMobileApp && !subscribed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-background to-sage/10 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-2 shadow-[var(--shadow-elegant)]">
          <CardContent className="pt-6 text-center space-y-6">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold">Subscribers Only</h2>
            <p className="text-muted-foreground">
              This mobile app feature is available for subscribed users only.
            </p>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                For more information, please visit our website at:
              </p>
              <a 
                href="https://housebudgetcalculator.com" 
                className="text-primary font-semibold hover:underline mt-2 block"
                target="_blank"
                rel="noopener noreferrer"
              >
                housebudgetcalculator.com
              </a>
            </div>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = 'https://housebudgetcalculator.com'}
              className="w-full"
            >
              Visit Website
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Web app subscription check
  if (!subscribed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-background to-sage/10">
        <SEO
          title="Voice Expense Tracker - House Budget Calculator"
          description="Track your daily expenses effortlessly with voice input and AI-powered categorization"
          keywords="expense tracker, voice input, budget tracking, AI expense logging"
        />
        
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
          {/* Hero Section */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-3xl shadow-lg mb-6">
              <Mic className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent mb-4">
              Voice Expense Tracker
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Just speak your expenses. Our AI handles the rest - categorizing, organizing, and visualizing your spending automatically.
            </p>
            <Link to="/settings">
              <Button size="lg" className="bg-gradient-to-r from-primary to-primary-glow hover:scale-105 transition-transform">
                Upgrade to Premium - Start Tracking
              </Button>
            </Link>
          </div>

          {/* Feature Preview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Voice Input Preview */}
            <Card className="bg-white/80 backdrop-blur-sm border-2 border-border/50 shadow-[var(--shadow-elegant)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-5 w-5" />
                  Effortless Voice Input
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center mb-4">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary-glow/20 flex items-center justify-center">
                    <Mic className="h-16 w-16 text-primary" />
                  </div>
                </div>
                <p className="text-muted-foreground text-center">
                  "Spent $45.99 at Whole Foods for groceries"
                </p>
                <div className="mt-4 p-4 bg-success/10 border border-success/30 rounded-lg">
                  <p className="text-sm font-medium">✓ AI Parsed:</p>
                  <p className="text-xs text-muted-foreground">Amount: $45.99 | Merchant: Whole Foods | Category: Groceries</p>
                </div>
              </CardContent>
            </Card>

            {/* Chart Preview */}
            <Card className="bg-white/80 backdrop-blur-sm border-2 border-border/50 shadow-[var(--shadow-elegant)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Visual Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center bg-muted/20 rounded-lg">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Daily spending trends</p>
                    <p className="text-xs text-muted-foreground">Category breakdowns</p>
                    <p className="text-xs text-muted-foreground">Budget alerts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Benefits List */}
          <Card className="bg-white/80 backdrop-blur-sm border-2 border-primary/20 shadow-[var(--shadow-elegant)]">
            <CardHeader>
              <CardTitle>What You'll Get</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-success font-bold">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Voice-to-Expense Magic</h3>
                    <p className="text-sm text-muted-foreground">Speak naturally, we'll extract amount, merchant, and category</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-success font-bold">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Smart Categorization</h3>
                    <p className="text-sm text-muted-foreground">AI automatically categorizes your spending</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-success font-bold">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Visual Analytics</h3>
                    <p className="text-sm text-muted-foreground">Charts and graphs show spending patterns</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-success font-bold">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Budget Alerts</h3>
                    <p className="text-sm text-muted-foreground">Get notified when you're approaching limits</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-success font-bold">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Export Reports</h3>
                    <p className="text-sm text-muted-foreground">Download PDF reports for your records</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-success font-bold">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Household Tracking</h3>
                    <p className="text-sm text-muted-foreground">Track expenses across your entire household</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <Link to="/settings">
                  <Button size="lg" className="bg-gradient-to-r from-primary to-primary-glow hover:scale-105 transition-transform">
                    Start Your Free Trial Today
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-gradient-to-br from-white via-background to-sage/10",
      isMobileApp ? "" : "min-h-screen"
    )}>
      <SEO
        title="Voice Expense Tracker - House Budget Calculator"
        description="Track your daily expenses effortlessly with voice input and AI-powered categorization"
        keywords="expense tracker, voice input, budget tracking, AI expense logging"
      />

      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8 p-6 rounded-2xl bg-white/60 backdrop-blur-sm border-2 border-border/50 shadow-[var(--shadow-elegant)] animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-2xl shadow-md">
              <Mic className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Voice Expense Tracker
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Just speak - we'll do the rest
              </p>
            </div>
          </div>

          {/* Date Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-[240px] justify-start text-left font-normal")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, 'PPP')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Budget Alert */}
        {isOverBudget && (
          <Alert variant="destructive" className="mb-6 animate-fade-in">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You've exceeded your monthly budget of {currency.symbol}{budgetThreshold.toFixed(2)}. Current spending: {currency.symbol}{totalSpent.toFixed(2)}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Voice Input Card */}
          <Card className="bg-white/80 backdrop-blur-sm border-2 border-border/50 shadow-[var(--shadow-elegant)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                What did you spend your money on today?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mic Button */}
              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isProcessing}
                  className={cn(
                    "w-32 h-32 rounded-full transition-all duration-300",
                    isRecording
                      ? "bg-destructive hover:bg-destructive/90 animate-pulse"
                      : "bg-gradient-to-br from-primary to-primary-glow hover:scale-110"
                  )}
                >
                  {isRecording ? (
                    <MicOff style={{ width: 32, height: 32 }} />
                  ) : (
                    <Mic style={{ width: 32, height: 32 }} />
                  )}
                </Button>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                {isRecording
                  ? "Listening... (Tap to stop)"
                  : isProcessing
                  ? "Processing..."
                  : "Tap to start recording"}
              </p>

              {/* AI Status */}
              {aiStatus && (
                <Alert className="bg-primary/5 border-primary/30">
                  <AlertDescription className="flex items-center gap-2">
                    <div className="animate-pulse w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">{aiStatus}</span>
                  </AlertDescription>
                </Alert>
              )}

              {/* Transcription */}
              {transcription && (
                <Alert className="border-2">
                  <AlertDescription>
                    <strong>You said:</strong> "{transcription}"
                  </AlertDescription>
                </Alert>
              )}

              {/* Parsed Expense */}
              {parsedExpense && (
                <Card className="border-2 border-success/40 bg-success/5">
                  <CardContent className="pt-4 space-y-2">
                    <p className="text-lg font-bold">
                      {currency.symbol}{parsedExpense.amount.toFixed(2)}
                    </p>
                    <p className="text-sm">
                      <strong>Merchant:</strong> {parsedExpense.merchant || 'Unknown'}
                    </p>
                    <p className="text-sm">
                      <strong>Category:</strong> {parsedExpense.category}
                    </p>
                    <Button onClick={saveExpense} className="w-full mt-4">
                      Save Expense
                    </Button>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Monthly Summary & Export */}
          <Card className="bg-white/80 backdrop-blur-sm border-2 border-border/50 shadow-[var(--shadow-elegant)]">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  This Month
                </span>
                <Button variant="outline" size="sm" onClick={exportToPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary mb-2">
                {currency.symbol}{totalSpent.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {expenses.length} expenses logged
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Expense Log */}
        <Card className="mt-6 bg-white/80 backdrop-blur-sm border-2 border-border/50 shadow-[var(--shadow-elegant)]">
          <CardHeader>
            <CardTitle>Expense Log - {format(selectedDate, 'MMMM d, yyyy')}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading expenses...</p>
            ) : (() => {
              const selectedDateExpenses = expenses.filter(expense => 
                format(new Date(expense.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
              );
              
              return selectedDateExpenses.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No expenses logged for {format(selectedDate, 'MMMM d, yyyy')}. Start recording!
                </p>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {selectedDateExpenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-4 bg-background/50 rounded-lg hover:bg-background/80 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="text-lg font-semibold">{currency.symbol}{Number(expense.amount).toFixed(2)}</p>
                          <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
                            {expense.category}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {expense.merchant && <span className="font-medium">{expense.merchant} • </span>}
                          {format(new Date(expense.date), 'h:mm a')}
                        </p>
                        {expense.notes && (
                          <p className="text-xs text-muted-foreground mt-1 italic">"{expense.notes}"</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(expense)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteExpense(expense.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </CardContent>
        </Card>

        {/* Edit Expense Dialog */}
        <Dialog open={!!editingExpense} onOpenChange={(open) => !open && setEditingExpense(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Expense</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-amount">Amount</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  step="0.01"
                  value={editForm.amount}
                  onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-merchant">Merchant (Optional)</Label>
                <Input
                  id="edit-merchant"
                  value={editForm.merchant}
                  onChange={(e) => setEditForm({ ...editForm, merchant: e.target.value })}
                  placeholder="Enter merchant name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={editForm.category}
                  onValueChange={(value) => setEditForm({ ...editForm, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Groceries">Groceries</SelectItem>
                    <SelectItem value="Dining Out">Dining Out</SelectItem>
                    <SelectItem value="Transportation">Transportation</SelectItem>
                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                    <SelectItem value="Shopping">Shopping</SelectItem>
                    <SelectItem value="Bills">Bills</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingExpense(null)}>
                Cancel
              </Button>
              <Button onClick={handleEditSave}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Category Breakdown Pie Chart */}
        {categoryData.length > 0 && (
          <Card className="mt-6 bg-white/80 backdrop-blur-sm border-2 border-border/50 shadow-[var(--shadow-elegant)]">
            <CardHeader>
              <CardTitle>Spending by Category - {format(selectedDate, 'MMMM yyyy')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="hsl(var(--primary))"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${currency.symbol}${value.toFixed(2)}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Chart */}
        {chartData.length > 0 && (
          <Card className="mt-6 bg-white/80 backdrop-blur-sm border-2 border-border/50 shadow-[var(--shadow-elegant)]">
            <CardHeader>
              <CardTitle>Monthly Spending - {selectedDate.getFullYear()}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      label={{ value: selectedDate.getFullYear().toString(), position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis
                      label={{ value: 'Amount', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip
                      formatter={(value: number) => [`${currency.symbol}${value.toFixed(2)}`, 'Spent']}
                      labelFormatter={(label) => `Day ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}