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
import { deleteParticipant, updateParticipantExit } from '../actions';

export function Participant({
  participant
}: {
  participant: SelectParticipant ;
}) {
  return (
    <TableRow className="">
      <TableCell className="hidden sm:table-cell">
        <UserIcon className="h-8 w-8 text-gray-400" />
      </TableCell>
      <TableCell className="font-medium">{participant.name ?? 'Unknown'}</TableCell>
      <TableCell className="font-medium">{participant.email ?? 'Unknown'}</TableCell>
      <TableCell>
            {participant.arrivedTime
            ? participant.arrivedTime.toTimeString().slice(0, 5)
            : 'No date'}
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {participant.exitedTime
            ? participant.exitedTime.toTimeString().slice(0, 5)
            : 'No date'}
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {participant.pn}
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {participant.nid}
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
            <DropdownMenuItem>
              <form action={updateParticipantExit}>
                <input type="hidden" name="id" value={participant.id} />
                <button type="submit">Exited</button>
              </form>
            </DropdownMenuItem>
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
