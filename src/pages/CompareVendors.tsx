import React, { useState, useEffect } from 'react';
import { Plus, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  // Vendor evaluation questions
  likedSalesRep: boolean;
  offersFinancing: boolean;
  goodTiming: boolean;
  trustworthy: boolean;
  responsive: boolean;
  dateReceived: string;
}

const CompareVendors: React.FC = () => {
  const [quotes, setQuotes] = useState<VendorQuote[]>([]);
  const [newQuote, setNewQuote] = useState<Partial<VendorQuote>>({
    projectName: '',
    vendorName: '',
    estimateAmount: 0,
    contactInfo: '',
    notes: '',
    likedSalesRep: false,
    offersFinancing: false,
    goodTiming: false,
    trustworthy: false,
    responsive: false,
    dateReceived: ''
  });
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
    setNewQuote(prev => ({ ...prev, dateReceived: today }));
  }, []);

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
      }
    }
  };

  const saveData = async () => {
    if (!user || quotes.length === 0) return;

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

  const addQuote = () => {
    if (newQuote.projectName && newQuote.vendorName && newQuote.estimateAmount) {
      const quote: VendorQuote = {
        id: Date.now().toString(),
        projectName: newQuote.projectName || '',
        vendorName: newQuote.vendorName || '',
        estimateAmount: newQuote.estimateAmount || 0,
        contactInfo: newQuote.contactInfo || '',
        notes: newQuote.notes || '',
        likedSalesRep: newQuote.likedSalesRep || false,
        offersFinancing: newQuote.offersFinancing || false,
        goodTiming: newQuote.goodTiming || false,
        trustworthy: newQuote.trustworthy || false,
        responsive: newQuote.responsive || false,
        dateReceived: newQuote.dateReceived || ''
      };
      setQuotes([...quotes, quote]);
      setNewQuote({
        projectName: '',
        vendorName: '',
        estimateAmount: 0,
        contactInfo: '',
        notes: '',
        likedSalesRep: false,
        offersFinancing: false,
        goodTiming: false,
        trustworthy: false,
        responsive: false,
        dateReceived: newQuote.dateReceived
      });
    }
  };

  const removeQuote = (id: string) => {
    setQuotes(quotes.filter(quote => quote.id !== id));
  };

  useEffect(() => {
    if (user && quotes.length > 0) {
      saveData();
    }
  }, [quotes, user]);

  const getVendorScore = (quote: VendorQuote) => {
    const factors = [
      quote.likedSalesRep,
      quote.offersFinancing,
      quote.goodTiming,
      quote.trustworthy,
      quote.responsive
    ];
    return factors.filter(Boolean).length;
  };

  const getLowestEstimate = (projectName: string) => {
    const projectQuotes = quotes.filter(quote => 
      quote.projectName.toLowerCase() === projectName.toLowerCase()
    );
    if (projectQuotes.length === 0) return null;
    return Math.min(...projectQuotes.map(quote => quote.estimateAmount));
  };

  const uniqueProjects = [...new Set(quotes.map(quote => quote.projectName.toLowerCase()))];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Compare Vendors</h1>
          <p className="text-muted-foreground">
            Compare estimates and evaluate vendors for your home projects
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-6">
          {/* Add New Quote */}
          <Card>
            <CardHeader>
              <CardTitle>Add Vendor Quote</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="projectName">Project Name</Label>
                    <Input
                      id="projectName"
                      value={newQuote.projectName}
                      onChange={(e) => setNewQuote({ ...newQuote, projectName: e.target.value })}
                      placeholder="e.g., Kitchen Remodel, Roof Replacement"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vendorName">Vendor/Company Name</Label>
                    <Input
                      id="vendorName"
                      value={newQuote.vendorName}
                      onChange={(e) => setNewQuote({ ...newQuote, vendorName: e.target.value })}
                      placeholder="Company name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="estimateAmount">Estimate Amount ({currency.symbol})</Label>
                    <Input
                      id="estimateAmount"
                      type="number"
                      step="0.01"
                      value={newQuote.estimateAmount || ''}
                      onChange={(e) => setNewQuote({ ...newQuote, estimateAmount: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactInfo">Contact Info</Label>
                    <Input
                      id="contactInfo"
                      value={newQuote.contactInfo}
                      onChange={(e) => setNewQuote({ ...newQuote, contactInfo: e.target.value })}
                      placeholder="Phone, email, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateReceived">Date Received</Label>
                    <Input
                      id="dateReceived"
                      type="date"
                      value={newQuote.dateReceived}
                      onChange={(e) => setNewQuote({ ...newQuote, dateReceived: e.target.value })}
                    />
                  </div>
                </div>

                {/* Vendor Evaluation */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Vendor Evaluation</h3>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="likedSalesRep">Did you like the sales rep?</Label>
                    <Switch
                      id="likedSalesRep"
                      checked={newQuote.likedSalesRep}
                      onCheckedChange={(checked) => setNewQuote({ ...newQuote, likedSalesRep: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="offersFinancing">Do they offer financing?</Label>
                    <Switch
                      id="offersFinancing"
                      checked={newQuote.offersFinancing}
                      onCheckedChange={(checked) => setNewQuote({ ...newQuote, offersFinancing: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="goodTiming">Is timing good?</Label>
                    <Switch
                      id="goodTiming"
                      checked={newQuote.goodTiming}
                      onCheckedChange={(checked) => setNewQuote({ ...newQuote, goodTiming: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="trustworthy">Are they trustworthy?</Label>
                    <Switch
                      id="trustworthy"
                      checked={newQuote.trustworthy}
                      onCheckedChange={(checked) => setNewQuote({ ...newQuote, trustworthy: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="responsive">Responsive?</Label>
                    <Switch
                      id="responsive"
                      checked={newQuote.responsive}
                      onCheckedChange={(checked) => setNewQuote({ ...newQuote, responsive: checked })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={newQuote.notes}
                      onChange={(e) => setNewQuote({ ...newQuote, notes: e.target.value })}
                      placeholder="Additional notes about the vendor or quote..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <Button onClick={addQuote} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Quote
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Project Comparisons */}
          {uniqueProjects.length > 0 && uniqueProjects.map(projectName => {
            const projectQuotes = quotes.filter(quote => 
              quote.projectName.toLowerCase() === projectName.toLowerCase()
            );
            const lowestEstimate = getLowestEstimate(projectName);
            
            return (
              <Card key={projectName}>
                <CardHeader>
                  <CardTitle className="capitalize">{projectName}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {projectQuotes.length} quotes • Lowest: {currency.symbol}{lowestEstimate?.toFixed(2)}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {projectQuotes
                      .sort((a, b) => a.estimateAmount - b.estimateAmount)
                      .map(quote => {
                        const score = getVendorScore(quote);
                        const isLowest = quote.estimateAmount === lowestEstimate;
                        
                        return (
                          <div
                            key={quote.id}
                            className={`border rounded-lg p-4 ${
                              isLowest
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                : 'border-border'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold">{quote.vendorName}</h3>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm">{score}/5</span>
                              </div>
                            </div>
                            
                            <div className="space-y-2 text-sm">
                              <div className="text-2xl font-bold text-primary">
                                {currency.symbol}{quote.estimateAmount.toFixed(2)}
                                {isLowest && <span className="text-xs text-green-600 ml-2">LOWEST</span>}
                              </div>
                              
                              <div className="text-muted-foreground">
                                {quote.contactInfo && (
                                  <div>Contact: {quote.contactInfo}</div>
                                )}
                                {quote.dateReceived && (
                                  <div>Received: {new Date(quote.dateReceived).toLocaleDateString()}</div>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-2 gap-1 text-xs">
                                <div className={quote.likedSalesRep ? 'text-green-600' : 'text-red-600'}>
                                  Sales Rep: {quote.likedSalesRep ? '✓' : '✗'}
                                </div>
                                <div className={quote.offersFinancing ? 'text-green-600' : 'text-red-600'}>
                                  Financing: {quote.offersFinancing ? '✓' : '✗'}
                                </div>
                                <div className={quote.goodTiming ? 'text-green-600' : 'text-red-600'}>
                                  Timing: {quote.goodTiming ? '✓' : '✗'}
                                </div>
                                <div className={quote.trustworthy ? 'text-green-600' : 'text-red-600'}>
                                  Trust: {quote.trustworthy ? '✓' : '✗'}
                                </div>
                                <div className={quote.responsive ? 'text-green-600' : 'text-red-600'}>
                                  Responsive: {quote.responsive ? '✓' : '✗'}
                                </div>
                              </div>
                              
                              {quote.notes && (
                                <div className="mt-2 p-2 bg-muted rounded text-xs">
                                  {quote.notes}
                                </div>
                              )}
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeQuote(quote.id)}
                                className="w-full mt-2 text-destructive hover:text-destructive"
                              >
                                Remove Quote
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {quotes.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  No vendor quotes yet. Add your first quote above to start comparing vendors!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompareVendors;