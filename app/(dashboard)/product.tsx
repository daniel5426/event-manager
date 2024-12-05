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
import { Ticket, MoreHorizontal } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { SelectEvent } from '@/lib/db';
import { deleteEvent } from './actions';

export function Event({
  event
}: {
  event: SelectEvent & { participantCount: number };
}) {
  return (
    <TableRow className="text-center">
      <TableCell className="hidden sm:table-cell">
        {event.imageUrl ? (
          <Image
            alt="Event image"
            className="aspect-square rounded-md object-cover"
            height="64"
            src={event.imageUrl}
            width="64"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-md border">
            <Ticket className="h-8 w-8 text-gray-400" />
          </div>
        )}
      </TableCell>
      <TableCell className="font-medium">{event.name}</TableCell>
      <TableCell>
        <Badge variant="outline" className="capitalize">
          {event.status}
        </Badge>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {event.eventDate
          ? event.eventDate.toLocaleDateString('en-US')
          : 'No date'}
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {event.participantCount}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-haspopup="true" size="icon" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>
              <form action={deleteEvent}>
                <button type="submit">Delete</button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
