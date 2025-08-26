import React, { useState, useEffect } from 'react';
import { Star, Plus, Edit3, Trash2, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/hooks/useCurrency';
import { useBadges } from '@/hooks/useBadges';
import { supabase } from '@/integrations/supabase/client';

import { useToast } from '@/hooks/use-toast';
import { SEO } from '@/components/SEO';
import { seoData } from '@/utils/seoData';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { InternalLinks } from '@/components/InternalLinks';
import { SocialShare } from '@/components/SocialShare';
import { FAQ } from '@/components/FAQ';
import { vendorComparisonFAQs } from '@/utils/faqData';
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
  projectId: string;
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
  const [selectedProject, setSelectedProject] = useState<VendorProject | null>(null);
  const [allProjects, setAllProjects] = useState<VendorProject[]>([]);
  const [isNewProject, setIsNewProject] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [deletingProject, setDeletingProject] = useState<string | null>(null);
  const [savingProject, setSavingProject] = useState(false);
  const { user } = useAuth();
  const { currency } = useCurrency();
  const { toast } = useToast();
  const { earnBadge } = useBadges();

  useEffect(() => {
    if (user) {
      loadProjects();
    } else {
      // Initialize with a default project for non-authenticated users
      const defaultProject: VendorProject = {
        id: 'default',
        user_id: 'guest',
        title: 'My Project',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setAllProjects([defaultProject]);
      setSelectedProject(defaultProject);
      setQuotes([]);
    }
  }, [user]);

  useEffect(() => {
    if (selectedProject) {
      loadQuotes();
    }
  }, [selectedProject]);

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
      // Create default project if none exist
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
    if (!user || !selectedProject) return;

    const { data } = await supabase
      .from('budget_data')
      .select('*')
      .eq('user_id', user.id)
      .eq('page_type', 'compare_prices')
      .eq('project_id', selectedProject.id);

    if (data && data.length > 0) {
      const budgetData = data[0];
      const expensesData = budgetData.expenses as any;
      if (expensesData.quotes) {
        setQuotes(expensesData.quotes.map((quote: any) => ({
          ...quote,
          projectId: selectedProject.id
        })));
      }
    } else {
      setQuotes([]);
    }
  };

  const saveQuotes = async () => {
    if (!user || !selectedProject) return;

    const { error } = await supabase
      .from('budget_data')
      .upsert({
        user_id: user.id,
        page_type: 'compare_prices',
        project_id: selectedProject.id,
        expenses: { quotes } as any
      });

    if (error) {
      console.error('Error saving data:', error);
    } else {
      earnBadge('compare_vendors');
    }
  };

  useEffect(() => {
    if (user && quotes.length > 0 && selectedProject) {
      saveQuotes();
    }
  }, [quotes, user, selectedProject]);

  const createNewProject = () => {
    setIsNewProject(true);
    setSelectedProject(null);
    setNewProjectName('');
  };

  const saveNewProject = async (projectName: string) => {
    if (!projectName.trim() || savingProject) return;
    
    setSavingProject(true);
    
    try {
      if (user) {
        const { data: newProject } = await supabase
          .from('vendor_projects')
          .insert({ user_id: user.id, title: projectName.trim() })
          .select()
          .single();

        if (newProject) {
          const updatedProjects = [...allProjects, newProject];
          setAllProjects(updatedProjects);
          setSelectedProject(newProject);
          setIsNewProject(false);
          setNewProjectName('');
          
          const newQuote: VendorQuote = {
            id: Date.now().toString(),
            projectId: newProject.id,
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
          
          setQuotes([newQuote]);
        }
      } else {
        // For non-authenticated users
        const newProject: VendorProject = {
          id: Date.now().toString(),
          user_id: 'guest',
          title: projectName.trim(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const updatedProjects = [...allProjects, newProject];
        setAllProjects(updatedProjects);
        setSelectedProject(newProject);
        setIsNewProject(false);
        setNewProjectName('');
        setQuotes([]);
      }
    } finally {
      setSavingProject(false);
    }
  };

  const startEditingProject = (projectId: string) => {
    const project = allProjects.find(p => p.id === projectId);
    if (project) {
      setEditingProjectId(projectId);
      setEditingTitle(project.title);
    }
  };

  const updateProjectTitle = async (projectId: string, newTitle: string) => {
    if (!newTitle.trim()) {
      setEditingProjectId(null);
      return;
    }

    try {
      if (user) {
        const { error } = await supabase
          .from('vendor_projects')
          .update({ title: newTitle.trim() })
          .eq('id', projectId);

        if (error) throw error;
      }

      const updatedProjects = allProjects.map(p => 
        p.id === projectId ? { ...p, title: newTitle.trim() } : p
      );
      setAllProjects(updatedProjects);
      
      if (selectedProject?.id === projectId) {
        setSelectedProject({ ...selectedProject, title: newTitle.trim() });
      }
      
      setEditingProjectId(null);
      setEditingTitle('');
    } catch (error) {
      console.error('Error updating project title:', error);
      setEditingProjectId(null);
    }
  };

  const deleteProject = async (projectId: string) => {
    if (allProjects.length <= 1 || deletingProject) return;
    
    setDeletingProject(projectId);
    
    try {
      if (user) {
        const { error: projectError } = await supabase
          .from('vendor_projects')
          .delete()
          .eq('id', projectId);

        const { error: budgetError } = await supabase
          .from('budget_data')
          .delete()
          .eq('user_id', user.id)
          .eq('page_type', 'compare_prices')
          .eq('project_id', projectId);

        if (projectError || budgetError) throw projectError || budgetError;
      }

      const updatedProjects = allProjects.filter(p => p.id !== projectId);
      setAllProjects(updatedProjects);
      
      if (selectedProject?.id === projectId) {
        setSelectedProject(updatedProjects.length > 0 ? updatedProjects[0] : null);
        setIsNewProject(false);
      }
      
    } catch (error) {
      console.error('Error deleting project:', error);
    } finally {
      setDeletingProject(null);
    }
  };

  const addVendorCard = () => {
    if (!selectedProject) return;

    const newQuote: VendorQuote = {
      id: Date.now().toString(),
      projectId: selectedProject.id,
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
  };

  const displayedQuotes = selectedProject && !isNewProject 
    ? quotes.filter(quote => quote.projectId === selectedProject.id)
    : [];

  const getLowestEstimate = () => {
    if (displayedQuotes.length === 0) return null;
    return Math.min(...displayedQuotes.map(quote => quote.estimateAmount).filter(amount => amount > 0));
  };

  const lowestEstimate = getLowestEstimate();

  return (
    <div className="min-h-screen">
      <SEO {...seoData.compareVendors} />
      
      {/* Hero Section with Dark Gradient */}
      <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-16">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEiIGhlaWdodD0iMjAiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPgo8L3N2Zz4K')] opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <Star className="h-16 w-16 mx-auto mb-6 text-primary" />
            <h1 className="text-4xl font-bold mb-4">Compare Vendors</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <WarningBanner />

        <div className="text-center mb-8">
          
          {/* Project Tabs */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {allProjects.map((project) => (
                <div key={project.id} className="flex items-center gap-1">
                  {editingProjectId === project.id ? (
                    <div className="flex items-center gap-1">
                      <Input
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        className="h-8 w-32 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') updateProjectTitle(project.id, editingTitle);
                          if (e.key === 'Escape') setEditingProjectId(null);
                        }}
                        autoFocus
                      />
                      <Button size="sm" variant="ghost" onClick={() => updateProjectTitle(project.id, editingTitle)} className="h-8 w-8 p-0">
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingProjectId(null)} className="h-8 w-8 p-0">
                        <X className="h-3 w-3" />
                      </Button>
                      {allProjects.length > 1 && (
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            deleteProject(project.id);
                            setEditingProjectId(null);
                          }}
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 rounded flex items-center justify-center"
                          title="Delete project"
                          type="button"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <div className="relative group">
                        <Button
                          variant={selectedProject?.id === project.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setSelectedProject(project);
                            setIsNewProject(false);
                          }}
                          className="pr-8"
                        >
                          {project.title}
                        </Button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditingProject(project.id);
                          }}
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20 rounded flex items-center justify-center"
                          title="Edit project name"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Add Project Plus Button */}
              {isNewProject ? (
                <div className="flex items-center gap-1">
                  <Input
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Project name"
                    className="h-8 w-32 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveNewProject(newProjectName);
                      if (e.key === 'Escape') {
                        setIsNewProject(false);
                        setNewProjectName('');
                      }
                    }}
                    autoFocus
                  />
                  <Button size="sm" variant="ghost" onClick={() => saveNewProject(newProjectName)} className="h-8 w-8 p-0">
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => {
                    setIsNewProject(false);
                    setNewProjectName('');
                  }} className="h-8 w-8 p-0">
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={createNewProject} 
                  size="sm" 
                  variant="outline"
                  className="h-8 w-8 p-0 rounded-full border-dashed"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            {!isNewProject && displayedQuotes.length > 0 && lowestEstimate && (
              <div className="text-sm text-muted-foreground mb-4">
                Lowest estimate: {currency.symbol}{lowestEstimate.toFixed(2)}
              </div>
            )}
          </div>
        </div>

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

          {!isNewProject && displayedQuotes.length === 0 && selectedProject && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No vendor quotes for "{selectedProject.title}" yet. Click the + button to add your first vendor!
              </p>
            </div>
          )}
          
          {!selectedProject && !isNewProject && allProjects.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Click "New Project" above to create your first project and start comparing vendors!
              </p>
            </div>
          )}
        </div>

        <section className="py-16 px-4 bg-slate-900 text-white relative mt-16" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.04) 40px, rgba(255,255,255,0.04) 42px)`
        }}>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white">
              Make Smarter Vendor Decisions
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Compare quotes, evaluate vendors, and save money on your home improvement projects
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <h3 className="font-semibold mb-2 text-white">Side-by-Side Comparison</h3>
                <p className="text-sm opacity-90">Easily compare multiple vendor quotes and services in one organized view</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <h3 className="font-semibold mb-2 text-white">Vendor Evaluation</h3>
                <p className="text-sm opacity-90">Rate vendors on key factors like trustworthiness, responsiveness, and financing options</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <h3 className="font-semibold mb-2 text-white">Save Your Favorites</h3>
                <p className="text-sm opacity-90">Keep track of top-rated vendors and their quotes for future reference</p>
              </div>
            </div>
          </div>
        </section>

        <FAQ faqs={vendorComparisonFAQs} />
        <InternalLinks currentPage="/compare-prices" category="comparison" />
      </div>

      <AIChatbot 
        pageContext="This is the Compare Vendors page where users can compare quotes and vendors for various services. Users can add vendor information, quotes, ratings, and track important details like financing options, timing, trustworthiness, and responsiveness. This helps users make informed decisions when choosing service providers."
        pageName="Compare Vendors"
      />
    </div>
  );
};

export default CompareVendors;