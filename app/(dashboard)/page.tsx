import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { File, Link, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EventsTable } from './events-table';
import { getEventParticipantCount, getEvents } from '@/lib/db';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AddEventForm } from './add-event-form';
import { EventsTabs } from './events-tabs';

export default async function EventsPage(
  props: {
    searchParams: Promise<{ q: string; offset: string; status?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const search = searchParams.q ?? '';
  const offset = searchParams.offset ?? 0;
  const status = searchParams.status ?? 'all';
  console.log("Offset:", offset);
  const { events, newOffset, totalEvents } = await getEvents(
    search,
    Number(offset),
    status as 'upcoming' | 'ongoing' | 'past' | undefined
  );


  const events2 = await Promise.all(
    events.map(async (event: any) => ({
      ...event,
      totalParticipant: await getEventParticipantCount(event.id, false),
      participantArrived: await getEventParticipantCount(event.id, true),
      eventDate: new Date(event.eventDate).toLocaleDateString()
    }))
  );

  return (
    <EventsTabs defaultValue="all" >
      <div className="flex items-center">
        <div className="mr-auto flex items-center gap-2">
          <AddEventForm />
        </div>
        <TabsList>
          <TabsTrigger value="all">הכל</TabsTrigger>
          <TabsTrigger value="ongoing">מתקיים כעת</TabsTrigger>
          <TabsTrigger value="upcoming">קרוב</TabsTrigger>
          <TabsTrigger value="past">עבר</TabsTrigger>
        </TabsList>

      </div>
      <TabsContent value="all">
        <EventsTable
          events={events2}
          offset={Number(offset) ?? 0}
          newOffset={newOffset ?? 0}
          totalEvents={totalEvents}
          status={undefined}  
        />
      </TabsContent>
      <TabsContent value="ongoing">
        <EventsTable
          events={events2}
          offset={Number(offset)   ?? 0}
          newOffset={newOffset ?? 0}
          totalEvents={totalEvents}
          status="ongoing"
        />
      </TabsContent>
      <TabsContent value="upcoming">
        <EventsTable
          events={events2}
          offset={Number(offset) ?? 0}
          newOffset={newOffset ?? 0}
          totalEvents={totalEvents}
          status="upcoming"
        />
      </TabsContent>
      <TabsContent value="past">
        <EventsTable
          events={events2}
          offset={Number(offset) ?? 0}
          newOffset={newOffset ?? 0}
          totalEvents={totalEvents}
          status="past"
        />
      </TabsContent>
    </EventsTabs>
  );
}
