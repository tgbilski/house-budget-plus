import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit3, Star, Trash2, Edit2, Check, X, Calendar, MapPin, DollarSign, Plane } from 'lucide-react';
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
  travel_mode_cost: number;
  lodging_cost: number;
  car_rental_cost: number;
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
  const [isEditing, setIsEditing] = useState(true);

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

  const getTotalCost = () => {
    return (localOption.travel_mode_cost || 0) + (localOption.lodging_cost || 0) + (localOption.car_rental_cost || 0);
  };

  const questions = [
    { key: 'favorable_travel' as const, label: 'Is the mode of travel favorable?' },
    { key: 'destination_safe' as const, label: 'Is the destination safe?' },
    { key: 'exciting_option' as const, label: 'Does this option excite you?' },
    { key: 'everyone_enjoy' as const, label: 'Will everyone enjoy it?' },
    { key: 'memorable' as const, label: 'Memorable?' }
  ];

  if (isEditing) {
    return (
      <Card className="border border-border/50 hover:border-border transition-colors">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold">Vacation Option</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
                className="h-8 w-8 p-0"
              >
                <Check className="h-4 w-4" />
              </Button>
              {showRemove && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRemove}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Total Cost Display */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <Label className="text-sm font-medium text-muted-foreground">Total Cost</Label>
            <div className="text-2xl font-bold text-primary">
              {currency.symbol}{getTotalCost().toFixed(2)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`destination-${option.id}`} className="text-sm font-medium">
                Destination
              </Label>
              <Input
                id={`destination-${option.id}`}
                value={localOption.destination}
                onChange={(e) => updateField('destination', e.target.value)}
                placeholder="Where are you going?"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor={`travel-mode-${option.id}`} className="text-sm font-medium">
                Travel Mode
              </Label>
              <Input
                id={`travel-mode-${option.id}`}
                value={localOption.travel_mode}
                onChange={(e) => updateField('travel_mode', e.target.value)}
                placeholder="Flight, drive, cruise, etc."
                className="mt-1"
              />
            </div>
          </div>

          {/* Cost Fields */}
          <div className="space-y-4">
            <h4 className="font-medium">Cost Breakdown</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor={`travel-cost-${option.id}`} className="text-sm font-medium">
                  Travel ({currency.symbol})
                </Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
                    {currency.symbol}
                  </span>
                  <Input
                    id={`travel-cost-${option.id}`}
                    type="number"
                    step="0.01"
                    value={localOption.travel_mode_cost || ''}
                    onChange={(e) => updateField('travel_mode_cost', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="pl-8"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor={`lodging-cost-${option.id}`} className="text-sm font-medium">
                  Lodging ({currency.symbol})
                </Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
                    {currency.symbol}
                  </span>
                  <Input
                    id={`lodging-cost-${option.id}`}
                    type="number"
                    step="0.01"
                    value={localOption.lodging_cost || ''}
                    onChange={(e) => updateField('lodging_cost', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="pl-8"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor={`rental-cost-${option.id}`} className="text-sm font-medium">
                  Car Rental ({currency.symbol})
                </Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
                    {currency.symbol}
                  </span>
                  <Input
                    id={`rental-cost-${option.id}`}
                    type="number"
                    step="0.01"
                    value={localOption.car_rental_cost || ''}
                    onChange={(e) => updateField('car_rental_cost', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="pl-8"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor={`contact-${option.id}`} className="text-sm font-medium">
              Contact Info
            </Label>
            <Input
              id={`contact-${option.id}`}
              value={localOption.contact}
              onChange={(e) => updateField('contact', e.target.value)}
              placeholder="Travel agent, website, etc."
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor={`notes-${option.id}`} className="text-sm font-medium">
              Notes
            </Label>
            <Textarea
              id={`notes-${option.id}`}
              value={localOption.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Additional details about this vacation option..."
              rows={3}
              className="mt-1"
            />
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Evaluation Questions</h4>
            {questions.map((question) => (
              <div key={question.key} className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/20">
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
    <Card className="border border-border/50 hover:border-border hover:shadow-md transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">
              {localOption.destination || 'Untitled Destination'}
            </h3>
            <div className="text-2xl font-bold text-primary mb-2">
              {currency.symbol}{getTotalCost().toFixed(2)}
            </div>
            {localOption.travel_mode && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Plane className="h-4 w-4" />
                {localOption.travel_mode}
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
          <div className="mb-3 p-3 bg-muted/30 rounded-lg">
            <span className="text-sm text-muted-foreground">Contact: </span>
            <span className="text-sm font-medium">{localOption.contact}</span>
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
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
      travel_mode_cost: 0,
      lodging_cost: 0,
      car_rental_cost: 0,
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
        travel_mode_cost: option.travel_mode_cost,
        lodging_cost: option.lodging_cost,
        car_rental_cost: option.car_rental_cost,
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

  const addNewOption = async () => {
    if (!selectedProject) return;

    if (user) {
      const { data: newOption, error } = await supabase
        .from('vacation_options')
        .insert({ project_id: selectedProject.id })
        .select()
        .single();

      if (error) {
        console.error('Error creating option:', error);
        return;
      }

      if (newOption) {
        setOptions([...options, newOption]);
      }
    } else {
      // For non-authenticated users
      const newOption: VacationOption = {
        id: `temp-${Date.now()}`,
        project_id: selectedProject.id,
        destination: '',
        travel_mode: '',
        travel_mode_cost: 0,
        lodging_cost: 0,
        car_rental_cost: 0,
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

  const createProject = async () => {
    if (!newProjectName.trim()) return;

    setSavingProject(true);
    try {
      if (user) {
        const { data: newProject, error } = await supabase
          .from('vacation_projects')
          .insert({ user_id: user.id, title: newProjectName })
          .select()
          .single();

        if (error) throw error;

        if (newProject) {
          setAllProjects([...allProjects, newProject]);
          setSelectedProject(newProject);
          await createBlankOption(newProject.id);
        }
      } else {
        // For non-authenticated users
        const newProject: VacationProject = {
          id: `temp-${Date.now()}`,
          user_id: 'guest',
          title: newProjectName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setAllProjects([...allProjects, newProject]);
        setSelectedProject(newProject);
        createDefaultOption(newProject);
      }

      setNewProjectName('');
      setIsCreatingProject(false);
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setSavingProject(false);
    }
  };

  const updateProjectTitle = async (projectId: string, newTitle: string) => {
    if (!newTitle.trim()) return;

    try {
      if (user) {
        const { error } = await supabase
          .from('vacation_projects')
          .update({ title: newTitle })
          .eq('id', projectId);

        if (error) throw error;
      }

      setAllProjects(allProjects.map(project =>
        project.id === projectId ? { ...project, title: newTitle } : project
      ));

      if (selectedProject?.id === projectId) {
        setSelectedProject({ ...selectedProject, title: newTitle });
      }

      setEditingProjectId(null);
      setEditingTitle('');
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      if (user) {
        // Delete all options first
        await supabase
          .from('vacation_options')
          .delete()
          .eq('project_id', projectId);

        // Then delete the project
        const { error } = await supabase
          .from('vacation_projects')
          .delete()
          .eq('id', projectId);

        if (error) throw error;
      }

      const updatedProjects = allProjects.filter(project => project.id !== projectId);
      setAllProjects(updatedProjects);

      if (selectedProject?.id === projectId) {
        if (updatedProjects.length > 0) {
          setSelectedProject(updatedProjects[0]);
        } else {
          setSelectedProject(null);
          setOptions([]);
        }
      }

      setDeletingProject(null);
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const getTotalCost = () => {
    return options.reduce((total, option) => {
      return total + (option.travel_mode_cost || 0) + (option.lodging_cost || 0) + (option.car_rental_cost || 0);
    }, 0);
  };

  const getAverageRating = () => {
    if (options.length === 0) return 0;
    
    const totalStars = options.reduce((total, option) => {
      const evaluationFields = [
        option.favorable_travel,
        option.destination_safe,
        option.exciting_option,
        option.everyone_enjoy,
        option.memorable
      ];
      return total + evaluationFields.filter(Boolean).length;
    }, 0);
    
    return totalStars / options.length;
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Vacation Planning"
        description="Plan and compare vacation options. Track costs, destinations, and evaluate your travel choices."
        keywords="vacation planning, travel comparison, vacation budget, travel costs, vacation options"
      />

      {/* Modern Header */}
      <div className="bg-card border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Vacation Planning</h1>
                <p className="text-sm text-muted-foreground">Compare and plan your perfect getaway</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Total Budget</div>
                <div className="text-2xl font-bold text-primary">{currency.symbol}{getTotalCost().toFixed(2)}</div>
              </div>
              <Button onClick={addNewOption} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Option
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <WarningBanner />

        {/* Stats Cards */}
        {options.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Options</div>
                    <div className="text-xl font-bold">{options.length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Total Cost</div>
                    <div className="text-xl font-bold">{currency.symbol}{getTotalCost().toFixed(2)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Star className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Avg Rating</div>
                    <div className="text-xl font-bold">{getAverageRating().toFixed(1)}/5</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Project</div>
                    <div className="text-lg font-medium truncate">{selectedProject?.title || 'No Project'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Project Management */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Vacation Projects</span>
              <Button
                onClick={() => setIsCreatingProject(true)}
                size="sm"
                variant="outline"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 mb-4">
              {allProjects.map((project) => (
                <div key={project.id} className="relative">
                  {editingProjectId === project.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            updateProjectTitle(project.id, editingTitle);
                          } else if (e.key === 'Escape') {
                            setEditingProjectId(null);
                            setEditingTitle('');
                          }
                        }}
                        className="text-lg font-semibold h-12 w-48 border-2 border-primary"
                        placeholder="Project name..."
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={() => updateProjectTitle(project.id, editingTitle)}
                        className="h-10"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingProjectId(null);
                          setEditingTitle('');
                        }}
                        className="h-10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className={`group relative cursor-pointer transition-all rounded-lg border-2 p-4 ${
                      selectedProject?.id === project.id 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'bg-card hover:bg-muted border-border hover:border-muted-foreground/20'
                    }`}>
                      <div
                        onClick={() => setSelectedProject(project)}
                        className="flex items-center justify-between min-w-0"
                      >
                        <span className="text-lg font-semibold truncate pr-2">
                          {project.title}
                        </span>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-black/10 px-2 py-1 rounded whitespace-nowrap">
                            Click to edit
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingProjectId(project.id);
                              setEditingTitle(project.title);
                            }}
                            className={`h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity ${
                              selectedProject?.id === project.id ? 'hover:bg-primary-foreground/20' : ''
                            }`}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          {allProjects.length > 1 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingProject(project.id);
                              }}
                              className={`h-6 w-6 p-0 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity ${
                                selectedProject?.id === project.id ? 'hover:bg-destructive/20' : 'hover:bg-destructive/10'
                              }`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {isCreatingProject && (
              <div className="flex items-center gap-2 mt-4">
                <Input
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Project name"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      createProject();
                    } else if (e.key === 'Escape') {
                      setIsCreatingProject(false);
                      setNewProjectName('');
                    }
                  }}
                  autoFocus
                />
                <Button
                  onClick={createProject}
                  disabled={!newProjectName.trim() || savingProject}
                >
                  {savingProject ? 'Creating...' : 'Create'}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsCreatingProject(false);
                    setNewProjectName('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vacation Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {options.map((option, index) => (
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

        {/* Empty State */}
        {options.length === 0 && (
          <Card className="border-dashed border-2 border-border">
            <CardContent className="p-12 text-center">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No vacation options yet</h3>
              <p className="text-muted-foreground mb-6">
                Start planning your perfect getaway by adding your first vacation option
              </p>
              <Button onClick={addNewOption} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Your First Option
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Tips */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Planning Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg mt-1">
                  <MapPin className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Compare Options</h4>
                  <p className="text-sm text-muted-foreground">Create multiple vacation options to compare costs, destinations, and overall appeal.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-lg mt-1">
                  <DollarSign className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Track All Costs</h4>
                  <p className="text-sm text-muted-foreground">Include travel, lodging, and car rental costs for accurate budget planning.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-lg mt-1">
                  <Star className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Rate Your Options</h4>
                  <p className="text-sm text-muted-foreground">Use the evaluation questions to rate each option and find your perfect match.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        {deletingProject && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Delete Project</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Are you sure you want to delete this project? This will also delete all vacation options within it.
                </p>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setDeletingProject(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => deleteProject(deletingProject)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <AIChatbot 
        pageContext="This is the Vacation Planning page where users can create multiple vacation projects and compare different vacation options within each project. Users can track costs, destinations, travel modes, and rate options based on various criteria."
        pageName="Vacation Planning"
      />
    </div>
  );
};

export default Vacation;