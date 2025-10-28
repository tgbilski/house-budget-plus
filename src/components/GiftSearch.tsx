import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface GiftSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export const GiftSearch: React.FC<GiftSearchProps> = ({ value, onChange }) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search gifts..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
};
