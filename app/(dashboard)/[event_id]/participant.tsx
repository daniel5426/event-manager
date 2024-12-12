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
import { unknown } from 'zod';

export function Participant({
  participant,
  isMobile
}: {
  participant: SelectParticipant;
  isMobile: boolean;
}) {
  return (
    <TableRow>
      <TableCell className="min-w-[80px]">
        <UserIcon className="h-8 w-8 text-gray-400" />
      </TableCell>
      <TableCell className="min-w-[120px]">{participant.name ? participant.name : 'Unknown'}</TableCell>
      <TableCell className="min-w-[100px]">{participant.pn}</TableCell>
      <TableCell className="min-w-[100px]">
        {participant.arrivedTime
          ? participant.arrivedTime.toTimeString().slice(0, 5)
          : 'No date'}
      </TableCell>
      <TableCell className="min-w-[100px]">
        {participant.exitedTime
          ? participant.exitedTime.toTimeString().slice(0, 5)
          : 'No date'}
      </TableCell>
      <TableCell className="min-w-[150px]">{participant.email ? participant.email : 'Unknown'}</TableCell>
      <TableCell className="min-w-[120px]">{participant.nid}</TableCell>
      <TableCell className="min-w-[80px]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-haspopup="true" size="icon" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only text-right">תפריט</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>פעולות</DropdownMenuLabel>
            <DropdownMenuItem>
              <form action={updateParticipantExit} className="text-right">
                <input type="hidden" name="id" value={participant.id} />
                <button type="submit">יציאה</button>
              </form>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <form action={deleteParticipant}>
                <input type="hidden" name="id" value={participant.id} />
                <button type="submit">מחיקה</button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
