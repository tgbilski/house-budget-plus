import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const searchablePages = [
  { title: 'Monthly Budget Calculator', path: '/budget', keywords: ['budget', 'income', 'expenses', 'calculator'] },
  { title: 'Savings Goals', path: '/savings', keywords: ['savings', 'goals', 'tracker', 'progress'] },
  { title: 'Compare Vendors', path: '/compare-prices', keywords: ['vendors', 'contractors', 'compare', 'quotes'] },
  { title: 'Vacation Planner', path: '/vacation', keywords: ['vacation', 'travel', 'trip', 'planner'] },
  { title: 'Gift Lists', path: '/gifts', keywords: ['gifts', 'presents', 'occasions', 'shopping'] },
  { title: 'Marketplace', path: '/marketplace', keywords: ['marketplace', 'vendors', 'rentals', 'community'] },
  { title: 'AI Financial Advisor', path: '/ai-insights', keywords: ['ai', 'insights', 'advice', 'assistant'] },
  { title: 'Blog', path: '/blog', keywords: ['blog', 'articles', 'tips', 'guides'] },
  { title: 'Settings', path: '/settings', keywords: ['settings', 'profile', 'account', 'preferences'] },
];

export const GlobalSearch: React.FC = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-9 p-0 xl:h-10 xl:w-64 xl:justify-start xl:px-3 xl:py-2"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 xl:mr-2" aria-hidden="true" />
        <span className="hidden xl:inline-flex">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search pages..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Pages">
            {searchablePages.map((page) => (
              <CommandItem
                key={page.path}
                onSelect={() => handleSelect(page.path)}
                className="cursor-pointer"
              >
                <Search className="mr-2 h-4 w-4" />
                <span>{page.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};
