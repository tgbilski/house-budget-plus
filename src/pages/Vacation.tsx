import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit3, Star, Trash2, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/hooks/useCurrency';
import { useBadges } from '@/hooks/useBadges';
import { supabase } from '@/integrations/supabase/client';
import { AIChatbot } from '@/components/AIChatbot';

import { useToast } from '@/hooks/use-toast';
import { SEO } from '@/components/SEO';
import { seoData } from '@/utils/seoData';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { InternalLinks } from '@/components/InternalLinks';
import { SocialShare } from '@/components/SocialShare';
import { FAQ } from '@/components/FAQ';
import { vacationPlanningFAQs } from '@/utils/faqData';
import { WarningBanner } from '@/components/WarningBanner';

interface VacationProject {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface VacationOption {
  id: string;
  project_id: string;
  destination: string;
  travel_mode: string;
  estimated_cost: number;
  notes: string;
  contact: string;
  favorable_travel: boolean;
  destination_safe: boolean;
  exciting_option: boolean;
  everyone_enjoy: boolean;
  memorable: boolean;
  created_at?: string;
  updated_at?: string;
}

interface VacationCardProps {
  option: VacationOption;
  onUpdate: (option: VacationOption) => void;
  onRemove: () => void;
  showRemove: boolean;
  currency: any;
}

const VacationCard: React.FC<VacationCardProps> = ({ option, onUpdate, onRemove, showRemove, currency }) => {
  const [localOption, setLocalOption] = useState(option);
  const [isEditing, setIsEditing] = useState(false);

  const updateField = useCallback((field: keyof VacationOption, value: any) => {
    const updated = { ...localOption, [field]: value };
    setLocalOption(updated);
    onUpdate(updated);
  }, [localOption, onUpdate]);

  const getStarCount = () => {
    const evaluationFields = [
      localOption.favorable_travel,
      localOption.destination_safe,
      localOption.exciting_option,
      localOption.everyone_enjoy,
      localOption.memorable
    ];
    return evaluationFields.filter(Boolean).length;
  };

  // Show editing mode if the card is completely empty (new card)
  const isEmpty = !localOption.destination && localOption.estimated_cost === 0 && !localOption.travel_mode;
  const shouldShowEditing = isEditing || isEmpty;


  const questions = [
    { key: 'favorable_travel' as const, label: 'Is the mode of travel favorable?' },
    { key: 'destination_safe' as const, label: 'Is the destination safe?' },
    { key: 'exciting_option' as const, label: 'Does this option excite you?' },
    { key: 'everyone_enjoy' as const, label: 'Will everyone enjoy it?' },
    { key: 'memorable' as const, label: 'Memorable?' }
  ];

  if (shouldShowEditing) {
    return (
      <Card className="relative">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">Vacation Option</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
              >
                <Check className="h-4 w-4" />
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
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`destination-${option.id}`}>Destination</Label>
              <Input
                id={`destination-${option.id}`}
                value={localOption.destination}
                onChange={(e) => updateField('destination', e.target.value)}
                placeholder="Where are you going?"
              />
            </div>
            <div>
              <Label htmlFor={`travel-mode-${option.id}`}>Travel Mode</Label>
              <Input
                id={`travel-mode-${option.id}`}
                value={localOption.travel_mode}
                onChange={(e) => updateField('travel_mode', e.target.value)}
                placeholder="Flight, drive, cruise, etc."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`cost-${option.id}`}>Estimated Cost ({currency.symbol})</Label>
              <Input
                id={`cost-${option.id}`}
                type="number"
                step="0.01"
                value={localOption.estimated_cost || ''}
                onChange={(e) => updateField('estimated_cost', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor={`contact-${option.id}`}>Contact Info</Label>
              <Input
                id={`contact-${option.id}`}
                value={localOption.contact}
                onChange={(e) => updateField('contact', e.target.value)}
                placeholder="Travel agent, website, etc."
              />
            </div>
          </div>

          <div>
            <Label htmlFor={`notes-${option.id}`}>Notes</Label>
            <Textarea
              id={`notes-${option.id}`}
              value={localOption.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Additional details about this vacation option..."
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-sm">Evaluation Questions</h4>
            {questions.map((question) => (
              <div key={question.key} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <span className="text-sm">{question.label}</span>
                <div className="flex gap-2">
                  <Button
                    variant={localOption[question.key] === true ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateField(question.key, true)}
                  >
                    Yes
                  </Button>
                  <Button
                    variant={localOption[question.key] === false ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => updateField(question.key, false)}
                  >
                    No
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Summary view
  const renderStars = () => {
    const filledStars = getStarCount();
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < filledStars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <Card className="relative hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">
              {localOption.destination || 'Untitled Destination'}
            </h3>
            <div className="text-2xl font-bold text-primary">
              {currency.symbol}{localOption.estimated_cost?.toFixed(2) || '0.00'}
            </div>
            {localOption.travel_mode && (
              <div className="text-sm text-muted-foreground mt-1">
                Travel: {localOption.travel_mode}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex">
              {renderStars()}
            </div>
          </div>
        </div>

        {localOption.contact && (
          <div className="mb-3">
            <span className="text-sm text-muted-foreground">Contact: </span>
            <span className="text-sm">{localOption.contact}</span>
          </div>
        )}

        {localOption.notes && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground line-clamp-2">{localOption.notes}</p>
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

const Vacation: React.FC = () => {
  const [options, setOptions] = useState<VacationOption[]>([]);
  const [selectedProject, setSelectedProject] = useState<VacationProject | null>(null);
  const [allProjects, setAllProjects] = useState<VacationProject[]>([]);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
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
      const defaultProject: VacationProject = {
        id: 'default',
        user_id: 'guest',
        title: 'My Vacation',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setAllProjects([defaultProject]);
      setSelectedProject(defaultProject);
      createDefaultOption(defaultProject);
    }
  }, [user]);

  useEffect(() => {
    if (selectedProject) {
      loadOptions();
    }
  }, [selectedProject]);

  const createDefaultOption = (project: VacationProject) => {
    const defaultOption: VacationOption = {
      id: 'default-option',
      project_id: project.id,
      destination: '',
      travel_mode: '',
      estimated_cost: 0,
      notes: '',
      contact: '',
      favorable_travel: false,
      destination_safe: false,
      exciting_option: false,
      everyone_enjoy: false,
      memorable: false
    };
    setOptions([defaultOption]);
  };

  const loadProjects = async () => {
    if (!user) return;

    const { data: projects } = await supabase
      .from('vacation_projects')
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
        .from('vacation_projects')
        .insert({ user_id: user.id, title: 'My Vacation' })
        .select()
        .single();

      if (newProject) {
        setAllProjects([newProject]);
        setSelectedProject(newProject);
      }
    }
  };

  const loadOptions = async () => {
    if (!user || !selectedProject) {
      if (!user && selectedProject) {
        createDefaultOption(selectedProject);
      }
      return;
    }

    const { data } = await supabase
      .from('vacation_options')
      .select('*')
      .eq('project_id', selectedProject.id)
      .order('created_at', { ascending: true });

    if (data && data.length > 0) {
      setOptions(data);
    } else {
      // Create default blank option for new projects
      await createBlankOption(selectedProject.id);
    }
  };

  const createBlankOption = async (projectId: string) => {
    if (!user) return;

    const { data: newOption } = await supabase
      .from('vacation_options')
      .insert({ project_id: projectId })
      .select()
      .single();

    if (newOption) {
      setOptions([newOption]);
    }
  };

  const saveOption = async (option: VacationOption) => {
    if (!user || !selectedProject) return;

    const { error } = await supabase
      .from('vacation_options')
      .upsert({
        id: option.id,
        project_id: option.project_id,
        destination: option.destination,
        travel_mode: option.travel_mode,
        estimated_cost: option.estimated_cost,
        notes: option.notes,
        contact: option.contact,
        favorable_travel: option.favorable_travel,
        destination_safe: option.destination_safe,
        exciting_option: option.exciting_option,
        everyone_enjoy: option.everyone_enjoy,
        memorable: option.memorable
      });

    if (error) {
      console.error('Error saving option:', error);
    } else {
      earnBadge('vacation');
    }
  };

  const updateVacationCard = (updatedOption: VacationOption) => {
    setOptions(options.map(option => 
      option.id === updatedOption.id ? updatedOption : option
    ));
    
    if (user) {
      saveOption(updatedOption);
    }
  };

  const removeVacationCard = async (optionId: string) => {
    if (options.length <= 1) return; // Always keep at least one card
    
    if (user) {
      const { error } = await supabase
        .from('vacation_options')
        .delete()
        .eq('id', optionId);

      if (error) {
        console.error('Error deleting option:', error);
        return;
      }
    }

    setOptions(options.filter(option => option.id !== optionId));
  };

  const createNewProject = async () => {
    if (!newProjectName.trim() || savingProject) return;
    
    setSavingProject(true);
    
    try {
      if (user) {
        const { data: newProject } = await supabase
          .from('vacation_projects')
          .insert({ user_id: user.id, title: newProjectName.trim() })
          .select()
          .single();

        if (newProject) {
          const updatedProjects = [...allProjects, newProject];
          setAllProjects(updatedProjects);
          setSelectedProject(newProject);
          setNewProjectName('');
          setIsCreatingProject(false);
          
          // Create default blank option for new project
          await createBlankOption(newProject.id);
        }
      } else {
        // For non-authenticated users
        const newProject: VacationProject = {
          id: Date.now().toString(),
          user_id: 'guest',
          title: newProjectName.trim(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const updatedProjects = [...allProjects, newProject];
        setAllProjects(updatedProjects);
        setSelectedProject(newProject);
        setNewProjectName('');
        setIsCreatingProject(false);
        createDefaultOption(newProject);
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
          .from('vacation_projects')
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
          .from('vacation_projects')
          .delete()
          .eq('id', projectId);

        if (error) throw error;
      }

      const updatedProjects = allProjects.filter(p => p.id !== projectId);
      setAllProjects(updatedProjects);
      
      if (selectedProject?.id === projectId) {
        setSelectedProject(updatedProjects.length > 0 ? updatedProjects[0] : null);
        setOptions([]);
      }
      
    } catch (error) {
      console.error('Error deleting project:', error);
    } finally {
      setDeletingProject(null);
    }
  };

  const addVacationCard = async () => {
    if (!selectedProject) return;

    if (user) {
      const { data: newOption } = await supabase
        .from('vacation_options')
        .insert({ project_id: selectedProject.id })
        .select()
        .single();

      if (newOption) {
        setOptions([...options, newOption]);
      }
    } else {
      const newOption: VacationOption = {
        id: Date.now().toString(),
        project_id: selectedProject.id,
        destination: '',
        travel_mode: '',
        estimated_cost: 0,
        notes: '',
        contact: '',
        favorable_travel: false,
        destination_safe: false,
        exciting_option: false,
        everyone_enjoy: false,
        memorable: false
      };
      setOptions([...options, newOption]);
    }
  };

  const getLowestCost = () => {
    if (options.length === 0) return 0;
    const costs = options.map(option => option.estimated_cost).filter(cost => cost > 0);
    return costs.length > 0 ? Math.min(...costs) : 0;
  };

  return (
    <div className="min-h-screen">
      <SEO {...seoData.vacation} />
      
      {/* Hero Section with Dark Gradient */}
      <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-16">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEiIGhlaWdodD0iMjAiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPgo8L3N2Zz4K')] opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <svg className="h-16 w-16 mx-auto mb-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
            </svg>
            <h1 className="text-4xl font-bold mb-4">Vacation Planning</h1>
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
                          onClick={() => setSelectedProject(project)}
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
              {isCreatingProject ? (
                <div className="flex items-center gap-1">
                  <Input
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Project name"
                    className="h-8 w-32 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') createNewProject();
                      if (e.key === 'Escape') {
                        setIsCreatingProject(false);
                        setNewProjectName('');
                      }
                    }}
                    autoFocus
                  />
                  <Button size="sm" variant="ghost" onClick={createNewProject} className="h-8 w-8 p-0">
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => {
                    setIsCreatingProject(false);
                    setNewProjectName('');
                  }} className="h-8 w-8 p-0">
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={() => setIsCreatingProject(true)} 
                  size="sm" 
                  variant="outline"
                  className="h-8 w-8 p-0 rounded-full border-dashed"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              )}
            </div>

            {selectedProject && options.length > 0 && getLowestCost() > 0 && (
              <div className="text-sm text-muted-foreground mb-4">
                Lowest estimate: {currency.symbol}{getLowestCost().toFixed(2)}
              </div>
            )}
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid gap-6">
            {options.map((option) => (
              <VacationCard
                key={option.id}
                option={option}
                onUpdate={updateVacationCard}
                onRemove={() => removeVacationCard(option.id)}
                showRemove={options.length > 1}
                currency={currency}
              />
            ))}
          </div>

          {!isCreatingProject && selectedProject && (
            <div className="flex items-center justify-center mt-6">
              <Button
                onClick={addVacationCard}
                variant="outline"
                size="lg"
                className="h-20 w-20 rounded-full border-2 border-dashed border-primary hover:bg-primary/5"
              >
                <Plus className="h-8 w-8 text-primary" />
              </Button>
            </div>
          )}
        </div>

        <section className="py-16 px-4 bg-slate-900 text-white relative mt-16" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.04) 40px, rgba(255,255,255,0.04) 42px)`
        }}>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white">
              Plan Your Perfect Vacation
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Compare destinations, costs, and travel options to make informed vacation decisions
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <h3 className="font-semibold mb-2 text-white">Budget Planning</h3>
                <p className="text-sm opacity-90">Compare costs across different destinations and travel options to stay within budget</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <h3 className="font-semibold mb-2 text-white">Option Evaluation</h3>
                <p className="text-sm opacity-90">Rate each vacation option on safety, excitement, and overall appeal</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <h3 className="font-semibold mb-2 text-white">Dream Tracker</h3>
                <p className="text-sm opacity-90">Save and organize multiple vacation ideas for future planning and comparison</p>
              </div>
            </div>
          </div>
        </section>

        <FAQ faqs={vacationPlanningFAQs} />
        <InternalLinks currentPage="/vacation" category="planning" />
      </div>

      <AIChatbot 
        pageContext="This is the Vacation Planning page where users can plan and budget for their vacations. Users can create different vacation projects, add various expense categories like flights, hotels, activities, and track their vacation budget. The page helps users organize all vacation-related expenses in one place."
        pageName="Vacation Planning"
      />
    </div>
  );
};

export default Vacation;