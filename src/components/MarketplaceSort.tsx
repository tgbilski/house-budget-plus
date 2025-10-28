import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpDown } from 'lucide-react';

export type SortOption = 'newest' | 'oldest' | 'price-low' | 'price-high' | 'name-az' | 'name-za';

interface MarketplaceSortProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export const MarketplaceSort: React.FC<MarketplaceSortProps> = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
      <Select value={value} onValueChange={(v) => onChange(v as SortOption)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest First</SelectItem>
          <SelectItem value="oldest">Oldest First</SelectItem>
          <SelectItem value="name-az">Name (A-Z)</SelectItem>
          <SelectItem value="name-za">Name (Z-A)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
