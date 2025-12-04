import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CalendarDays, Gift } from 'lucide-react';
import { format } from 'date-fns';

interface EventAlertDialogProps {
  open: boolean;
  onDismiss: () => void;
  listTitle: string;
  eventDate: Date;
}

export function EventAlertDialog({ open, onDismiss, listTitle, eventDate }: EventAlertDialogProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-teal to-teal/60 rounded-full flex items-center justify-center">
                <CalendarDays className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
                <Gift className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
          <AlertDialogTitle className="text-center text-xl">
            One Week Reminder! 🎁
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center space-y-2">
            <p className="text-base">
              <span className="font-semibold text-foreground">{listTitle}</span> is coming up in just one week!
            </p>
            <p className="text-sm">
              Event date: <span className="font-medium">{format(eventDate, 'PPPP')}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Make sure you've got all your gifts ready!
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogAction 
            onClick={onDismiss}
            className="bg-teal hover:bg-teal/90 text-white px-8"
          >
            Got it!
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}