// GiftCard.tsx (Refactored Version)
import React, { useState, useEffect } from 'react';
// ... other imports
import { useGiftItems } from '@/hooks/useGiftItems'; // Import the new hook
import { GiftItem } from './GiftItem';

// ... (Interfaces remain the same)

export function GiftCard({ initialData, onDelete, onSave }: GiftCardProps) {
  // --- All the logic for the LIST itself remains for now ---
  const { user } = useAuth();
  const { currentHousehold } = useHouseholdContext();
  const { toast } = useToast();
  const [isEditingTitle, setIsEditingTitle] = useState(!initialData?.id);
  const [listData, setListData] = useState<GiftListData>({ /* ... */ });
  const [showNewItem, setShowNewItem] = useState(false);

  // --- HERE'S THE CHANGE: Use our new hook for the items ---
  const { items, refetchItems, deleteItem } = useGiftItems(listData.id);

  // This useEffect hook simplifies greatly
  useEffect(() => {
    if (initialData) {
      setListData({
        list_title: initialData.list_title || 'Holiday Gifts',
        ...initialData
      });
      setIsEditingTitle(!initialData.id);
      setShowNewItem(false);
    }
  }, [initialData]);

  // The 'loadGiftItems' function and its useEffect are now GONE from this component.

  // ... (All other functions like saveBudgetTarget, saveListTitle, handleDeleteList remain unchanged for now)

  // This local delete handler is no longer needed. The hook handles it.
  // const handleDeleteItem = (itemId: string) => { ... };

  // The total calculation now uses 'items' from our hook
  const totalSpent = items.reduce((sum, item) => sum + (item.price || 0), 0);
  
  return (
    <Card>
      {/* ... CardHeader and Budget sections are mostly the same ... */}
      <CardContent>
        {/* ... */}
        {/* Existing gift items - now using 'items' from the hook */}
        {items.map((item) => (
          <GiftItem
            key={item.id}
            item={item}
            listId={listData.id!}
            onSave={refetchItems} // Tell the hook to refetch after a save
            onDelete={() => deleteItem(item.id)} // Tell the hook to delete
          />
        ))}

        {/* New gift item form */}
        {showNewItem && listData.id && (
          <GiftItem
            listId={listData.id}
            onSave={() => {
              setShowNewItem(false);
              refetchItems(); // Tell the hook to refetch after adding
            }}
            isNew
          />
        )}
        {/* ... Rest of the JSX ... */}
      </CardContent>
    </Card>
  );
}
