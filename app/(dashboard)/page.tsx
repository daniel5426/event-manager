import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { File, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EventsTable } from './products-table';
import { getEventParticipantCount, getEvents } from '@/lib/db';

export default async function EventsPage(
  props: {
    searchParams: Promise<{ q: string; offset: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const search = searchParams.q ?? '';
  const offset = searchParams.offset ?? 0;
  const { events, newOffset, totalEvents } = await getEvents(
    search,
    Number(offset)
  );

  const events2 = await Promise.all(
    events.map(async (event: any ) => ({
      ...event,
      participantCount: await getEventParticipantCount(event.id)
    }))
  );

  return (
    <Tabs defaultValue="all">
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="scheduled" className="hidden sm:flex">
          Scheduled
          </TabsTrigger>
        </TabsList>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 gap-1">
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Export
            </span>
          </Button>
          <Button size="sm" className="h-8 gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Add Event
            </span>
          </Button>
        </div>
      </div>
      <TabsContent value="all">
        <EventsTable
          events={events2}
          offset={newOffset ?? 0}
          totalEvents={totalEvents}
        />
      </TabsContent>
      <TabsContent value="ongoing">
        <EventsTable
          events={events2.filter(event => event.status === 'ongoing')}
          offset={newOffset ?? 0}
          totalEvents={totalEvents}
        />
      </TabsContent>
      <TabsContent value="draft">
        <EventsTable
          events={events2.filter(event => event.status === 'scheduled')}
          offset={newOffset ?? 0}
          totalEvents={totalEvents}
        />
      </TabsContent>
      <TabsContent value="archived">
        <EventsTable
          events={events2.filter(event => event.status === 'completed')}
          offset={newOffset ?? 0}
          totalEvents={totalEvents}
        />
      </TabsContent>
    </Tabs>
  );
}
