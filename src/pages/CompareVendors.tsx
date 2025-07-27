import React, { useState, useEffect } from 'react';
import { Plus, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/components/BudgetApp';
import { supabase } from '@/integrations/supabase/client';

interface VendorQuote {
  id: string;
  projectName: string;
  vendorName: string;
  estimateAmount: number;
  contactInfo: string;
  notes: string;
  likedSalesRep: boolean;
  offersFinancing: boolean;
  goodTiming: boolean;
  trustworthy: boolean;
  responsive: boolean;
  dateReceived: string;
}

interface VendorCardProps {
  quote: VendorQuote;
  onUpdate: (updatedQuote: VendorQuote) => void;
  onRemove: () => void;
  showRemove: boolean;
  currency: any;
}

const VendorCard: React.FC<VendorCardProps> = ({ quote, onUpdate, onRemove, showRemove, currency }) => {
  const [localQuote, setLocalQuote] = useState<VendorQuote>(quote);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (JSON.stringify(localQuote) !== JSON.stringify(quote)) {
        onUpdate(localQuote);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [localQuote, quote, onUpdate]);

  const updateField = (field: keyof VendorQuote, value: any) => {
    setLocalQuote(prev => ({ ...prev, [field]: value }));
  };

  const getStarCount = () => {
    const factors = [
      localQuote.likedSalesRep,
      localQuote.offersFinancing,
      localQuote.goodTiming,
      localQuote.trustworthy,
      localQuote.responsive
    ];
    return factors.filter(Boolean).length;
  };

  const starCount = getStarCount();

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border border-border">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Label htmlFor={`vendor-${quote.id}`} className="text-sm font-medium text-muted-foreground">
              Vendor/Company
            </Label>
            <Input
              id={`vendor-${quote.id}`}
              placeholder="Company name..."
              value={localQuote.vendorName}
              onChange={(e) => updateField('vendorName', e.target.value)}
              className="mt-1 font-semibold"
            />
          </div>
          <div className="ml-4 flex items-center gap-2">
            {/* 5-Star Rating Display */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((starIndex) => (
                <Star
                  key={starIndex}
                  className={`h-4 w-4 ${
                    starIndex <= starCount
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            {showRemove && (
              <Button
                variant="destructive"
                size="sm"
                onClick={onRemove}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Estimate Amount */}
        <div>
          <Label className="text-sm font-semibold text-foreground">
            Estimate Amount
          </Label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {currency.symbol}
            </span>
            <Input
              type="number"
              step="0.01"
              value={localQuote.estimateAmount || ''}
              onChange={(e) => updateField('estimateAmount', parseFloat(e.target.value) || 0)}
              className="pl-8 text-lg font-bold text-primary"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <Label className="text-sm font-medium text-muted-foreground">
            Contact Info
          </Label>
          <Input
            value={localQuote.contactInfo}
            onChange={(e) => updateField('contactInfo', e.target.value)}
            placeholder="Phone, email, etc."
            className="mt-1"
          />
        </div>

        {/* Date Received */}
        <div>
          <Label className="text-sm font-medium text-muted-foreground">
            Date Received
          </Label>
          <Input
            type="date"
            value={localQuote.dateReceived}
            onChange={(e) => updateField('dateReceived', e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Vendor Evaluation Questions */}
        <div className="pt-4 border-t">
          <h3 className="text-sm font-semibold text-foreground mb-3">Vendor Evaluation</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Did you like the sales rep?</Label>
              <Switch
                checked={localQuote.likedSalesRep}
                onCheckedChange={(checked) => updateField('likedSalesRep', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm">Do they offer financing?</Label>
              <Switch
                checked={localQuote.offersFinancing}
                onCheckedChange={(checked) => updateField('offersFinancing', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm">Is timing good?</Label>
              <Switch
                checked={localQuote.goodTiming}
                onCheckedChange={(checked) => updateField('goodTiming', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm">Are they trustworthy?</Label>
              <Switch
                checked={localQuote.trustworthy}
                onCheckedChange={(checked) => updateField('trustworthy', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm">Responsive?</Label>
              <Switch
                checked={localQuote.responsive}
                onCheckedChange={(checked) => updateField('responsive', checked)}
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <Label className="text-sm font-medium text-muted-foreground">
            Notes
          </Label>
          <Textarea
            value={localQuote.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            placeholder="Additional notes about the vendor or quote..."
            rows={2}
            className="mt-1"
          />
        </div>
      </CardContent>
    </Card>
  );
};

const CompareVendors: React.FC = () => {
  const [quotes, setQuotes] = useState<VendorQuote[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [isNewProject, setIsNewProject] = useState(true);
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
      if (expenses.quotes) {
        setQuotes(expenses.quotes);
        // Set first project as selected if we have quotes
        if (expenses.quotes.length > 0 && !selectedProject) {
          const firstProject = expenses.quotes[0].projectName;
          setSelectedProject(firstProject);
          setIsNewProject(false);
        }
      }
    }
  };

  const saveData = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('budget_data')
      .upsert({
        user_id: user.id,
        page_type: 'compare_prices',
        calculator_id: 'vendors',
        expenses: { quotes } as any
      });

    if (error) {
      console.error('Error saving data:', error);
    }
  };

  useEffect(() => {
    if (user && quotes.length > 0) {
      saveData();
    }
  }, [quotes, user]);

  const addVendorCard = () => {
    const projectName = isNewProject ? 'New Project' : selectedProject;
    const newQuote: VendorQuote = {
      id: Date.now().toString(),
      projectName,
      vendorName: '',
      estimateAmount: 0,
      contactInfo: '',
      notes: '',
      likedSalesRep: false,
      offersFinancing: false,
      goodTiming: false,
      trustworthy: false,
      responsive: false,
      dateReceived: new Date().toISOString().split('T')[0]
    };
    
    setQuotes([...quotes, newQuote]);
    
    // If creating first quote for new project, switch to that project
    if (isNewProject) {
      setSelectedProject(projectName);
      setIsNewProject(false);
    }
  };

  const updateVendorCard = (updatedQuote: VendorQuote) => {
    setQuotes(quotes.map(quote => 
      quote.id === updatedQuote.id ? updatedQuote : quote
    ));
  };

  const removeVendorCard = (quoteId: string) => {
    const filteredQuotes = quotes.filter(quote => quote.id !== quoteId);
    setQuotes(filteredQuotes);
    
    // If no quotes left for current project, switch to new project mode
    const currentProjectQuotes = filteredQuotes.filter(quote => quote.projectName === selectedProject);
    if (currentProjectQuotes.length === 0 && filteredQuotes.length > 0) {
      const remainingProject = filteredQuotes[0].projectName;
      setSelectedProject(remainingProject);
    } else if (filteredQuotes.length === 0) {
      setIsNewProject(true);
      setSelectedProject('');
    }
  };

  const updateProjectName = (oldName: string, newName: string) => {
    setQuotes(quotes.map(quote => 
      quote.projectName === oldName 
        ? { ...quote, projectName: newName }
        : quote
    ));
    setSelectedProject(newName);
  };

  const uniqueProjects = [...new Set(quotes.map(quote => quote.projectName))];
  
  const displayedQuotes = selectedProject && !isNewProject 
    ? quotes.filter(quote => quote.projectName === selectedProject)
    : [];

  const getLowestEstimate = () => {
    if (displayedQuotes.length === 0) return null;
    return Math.min(...displayedQuotes.map(quote => quote.estimateAmount).filter(amount => amount > 0));
  };

  const lowestEstimate = getLowestEstimate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Compare Vendors</h1>
          <p className="text-muted-foreground mb-6">
            Compare estimates and evaluate vendors for your home projects
          </p>
          
          {/* Project Selector */}
          <div className="max-w-md mx-auto">
            <Label className="text-left block mb-2 font-medium">
              Select Project
            </Label>
            <div className="space-y-3">
              <Select
                value={isNewProject ? 'new-project' : selectedProject}
                onValueChange={(value) => {
                  if (value === 'new-project') {
                    setIsNewProject(true);
                    setSelectedProject('');
                  } else {
                    setIsNewProject(false);
                    setSelectedProject(value);
                  }
                }}
              >
                <SelectTrigger className="text-center text-lg">
                  <SelectValue placeholder="Select a project or create new" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new-project">+ Create New Project</SelectItem>
                  {uniqueProjects.map((project) => (
                    <SelectItem key={project} value={project}>
                      {project}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {isNewProject && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Add your first vendor card to create a new project
                  </p>
                </div>
              )}
              
              {!isNewProject && selectedProject && displayedQuotes.length > 0 && (
                <div className="text-center">
                  <Input
                    value={selectedProject}
                    onChange={(e) => updateProjectName(selectedProject, e.target.value)}
                    className="text-center text-lg font-semibold"
                  />
                  {lowestEstimate && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {displayedQuotes.length} quotes • Lowest: {currency.symbol}{lowestEstimate.toFixed(2)}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Vendor Cards */}
        <div className="flex flex-wrap gap-6 justify-center mb-8">
          {displayedQuotes.map((quote) => (
            <VendorCard
              key={quote.id}
              quote={quote}
              onUpdate={updateVendorCard}
              onRemove={() => removeVendorCard(quote.id)}
              showRemove={displayedQuotes.length > 1}
              currency={currency}
            />
          ))}

          {/* Add New Vendor Card Button */}
          <div className="flex items-center justify-center">
            <Button
              onClick={addVendorCard}
              variant="outline"
              size="lg"
              className="h-20 w-20 rounded-full border-2 border-dashed border-primary hover:bg-primary/5"
            >
              <Plus className="h-8 w-8 text-primary" />
            </Button>
          </div>
        </div>

        {/* Empty State */}
        {displayedQuotes.length === 0 && !isNewProject && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No vendor quotes for "{selectedProject}" yet. Click the + button to add your first vendor!
            </p>
          </div>
        )}
        
        {isNewProject && quotes.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Click the + button above to add your first vendor quote and create a project!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompareVendors;