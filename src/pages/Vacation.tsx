import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit3, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { vacationPlanningFAQs } from '@/utils/faqData';

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
  const [selectedProject, setSelectedProject] = useState<string>('default');
  const [projects, setProjects] = useState<string[]>(['default']);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [isEditingProjectName, setIsEditingProjectName] = useState(false);
  const [editProjectName, setEditProjectName] = useState('');
  
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

    // Load all projects
    const { data: allData } = await supabase
      .from('budget_data')
      .select('calculator_id')
      .eq('user_id', user.id)
      .eq('page_type', 'vacation');

    if (allData) {
      const uniqueProjects = [...new Set(allData.map(item => item.calculator_id))];
      const projectList = uniqueProjects.length > 0 ? uniqueProjects : ['default'];
      setProjects(projectList);
      
      // Set default selected project if none is selected
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
      // Award badge when user actually saves vacation data
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
      
      // Create a new vacation option for the new project
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
      
      // Save to database immediately if user is logged in
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

  const updateProjectName = async () => {
    if (editProjectName.trim() && editProjectName.trim() !== selectedProject) {
      // Update projects locally
      const updatedProjects = projects.map(project => 
        project === selectedProject ? editProjectName.trim() : project
      );
      setProjects(updatedProjects);
      
      // Update database if user is logged in
      if (user) {
        const { error } = await supabase
          .from('budget_data')
          .update({ calculator_id: editProjectName.trim() })
          .eq('user_id', user.id)
          .eq('page_type', 'vacation')
          .eq('calculator_id', selectedProject);
          
        if (error) {
          console.error('Error updating vacation name:', error);
          toast({
            title: "Error",
            description: "Failed to update vacation name. Please try again.",
            variant: "destructive",
          });
          return;
        }
      }
      
      setSelectedProject(editProjectName.trim());
      
      toast({
        title: "Vacation renamed",
        description: `Vacation renamed to "${editProjectName.trim()}" successfully.`,
      });
    }
    setIsEditingProjectName(false);
    setEditProjectName('');
  };

  const deleteCurrentProject = async () => {
    if (!user) {
      return;
    }
    
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete the vacation "${selectedProject}"? This action cannot be undone.`)) {
      return;
    }
    
    // Store project name for toast
    const deletedProjectName = selectedProject;
    
    // Delete all data for this project
    const { error } = await supabase
      .from('budget_data')
      .delete()
      .eq('user_id', user.id)
      .eq('page_type', 'vacation')
      .eq('calculator_id', selectedProject);

    if (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: "Failed to delete vacation project. Please try again.",
        variant: "destructive",
      });
      return;
    }

    // Update local state
    const updatedProjects = projects.filter(project => project !== selectedProject);
    setProjects(updatedProjects);
    
    // Select first remaining project or default
    const newSelectedProject = updatedProjects.length > 0 ? updatedProjects[0] : 'default';
    setSelectedProject(newSelectedProject);
    
    // Clear current options
    setOptions([]);

    // Show success toast
    toast({
      title: "Vacation deleted",
      description: `"${deletedProjectName}" has been successfully deleted.`,
    });
  };

  const getLowestCost = () => {
    if (options.length === 0) return 0;
    return Math.min(...options.map(option => option.estimatedCost || Infinity));
  };

  return (
    <div className="min-h-screen">
      <SEO {...seoData.vacation} />
      <Breadcrumbs />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <img 
              src="/lovable-uploads/ed809955-ef71-4d81-b072-945082f4380a.png" 
              alt="Calculator mascot" 
              className="w-16 h-16 object-contain"
            />
            <h1 className="text-3xl font-bold text-foreground">Vacation Planning</h1>
          </div>
          <p className="text-muted-foreground text-lg mb-4">
            Plan and compare vacation options within your budget
          </p>
          <div className="flex justify-center mb-6">
            <SocialShare 
              title="Vacation Planning & Budget Tool"
              description="Compare vacation destinations and costs. Plan your perfect trip within budget with our comparison tool."
            />
          </div>
          
          {/* Project Management */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between max-w-6xl mx-auto">            
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <Button 
                onClick={() => setIsCreatingProject(true)}
                className="whitespace-nowrap bg-accent hover:bg-accent-hover text-accent-foreground"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Vacation
              </Button>
              
              {!isCreatingProject && projects.filter(p => p !== 'default').length > 0 && (
                <div className="flex items-center gap-2">
                  {isEditingProjectName ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editProjectName}
                        onChange={(e) => setEditProjectName(e.target.value)}
                        className="w-[200px]"
                        onKeyPress={(e) => e.key === 'Enter' && updateProjectName()}
                        autoFocus
                      />
                      <Button size="sm" onClick={updateProjectName}>Save</Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          setIsEditingProjectName(false);
                          setEditProjectName('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                       <Select value={selectedProject} onValueChange={setSelectedProject}>
                         <SelectTrigger className="w-[200px]">
                           <SelectValue placeholder="Select vacation">
                             {selectedProject && selectedProject !== 'default' ? selectedProject : "Select vacation"}
                           </SelectValue>
                         </SelectTrigger>
                         <SelectContent className="z-50 bg-background border shadow-lg">
                           {projects.filter(project => project !== 'default').map((project) => (
                             <SelectItem key={project} value={project}>
                               {project}
                             </SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setIsEditingProjectName(true);
                          setEditProjectName(selectedProject);
                        }}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={deleteCurrentProject}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
            
            {!isCreatingProject && options.length > 0 && (
              <div className="text-sm text-muted-foreground">
                Lowest estimate: {currency.symbol}{getLowestCost().toFixed(2)}
              </div>
            )}
          </div>

          {/* Project Creation */}
          {isCreatingProject && (
            <div className="max-w-6xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Vacation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="Enter vacation name"
                      onKeyPress={(e) => e.key === 'Enter' && createNewProject()}
                      autoFocus
                    />
                    <Button onClick={createNewProject}>Create</Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsCreatingProject(false);
                        setNewProjectName('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Vacation Options */}
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

          {/* Add New Option Button - Only show when project is selected and not creating */}
          {!isCreatingProject && selectedProject && selectedProject !== 'default' && (
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

          {/* Empty States */}
          {!isCreatingProject && options.length === 0 && selectedProject && selectedProject !== 'default' && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No vacation options for "{selectedProject}" yet. Click the + button to add your first option!
              </p>
            </div>
          )}
          
          {((!selectedProject || selectedProject === 'default') && !isCreatingProject && options.length === 0) && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Click "New Vacation" above to create your first vacation comparison!
              </p>
            </div>
          )}
        </div>


        <FAQ faqs={vacationPlanningFAQs} />
        <InternalLinks currentPage="/vacation" category="planning" />
      </div>
    </div>
  );
};

export default Vacation;