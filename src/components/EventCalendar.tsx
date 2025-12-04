import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, X } from 'lucide-react';
import { format, differenceInDays, isBefore, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';

interface EventCalendarProps {
  eventDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  listTitle: string;
  disabled?: boolean;
}

export function EventCalendar({ eventDate, onDateSelect, listTitle, disabled }: EventCalendarProps) {
  const today = startOfDay(new Date());
  const daysUntil = eventDate ? differenceInDays(startOfDay(eventDate), today) : null;
  const isPast = eventDate ? isBefore(startOfDay(eventDate), today) : false;

  const getCountdownText = () => {
    if (daysUntil === null) return null;
    if (isPast) return 'Event has passed';
    if (daysUntil === 0) return "Today's the day!";
    if (daysUntil === 1) return '1 day away';
    return `${daysUntil} days away`;
  };

  const getCountdownColor = () => {
    if (daysUntil === null) return '';
    if (isPast) return 'text-muted-foreground';
    if (daysUntil <= 3) return 'text-red-500';
    if (daysUntil <= 7) return 'text-amber-500';
    return 'text-teal';
  };

  return (
    <Card className="bg-card border-border shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarDays className="h-5 w-5 text-teal" />
          Event Date
        </CardTitle>
        {eventDate && (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {listTitle} on {format(eventDate, 'PPP')}
            </p>
            <div className={cn("flex items-center gap-1.5 text-sm font-medium", getCountdownColor())}>
              <Clock className="h-4 w-4" />
              {getCountdownText()}
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <Calendar
          mode="single"
          selected={eventDate}
          onSelect={onDateSelect}
          disabled={disabled}
          className={cn("p-3 pointer-events-auto rounded-md border")}
          initialFocus
        />
        {eventDate && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2 text-muted-foreground hover:text-destructive"
            onClick={() => onDateSelect(undefined)}
            disabled={disabled}
          >
            <X className="h-4 w-4 mr-1" />
            Clear Date
          </Button>
        )}
      </CardContent>
    </Card>
  );
}