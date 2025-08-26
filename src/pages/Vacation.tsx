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

interface VacationOption {
  id: string;
  destination: string;
  travelMode: string;
  estimatedCost: number;
  notes: string;
  contact: string;
  evaluation: {
    favorableTravel: boolean;
    destinationSafe: boolean;
    excitingOption: boolean;
    everyoneEnjoy: boolean;
    memorable: boolean;
  };
}

interface VacationCardProps {
  option: VacationOption;
  onUpdate: (option: VacationOption) => void;
  onRemove: () => void;
  currency: any;
}

const VacationCard: React.FC<VacationCardProps> = ({ option, onUpdate, onRemove, currency }) => {
  const [localOption, setLocalOption] = useState(option);

  const updateField = useCallback((field: keyof VacationOption, value: any) => {
    const updated = { ...localOption, [field]: value };
    setLocalOption(updated);
    onUpdate(updated);
  }, [localOption, onUpdate]);

  const updateEvaluation = useCallback((field: keyof VacationOption['evaluation'], value: boolean) => {
    const updated = {
      ...localOption,
      evaluation: { ...localOption.evaluation, [field]: value }
    };
    setLocalOption(updated);
    onUpdate(updated);
  }, [localOption, onUpdate]);

  const getStarCount = () => {
    const evaluation = localOption.evaluation;
    return Object.values(evaluation).filter(value => value === true).length;
  };

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

  const questions = [
    { key: 'favorableTravel' as const, label: 'Is the mode of travel favorable?' },
    { key: 'destinationSafe' as const, label: 'Is the destination safe?' },
    { key: 'excitingOption' as const, label: 'Does this option excite you?' },
    { key: 'everyoneEnjoy' as const, label: 'Will everyone enjoy it?' },
    { key: 'memorable' as const, label: 'Memorable?' }
  ];

  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">Vacation Option</CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex">
              {renderStars()}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
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
              value={localOption.travelMode}
              onChange={(e) => updateField('travelMode', e.target.value)}
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
              value={localOption.estimatedCost || ''}
              onChange={(e) => updateField('estimatedCost', parseFloat(e.target.value) || 0)}
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
                  variant={localOption.evaluation[question.key] === true ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateEvaluation(question.key, true)}
                >
                  Yes
                </Button>
                <Button
                  variant={localOption.evaluation[question.key] === false ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => updateEvaluation(question.key, false)}
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
};

const Vacation: React.FC = () => {
  const [options, setOptions] = useState<VacationOption[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('My Vacation');
  const [projects, setProjects] = useState<string[]>(['My Vacation']);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  
  const { user } = useAuth();
  const { currency } = useCurrency();
  const { toast } = useToast();
  const { earnBadge } = useBadges();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, selectedProject]);

  useEffect(() => {
    if (user && options.length > 0) {
      const timeoutId = setTimeout(() => {
        saveData();
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [options, user]);

  const loadData = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('budget_data')
      .select('*')
      .eq('user_id', user.id)
      .eq('page_type', 'vacation')
      .eq('calculator_id', selectedProject)
      .order('created_at', { ascending: false });

    if (data && data.length > 0) {
      const budgetData = data[0];
      const optionsData = budgetData.expenses as any;
      if (optionsData.options) {
        setOptions(optionsData.options);
      }
    } else {
      setOptions([]);
    }

    const { data: allData } = await supabase
      .from('budget_data')
      .select('calculator_id')
      .eq('user_id', user.id)
      .eq('page_type', 'vacation');

    if (allData) {
      const uniqueProjects = [...new Set(allData.map(item => item.calculator_id))];
      let projectList = uniqueProjects.length > 0 ? uniqueProjects : ['My Vacation'];
      
      // Ensure "My Vacation" is always included for authenticated users
      if (!projectList.includes('My Vacation')) {
        projectList = ['My Vacation', ...projectList];
      }
      
      setProjects(projectList);
      
      if (!selectedProject && projectList.length > 0) {
        setSelectedProject(projectList[0]);
      }
    }
  };

  const saveData = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('budget_data')
      .upsert({
        user_id: user.id,
        page_type: 'vacation',
        calculator_id: selectedProject,
        income: 0,
        expenses: { options } as any
      });

    if (error) {
      console.error('Error saving data:', error);
    } else {
      earnBadge('vacation');
    }
  };

  const addVacationCard = () => {
    const newOption: VacationOption = {
      id: Date.now().toString(),
      destination: '',
      travelMode: '',
      estimatedCost: 0,
      notes: '',
      contact: '',
      evaluation: {
        favorableTravel: false,
        destinationSafe: false,
        excitingOption: false,
        everyoneEnjoy: false,
        memorable: false
      }
    };
    setOptions([...options, newOption]);
  };

  const updateVacationCard = (updatedOption: VacationOption) => {
    setOptions(options.map(option => 
      option.id === updatedOption.id ? updatedOption : option
    ));
  };

  const removeVacationCard = (id: string) => {
    setOptions(options.filter(option => option.id !== id));
  };

  const createNewProject = async () => {
    if (newProjectName.trim()) {
      const newProjects = [...projects, newProjectName.trim()];
      setProjects(newProjects);
      setSelectedProject(newProjectName.trim());
      setNewProjectName('');
      setIsCreatingProject(false);
      
      const newOption: VacationOption = {
        id: Date.now().toString(),
        destination: '',
        travelMode: '',
        estimatedCost: 0,
        notes: '',
        contact: '',
        evaluation: {
          favorableTravel: false,
          destinationSafe: false,
          excitingOption: false,
          everyoneEnjoy: false,
          memorable: false
        }
      };
      
      setOptions([newOption]);
      
      if (user) {
        const { error } = await supabase
          .from('budget_data')
          .upsert({
            user_id: user.id,
            page_type: 'vacation',
            calculator_id: newProjectName.trim(),
            income: 0,
            expenses: { options: [newOption] } as any
          });

        if (error) {
          console.error('Error saving new vacation project:', error);
        }
      }
    }
  };

  const startEditingProject = (projectId: string) => {
    setEditingProjectId(projectId);
    setEditingTitle(projectId);
  };

  const updateProjectTitle = async (oldTitle: string, newTitle: string) => {
    if (!newTitle.trim() || newTitle === oldTitle) {
      setEditingProjectId(null);
      return;
    }

    try {
      const updatedProjects = projects.map(p => p === oldTitle ? newTitle.trim() : p);
      setProjects(updatedProjects);
      
      if (selectedProject === oldTitle) {
        setSelectedProject(newTitle.trim());
      }

      if (user) {
        const { error } = await supabase
          .from('budget_data')
          .update({ calculator_id: newTitle.trim() })
          .eq('user_id', user.id)
          .eq('page_type', 'vacation')
          .eq('calculator_id', oldTitle);

        if (error) throw error;
      }
      
      setEditingProjectId(null);
      setEditingTitle('');
    } catch (error) {
      console.error('Error updating project title:', error);
      setEditingProjectId(null);
    }
  };

  const deleteProject = async (projectToDelete: string) => {
    console.log('Delete project called with:', projectToDelete);
    console.log('Current projects:', projects);
    console.log('Projects length:', projects.length);
    
    if (projects.length <= 1) {
      console.log('Cannot delete - only one project left');
      return; // Don't delete the last project
    }
    
    try {
      console.log('Proceeding with deletion...');
      // Remove from projects array
      const updatedProjects = projects.filter(p => p !== projectToDelete);
      console.log('Updated projects after filter:', updatedProjects);
      setProjects(updatedProjects);
      
      // If we're deleting the currently selected project, switch to another one
      if (selectedProject === projectToDelete) {
        console.log('Switching selected project to:', updatedProjects[0]);
        setSelectedProject(updatedProjects[0]);
      }
      
      // Remove from database if user is logged in
      if (user) {
        console.log('Deleting from database for user:', user.id);
        const { error } = await supabase
          .from('budget_data')
          .delete()
          .eq('user_id', user.id)
          .eq('page_type', 'vacation')
          .eq('calculator_id', projectToDelete);
          
        if (error) throw error;
        console.log('Database deletion successful');
      }
      
      // Clear options if we deleted the currently selected project
      if (selectedProject === projectToDelete) {
        console.log('Clearing options for deleted project');
        setOptions([]);
      }
      
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const getLowestCost = () => {
    if (options.length === 0) return 0;
    return Math.min(...options.map(option => option.estimatedCost || Infinity));
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
              {projects.map((project) => (
                <div key={project} className="flex items-center gap-1">
                  {editingProjectId === project ? (
                    <div className="flex items-center gap-1">
                      <Input
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        className="h-8 w-32 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') updateProjectTitle(project, editingTitle);
                          if (e.key === 'Escape') setEditingProjectId(null);
                        }}
                        onBlur={() => updateProjectTitle(project, editingTitle)}
                        autoFocus
                      />
                      <Button size="sm" variant="ghost" onClick={() => updateProjectTitle(project, editingTitle)} className="h-8 w-8 p-0">
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingProjectId(null)} className="h-8 w-8 p-0">
                        <X className="h-3 w-3" />
                      </Button>
                      {projects.length > 1 && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => {
                            console.log('Delete button clicked!');
                            alert('Delete button clicked for: ' + project);
                            deleteProject(project);
                            setEditingProjectId(null);
                          }}
                          className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/20"
                          title="Delete project"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <div className="relative group">
                        <Button
                          variant={selectedProject === project ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedProject(project)}
                          className="pr-8"
                        >
                          {project}
                        </Button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditingProject(project);
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
                    onBlur={() => {
                      if (newProjectName.trim()) {
                        createNewProject();
                      } else {
                        setIsCreatingProject(false);
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
          </div>

          {selectedProject && options.length > 0 && (
            <div className="text-sm text-muted-foreground mb-4">
              Lowest estimate: {currency.symbol}{getLowestCost().toFixed(2)}
            </div>
          )}
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid gap-6">
            {options.map((option) => (
              <VacationCard
                key={option.id}
                option={option}
                onUpdate={updateVacationCard}
                onRemove={() => removeVacationCard(option.id)}
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

          {!isCreatingProject && options.length === 0 && selectedProject && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No vacation options for "{selectedProject}" yet. Click the + button to add your first option!
              </p>
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