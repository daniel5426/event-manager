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
    <TableRow className="">
      <TableCell className="hidden sm:table-cell">
        {event.imageUrl ? (
          <Image
            alt="Event image"
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
      <TableCell className="font-medium ">
        <Link href={`/${event.id}`} className="hover:underline">
          {event.name}
        </Link>
      </TableCell>
      <TableCell className="hidden md:table-cell ">
        {event.eventDate
          ? new Date(event.eventDate).toDateString()
          : 'No date'}
      </TableCell>
      <TableCell className="">
        <Badge variant="outline" className="capitalize">
          {event.eventDate
            ? new Date().setHours(0,0,0,0) === new Date(event.eventDate).setHours(0,0,0,0)
              ? 'ongoing'
              : new Date().setHours(0,0,0,0) > new Date(event.eventDate).setHours(0,0,0,0)
                ? 'past'
                : 'upcoming'
            : 'scheduled'}
        </Badge>
      </TableCell>

      <TableCell className="hidden md:table-cell ">
        <span className="text-center px-10 text-md">{event.totalParticipant}</span>
      </TableCell>
      <TableCell className="hidden md:table-cell ">
        <span className=" px-14 text-md">{event.participantArrived}</span>
      </TableCell>
      <TableCell className="">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-haspopup="true" size="icon" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
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
                Export
              </button>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <form action={deleteEvent}>
                <input type="hidden" name="id" value={event.id} />
                <button type="submit">Delete</button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
