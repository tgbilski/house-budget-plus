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
}

const VendorCard: React.FC<VendorCardProps> = ({ quote, onUpdate, onRemove, showRemove, currency }) => {
  const [localQuote, setLocalQuote] = useState<VendorQuote>(quote);
  
  // Check if this is a new/empty card to start in editing mode
  const isEmpty = !quote.vendor_name && quote.estimate_amount === 0 && !quote.contact_info;
  const [isEditing, setIsEditing] = useState(isEmpty);

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

  const starCount = getStarCount();

  if (isEditing) {
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
                value={localQuote.vendor_name}
                onChange={(e) => updateField('vendor_name', e.target.value)}
                className="mt-1 font-semibold"
              />
            </div>
            <div className="ml-4 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
              >
                <Check className="h-4 w-4" />
              </Button>
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
                value={localQuote.estimate_amount || ''}
                onChange={(e) => updateField('estimate_amount', parseFloat(e.target.value) || 0)}
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
              value={localQuote.contact_info}
              onChange={(e) => updateField('contact_info', e.target.value)}
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
              value={localQuote.date_received}
              onChange={(e) => updateField('date_received', e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-sm font-semibold text-foreground mb-3">Vendor Evaluation</h3>
            
            <div className="space-y-4">
              <div className="p-3 border border-border rounded-lg">
                <div className="text-sm mb-3">Did you like the sales rep?</div>
                <div className="flex gap-2">
                  <Button
                    variant={localQuote.liked_sales_rep === true ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateField('liked_sales_rep', true)}
                    className="flex-1"
                  >
                    Yes
                  </Button>
                  <Button
                    variant={localQuote.liked_sales_rep === false ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => updateField('liked_sales_rep', false)}
                    className="flex-1"
                  >
                    No
                  </Button>
                </div>
              </div>

              <div className="p-3 border border-border rounded-lg">
                <div className="text-sm mb-3">Do they offer financing?</div>
                <div className="flex gap-2">
                  <Button
                    variant={localQuote.offers_financing === true ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateField('offers_financing', true)}
                    className="flex-1"
                  >
                    Yes
                  </Button>
                  <Button
                    variant={localQuote.offers_financing === false ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => updateField('offers_financing', false)}
                    className="flex-1"
                  >
                    No
                  </Button>
                </div>
              </div>

              <div className="p-3 border border-border rounded-lg">
                <div className="text-sm mb-3">Is timing good?</div>
                <div className="flex gap-2">
                  <Button
                    variant={localQuote.good_timing === true ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateField('good_timing', true)}
                    className="flex-1"
                  >
                    Yes
                  </Button>
                  <Button
                    variant={localQuote.good_timing === false ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => updateField('good_timing', false)}
                    className="flex-1"
                  >
                    No
                  </Button>
                </div>
              </div>

              <div className="p-3 border border-border rounded-lg">
                <div className="text-sm mb-3">Are they trustworthy?</div>
                <div className="flex gap-2">
                  <Button
                    variant={localQuote.trustworthy === true ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateField('trustworthy', true)}
                    className="flex-1"
                  >
                    Yes
                  </Button>
                  <Button
                    variant={localQuote.trustworthy === false ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => updateField('trustworthy', false)}
                    className="flex-1"
                  >
                    No
                  </Button>
                </div>
              </div>

              <div className="p-3 border border-border rounded-lg">
                <div className="text-sm mb-3">Responsive?</div>
                <div className="flex gap-2">
                  <Button
                    variant={localQuote.responsive === true ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateField('responsive', true)}
                    className="flex-1"
                  >
                    Yes
                  </Button>
                  <Button
                    variant={localQuote.responsive === false ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => updateField('responsive', false)}
                    className="flex-1"
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

          <div className="flex justify-center gap-2 pt-4 border-t mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(false)}
            >
              <Check className="h-4 w-4 mr-1" />
              Save
            </Button>
            {showRemove && (
              <Button
                variant="destructive"
                size="sm"
                onClick={onRemove}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Summary view
  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border border-border hover:shadow-xl transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">
              {localQuote.vendor_name || 'Untitled Vendor'}
            </h3>
            <div className="text-2xl font-bold text-primary">
              {currency.symbol}{localQuote.estimate_amount?.toFixed(2) || '0.00'}
            </div>
          </div>
          <div className="flex items-center gap-2">
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
          </div>
        </div>

        {localQuote.contact_info && (
          <div className="mb-3">
            <span className="text-sm text-muted-foreground">Contact: </span>
            <span className="text-sm">{localQuote.contact_info}</span>
          </div>
        )}

        {localQuote.date_received && (
          <div className="mb-4">
            <span className="text-sm text-muted-foreground">Date: </span>
            <span className="text-sm">{new Date(localQuote.date_received).toLocaleDateString()}</span>
          </div>
        )}

        {localQuote.notes && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground line-clamp-2">{localQuote.notes}</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2"
          >
            <Edit3 className="h-4 w-4" />
            Edit Details
          </Button>
          {showRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
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
      // Create default blank quote for new projects
      await createBlankQuote(selectedProject.id);
    }
  };

  const createBlankQuote = async (projectId: string) => {
    if (!user) return;

    const { data: newQuote } = await supabase
      .from('vendor_quotes')
      .insert({ project_id: projectId })
      .select()
      .single();

    if (newQuote) {
      setQuotes([newQuote]);
    }
  };

  const saveQuote = async (quote: VendorQuote) => {
    if (!user || !selectedProject) return;

    const { error } = await supabase
      .from('vendor_quotes')
      .upsert({
        id: quote.id,
        project_id: quote.project_id,
        vendor_name: quote.vendor_name,
        estimate_amount: quote.estimate_amount,
        contact_info: quote.contact_info,
        notes: quote.notes,
        liked_sales_rep: quote.liked_sales_rep,
        offers_financing: quote.offers_financing,
        good_timing: quote.good_timing,
        trustworthy: quote.trustworthy,
        responsive: quote.responsive,
        date_received: quote.date_received
      });

    if (error) {
      console.error('Error saving quote:', error);
    } else {
      earnBadge('compare_vendors');
    }
  };

  const updateVendorCard = (updatedQuote: VendorQuote) => {
    setQuotes(quotes.map(quote => 
      quote.id === updatedQuote.id ? updatedQuote : quote
    ));
    
    if (user) {
      saveQuote(updatedQuote);
    }
  };

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
          
          // Create default blank quote for new project
          await createBlankQuote(newProject.id);
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
        createDefaultQuote(newProject);
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
        const { error } = await supabase
          .from('vendor_projects')
          .delete()
          .eq('id', projectId);

        if (error) throw error;
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

  const addVendorCard = async () => {
    if (!selectedProject) return;

    if (user) {
      const { data: newQuote } = await supabase
        .from('vendor_quotes')
        .insert({ project_id: selectedProject.id })
        .select()
        .single();

      if (newQuote) {
        setQuotes([...quotes, newQuote]);
      }
    } else {
      const newQuote: VendorQuote = {
        id: Date.now().toString(),
        project_id: selectedProject.id,
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
      setQuotes([...quotes, newQuote]);
    }
  };

  const removeVendorCard = async (quoteId: string) => {
    if (quotes.length <= 1) return; // Always keep at least one card
    
    if (user) {
      const { error } = await supabase
        .from('vendor_quotes')
        .delete()
        .eq('id', quoteId);

      if (error) {
        console.error('Error deleting quote:', error);
        return;
      }
    }

    setQuotes(quotes.filter(quote => quote.id !== quoteId));
  };

  const getLowestEstimate = () => {
    if (quotes.length === 0) return null;
    const estimates = quotes.map(quote => quote.estimate_amount).filter(amount => amount > 0);
    return estimates.length > 0 ? Math.min(...estimates) : null;
  };

  const lowestEstimate = getLowestEstimate();

  return (
    <div className="min-h-screen">
      <SEO {...seoData.compareVendors} />
      
      {/* Hero Section with Light Background */}
      <div className="relative bg-white text-gray-900 py-8 rounded-2xl mx-4 mt-4 mb-6 shadow-xl">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <Star className="h-10 w-10 mx-auto mb-4 text-primary" />
            <h1 className="text-xl md:text-2xl font-bold mb-2 text-gray-900">Compare Vendors</h1>
            <p className="text-sm md:text-base text-gray-600 mb-4">Get quotes, compare prices, and evaluate vendors side by side</p>
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
                          className={`pr-8 ${selectedProject?.id === project.id ? 'border-2 border-white' : ''}`}
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
            
            {!isNewProject && quotes.length > 0 && lowestEstimate && (
              <div className="text-sm text-muted-foreground mb-4">
                Lowest estimate: {currency.symbol}{lowestEstimate.toFixed(2)}
              </div>
            )}
          </div>
        </div>

        <div className="w-full max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8 w-full">
            {quotes.map((quote) => (
              <VendorCard
                key={quote.id}
                quote={quote}
                onUpdate={updateVendorCard}
                onRemove={() => removeVendorCard(quote.id)}
                showRemove={quotes.length > 1}
                currency={currency}
              />
            ))}

            {!isNewProject && selectedProject && (
              <div className="w-full flex items-center justify-center col-span-1 lg:col-span-2 xl:col-span-3">
                <Button
                  onClick={addVendorCard}
                  variant="outline"
                  size="lg"
                  className="h-20 w-20 rounded-full border-2 border-dashed border-primary hover:bg-primary/5"
                >
                  <Plus className="h-8 w-8 text-primary" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <section className="py-16 px-4 bg-white text-gray-900 relative mt-16 rounded-2xl mx-4 shadow-xl">
          <div className="w-full max-w-4xl mx-auto text-center relative z-10 px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">
              Make Smarter Vendor Decisions
            </h2>
            <p className="text-lg mb-8 text-gray-600">
              Compare quotes, evaluate vendors, and save money on your home improvement projects
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="font-semibold mb-2 text-gray-900">Side-by-Side Comparison</h3>
                <p className="text-sm text-gray-600">Easily compare multiple vendor quotes and services in one organized view</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="font-semibold mb-2 text-gray-900">Vendor Evaluation</h3>
                <p className="text-sm text-gray-600">Rate vendors on key factors like trustworthiness, responsiveness, and financing options</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="font-semibold mb-2 text-gray-900">Save Your Favorites</h3>
                <p className="text-sm text-gray-600">Keep track of top-rated vendors and their quotes for future reference</p>
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