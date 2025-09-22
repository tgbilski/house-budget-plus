import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useYear } from '@/hooks/useYear';
import { useHouseholdContext } from '@/providers/HouseholdProvider';
import { supabase } from '@/integrations/supabase/client';

interface VendorProject {
  id: string;
  title: string;
  project_number?: number;
  // add other fields as needed
  year: number;
}

const CompareVendors: React.FC = () => {
  const { user } = useAuth();
  const { currentHousehold } = useHouseholdContext();
  const { selectedYear } = useYear();

  const [projects, setProjects] = useState<VendorProject[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load vendor projects for the selected year
  const loadProjects = async () => {
    setError(null);
    if (!user || !currentHousehold) return;
    const { data, error } = await supabase
      .from('vendor_projects')
      .select('*')
      .eq('user_id', user.id)
      .eq('household_id', currentHousehold.id)
      .eq('year', selectedYear);
    if (error) setError(error.message);
    else setProjects(data || []);
  };

  useEffect(() => {
    loadProjects();
    // eslint-disable-next-line
  }, [user, currentHousehold, selectedYear]);

  // Example: Add a vendor project
  const addProject = async (project: Partial<VendorProject>) => {
    if (!user || !currentHousehold) return;
    const { error } = await supabase
      .from('vendor_projects')
      .insert([{ ...project, user_id: user.id, household_id: currentHousehold.id, year: selectedYear }]);
    if (error) setError(error.message);
    else loadProjects();
  };

  // Example: Update a vendor project
  const updateProject = async (id: string, updates: Partial<VendorProject>) => {
    const { error } = await supabase
      .from('vendor_projects')
      .update({ ...updates, year: selectedYear })
      .eq('id', id);
    if (error) setError(error.message);
    else loadProjects();
  };

  return (
    <div>
      <h1>Vendor Projects - {selectedYear}</h1>
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      <ul>
        {projects.map((p) => (
          <li key={p.id}>
            {p.title} (Project #{p.project_number ?? 'N/A'})
            {/* Example update button:
            <button onClick={() => updateProject(p.id, { title: "New Title" })}>Update</button>
            */}
          </li>
        ))}
      </ul>
      {/* Example add project button:
      <button onClick={() => addProject({ title: "Vendor Example", project_number: 123 })}>Add Project</button>
      */}
    </div>
  );
};

export default CompareVendors;
