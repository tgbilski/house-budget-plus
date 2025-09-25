// src/components/GiftCard.tsx (Updated)
import React, from 'react';
// ... (Keep all your existing imports: Card, Input, Button, etc.)
import { useGiftItems } from '@/hooks/useGiftItems';
import { GiftItem } from './GiftItem';

// ... (Interfaces remain the same)

interface GiftCardProps {
  initialData?: GiftListData;
  onSave?: () => void;
}

// REMOVED the 'onDelete' prop as it's no longer needed
export function GiftCard({ initialData, onSave }: GiftCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  // REMOVED isEditingTitle state
  const [listData, setListData] = useState<GiftListData>({ ...initialData });
  const [showNewItem, setShowNewItem] = useState(false);

  // Use our custom hook to manage the gift items
  const { items, refetchItems, deleteItem } = useGiftItems(listData.id);

  useEffect(() => {
    if (initialData) {
      setListData({ ...initialData });
      setShowNewItem(false);
    }
  }, [initialData]);

  // REMOVED saveListTitle and handleDeleteList functions. They are no longer this component's responsibility.

  // The saveBudgetTarget function remains the same
  const saveBudgetTarget = async (budgetTarget: number) => {
    // ... (This function's code does not need to change)
  };

  const totalSpent = items.reduce((sum, item) => sum + (item.price || 0), 0);
  const budgetTarget = listData.budget_target || 0;
  // ... (Budget calculation logic is the same)

  return (
    <Card className="w-full bg-white border-gray-200 text-gray-900 shadow-lg">
      <CardHeader className="pb-4">
        {/* The title is now just a simple, non-editable header */}
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          {listData.list_title} - Gift Ideas
        </h2>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* The budget tracking section remains exactly the same */}
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
          {/* ... (All your budget JSX here) ... */}
        </div>

        {/* The gift item mapping and "Add Gift Idea" button remain exactly the same */}
        {items.map((item) => (
          <GiftItem
            key={item.id}
            item={item}
            listId={listData.id!}
            onSave={refetchItems}
            onDelete={() => deleteItem(item.id)}
          />
        ))}

        {showNewItem && listData.id && (
          <GiftItem
            listId={listData.id}
            onSave={() => {
              setShowNewItem(false);
              refetchItems();
            }}
            isNew
          />
        )}

        {listData.id && !showNewItem && (
          <Button
            onClick={() => setShowNewItem(true)}
            variant="outline"
            className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Gift Idea
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
