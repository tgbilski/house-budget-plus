import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const WarningBanner: React.FC = () => {
  const { user } = useAuth();

  if (user) return null;

  return (
    <Alert className="mb-6 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
      <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      <AlertDescription className="text-yellow-800 dark:text-yellow-200">
        <strong>Try it out!</strong> You're using this tool in demo mode. 
        <Link to="/auth" className="underline font-medium ml-1 hover:text-yellow-900 dark:hover:text-yellow-100">
          Sign in to save your progress
        </Link> and access all features.
      </AlertDescription>
    </Alert>
  );
};