import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { File, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ParticipantsTable } from './participants-table';
import { getParticipants } from '@/lib/db';
import { ExportButton } from './export-button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AddParticipantForm } from './add-part-form';
import { ParticipantsTabs } from './participants-tabs';

interface PageProps {
  params: Promise<{
    event_id: string
  }>,
  searchParams: Promise<{
    q?: string
    offset?: string
    status?: string
  }>
}

export default async function ParticipantsPage({
  params,
  searchParams,
}: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const eventId = resolvedParams.event_id;
  const search = resolvedSearchParams.q ?? '';
  const offset = resolvedSearchParams.offset ?? 0;
  const status = resolvedSearchParams.status ?? 'all';
  
  const { participants, newOffset, totalParticipants } = await getParticipants(
    Number(eventId),
    search,
    Number(offset),
    status as 'hasnt_arrived' | 'arrived' | 'exited' | undefined
  );

  return (
    <ParticipantsTabs defaultValue="all">
      <div className="flex items-center">
        <div className="mr-auto flex items-center gap-2 shrink-0">
          <ExportButton eventId={Number(eventId)} />
        </div>
        <div className="mr-auto flex items-end gap-5">
          <AddParticipantForm eventId={Number(eventId)} />
        </div>
        <div className="overflow-x-auto">
          <TabsList className="w-fit">
            <TabsTrigger value="all" className="text-sm px-2 sm:px-4">הכל</TabsTrigger>
            <TabsTrigger value="hasnt_arrived" className="text-sm px-2 sm:px-4">
              <span className="sm:inline">לא נוכח</span>
            </TabsTrigger>
            <TabsTrigger value="arrived" className="text-sm px-2 sm:px-4">
              <span className="hidden sm:inline">עדיין באירוע</span>
              <span className="sm:hidden">נוכח</span>
            </TabsTrigger>
            <TabsTrigger value="exited" className="text-sm px-2 sm:px-4">
              <span className="hidden sm:inline">יצא מהאירוע</span>
              <span className="sm:hidden">יצא</span>
            </TabsTrigger>
          </TabsList>
        </div>

      </div>
      <TabsContent value="all">
        <ParticipantsTable
          participants={participants}
          offset={Number(offset) ?? 0}
          newOffset={newOffset ?? 0}
          totalParticipants={totalParticipants}
          status={undefined}
        />
      </TabsContent>
      <TabsContent value="hasnt_arrived">
        <ParticipantsTable
          participants={participants}
          offset={Number(offset) ?? 0}
          newOffset={newOffset ?? 0}
          totalParticipants={totalParticipants}
          status="hasnt_arrived"
        />
      </TabsContent>
      <TabsContent value="arrived">
        <ParticipantsTable
          participants={participants}
          offset={Number(offset) ?? 0}
          newOffset={newOffset ?? 0}
          totalParticipants={totalParticipants}
          status="arrived"
        />
      </TabsContent>
      <TabsContent value="exited">
        <ParticipantsTable
          participants={participants}
          offset={Number(offset) ?? 0}
          newOffset={newOffset ?? 0}
          totalParticipants={totalParticipants}
          status="exited"
        />
      </TabsContent>
    </ParticipantsTabs>
  );
}
