'use client';

import {
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  Table
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Participant } from './participant';
import { SelectParticipant } from '@/lib/db';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ParticipantsTable({
  participants,
  offset,
  totalParticipants
}: {
  participants: SelectParticipant[];
  offset: number;
  totalParticipants: number;
}) {
  let router = useRouter();
  let participantsPerPage = 5;
    
  function prevPage() {
    router.push(`/?offset=${Math.max(0, offset - participantsPerPage)}`, { scroll: false });
  }

  function nextPage() {
    router.push(`/?offset=${offset}`, { scroll: false });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Events</CardTitle>
        <CardDescription>
          Manage your events and track participant attendance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] text-center sm:table-cell">
                <span className="sr-only">Image</span>
              </TableHead>
              <TableHead className="text-center">ID</TableHead>
              <TableHead className="text-center">Arrived Time</TableHead>
              <TableHead className="hidden text-center md:table-cell">Exited Time</TableHead>
              <TableHead className="hidden text-center md:table-cell">
                Second ID
              </TableHead>
              <TableHead className="text-center">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants.map((participant) => (
              <Participant key={participant.id} participant={participant} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <form className="flex items-center w-full justify-between">
          <div className="text-xs text-muted-foreground">
            Showing{' '}
            <strong>
              {Math.max(0, Math.min(offset - participantsPerPage, totalParticipants) + 1)}-{offset}
            </strong>{' '}
            of <strong>{totalParticipants}</strong> participants
          </div>
          <div className="flex">
            <Button
              formAction={prevPage}
              variant="ghost"
              size="sm"
              type="submit"
              disabled={offset <= participantsPerPage}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Prev
            </Button>
            <Button
              formAction={nextPage}
              variant="ghost"
              size="sm"
              type="submit"
              disabled={offset + participantsPerPage > totalParticipants}
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardFooter>
    </Card>
  );
}
