import React, { useState, useEffect } from 'react';
import { Target, Trophy, Plus, Calendar, DollarSign, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useHouseholdContext } from '@/providers/HouseholdProvider';
import { useCurrency } from '@/hooks/useCurrency';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Challenge {
  id: string;
  challenge_type: string;
  title: string;
  description?: string;
  target_amount?: number;
  target_days?: number;
  start_date: string;
  end_date?: string;
  current_progress: number;
  status: 'active' | 'completed' | 'failed' | 'paused';
  reward_badge?: string;
}

const challengeTypes = [
  {
    type: 'no_takeout',
    title: 'No Takeout Challenge',
    description: 'Avoid takeout and delivery for X days',
    icon: Target,
    defaultDays: 30
  },
  {
    type: 'save_target',
    title: 'Savings Goal',
    description: 'Save a specific amount by reducing expenses',
    icon: DollarSign,
    defaultDays: 60
  },
  {
    type: 'budget_streak',
    title: 'Budget Tracking Streak',
    description: 'Track your budget daily for X days',
    icon: TrendingUp,
    defaultDays: 21
  },
  {
    type: 'spend_limit',
    title: 'Monthly Spending Limit',
    description: 'Stay under budget in a specific category',
    icon: CheckCircle,
    defaultDays: 30
  }
];

export const ChallengesCard: React.FC = () => {
  const { user } = useAuth();
  const { currentHousehold } = useHouseholdContext();
  const { currency } = useCurrency();
  
  const formatCurrency = (amount: number) => {
    return `${currency.symbol}${amount.toFixed(2)}`;
  };
  const { toast } = useToast();
  
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    challenge_type: '',
    title: '',
    description: '',
    target_amount: '',
    target_days: ''
  });

  useEffect(() => {
    if (user && currentHousehold) {
      fetchChallenges();
    }
  }, [user, currentHousehold]);

  const fetchChallenges = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('user_id', user.id)
        .eq('household_id', currentHousehold?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChallenges(data || []);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    }
  };

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const selectedType = challengeTypes.find(t => t.type === formData.challenge_type);
      const endDate = formData.target_days ? 
        new Date(Date.now() + parseInt(formData.target_days) * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : 
        null;

      const challengeData = {
        user_id: user.id,
        household_id: currentHousehold?.id,
        challenge_type: formData.challenge_type,
        title: formData.title || selectedType?.title || 'Custom Challenge',
        description: formData.description || selectedType?.description || '',
        target_amount: formData.target_amount ? parseFloat(formData.target_amount) : null,
        target_days: formData.target_days ? parseInt(formData.target_days) : null,
        end_date: endDate,
        current_progress: 0,
        status: 'active' as const
      };

      const { error } = await supabase
        .from('challenges')
        .insert([challengeData]);

      if (error) throw error;

      toast({
        title: "Challenge created!",
        description: "You've started a new financial challenge. Good luck!",
      });

      setFormData({
        challenge_type: '',
        title: '',
        description: '',
        target_amount: '',
        target_days: ''
      });
      
      setIsDialogOpen(false);
      fetchChallenges();

    } catch (error) {
      console.error('Error creating challenge:', error);
      toast({
        title: "Error creating challenge",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateChallengeStatus = async (challengeId: string, status: Challenge['status']) => {
    try {
      const { error } = await supabase
        .from('challenges')
        .update({ status })
        .eq('id', challengeId);

      if (error) throw error;

      toast({
        title: status === 'completed' ? "Challenge completed!" : "Challenge updated",
        description: status === 'completed' ? "Congratulations on reaching your goal!" : `Challenge marked as ${status}`,
      });

      fetchChallenges();
    } catch (error) {
      console.error('Error updating challenge:', error);
      toast({
        title: "Error updating challenge",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const getProgressPercentage = (challenge: Challenge) => {
    if (challenge.challenge_type === 'no_takeout' || challenge.challenge_type === 'budget_streak') {
      const startDate = new Date(challenge.start_date);
      const today = new Date();
      const daysPassed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return challenge.target_days ? Math.min((daysPassed / challenge.target_days) * 100, 100) : 0;
    }
    
    if (challenge.target_amount) {
      return Math.min((challenge.current_progress / challenge.target_amount) * 100, 100);
    }
    
    return 0;
  };

  const getDaysRemaining = (challenge: Challenge) => {
    if (!challenge.end_date) return null;
    const endDate = new Date(challenge.end_date);
    const today = new Date();
    const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(daysRemaining, 0);
  };

  const getStatusColor = (status: Challenge['status']) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const onChallengeTypeChange = (type: string) => {
    const selectedType = challengeTypes.find(t => t.type === type);
    setFormData(prev => ({
      ...prev,
      challenge_type: type,
      title: selectedType?.title || '',
      description: selectedType?.description || '',
      target_days: selectedType?.defaultDays?.toString() || ''
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Your Challenges
        </h3>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <div className="flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                <span>New Challenge</span>
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Challenge</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateChallenge} className="space-y-4">
              <div>
                <Label htmlFor="challenge_type">Challenge Type</Label>
                <Select value={formData.challenge_type} onValueChange={onChallengeTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select challenge type" />
                  </SelectTrigger>
                  <SelectContent>
                    {challengeTypes.map(type => (
                      <SelectItem key={type.type} value={type.type}>
                        {type.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Challenge title"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your challenge"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {(formData.challenge_type === 'save_target' || formData.challenge_type === 'spend_limit') && (
                  <div>
                    <Label htmlFor="target_amount">Target Amount</Label>
                    <Input
                      id="target_amount"
                      type="number"
                      step="0.01"
                      value={formData.target_amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, target_amount: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                )}
                
                <div className={formData.challenge_type === 'save_target' || formData.challenge_type === 'spend_limit' ? '' : 'col-span-2'}>
                  <Label htmlFor="target_days">Duration (Days)</Label>
                  <Input
                    id="target_days"
                    type="number"
                    value={formData.target_days}
                    onChange={(e) => setFormData(prev => ({ ...prev, target_days: e.target.value }))}
                    placeholder="30"
                  />
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Creating...' : 'Create Challenge'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {challenges.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No challenges yet. Create your first challenge to start building better financial habits!</p>
            </CardContent>
          </Card>
        ) : (
          challenges.map((challenge) => {
            const progressPercentage = getProgressPercentage(challenge);
            const daysRemaining = getDaysRemaining(challenge);
            const ChallengeIcon = challengeTypes.find(t => t.type === challenge.challenge_type)?.icon || Target;

            return (
              <Card key={challenge.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <ChallengeIcon className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle className="text-base">{challenge.title}</CardTitle>
                        {challenge.description && (
                          <p className="text-sm text-muted-foreground mt-1">{challenge.description}</p>
                        )}
                      </div>
                    </div>
                    <Badge className={getStatusColor(challenge.status)}>
                      {challenge.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{Math.round(progressPercentage)}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    {challenge.target_amount && (
                      <div>
                        <span className="text-muted-foreground">Target: </span>
                        <span className="font-medium">{formatCurrency(challenge.target_amount)}</span>
                      </div>
                    )}
                    {daysRemaining !== null && (
                      <div>
                        <span className="text-muted-foreground">Days left: </span>
                        <span className="font-medium">{daysRemaining}</span>
                      </div>
                    )}
                  </div>

                  {challenge.status === 'active' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateChallengeStatus(challenge.id, 'completed')}
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Complete
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateChallengeStatus(challenge.id, 'failed')}
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        End
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};