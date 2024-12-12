import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { File, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ParticipantsTable } from './participants-table';
import { getParticipants } from '@/lib/db';
import { ExportButton } from './export-button';
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AddEventForm } from '../add-event-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AddParticipantForm } from './add-part-form';
import { ParticipantsTabs } from './participants-tabs';

export default async function ParticipantsPage({
  params,
  searchParams,
}: {
  params: Promise<{ event_id: string }>;
  searchParams: Promise<{ q: string; offset: string; status?: string }>;
}) {
  const eventId = (await params).event_id;
  const searchParamsResolved = await searchParams;
  const search = searchParamsResolved.q ?? '';
  const offset = searchParamsResolved.offset ?? 0;
  const status = searchParamsResolved.status ?? 'all';
  
  const { participants, newOffset, totalParticipants } = await getParticipants(
    Number(eventId),
    search,
    Number(offset),
    status as 'arrived' | 'exited' | undefined
  );

  return (
    <ParticipantsTabs defaultValue="all">
      <div className="flex items-center">
        <div className="mr-auto flex items-center gap-2 shrink-0">
          <ExportButton eventId={Number(eventId)} />
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  הוסף משתתף
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className='w-full max-w-sm'>
              <DialogHeader>
                <DialogTitle>הוסף משתתף</DialogTitle>
              </DialogHeader>
              <AddParticipantForm />
            </DialogContent>
          </Dialog>
        </div>
        <div className="overflow-x-auto">
          <TabsList className="w-fit">
            <TabsTrigger value="all" className="text-sm px-2 sm:px-4">הכל</TabsTrigger>
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
