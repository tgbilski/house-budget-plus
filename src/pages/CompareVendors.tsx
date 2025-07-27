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
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <span className="text-sm">Did you like the sales rep?</span>
              <div className="flex gap-2">
                <Button
                  variant={localQuote.likedSalesRep === true ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateField('likedSalesRep', true)}
                >
                  Yes
                </Button>
                <Button
                  variant={localQuote.likedSalesRep === false ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => updateField('likedSalesRep', false)}
                >
                  No
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <span className="text-sm">Do they offer financing?</span>
              <div className="flex gap-2">
                <Button
                  variant={localQuote.offersFinancing === true ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateField('offersFinancing', true)}
                >
                  Yes
                </Button>
                <Button
                  variant={localQuote.offersFinancing === false ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => updateField('offersFinancing', false)}
                >
                  No
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <span className="text-sm">Is timing good?</span>
              <div className="flex gap-2">
                <Button
                  variant={localQuote.goodTiming === true ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateField('goodTiming', true)}
                >
                  Yes
                </Button>
                <Button
                  variant={localQuote.goodTiming === false ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => updateField('goodTiming', false)}
                >
                  No
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <span className="text-sm">Are they trustworthy?</span>
              <div className="flex gap-2">
                <Button
                  variant={localQuote.trustworthy === true ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateField('trustworthy', true)}
                >
                  Yes
                </Button>
                <Button
                  variant={localQuote.trustworthy === false ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => updateField('trustworthy', false)}
                >
                  No
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <span className="text-sm">Responsive?</span>
              <div className="flex gap-2">
                <Button
                  variant={localQuote.responsive === true ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateField('responsive', true)}
                >
                  Yes
                </Button>
                <Button
                  variant={localQuote.responsive === false ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => updateField('responsive', false)}
                >
                  No
                </Button>
              </div>
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
  const [isNewProject, setIsNewProject] = useState(false);
  const [isEditingProjectName, setIsEditingProjectName] = useState(false);
  const { user } = useAuth();
  const { currency } = useCurrency();

  // Initialize with new project state if no data exists
  useEffect(() => {
    if (user) {
      loadData();
    } else {
      // When no user, ensure we show the interface
      setIsNewProject(quotes.length === 0);
    }
  }, [user]);

  useEffect(() => {
    // If no quotes and no selected project, show new project state
    if (quotes.length === 0 && !selectedProject && !isNewProject) {
      setIsNewProject(true);
    }
  }, [quotes, selectedProject, isNewProject]);

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

  const createNewProject = () => {
    setIsNewProject(true);
    setSelectedProject('');
    setIsEditingProjectName(true);
  };

  const saveNewProject = (projectName: string) => {
    if (projectName.trim()) {
      setSelectedProject(projectName.trim());
      setIsNewProject(false);
      setIsEditingProjectName(false);
      // Add first vendor card for the new project
      addVendorCard(projectName.trim());
    }
  };

  const addVendorCard = (projectName?: string) => {
    const project = projectName || selectedProject || 'New Project';
    const newQuote: VendorQuote = {
      id: Date.now().toString(),
      projectName: project,
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
  };

  const updateVendorCard = (updatedQuote: VendorQuote) => {
    setQuotes(quotes.map(quote => 
      quote.id === updatedQuote.id ? updatedQuote : quote
    ));
  };

  const removeVendorCard = (quoteId: string) => {
    const filteredQuotes = quotes.filter(quote => quote.id !== quoteId);
    setQuotes(filteredQuotes);
    
    // If no quotes left for current project, select another project or clear
    const currentProjectQuotes = filteredQuotes.filter(quote => quote.projectName === selectedProject);
    if (currentProjectQuotes.length === 0 && filteredQuotes.length > 0) {
      const remainingProject = filteredQuotes[0].projectName;
      setSelectedProject(remainingProject);
      setIsNewProject(false);
    } else if (filteredQuotes.length === 0) {
      setSelectedProject('');
      setIsNewProject(false);
    }
  };

  const updateProjectName = (oldName: string, newName: string) => {
    if (newName.trim() && newName !== oldName) {
      setQuotes(quotes.map(quote => 
        quote.projectName === oldName 
          ? { ...quote, projectName: newName.trim() }
          : quote
      ));
      setSelectedProject(newName.trim());
      setIsEditingProjectName(false);
    }
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
          
          {/* Project Management */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <Button
                onClick={createNewProject}
                variant="outline"
                className="whitespace-nowrap"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
              
              {!isNewProject && uniqueProjects.length > 1 && (
                <Select
                  value={selectedProject}
                  onValueChange={(value) => {
                    setSelectedProject(value);
                    setIsNewProject(false);
                    setIsEditingProjectName(false);
                  }}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueProjects.map((project) => (
                      <SelectItem key={project} value={project}>
                        {project}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            {!isNewProject && displayedQuotes.length > 0 && lowestEstimate && (
              <div className="text-sm text-muted-foreground">
                Lowest estimate: {currency.symbol}{lowestEstimate.toFixed(2)}
              </div>
            )}
          </div>

          {/* Project Creation */}
          {isNewProject && (
            <div className="max-w-6xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Project</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter project name (e.g., Kitchen Remodel)"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const target = e.target as HTMLInputElement;
                          saveNewProject(target.value);
                        }
                      }}
                      autoFocus
                    />
                    <Button
                      onClick={(e) => {
                        const input = e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement;
                        if (input) saveNewProject(input.value);
                      }}
                    >
                      Create
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsNewProject(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Vendor Cards */}
        <div className="max-w-6xl mx-auto">
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
            {!isNewProject && selectedProject && (
              <div className="flex items-center justify-center">
                <Button
                  onClick={() => addVendorCard()}
                  variant="outline"
                  size="lg"
                  className="h-20 w-20 rounded-full border-2 border-dashed border-primary hover:bg-primary/5"
                >
                  <Plus className="h-8 w-8 text-primary" />
                </Button>
              </div>
            )}
          </div>

          {/* Empty States */}
          {!isNewProject && displayedQuotes.length === 0 && selectedProject && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No vendor quotes for "{selectedProject}" yet. Click the + button to add your first vendor!
              </p>
            </div>
          )}
          
          {!selectedProject && !isNewProject && quotes.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Click "New Project" above to create your first project and start comparing vendors!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompareVendors;