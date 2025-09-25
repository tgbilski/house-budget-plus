// src/components/GiftListSelector.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Gift, Edit3, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Define the shape of a single gift list item for the props
interface GiftListData {
  id: string;
  list_title: string;
  year: number;
}

// Define the props this component will accept from the main page
interface GiftListSelectorProps {
  giftLists: GiftListData[];
  selectedList: GiftListData | null;
  editingListId: string | null;
  editingTitle: string;
  onSelectList: (list: GiftListData) => void;
  onStartEditing: (list: GiftListData) => void;
  onSaveTitle: (list: GiftListData) => void;
  onCancelEditing: () => void;
  onSetEditingTitle: (title: string) => void;
}

export function GiftListSelector({
  giftLists,
  selectedList,
  editingListId,
  editingTitle,
  onSelectList,
  onStartEditing,
  onSaveTitle,
  onCancelEditing,
  onSetEditingTitle,
}: GiftListSelectorProps) {
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="space-y-2">
          {giftLists.map((list) => (
            <div key={list.id} className="w-full">
              <div
                className={cn(
                  "group relative cursor-pointer transition-all w-full",
                  selectedList?.id === list.id ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80",
                  "rounded-lg px-4 py-3 border-2",
                  selectedList?.id === list.id && "border-primary",
                  "flex items-center justify-between"
                )}
                onClick={() => onSelectList(list)}
              >
                <div className="flex items-center gap-3">
                  <Gift className="h-5 w-5" />
                  {editingListId === list.id ? (
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Input
                        value={editingTitle}
                        onChange={(e) => onSetEditingTitle(e.target.value)}
                        className="h-8 text-sm text-gray-900 bg-white"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') onSaveTitle(list);
                          if (e.key === 'Escape') onCancelEditing();
                        }}
                        autoFocus
                      />
                      <Button size="sm" onClick={() => onSaveTitle(list)}>
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={onCancelEditing}
                        className="bg-white text-gray-700 hover:bg-gray-100"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="font-medium">{list.list_title}</span>
                      <Badge variant="secondary" className="ml-2">{list.year}</Badge>
                    </>
                  )}
                </div>
                {editingListId !== list.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); onStartEditing(list); }}
                    className={cn(
                      "h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity",
                      selectedList?.id === list.id && "text-primary-foreground hover:text-primary-foreground"
                    )}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
