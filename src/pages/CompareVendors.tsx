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

interface VendorProject {
  id: string;
  user_id: string;
  title: string;
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
  const [allProjects, setAllProjects] = useState<VendorProject[]>([]);
  const [isNewProject, setIsNewProject] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [sortBy, setSortBy] = useState<'amount' | 'rating' | 'date'>('amount');
  const { user } = useAuth();
  const { currency } = useCurrency();
  const { toast } = useToast();
  const { earnBadge } = useBadges();

  useEffect(() => {
    if (user) {
      loadProjects();
    } else {
      const defaultProject: VendorProject = {
        id: 'default',
        user_id: 'guest',
        title: 'My Project',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setAllProjects([defaultProject]);
      setSelectedProject(defaultProject);
      createDefaultQuote(defaultProject);
    }
  }, [user]);

  useEffect(() => {
    if (selectedProject) {
      loadQuotes();
    }
  }, [selectedProject]);

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

    const { data: projects } = await supabase
      .from('vendor_projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (projects && projects.length > 0) {
      setAllProjects(projects);
      if (!selectedProject) {
        setSelectedProject(projects[0]);
      }
    } else {
      const { data: newProject } = await supabase
        .from('vendor_projects')
        .insert({ user_id: user.id, title: 'My Project' })
        .select()
        .single();

      if (newProject) {
        setAllProjects([newProject]);
        setSelectedProject(newProject);
      }
    }
  };

  const loadQuotes = async () => {
    if (!user || !selectedProject) {
      if (!user && selectedProject) {
        createDefaultQuote(selectedProject);
      }
      return;
    }

    const { data } = await supabase
      .from('vendor_quotes')
      .select('*')
      .eq('project_id', selectedProject.id)
      .order('created_at', { ascending: true });

    if (data && data.length > 0) {
      setQuotes(data);
    } else {
      createDefaultQuote(selectedProject);
    }
  };

  const addNewQuote = async () => {
    const newQuote: VendorQuote = {
      id: `temp-${Date.now()}`,
      project_id: selectedProject?.id || 'default',
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
            project_id: selectedProject?.id,
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

  const createNewProject = async () => {
    if (!newProjectName.trim()) return;

    if (!user) {
      const tempProject: VendorProject = {
        id: `temp-${Date.now()}`,
        user_id: 'guest',
        title: newProjectName.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setAllProjects(prev => [...prev, tempProject]);
      setSelectedProject(tempProject);
      setNewProjectName('');
      setIsNewProject(false);
      createDefaultQuote(tempProject);
      return;
    }

    try {
      const { data: newProject, error } = await supabase
        .from('vendor_projects')
        .insert([{ user_id: user.id, title: newProjectName.trim() }])
        .select()
        .single();

      if (error) throw error;

      setAllProjects(prev => [...prev, newProject]);
      setSelectedProject(newProject);
      setNewProjectName('');
      setIsNewProject(false);
      createDefaultQuote(newProject);
      toast({ title: "Success", description: "New project created!" });
    } catch (error) {
      console.error('Error creating project:', error);
      toast({ title: "Error", description: "Failed to create project", variant: "destructive" });
    }
  };

  const updateProjectTitle = async (projectId: string, newTitle: string) => {
    if (!newTitle.trim()) return;

    setAllProjects(prev => prev.map(p => p.id === projectId ? { ...p, title: newTitle.trim() } : p));
    setEditingProjectId(null);

    if (user && !projectId.startsWith('temp-')) {
      try {
        await supabase
          .from('vendor_projects')
          .update({ title: newTitle.trim() })
          .eq('id', projectId);
      } catch (error) {
        console.error('Error updating project title:', error);
      }
    }
  };

  const deleteProject = async (projectId: string) => {
    if (allProjects.length <= 1) {
      toast({ title: "Cannot delete", description: "Must have at least one project", variant: "destructive" });
      return;
    }

    const newProjects = allProjects.filter(p => p.id !== projectId);
    setAllProjects(newProjects);
    setSelectedProject(newProjects[0]);

    if (user && !projectId.startsWith('temp-')) {
      try {
        await supabase.from('vendor_projects').delete().eq('id', projectId);
        await supabase.from('vendor_quotes').delete().eq('project_id', projectId);
      } catch (error) {
        console.error('Error deleting project:', error);
      }
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

        {/* Project Selector */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Projects</h2>
              <Button 
                onClick={() => setIsNewProject(true)} 
                size="sm"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </div>

            <div className="flex gap-2 flex-wrap">
              {allProjects.map((project) => (
                <div key={project.id} className="flex items-center gap-1">
                  {editingProjectId === project.id ? (
                    <div className="flex items-center gap-1">
                      <Input
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        className="h-8 w-32"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') updateProjectTitle(project.id, editingTitle);
                          if (e.key === 'Escape') setEditingProjectId(null);
                        }}
                        onBlur={() => updateProjectTitle(project.id, editingTitle)}
                        autoFocus
                      />
                      <Button size="sm" variant="ghost" onClick={() => updateProjectTitle(project.id, editingTitle)} className="h-8 w-8 p-0">
                        <Check className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Button
                        variant={selectedProject?.id === project.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedProject(project)}
                        className="relative group"
                      >
                        {project.title}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute -right-1 -top-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingProjectId(project.id);
                            setEditingTitle(project.title);
                          }}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      </Button>
                      {allProjects.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteProject(project.id)}
                          className="h-8 w-8 p-0 text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {isNewProject && (
                <div className="flex items-center gap-1">
                  <Input
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Project name..."
                    className="h-8 w-32"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') createNewProject();
                      if (e.key === 'Escape') setIsNewProject(false);
                    }}
                    autoFocus
                  />
                  <Button size="sm" onClick={createNewProject} className="h-8 w-8 p-0">
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsNewProject(false)} className="h-8 w-8 p-0">
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
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