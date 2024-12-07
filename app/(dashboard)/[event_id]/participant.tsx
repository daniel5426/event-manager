import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Ticket, MoreHorizontal, UserIcon } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { SelectParticipant } from '@/lib/db';
import { deleteParticipant } from '../actions';

export function Participant({
  participant
}: {
  participant: SelectParticipant ;
}) {
  return (
    <TableRow className="text-center">
      <TableCell className="hidden sm:table-cell">
        <div className="flex h-16 w-16 items-center justify-center rounded-md border">
          <UserIcon className="h-8 w-8 text-gray-400" />
        </div>
      </TableCell>
      <TableCell className="font-medium">{participant.id}</TableCell>
      <TableCell>
        <Badge variant="outline" className="capitalize">
            {participant.arrivedTime
            ? participant.arrivedTime.toLocaleDateString('en-US')
            : 'No date'}
        </Badge>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {participant.exitedTime
          ? participant.exitedTime.toLocaleDateString('en-US')
          : 'No date'}
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {participant.secondId}
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
              <form action={deleteParticipant}>
                <input type="hidden" name="id" value={participant.id} />
                <button type="submit">Delete</button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
