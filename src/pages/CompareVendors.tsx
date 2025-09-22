import React, { useState, useEffect } from 'react';
import { Star, Plus, Edit3, Trash2, Edit2, Check, X, Scale, Building, Calendar, Phone, DollarSign, Award, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/hooks/useCurrency';
import { useBadges } from '@/hooks/useBadges';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SEO } from '@/components/SEO';
import { seoData } from '@/utils/seoData';
import { AIChatbot } from '@/components/AIChatbot';
import { WarningBanner } from '@/components/WarningBanner';
import { cn } from '@/lib/utils';
import { YearSelector } from '@/components/YearSelector';
import { useYear } from '@/hooks/useYear';

interface VendorProject {
  id: string;
  user_id: string;
  title: string;
  project_number: number;
  household_id?: string;
  created_at: string;
  updated_at: string;
}

interface VendorQuote {
  id: string;
  project_id: string;
  vendor_name: string;
  estimate_amount: number;
  contact_info: string;
  notes: string;
  liked_sales_rep: boolean;
  offers_financing: boolean;
  good_timing: boolean;
  trustworthy: boolean;
  responsive: boolean;
  date_received: string;
  created_at?: string;
  updated_at?: string;
}

interface VendorCardProps {
  quote: VendorQuote;
  onUpdate: (updatedQuote: VendorQuote) => void;
  onRemove: () => void;
  showRemove: boolean;
  currency: any;
  isCompact?: boolean;
}

// Modern, compact vendor card component
const VendorCard: React.FC<VendorCardProps> = ({ quote, onUpdate, onRemove, showRemove, currency, isCompact = false }) => {
  const [localQuote, setLocalQuote] = useState<VendorQuote>(quote);
  const [isEditing, setIsEditing] = useState(!quote.vendor_name && quote.estimate_amount === 0);

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
      localQuote.liked_sales_rep,
      localQuote.offers_financing,
      localQuote.good_timing,
      localQuote.trustworthy,
      localQuote.responsive
    ];
    return factors.filter(Boolean).length;
  };

  const getBadgeColor = (count: number) => {
    if (count >= 4) return 'bg-green-100 text-green-800';
    if (count >= 2) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (isEditing) {
    return (
      <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary">
        <CardHeader className="pb-4 space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex-1 space-y-4">
              <div>
                <Label className="text-sm font-medium">Vendor Name</Label>
                <Input
                  placeholder="Company name..."
                  value={localQuote.vendor_name}
                  onChange={(e) => updateField('vendor_name', e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Estimate</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      step="0.01"
                      value={localQuote.estimate_amount || ''}
                      onChange={(e) => updateField('estimate_amount', parseFloat(e.target.value) || 0)}
                      className="pl-10"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Date</Label>
                  <Input
                    type="date"
                    value={localQuote.date_received}
                    onChange={(e) => updateField('date_received', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Contact Info</Label>
                <Input
                  value={localQuote.contact_info}
                  onChange={(e) => updateField('contact_info', e.target.value)}
                  placeholder="Phone, email, etc."
                />
              </div>
            </div>
            
            {showRemove && (
              <Button variant="ghost" size="sm" onClick={onRemove} className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-3 block">Quick Evaluation</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'liked_sales_rep' as keyof VendorQuote, label: 'Good Rep' },
                { key: 'offers_financing' as keyof VendorQuote, label: 'Financing' },
                { key: 'good_timing' as keyof VendorQuote, label: 'Good Timing' },
                { key: 'trustworthy' as keyof VendorQuote, label: 'Trustworthy' },
                { key: 'responsive' as keyof VendorQuote, label: 'Responsive' }
              ].map(({ key, label }) => (
                <Button
                  key={key}
                  variant={localQuote[key] ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateField(key, !localQuote[key])}
                  className="h-8 text-xs"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Notes</Label>
            <Textarea
              value={localQuote.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Additional notes..."
              rows={2}
              className="resize-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={() => setIsEditing(false)} size="sm" className="flex-1">
              <Check className="h-4 w-4 mr-1" />
              Save
            </Button>
            {showRemove && (
              <Button variant="destructive" size="sm" onClick={onRemove}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Summary view - more compact and modern
  const starCount = getStarCount();
  
  return (
    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group border-l-4 border-l-primary/20 hover:border-l-primary">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-base truncate">
                {localQuote.vendor_name || 'Untitled Vendor'}
              </h3>
            </div>
            <div className="flex items-center gap-1 mb-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-xl font-bold text-primary">
                {currency.symbol}{localQuote.estimate_amount?.toLocaleString() || '0'}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <Badge className={getBadgeColor(starCount)}>
              {starCount}/5 Stars
            </Badge>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
              {showRemove && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRemove}
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          {localQuote.contact_info && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span className="truncate">{localQuote.contact_info}</span>
            </div>
          )}
          
          {localQuote.date_received && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{new Date(localQuote.date_received).toLocaleDateString()}</span>
            </div>
          )}

          {localQuote.notes && (
            <p className="text-muted-foreground text-xs line-clamp-2 mt-2">
              {localQuote.notes}
            </p>
          )}

          {/* Quick indicators */}
          <div className="flex gap-1 flex-wrap mt-2">
            {localQuote.offers_financing && (
              <Badge variant="secondary" className="text-xs">Financing</Badge>
            )}
            {localQuote.trustworthy && (
              <Badge variant="secondary" className="text-xs">Trusted</Badge>
            )}
            {localQuote.responsive && (
              <Badge variant="secondary" className="text-xs">Responsive</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const CompareVendors: React.FC = () => {
  const [quotes, setQuotes] = useState<VendorQuote[]>([]);
  const [selectedProject, setSelectedProject] = useState<VendorProject | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [allProjects, setAllProjects] = useState<VendorProject[]>([]);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [sortBy, setSortBy] = useState<'amount' | 'rating' | 'date'>('amount');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { currency } = useCurrency();
  const { toast } = useToast();
  const { earnBadge } = useBadges();
  const { selectedYear } = useYear();

  useEffect(() => {
    if (user) {
      loadProjects();
    } else {
      initializeDemoProjects();
      setLoading(false);
    }
  }, [user, selectedYear]);

  useEffect(() => {
    if (currentProjectId) {
      loadQuotes();
    }
  }, [currentProjectId, selectedYear]);

  // Initialize 3 projects for demo users
  const initializeDemoProjects = () => {
    const demoProjects = [
      { id: 'temp-1', user_id: 'guest', title: 'Project 1', project_number: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'temp-2', user_id: 'guest', title: 'Project 2', project_number: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'temp-3', user_id: 'guest', title: 'Project 3', project_number: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    ];
    setAllProjects(demoProjects);
    setCurrentProjectId(demoProjects[0].id);
    setSelectedProject(demoProjects[0]);
  };

  const createDefaultQuote = (project: VendorProject) => {
    const defaultQuote: VendorQuote = {
      id: 'default-quote',
      project_id: project.id,
      vendor_name: '',
      estimate_amount: 0,
      contact_info: '',
      notes: '',
      liked_sales_rep: false,
      offers_financing: false,
      good_timing: false,
      trustworthy: false,
      responsive: false,
      date_received: new Date().toISOString().split('T')[0]
    };
    setQuotes([defaultQuote]);
  };

  const loadProjects = async () => {
    if (!user) return;

    try {
      const { data: projects, error: fetchError } = await supabase
        .from('vendor_projects')
        .select('*')
        .eq('user_id', user?.id)
        .eq('year', selectedYear)
        .order('project_number', { ascending: true });

      if (fetchError) throw fetchError;

      // Create all 3 projects if they don't exist
      const existingProjectNumbers = projects?.map(p => p.project_number) || [];
      const missingProjects = [];
      
      for (let i = 1; i <= 3; i++) {
        if (!existingProjectNumbers.includes(i)) {
          missingProjects.push({
            user_id: user?.id,
            year: selectedYear,
            title: `Project ${i}`,
            project_number: i
          });
        }
      }

      if (missingProjects.length > 0) {
        const { data: newProjects, error: insertError } = await supabase
          .from('vendor_projects')
          .insert(missingProjects)
          .select();
        
        if (insertError) throw insertError;
        
        const allProjects = [...(projects || []), ...(newProjects || [])].sort((a, b) => a.project_number - b.project_number);
        setAllProjects(allProjects);
        setCurrentProjectId(allProjects[0].id);
        setSelectedProject(allProjects[0]);
      } else {
        setAllProjects(projects);
        setCurrentProjectId(projects[0].id);
        setSelectedProject(projects[0]);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      toast({ title: "Error", description: "Failed to load projects", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const loadQuotes = async () => {
    if (!user || !currentProjectId) {
      if (!user && currentProjectId) {
        const project = allProjects.find(p => p.id === currentProjectId);
        if (project) createDefaultQuote(project);
      }
      return;
    }

    const { data } = await supabase
      .from('vendor_quotes')
      .select('*')
      .eq('project_id', currentProjectId)
      .eq('year', selectedYear)
      .order('created_at', { ascending: true });

    if (data && data.length > 0) {
      setQuotes(data);
    } else {
      const project = allProjects.find(p => p.id === currentProjectId);
      if (project) createDefaultQuote(project);
    }
  };

  const addNewQuote = async () => {
    const newQuote: VendorQuote = {
      id: `temp-${Date.now()}`,
      project_id: currentProjectId || 'default',
      vendor_name: '',
      estimate_amount: 0,
      contact_info: '',
      notes: '',
      liked_sales_rep: false,
      offers_financing: false,
      good_timing: false,
      trustworthy: false,
      responsive: false,
      date_received: new Date().toISOString().split('T')[0]
    };

    setQuotes(prev => [...prev, newQuote]);
  };

  const updateQuote = async (updatedQuote: VendorQuote) => {
    if (!user) {
      setQuotes(prev => prev.map(q => q.id === updatedQuote.id ? updatedQuote : q));
      return;
    }

    try {
      if (updatedQuote.id.startsWith('temp-')) {
        const { data, error } = await supabase
          .from('vendor_quotes')
          .insert([{
            project_id: currentProjectId,
            year: selectedYear,
            vendor_name: updatedQuote.vendor_name,
            estimate_amount: updatedQuote.estimate_amount,
            contact_info: updatedQuote.contact_info,
            notes: updatedQuote.notes,
            liked_sales_rep: updatedQuote.liked_sales_rep,
            offers_financing: updatedQuote.offers_financing,
            good_timing: updatedQuote.good_timing,
            trustworthy: updatedQuote.trustworthy,
            responsive: updatedQuote.responsive,
            date_received: updatedQuote.date_received
          }])
          .select()
          .single();

        if (error) throw error;

        setQuotes(prev => prev.map(q => q.id === updatedQuote.id ? data : q));
        earnBadge('compare_vendors');
      } else {
        const { error } = await supabase
          .from('vendor_quotes')
          .update({
            vendor_name: updatedQuote.vendor_name,
            estimate_amount: updatedQuote.estimate_amount,
            contact_info: updatedQuote.contact_info,
            notes: updatedQuote.notes,
            liked_sales_rep: updatedQuote.liked_sales_rep,
            offers_financing: updatedQuote.offers_financing,
            good_timing: updatedQuote.good_timing,
            trustworthy: updatedQuote.trustworthy,
            responsive: updatedQuote.responsive,
            date_received: updatedQuote.date_received
          })
          .eq('id', updatedQuote.id);

        if (error) throw error;

        setQuotes(prev => prev.map(q => q.id === updatedQuote.id ? updatedQuote : q));
      }
    } catch (error) {
      console.error('Error updating quote:', error);
      toast({ title: "Error", description: "Failed to save quote", variant: "destructive" });
    }
  };

  const removeQuote = async (quoteId: string) => {
    if (quotes.length <= 1) {
      toast({ title: "Cannot delete", description: "Must have at least one quote", variant: "destructive" });
      return;
    }

    setQuotes(prev => prev.filter(q => q.id !== quoteId));

    if (user && !quoteId.startsWith('temp-')) {
      try {
        await supabase.from('vendor_quotes').delete().eq('id', quoteId);
      } catch (error) {
        console.error('Error deleting quote:', error);
      }
    }
  };

  const updateProjectTitle = async (projectId: string, newTitle: string) => {
    if (!newTitle.trim()) return;

    if (!user) {
      const updatedProjects = allProjects.map(p =>
        p.id === projectId ? { ...p, title: newTitle.trim() } : p
      );
      setAllProjects(updatedProjects);
      return;
    }

    try {
      const { error } = await supabase
        .from('vendor_projects')
        .update({ title: newTitle.trim() })
        .eq('id', projectId);
      
      if (error) throw error;
      
      setAllProjects(prevProjects => prevProjects.map(project =>
        project.id === projectId ? { ...project, title: newTitle.trim() } : project
      ));
      
      toast({ title: "Success", description: "Project title updated!" });
    } catch (error) {
      console.error('Error updating project title:', error);
      toast({ title: "Error", description: "Failed to update project title", variant: "destructive" });
    }
  };

  const handleTitleEdit = (project: VendorProject) => {
    setEditingProjectId(project.id);
    setEditingTitle(project.title);
  };

  const handleTitleSave = async () => {
    if (editingProjectId && editingTitle.trim()) {
      await updateProjectTitle(editingProjectId, editingTitle.trim());
    }
    setEditingProjectId(null);
    setEditingTitle('');
  };

  const handleTitleCancel = () => {
    setEditingProjectId(null);
    setEditingTitle('');
  };

  const resetProjectData = async () => {
    if (!currentProjectId) return;

    // Clear local state
    setQuotes([]);

    if (!user) return;

    try {
      // Delete all quotes for the current project
      await supabase
        .from('vendor_quotes')
        .delete()
        .eq('project_id', currentProjectId);

      // Create a default quote
      const project = allProjects.find(p => p.id === currentProjectId);
      if (project) createDefaultQuote(project);

      toast({ title: "Success", description: "Project data reset successfully" });
    } catch (error) {
      console.error('Error resetting project data:', error);
      toast({ title: "Error", description: "Failed to reset project data", variant: "destructive" });
    }
  };

  const sortedQuotes = [...quotes].sort((a, b) => {
    switch (sortBy) {
      case 'amount':
        return a.estimate_amount - b.estimate_amount;
      case 'rating':
        const getRating = (q: VendorQuote) => [q.liked_sales_rep, q.offers_financing, q.good_timing, q.trustworthy, q.responsive].filter(Boolean).length;
        return getRating(b) - getRating(a);
      case 'date':
        return new Date(b.date_received).getTime() - new Date(a.date_received).getTime();
      default:
        return 0;
    }
  });

  const getLowestQuote = () => {
    const validQuotes = quotes.filter(q => q.estimate_amount > 0);
    return validQuotes.length > 0 ? Math.min(...validQuotes.map(q => q.estimate_amount)) : 0;
  };

  const getHighestQuote = () => {
    const validQuotes = quotes.filter(q => q.estimate_amount > 0);
    return validQuotes.length > 0 ? Math.max(...validQuotes.map(q => q.estimate_amount)) : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-16 bg-gray-200 rounded w-80"></div>
          <div className="h-64 bg-gray-200 rounded w-96"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title={seoData.compareVendors.title}
        description={seoData.compareVendors.description}
        keywords={seoData.compareVendors.keywords}
        structuredData={seoData.compareVendors.structuredData}
        canonical="https://www.housebudgetcalculator.com/compare-prices"
      />

      {/* Modern Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Scale className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Vendor Comparison</h1>
                <p className="text-sm text-gray-600">Compare quotes and find the best value</p>
              </div>
            </div>
            
            <YearSelector />
            
            {quotes.filter(q => q.estimate_amount > 0).length > 1 && (
              <div className="text-right">
                <div className="text-sm text-gray-600">Savings Potential</div>
                <div className="text-2xl font-bold text-green-600">
                  {currency.symbol}{(getHighestQuote() - getLowestQuote()).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <WarningBanner />

        {/* Projects Selector - Similar to Savings Goals */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="space-y-2">
              {allProjects.map((project) => (
                <div key={project.id} className="w-full">
                  <div 
                    className={cn(
                      "group relative cursor-pointer transition-all w-full",
                      currentProjectId === project.id 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted hover:bg-muted/80",
                      "rounded-lg px-4 py-3 border-2",
                      currentProjectId === project.id && "border-primary",
                      currentProjectId !== project.id && "border-transparent hover:border-muted-foreground/20"
                    )}
                    onClick={() => {
                      setCurrentProjectId(project.id);
                      setSelectedProject(project);
                    }}
                  >
                    <div className="flex items-center justify-between min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        {editingProjectId === project.id ? (
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <Input
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleTitleSave();
                                if (e.key === 'Escape') handleTitleCancel();
                              }}
                              className="text-lg font-semibold bg-background text-foreground h-8"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleTitleSave}
                              className="h-6 w-6 p-0"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleTitleCancel}
                              className="h-6 w-6 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <span className="text-lg font-semibold">
                              {project.title}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTitleEdit(project);
                              }}
                              className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                      <div className="text-sm opacity-75">
                        {quotes.filter(q => q.project_id === project.id && q.estimate_amount > 0).length} quotes
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={sortBy} onValueChange={(value: 'amount' | 'rating' | 'date') => setSortBy(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="amount">Price (Low to High)</SelectItem>
                  <SelectItem value="rating">Rating (High to Low)</SelectItem>
                  <SelectItem value="date">Date (Newest First)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={resetProjectData}
              className="text-destructive hover:text-destructive"
            >
              Reset Project
            </Button>
          </div>

          <Button onClick={addNewQuote} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Quote
          </Button>
        </div>

        {/* Quotes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {sortedQuotes.map((quote) => (
            <VendorCard
              key={quote.id}
              quote={quote}
              onUpdate={updateQuote}
              onRemove={() => removeQuote(quote.id)}
              showRemove={quotes.length > 1}
              currency={currency}
            />
          ))}
        </div>
      </div>

      <AIChatbot 
        pageContext="This is the Vendor Comparison page where users can create projects and compare vendor quotes. Each quote includes vendor details, pricing, contact info, and evaluation criteria."
        pageName="Vendor Comparison"
      />
    </div>
  );
};

export default CompareVendors;