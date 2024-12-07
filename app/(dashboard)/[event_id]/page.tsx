import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { File, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ParticipantsTable } from './participants-table';
import { getParticipants } from '@/lib/db';

export default async function ParticipantsPage({
  params,
  searchParams,
}: {
  params: Promise<{ event_id: string }>;
  searchParams: Promise<{ q: string; offset: string }>;
}) {
  const eventId = (await params).event_id;
  const searchParamsResolved = await searchParams;
  const search = searchParamsResolved.q ?? '';
  const offset = searchParamsResolved.offset ?? 0;
  const { participants, newOffset, totalParticipants } = await getParticipants(
    Number(eventId),
    search,
    Number(offset)
  );

  return (
    <Tabs defaultValue="all">
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="arrived">Still in the event</TabsTrigger>
          <TabsTrigger value="exited">Exited the event</TabsTrigger>
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
        <ParticipantsTable
          participants={participants}
          offset={newOffset ?? 0}
          totalParticipants={totalParticipants}
        />
      </TabsContent>
      <TabsContent value="arrived">
        <ParticipantsTable
          participants={participants.filter(participant => participant.exitedTime === null)}
          offset={newOffset ?? 0}
          totalParticipants={totalParticipants}
        />
      </TabsContent>
      <TabsContent value="exited">
        <ParticipantsTable
          participants={participants.filter(participant => participant.exitedTime !== null)}
          offset={newOffset ?? 0}
          totalParticipants={totalParticipants}
        />
      </TabsContent>
    </Tabs>
  );
}
