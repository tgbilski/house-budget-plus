 import React, { useState, useRef, useEffect, useCallback } from 'react';
 import { MapPin, Search, Loader2, X } from 'lucide-react';
 import { Input } from '@/components/ui/input';
 import { cn } from '@/lib/utils';
 import { supabase } from '@/integrations/supabase/client';
 
 interface PlaceResult {
   id: string;
   place_name: string;
   center: [number, number]; // [lng, lat]
   text: string;
 }
 
 interface PlaceSearchInputProps {
   value: string;
   onSelect: (place: { name: string; lat: number; lng: number }) => void;
   onChange: (value: string) => void;
   placeholder?: string;
   className?: string;
 }
 
 // Use edge function for geocoding to keep token secure
 
 export const PlaceSearchInput: React.FC<PlaceSearchInputProps> = ({
   value,
   onSelect,
   onChange,
   placeholder = "Search destinations...",
   className
 }) => {
   const [query, setQuery] = useState(value);
   const [results, setResults] = useState<PlaceResult[]>([]);
   const [isOpen, setIsOpen] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const [selectedIndex, setSelectedIndex] = useState(-1);
   const inputRef = useRef<HTMLInputElement>(null);
   const dropdownRef = useRef<HTMLDivElement>(null);
   const debounceRef = useRef<NodeJS.Timeout>();
 
   // Update local query when value prop changes
   useEffect(() => {
     setQuery(value);
   }, [value]);
 
   const searchPlaces = useCallback(async (searchQuery: string) => {
     if (!searchQuery || searchQuery.length < 2) {
       setResults([]);
       return;
     }
 
     setIsLoading(true);
     try {
       const { data, error } = await supabase.functions.invoke('geocode-places', {
         body: { query: searchQuery }
       });
 
       if (error) {
         console.error('Geocoding error:', error);
         return;
       }
 
       if (data?.features) {
         setResults(data.features.map((f: any) => ({
           id: f.id,
           place_name: f.place_name,
           center: f.center,
           text: f.text
         })));
         setIsOpen(true);
       }
     } catch (error) {
       console.error('Error searching places:', error);
     } finally {
       setIsLoading(false);
     }
   }, []);
 
   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const newValue = e.target.value;
     setQuery(newValue);
     onChange(newValue);
     setSelectedIndex(-1);
 
     // Debounce search
     if (debounceRef.current) {
       clearTimeout(debounceRef.current);
     }
     debounceRef.current = setTimeout(() => {
       searchPlaces(newValue);
     }, 300);
   };
 
   const handleSelect = (result: PlaceResult) => {
     setQuery(result.text);
     onChange(result.text);
     onSelect({
       name: result.text,
       lng: result.center[0],
       lat: result.center[1]
     });
     setIsOpen(false);
     setResults([]);
   };
 
   const handleKeyDown = (e: React.KeyboardEvent) => {
     if (!isOpen || results.length === 0) return;
 
     switch (e.key) {
       case 'ArrowDown':
         e.preventDefault();
         setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
         break;
       case 'ArrowUp':
         e.preventDefault();
         setSelectedIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
         break;
       case 'Enter':
         e.preventDefault();
         if (selectedIndex >= 0 && results[selectedIndex]) {
           handleSelect(results[selectedIndex]);
         }
         break;
       case 'Escape':
         setIsOpen(false);
         break;
     }
   };
 
   const handleClear = () => {
     setQuery('');
     onChange('');
     onSelect({ name: '', lat: 0, lng: 0 });
     setResults([]);
     inputRef.current?.focus();
   };
 
   // Close dropdown on click outside
   useEffect(() => {
     const handleClickOutside = (e: MouseEvent) => {
       if (
         dropdownRef.current && 
         !dropdownRef.current.contains(e.target as Node) &&
         !inputRef.current?.contains(e.target as Node)
       ) {
         setIsOpen(false);
       }
     };
 
     document.addEventListener('mousedown', handleClickOutside);
     return () => document.removeEventListener('mousedown', handleClickOutside);
   }, []);
 
   return (
     <div className={cn("relative", className)}>
       <div className="relative">
         <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
         <Input
           ref={inputRef}
           value={query}
           onChange={handleInputChange}
           onKeyDown={handleKeyDown}
           onFocus={() => results.length > 0 && setIsOpen(true)}
           placeholder={placeholder}
           className={cn("pl-9 pr-8 h-10", className)}
         />
         {isLoading && (
           <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
         )}
         {!isLoading && query && (
           <button
             type="button"
             onClick={handleClear}
             className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
           >
             <X className="h-4 w-4" />
           </button>
         )}
       </div>
 
       {/* Dropdown results */}
       {isOpen && results.length > 0 && (
         <div
           ref={dropdownRef}
           className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden"
         >
           {results.map((result, index) => (
             <button
               key={result.id}
               type="button"
               onClick={() => handleSelect(result)}
               className={cn(
                 "w-full px-3 py-2.5 text-left flex items-start gap-2.5 hover:bg-accent transition-colors",
                 index === selectedIndex && "bg-accent"
               )}
             >
               <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
               <div className="min-w-0">
                 <div className="font-medium text-sm truncate">{result.text}</div>
                 <div className="text-xs text-muted-foreground truncate">
                   {result.place_name}
                 </div>
               </div>
             </button>
           ))}
         </div>
       )}
     </div>
   );
 };