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
import { Event } from './event';
import { SelectEvent } from '@/lib/db';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function EventsTable({
  events,
  offset,
  newOffset,
  totalEvents,
  status
}: {
  events: (SelectEvent & { totalParticipant: number; participantArrived: number })[];
  offset: number;
  newOffset: number;
  totalEvents: number;
  status: 'upcoming' | 'ongoing' | 'past' | undefined;
}) {
  let router = useRouter();
  let eventsPerPage = 5;

  function prevPage() {
    router.push(`/?offset=${Math.max(0, newOffset - eventsPerPage)}&status=${status}`, { scroll: false });
  }

  function nextPage() {
    router.push(`/?offset=${newOffset}&status=${status}`, { scroll: false });
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
              <TableHead className="sm:table-cell">
                Events
              </TableHead>
              <TableHead className=" md:table-cell">Name</TableHead>
              <TableHead className="hidden  md:table-cell">Date</TableHead>
              <TableHead className="">Status</TableHead>

              <TableHead className="hidden  md:table-cell">
                All participants
              </TableHead>
              <TableHead className="hidden  md:table-cell">
                Arrived participants
              </TableHead>
              <TableHead className="">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <Event key={event.id} event={event} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <form className="flex items-center w-full justify-between">
          <div className="text-xs text-muted-foreground">
            Showing{' '}
            <strong>
              {Math.max(0, Math.min(offset - eventsPerPage, totalEvents) + 1)}-{offset}
            </strong>{' '}
            of <strong>{totalEvents}</strong> events
          </div>
          <div className="flex">
            <Button
              formAction={prevPage}
              variant="ghost"
              size="sm"
              type="submit"
              disabled={offset  < eventsPerPage}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Prev
            </Button>
            <Button
              formAction={nextPage}
              variant="ghost"
              size="sm"
              type="submit"
              disabled={offset + eventsPerPage > totalEvents}
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
