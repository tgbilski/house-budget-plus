import React, { useState, useRef, useEffect, useMemo } from 'react';
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

import { usePageReady } from '@/hooks/usePageReady';
import { Mic, MicOff, Calendar as CalendarIcon, Trash2, TrendingUp, Edit2, Plus, Download, Search, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts';
import { AlertCircle } from 'lucide-react';
import { isNativeApp } from '@/utils/capacitor';
import calculatorMascot from '@/assets/calculator-mascot.png';

import InlineSignUpForm from '@/components/InlineSignUpForm';
import { useIsMobile } from '@/hooks/use-mobile';
import { sanitizeText } from '@/utils/sanitize';

const EXPENSE_CATEGORIES = [
  'Groceries', 'Dining Out', 'Transportation', 'Entertainment',
  'Shopping', 'Bills', 'Healthcare', 'Other'
];

// Demo data for guest preview
const DEMO_CHART_DATA = [
  { month: 'Jan', amount: 1200 }, { month: 'Feb', amount: 980 },
  { month: 'Mar', amount: 1450 }, { month: 'Apr', amount: 1100 },
  { month: 'May', amount: 890 }, { month: 'Jun', amount: 1320 },
];

const DEMO_CATEGORY_DATA = [
  { name: 'Groceries', value: 450 }, { name: 'Dining Out', value: 280 },
  { name: 'Transportation', value: 190 }, { name: 'Bills', value: 520 },
  { name: 'Entertainment', value: 150 },
];

export default function Expenses() {
  const { user } = useAuth();
  const { subscribed } = useSubscription();
  const isMobileApp = isNativeApp();
  const isMobile = useIsMobile();
  const { currency } = useCurrency();
  const { currentHousehold } = useHouseholdContext();
  const { toast } = useToast();
  
  const { setPageReady } = usePageReady();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { expenses, loading, addExpense, deleteExpense, updateExpense } = useExpenses(selectedDate);
  
  useEffect(() => {
    if (!loading) {
      requestAnimationFrame(() => setPageReady());
    }
  }, [loading, setPageReady]);
  
  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [parsedExpense, setParsedExpense] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiStatus, setAiStatus] = useState('');
  
  // Manual entry state
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualForm, setManualForm] = useState({ amount: '', merchant: '', category: 'Other', notes: '' });
  
  // Edit dialog state
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [editForm, setEditForm] = useState({ amount: '', merchant: '', category: '' });
  const [yearlyExpenses, setYearlyExpenses] = useState<any[]>([]);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Fetch yearly expenses
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


  // Chart data
  const chartData = useMemo(() => {
    const monthlyTotals: Record<number, number> = {};
    yearlyExpenses.forEach((expense) => {
      const month = new Date(expense.date).getMonth();
      monthlyTotals[month] = (monthlyTotals[month] || 0) + Number(expense.amount);
    });
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames.map((name, index) => ({ month: name, amount: monthlyTotals[index] || 0 }));
  }, [yearlyExpenses]);

  const totalSpent = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const yearlyTotal = yearlyExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

  const categoryData = useMemo(() => {
    const breakdown = expenses.reduce((acc, expense) => {
      const cat = expense.category || 'Other';
      acc[cat] = (acc[cat] || 0) + Number(expense.amount);
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(breakdown).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const COLORS = [
    'hsl(var(--primary))', 'hsl(var(--teal))', 'hsl(var(--success))', 'hsl(var(--sage))',
    'hsl(var(--primary-glow))', 'hsl(var(--teal-glow))', 'hsl(var(--accent))', 'hsl(var(--secondary))',
  ];

  const budgetThreshold = 1000;
  const isOverBudget = totalSpent > budgetThreshold;

  // Filtered expenses for the log
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchesSearch = !searchQuery || 
        (expense.merchant?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (expense.notes?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        expense.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'all' || expense.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [expenses, searchQuery, filterCategory]);

  // CSV export
  const exportToCSV = () => {
    if (expenses.length === 0) {
      toast({ title: 'No data', description: 'No expenses to export for this month', variant: 'destructive' });
      return;
    }
    const headers = ['Date', 'Amount', 'Merchant', 'Category', 'Notes'];
    const rows = expenses.map(e => [
      format(new Date(e.date), 'yyyy-MM-dd'),
      Number(e.amount).toFixed(2),
      `"${(e.merchant || '').replace(/"/g, '""')}"`,
      e.category,
      `"${(e.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expenses-${format(selectedDate, 'yyyy-MM')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Exported!', description: `${expenses.length} expenses exported to CSV` });
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
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
        const { data, error } = await supabase.functions.invoke('voice-expense', {
          body: { audio: base64Audio },
        });
        if (error) throw error;
        setTranscription(data.transcription);
        setParsedExpense(data.expense);
        setAiStatus('Expense parsed successfully!');
        toast({ title: 'Success', description: 'Expense details extracted' });
      };
    } catch (error) {
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
        toast({ title: 'Saved!', description: `${currency.symbol}${parsedExpense.amount} expense added` });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save expense', variant: 'destructive' });
    }
  };

  // Manual entry save
  const saveManualExpense = async () => {
    const amount = parseFloat(manualForm.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: 'Invalid amount', description: 'Please enter a valid amount', variant: 'destructive' });
      return;
    }
    if (manualForm.merchant && manualForm.merchant.length > 100) {
      toast({ title: 'Too long', description: 'Merchant name must be under 100 characters', variant: 'destructive' });
      return;
    }
    if (manualForm.notes && manualForm.notes.length > 500) {
      toast({ title: 'Too long', description: 'Notes must be under 500 characters', variant: 'destructive' });
      return;
    }
    try {
      const result = await addExpense({
        date: format(selectedDate, 'yyyy-MM-dd'),
        amount,
        merchant: manualForm.merchant.trim() || null,
        category: manualForm.category,
        notes: manualForm.notes.trim() || null,
        year: selectedDate.getFullYear(),
      });
      if (result) {
        setManualForm({ amount: '', merchant: '', category: 'Other', notes: '' });
        setShowManualEntry(false);
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add expense', variant: 'destructive' });
    }
  };

  const openEditDialog = (expense: any) => {
    setEditingExpense(expense);
    setEditForm({ amount: expense.amount.toString(), merchant: expense.merchant || '', category: expense.category });
  };

  const handleEditSave = async () => {
    if (!editingExpense) return;
    const amount = parseFloat(editForm.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: 'Invalid amount', description: 'Please enter a valid amount', variant: 'destructive' });
      return;
    }
    await updateExpense(editingExpense.id, {
      amount,
      merchant: editForm.merchant || null,
      category: editForm.category,
    });
    setEditingExpense(null);
  };

  // ─── GUEST VIEW ───
  if (!user) {
    return (
      <div className="min-h-screen">
        <SEO
          title="Voice Expense Tracker - House Budget Calculator"
          description="Track your daily expenses effortlessly with voice input and AI-powered categorization"
          keywords="expense tracker, voice input, budget tracking, AI expense logging"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Hero Section */}
          <div className="text-center mb-6 stagger-1 relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-3xl shadow-[var(--shadow-elegant)] mb-5 animate-bounce-in">
              <Mic className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-foreground via-primary to-teal bg-clip-text text-transparent mb-4">
              Welcome to House Budget Calculator
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-2">
              Track every dollar you spend with voice or manual entry — AI categorizes it, charts reveal your patterns, and smart alerts keep you on budget.
            </p>
          </div>

          {/* Scroll indicator */}
          <div className="flex justify-center mb-8 stagger-2">
            <div className="flex flex-col items-center gap-1 text-muted-foreground/50">
              <span className="text-xs uppercase tracking-widest">See what you're missing</span>
              <svg className="w-5 h-5 animate-scroll-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>

          {/* Section: Interactive Previews */}
          <div className={cn("grid gap-6 mb-8 stagger-3", isMobile ? "grid-cols-1" : "grid-cols-2")}>
            {/* Demo chart with blur overlay */}
            <Card className="relative overflow-hidden border-2 border-border/50 bg-card relative z-10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4" /> Monthly Spending Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={DEMO_CHART_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v}`} width={45} />
                      <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent flex items-end justify-center pb-6">
                <Link to="/auth">
                  <Button size="sm" className="bg-gradient-to-r from-primary to-primary-glow shadow-[var(--shadow-elegant)] hover:scale-105 transition-transform">
                    Sign Up to Track Your Spending
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Demo category pie with blur */}
            <Card className="relative overflow-hidden border-2 border-border/50 bg-card relative z-10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Filter className="h-4 w-4" /> Category Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={DEMO_CATEGORY_DATA} cx="50%" cy="50%" outerRadius={70} dataKey="value"
                        label={({ name }) => name}>
                        {DEMO_CATEGORY_DATA.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent flex items-end justify-center pb-6">
                <Link to="/auth">
                  <Button size="sm" className="bg-gradient-to-r from-primary to-primary-glow shadow-[var(--shadow-elegant)] hover:scale-105 transition-transform">
                    Sign Up to See Your Categories
                  </Button>
                </Link>
              </div>
            </Card>
          </div>

          {/* Decorative divider */}
          <div className="flex items-center gap-4 my-10 stagger-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <span className="text-xs uppercase tracking-widest text-muted-foreground/60 font-medium">Ready to start?</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-teal/30 to-transparent" />
          </div>

          {/* Sales pitch + signup form */}
          <Card className={cn("border-2 border-primary/30 bg-card shadow-[var(--shadow-elegant)] relative z-10 stagger-5", isMobile ? "" : "")}>
            <CardContent className="p-6 md:p-8">
              <div className={cn("gap-8", isMobile ? "space-y-6" : "grid grid-cols-2")}>
                <div className="space-y-5">
                  <h2 className="text-2xl font-bold text-foreground">Track every dollar, effortlessly</h2>
                  <ul className="space-y-3 text-sm">
                    {[
                      ['🎤', 'Voice-to-expense: just speak naturally'],
                      ['🤖', 'AI auto-categorizes your spending'],
                      ['📊', 'Monthly trends & category charts'],
                      ['📥', 'Export your data to CSV anytime'],
                    ].map(([emoji, text]) => (
                      <li key={text} className="flex items-center gap-3 text-muted-foreground">
                        <span className="text-lg">{emoji}</span>
                        <span>{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <InlineSignUpForm />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ─── MOBILE APP: subscription gate ───
  if (isMobileApp && !subscribed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-2 shadow-[var(--shadow-elegant)]">
          <CardContent className="pt-6 text-center space-y-6">
            <div className="w-16 h-16 bg-gradient-to-br from-warning/20 to-warning/10 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-warning" />
            </div>
            <h2 className="text-2xl font-bold">Subscribers Only</h2>
            <p className="text-muted-foreground">This mobile app feature is available for subscribed users only.</p>
            <Button variant="outline" onClick={() => window.location.href = 'https://housebudgetcalculator.com'} className="w-full">
              Visit Website
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── WEB: subscription gate (premium sales page) ───
  if (!subscribed) {
    return (
      <div className="min-h-screen">
        <SEO
          title="Voice Expense Tracker - House Budget Calculator"
          description="Track your daily expenses effortlessly with voice input and AI-powered categorization"
          keywords="expense tracker, voice input, budget tracking, AI expense logging"
        />
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
          {/* Hero with staggered entrance */}
          <div className="text-center mb-8 stagger-1 relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-3xl shadow-[var(--shadow-elegant)] mb-5 animate-bounce-in">
              <Mic className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-teal bg-clip-text text-transparent mb-4">
              Voice Expense Tracker
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-3">
              Just speak your expenses. Our AI handles the rest.
            </p>
            <Link to="/settings">
              <Button size="lg" className="bg-gradient-to-r from-primary to-primary-glow hover:scale-105 transition-transform shadow-[var(--shadow-elegant)]">
                Upgrade to Premium
              </Button>
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="flex justify-center mb-8 stagger-2">
            <div className="flex flex-col items-center gap-1 text-muted-foreground/50">
              <span className="text-xs uppercase tracking-widest">Discover premium features</span>
              <svg className="w-5 h-5 animate-scroll-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 stagger-3">
            <Card className="bg-card border-2 border-border/50 shadow-cartoon relative z-10 hover-cartoon">
              <CardHeader><CardTitle className="flex items-center gap-2"><Mic className="h-5 w-5" /> Effortless Voice Input</CardTitle></CardHeader>
              <CardContent>
                <div className="flex justify-center mb-4">
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary/20 to-primary-glow/20 flex items-center justify-center animate-pulse-subtle">
                    <Mic className="h-14 w-14 text-primary" />
                  </div>
                </div>
                <p className="text-muted-foreground text-center">"Spent $45.99 at Whole Foods for groceries"</p>
                <div className="mt-4 p-4 bg-success/10 border border-success/30 rounded-lg">
                  <p className="text-sm font-medium">✓ AI Parsed:</p>
                  <p className="text-xs text-muted-foreground">Amount: $45.99 | Merchant: Whole Foods | Category: Groceries</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-2 border-border/50 shadow-cartoon relative z-10 hover-cartoon">
              <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Visual Analytics</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={DEMO_CHART_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v}`} width={45} />
                      <Bar dataKey="amount" fill="hsl(var(--teal))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Decorative divider */}
          <div className="flex items-center gap-4 my-10 stagger-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-teal/30 to-transparent" />
            <span className="text-xs uppercase tracking-widest text-muted-foreground/60 font-medium">Everything included</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          </div>

          {/* Benefits card */}
          <Card className="bg-card border-2 border-primary/20 shadow-cartoon relative z-10 stagger-5">
            <CardHeader><CardTitle>What You'll Get</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  ['🎤', 'Voice-to-Expense Magic', 'Speak naturally, we\'ll extract amount, merchant, and category'],
                  ['⌨️', 'Manual Entry Too', 'Prefer typing? Quick form to add expenses manually'],
                  ['🤖', 'Smart Categorization', 'AI automatically categorizes your spending'],
                  ['🔍', 'Search & Filter', 'Find any expense by merchant, category, or notes'],
                  ['📊', 'Visual Analytics', 'Charts and graphs show spending patterns'],
                  ['📥', 'CSV Export', 'Download your expense data anytime'],
                ].map(([emoji, title, desc]) => (
                  <div key={title} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-teal/10 flex items-center justify-center flex-shrink-0 text-lg">
                      {emoji}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{title}</h3>
                      <p className="text-sm text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 text-center">
                <Link to="/settings">
                  <Button size="lg" className="bg-gradient-to-r from-primary to-primary-glow hover:scale-105 transition-transform shadow-[var(--shadow-elegant)]">
                    Get Started
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ─── SUBSCRIBED USER: Full expense tracker ───
  return (
    <div className={cn(isMobileApp ? "" : "min-h-screen")}>
      <SEO
        title="Voice Expense Tracker - House Budget Calculator"
        description="Track your daily expenses effortlessly with voice input and AI-powered categorization"
        keywords="expense tracker, voice input, budget tracking, AI expense logging"
      />

      <div className="w-full px-4 sm:px-6 lg:px-8 pt-2">
        {/* Header */}
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <img src={calculatorMascot} alt="Budget Calculator Mascot" className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 flex-shrink-0 object-contain" />
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground tracking-wide truncate">DAILY EXPENSES</h1>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* CSV Export */}
              <Button variant="outline" size="sm" onClick={exportToCSV} className="hidden sm:flex items-center gap-1">
                <Download className="h-4 w-4" />
                <span>CSV</span>
              </Button>
              {/* Desktop Date Picker */}
              <div className="hidden sm:block">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-[180px] md:w-[240px] justify-start text-left font-normal text-sm")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(selectedDate, 'PPP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar mode="single" selected={selectedDate} onSelect={(date) => date && setSelectedDate(date)} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          {/* Mobile Date Picker + Export */}
          <div className="sm:hidden flex gap-2 w-full">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex-1 justify-between text-left font-normal text-sm">
                  <span className="flex items-center">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedDate, 'PPP')}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={selectedDate} onSelect={(date) => date && setSelectedDate(date)} initialFocus />
              </PopoverContent>
            </Popover>
            <Button variant="outline" size="icon" onClick={exportToCSV} className="flex-shrink-0">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-fade-in">
          <Card className="bg-gradient-to-br from-primary/10 to-primary-glow/10 border-primary/20">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Year Total</p>
              <p className="text-2xl md:text-3xl font-bold text-primary">{currency.symbol}{yearlyTotal.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">{selectedDate.getFullYear()}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-teal/10 to-teal-glow/10 border-teal/20">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">This Month</p>
              <p className="text-2xl md:text-3xl font-bold text-teal">{currency.symbol}{totalSpent.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">{format(selectedDate, 'MMMM')}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-sage/10 to-success/10 border-sage/20">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Monthly Avg</p>
              <p className="text-2xl md:text-3xl font-bold text-sage">{currency.symbol}{(yearlyTotal / (selectedDate.getMonth() + 1)).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">per month</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-secondary/30 to-muted/30 border-border/50">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Transactions</p>
              <p className="text-2xl md:text-3xl font-bold text-foreground">{yearlyExpenses.length}</p>
              <p className="text-xs text-muted-foreground">this year</p>
            </CardContent>
          </Card>
        </div>

        {/* Budget Alert */}
        {isOverBudget && (
          <Alert variant="destructive" className="mb-6 animate-fade-in">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You've exceeded your monthly budget of {currency.symbol}{budgetThreshold.toFixed(2)}. Current: {currency.symbol}{totalSpent.toFixed(2)}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Voice Input Card */}
          <Card className="bg-card border-2 border-sage/30 shadow-cartoon">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                What did you spend today?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  {isRecording ? <MicOff style={{ width: 32, height: 32 }} /> : <Mic style={{ width: 32, height: 32 }} />}
                </Button>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                {isRecording ? "Listening... (Tap to stop)" : isProcessing ? "Processing..." : "Tap to start recording"}
              </p>
              {aiStatus && (
                <Alert className="bg-primary/5 border-primary/30">
                  <AlertDescription className="flex items-center gap-2">
                    <div className="animate-pulse w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">{aiStatus}</span>
                  </AlertDescription>
                </Alert>
              )}
              {transcription && (
                <Alert className="border-2">
                  <AlertDescription><strong>You said:</strong> "{sanitizeText(transcription)}"</AlertDescription>
                </Alert>
              )}
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

              {/* Manual entry toggle */}
              <div className="border-t border-border pt-4">
                <Button variant="outline" size="sm" onClick={() => setShowManualEntry(!showManualEntry)} className="w-full flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  {showManualEntry ? 'Hide Manual Entry' : 'Add Manually Instead'}
                </Button>
              </div>

              {/* Manual entry form */}
              {showManualEntry && (
                <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border/50 animate-fade-in">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="manual-amount" className="text-xs">Amount *</Label>
                      <Input
                        id="manual-amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        max="999999.99"
                        placeholder="0.00"
                        value={manualForm.amount}
                        onChange={(e) => setManualForm({ ...manualForm, amount: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="manual-category" className="text-xs">Category</Label>
                      <Select value={manualForm.category} onValueChange={(v) => setManualForm({ ...manualForm, category: v })}>
                        <SelectTrigger id="manual-category"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {EXPENSE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="manual-merchant" className="text-xs">Merchant (optional)</Label>
                    <Input
                      id="manual-merchant"
                      placeholder="e.g. Whole Foods"
                      maxLength={100}
                      value={manualForm.merchant}
                      onChange={(e) => setManualForm({ ...manualForm, merchant: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="manual-notes" className="text-xs">Notes (optional)</Label>
                    <Input
                      id="manual-notes"
                      placeholder="Quick note..."
                      maxLength={500}
                      value={manualForm.notes}
                      onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
                    />
                  </div>
                  <Button onClick={saveManualExpense} className="w-full" size="sm">
                    <Plus className="h-4 w-4 mr-1" /> Add Expense
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Summary */}
          <Card className="bg-card border-2 border-border/50 shadow-cartoon">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" /> This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary mb-2">{currency.symbol}{totalSpent.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground mb-4">{expenses.length} expenses logged</p>
            </CardContent>
          </Card>
        </div>

        {/* Expense Log with Search & Filter */}
        <Card className="mt-6 bg-card border-2 border-border/50 shadow-cartoon">
          <CardHeader>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <CardTitle className="text-base">Expense Log - {format(selectedDate, 'MMMM d, yyyy')}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                <span className="text-xs">{showFilters ? 'Hide' : 'Filter'}</span>
              </Button>
            </div>
            {showFilters && (
              <div className="flex flex-col sm:flex-row gap-2 mt-3 animate-fade-in">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search merchant, notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-9 text-sm"
                    maxLength={100}
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-2.5">
                      <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </button>
                  )}
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-full sm:w-[150px] h-9 text-sm">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {EXPENSE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading expenses...</p>
            ) : filteredExpenses.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {searchQuery || filterCategory !== 'all'
                  ? 'No expenses match your filters.'
                  : `No expenses logged for ${format(selectedDate, 'MMMM d, yyyy')}. Start recording!`}
              </p>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredExpenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-4 bg-background/50 rounded-lg hover:bg-background/80 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="text-lg font-semibold">{currency.symbol}{Number(expense.amount).toFixed(2)}</p>
                        <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">{expense.category}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {expense.merchant && <span className="font-medium">{expense.merchant} • </span>}
                        {format(new Date(expense.date), 'h:mm a')}
                      </p>
                      {expense.notes && <p className="text-xs text-muted-foreground mt-1 italic">"{expense.notes}"</p>}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(expense)}><Edit2 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteExpense(expense.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Expense Dialog */}
        <Dialog open={!!editingExpense} onOpenChange={(open) => !open && setEditingExpense(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Expense</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-amount">Amount</Label>
                <Input id="edit-amount" type="number" step="0.01" min="0.01" max="999999.99" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-merchant">Merchant (Optional)</Label>
                <Input id="edit-merchant" value={editForm.merchant} maxLength={100} onChange={(e) => setEditForm({ ...editForm, merchant: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select value={editForm.category} onValueChange={(v) => setEditForm({ ...editForm, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingExpense(null)}>Cancel</Button>
              <Button onClick={handleEditSave}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Category Breakdown Pie */}
        {categoryData.length > 0 && (
          <Card className="mt-6 bg-card border-2 border-border/50 shadow-cartoon">
            <CardHeader><CardTitle>Spending by Category - {format(selectedDate, 'MMMM yyyy')}</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100} dataKey="value">
                      {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${currency.symbol}${value.toFixed(2)}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Monthly Spending Chart */}
        {chartData.length > 0 && (
          <Card className="mt-6 bg-card border-2 border-border/50 shadow-cartoon">
            <CardHeader><CardTitle>Monthly Spending - {selectedDate.getFullYear()}</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[250px] md:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} tickMargin={5} axisLine={{ stroke: 'hsl(var(--border))' }} />
                    <YAxis tick={{ fontSize: 10 }} tickMargin={5} width={40} axisLine={{ stroke: 'hsl(var(--border))' }} tickFormatter={(v) => `${currency.symbol}${v}`} />
                    <Tooltip formatter={(value: number) => [`${currency.symbol}${value.toFixed(2)}`, 'Spent']} contentStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))', r: 3 }} activeDot={{ r: 5 }} />
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
