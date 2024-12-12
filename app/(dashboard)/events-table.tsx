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
    router.push(`/?offset=${Math.max(0, offset - eventsPerPage)}&status=${status}`, { scroll: false });
  }

  function nextPage() {
    router.push(`/?offset=${offset + eventsPerPage}&status=${status}`, { scroll: false });
  }

  return (
    <Card dir='rtl'>
      <CardHeader>
        <CardTitle>אירועים</CardTitle>
        <CardDescription>
          נהל את האירועים שלך ועקוב אחר נוכחות המשתתפים
        </CardDescription>
      </CardHeader>
      <CardContent className="max-w-[92vw] overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right min-w-[80px]">
                  אירועים
                </TableHead>
                <TableHead className="text-right min-w-[120px]">שם</TableHead>
                <TableHead className="text-right min-w-[120px]">תאריך</TableHead>
                <TableHead className="text-right min-w-[100px]">סטטוס</TableHead>
                <TableHead className="text-right min-w-[100px]">
                  כל המשתתפים
                </TableHead>
                <TableHead className="text-right min-w-[100px]">
                  משתתפים שהגיעו
                </TableHead>
                <TableHead className="text-right min-w-[80px]">
                  <span className="sr-only">פעולות</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <Event key={event.id} event={event} />
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter>
        <form className="flex items-center w-[100%] justify-between">
          <div className="text-xs text-muted-foreground">
            מציג{' '}
            <strong>
              {Math.max(0, Math.min(offset, totalEvents) + 1)}-{offset + eventsPerPage}
            </strong>{' '}
            מתוך <strong>{totalEvents}</strong> אירועים
          </div>
          <div className="flex">
            <Button
              formAction={prevPage}
              variant="ghost"
              size="sm"
              type="submit"
              disabled={offset < eventsPerPage}
            >
              <ChevronRight className="ml-2 h-4 w-4" />
              הקודם
            </Button>
            <Button
              formAction={nextPage}
              variant="ghost"
              size="sm"
              type="submit"
              disabled={offset + eventsPerPage > totalEvents}
            >
              הבא
              <ChevronLeft className="mr-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardFooter>
    </Card>
  );
}
