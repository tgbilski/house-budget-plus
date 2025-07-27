import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit3, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/components/BudgetApp';
import { supabase } from '@/integrations/supabase/client';

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
      setProjects(uniqueProjects.length > 0 ? uniqueProjects : ['default']);
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

  const createNewProject = () => {
    if (newProjectName.trim()) {
      const newProjects = [...projects, newProjectName.trim()];
      setProjects(newProjects);
      setSelectedProject(newProjectName.trim());
      setNewProjectName('');
      setIsCreatingProject(false);
      
      // Add first vacation card to new project
      setTimeout(() => {
        addVacationCard();
      }, 100);
    }
  };

  const updateProjectName = () => {
    if (editProjectName.trim() && editProjectName.trim() !== selectedProject) {
      const updatedProjects = projects.map(project => 
        project === selectedProject ? editProjectName.trim() : project
      );
      setProjects(updatedProjects);
      setSelectedProject(editProjectName.trim());
    }
    setIsEditingProjectName(false);
    setEditProjectName('');
  };

  const getLowestCost = () => {
    if (options.length === 0) return 0;
    return Math.min(...options.map(option => option.estimatedCost || Infinity));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Vacation Planning</h1>
          <p className="text-muted-foreground mb-6">
            Compare vacation options and find your perfect getaway
          </p>
          
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
              
              {!isCreatingProject && projects.length > 0 && (
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select vacation" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-background border shadow-lg">
                    {projects.map((project) => (
                      <SelectItem key={project} value={project}>
                        {project}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
      </div>
    </div>
  );
};

export default Vacation;