import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Calendar, CalendarDays, CalendarClock, PartyPopper, Users, MoreHorizontal } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { SelectEvent } from '@/lib/db';
import { deleteEvent } from './actions';
import Link from 'next/link';
import { exportParticipants } from './actions';

export function Event({
  event
}: {
  event: SelectEvent & { totalParticipant: number, participantArrived: number };
}) {
  return (
    <TableRow className="" dir='rtl'>
      <TableCell className="hidden sm:table-cell  object-right">
        {event.imageUrl ? (
          <Image
            alt="תמונת אירוע"
            className="aspect-square rounded-xl object-cover"
            height="64"
            src={event.imageUrl}
            width="64"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-xl border">
            <PartyPopper className="h-8 w-8 text-gray-400" />
          </div>
        )}
      </TableCell>
      <TableCell className="font-medium text-right">
        <Link href={`/${event.id}`} className="hover:underline">
          {event.name}
        </Link>
      </TableCell>
      <TableCell className="hidden md:table-cell text-right">
        {event.eventDate
          ? new Date(event.eventDate).toDateString()
          : 'אין תאריך'}
      </TableCell>
      <TableCell className="text-right">
        <Badge 
          variant={
            event.eventDate
              ? new Date().setHours(0,0,0,0) === new Date(event.eventDate).setHours(0,0,0,0)
                ? 'destructive'    // Blue for ongoing events
                : new Date().setHours(0,0,0,0) > new Date(event.eventDate).setHours(0,0,0,0)
                  ? 'secondary'  // Gray for past events
                  : 'default'    // Changed from 'success' to 'default' for future events
              : 'outline'        // Default outline for planned events
          } 
          className="capitalize"
        >
          {event.eventDate
            ? new Date().setHours(0,0,0,0) === new Date(event.eventDate).setHours(0,0,0,0)
              ? 'מתקיים'
              : new Date().setHours(0,0,0,0) > new Date(event.eventDate).setHours(0,0,0,0)
                ? 'עבר'
                : 'עתידי'
            : 'מתוכנן'}
        </Badge>
      </TableCell>

      <TableCell className="hidden md:table-cell text-right">
        <span className="text-center px-10 text-md">{event.totalParticipant}</span>
      </TableCell>
      <TableCell className="hidden md:table-cell text-right">
        <span className="px-14 text-md">{event.participantArrived}</span>
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-haspopup="true" size="icon" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">פתח תפריט</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>פעו��ות</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <button
                className="w-full"
                onClick={async () => {
                  const response = await exportParticipants(event.id);
                  const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `participants-${event.id}.xlsx`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                }}
              >
                ייצוא
              </button>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <form action={deleteEvent}>
                <input type="hidden" name="id" value={event.id} />
                <button type="submit">מחיקה</button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
