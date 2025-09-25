// src/components/GiftCardDisplay.tsx
import React from 'react';
import { GiftCard } from '@/components/GiftCard';

// Define the shape of the data it expects
interface GiftListData {
  id: string;
  list_title: string;
  // This allows any other properties to be passed through to GiftCard
  [key: string]: any; 
}

interface GiftCardDisplayProps {
  selectedList: GiftListData | null;
  onSave: () => void;
}

export function GiftCardDisplay({ selectedList, onSave }: GiftCardDisplayProps) {
  // If no list is selected, this component renders nothing.
  if (!selectedList) {
    return null;
  }

  // When a list IS selected, it renders your main GiftCard component
  // and passes the necessary data down to it.
  return (
      <GiftCard
        initialData={selectedList}
      />
  );
}
