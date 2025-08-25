import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Plus, Target, DollarSign, Calendar, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';

interface SavingsGoal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  description: string | null;
  image_url: string | null;
}

interface SavingsEntry {
  id: string;
  amount: number;
  entry_month: string;
  notes: string | null;
}

const SavingsGoals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
  const [entries, setEntries] = useState<SavingsEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [entryDialogOpen, setEntryDialogOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [newGoal, setNewGoal] = useState({
    title: '',
    target_amount: '',
    target_date: '',
    description: ''
  });

  const [newEntry, setNewEntry] = useState({
    amount: '',
    entry_month: new Date().toISOString().slice(0, 7), // YYYY-MM format
    notes: ''
  });

  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  const fetchGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast.error('Failed to load savings goals');
    } finally {
      setLoading(false);
    }
  };

  const fetchEntries = async (goalId: string) => {
    try {
      const { data, error } = await supabase
        .from('savings_entries')
        .select('*')
        .eq('goal_id', goalId)
        .order('entry_month', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching entries:', error);
      toast.error('Failed to load savings entries');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('goal-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('goal-images')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      return null;
    }
  };

  const createGoal = async () => {
    try {
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const { data, error } = await supabase
        .from('savings_goals')
        .insert([{
          user_id: user?.id,
          title: newGoal.title,
          target_amount: parseFloat(newGoal.target_amount),
          target_date: newGoal.target_date || null,
          description: newGoal.description || null,
          image_url: imageUrl
        }])
        .select()
        .single();

      if (error) throw error;

      setGoals([data, ...goals]);
      setDialogOpen(false);
      setNewGoal({ title: '', target_amount: '', target_date: '', description: '' });
      setImageFile(null);
      setImagePreview(null);
      toast.success('Savings goal created successfully!');
    } catch (error) {
      console.error('Error creating goal:', error);
      toast.error('Failed to create savings goal');
    }
  };

  const addEntry = async () => {
    if (!selectedGoal) return;

    try {
      const { data, error } = await supabase
        .from('savings_entries')
        .insert([{
          goal_id: selectedGoal.id,
          amount: parseFloat(newEntry.amount),
          entry_month: newEntry.entry_month + '-01', // Convert YYYY-MM to YYYY-MM-DD
          notes: newEntry.notes || null
        }])
        .select()
        .single();

      if (error) throw error;

      // Update the goal's current amount
      const newCurrentAmount = selectedGoal.current_amount + parseFloat(newEntry.amount);
      
      const { error: updateError } = await supabase
        .from('savings_goals')
        .update({ current_amount: newCurrentAmount })
        .eq('id', selectedGoal.id);

      if (updateError) throw updateError;

      // Update local state
      setGoals(goals.map(goal => 
        goal.id === selectedGoal.id 
          ? { ...goal, current_amount: newCurrentAmount }
          : goal
      ));
      setSelectedGoal({ ...selectedGoal, current_amount: newCurrentAmount });
      setEntries([data, ...entries]);
      
      setEntryDialogOpen(false);
      setNewEntry({ amount: '', entry_month: new Date().toISOString().slice(0, 7), notes: '' });
      toast.success('Savings entry added successfully!');
    } catch (error) {
      console.error('Error adding entry:', error);
      toast.error('Failed to add savings entry');
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Please sign in to track your savings goals.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80">
      <SEO 
        title="Savings Goals - Track Your Financial Dreams"
        description="Set and track your monthly savings goals with visual progress tracking and image uploads to stay motivated."
        keywords="savings goals, financial planning, money saving, monthly savings tracker"
      />
      
      {/* Hero Section with Dark Gradient */}
      <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-16">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEiIGhlaWdodD0iMjAiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPgo8L3N2Zz4K')] opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <Target className="h-16 w-16 mx-auto mb-6 text-primary" />
            <h1 className="text-4xl font-bold mb-4">Savings Goals</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Set financial targets, track monthly progress, and visualize your dreams with photo uploads
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold">Your Savings Goals</h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Savings Goal</DialogTitle>
                <DialogDescription>
                  Set a target amount and track your monthly progress
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Goal Title</Label>
                  <Input
                    id="title"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    placeholder="e.g., New Car, Vacation, Emergency Fund"
                  />
                </div>
                <div>
                  <Label htmlFor="target_amount">Target Amount ($)</Label>
                  <Input
                    id="target_amount"
                    type="number"
                    value={newGoal.target_amount}
                    onChange={(e) => setNewGoal({ ...newGoal, target_amount: e.target.value })}
                    placeholder="10000"
                  />
                </div>
                <div>
                  <Label htmlFor="target_date">Target Date (Optional)</Label>
                  <Input
                    id="target_date"
                    type="date"
                    value={newGoal.target_date}
                    onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                    placeholder="What are you saving for?"
                  />
                </div>
                <div>
                  <Label htmlFor="image">Goal Image (Optional)</Label>
                  <div className="space-y-2">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    {imagePreview && (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded-md"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview(null);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={createGoal} className="flex-1">
                    Create Goal
                  </Button>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : goals.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Savings Goals Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first savings goal to start tracking your financial progress
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Goal
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => {
              const progressPercent = getProgressPercentage(goal.current_amount, goal.target_amount);
              return (
                <Card key={goal.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    {goal.image_url && (
                      <img
                        src={goal.image_url}
                        alt={goal.title}
                        className="w-full h-32 object-cover rounded-md mb-4"
                      />
                    )}
                    <h3 className="text-lg font-semibold mb-2">{goal.title}</h3>
                    {goal.description && (
                      <p className="text-sm text-muted-foreground mb-4">{goal.description}</p>
                    )}
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{progressPercent.toFixed(1)}%</span>
                      </div>
                      <Progress value={progressPercent} className="h-2" />
                      <div className="flex justify-between text-sm">
                        <span>${goal.current_amount.toLocaleString()}</span>
                        <span>${goal.target_amount.toLocaleString()}</span>
                      </div>
                    </div>

                    {goal.target_date && (
                      <div className="flex items-center text-sm text-muted-foreground mb-4">
                        <Calendar className="h-4 w-4 mr-1" />
                        Target: {new Date(goal.target_date).toLocaleDateString()}
                      </div>
                    )}

                    <Button
                      onClick={() => {
                        setSelectedGoal(goal);
                        setEntryDialogOpen(true);
                        fetchEntries(goal.id);
                      }}
                      className="w-full"
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Add Savings
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Add Entry Dialog */}
        <Dialog open={entryDialogOpen} onOpenChange={setEntryDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Savings Entry</DialogTitle>
              <DialogDescription>
                Record your monthly savings for: {selectedGoal?.title}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount Saved ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={newEntry.amount}
                  onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })}
                  placeholder="500"
                />
              </div>
              <div>
                <Label htmlFor="entry_month">Month</Label>
                <Input
                  id="entry_month"
                  type="month"
                  value={newEntry.entry_month}
                  onChange={(e) => setNewEntry({ ...newEntry, entry_month: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={newEntry.notes}
                  onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                  placeholder="Any additional notes about this savings..."
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={addEntry} className="flex-1">
                  Add Entry
                </Button>
                <Button variant="outline" onClick={() => setEntryDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SavingsGoals;