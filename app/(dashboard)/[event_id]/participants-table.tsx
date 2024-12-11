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
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { registerParticipantAction } from '../actions';

export function ParticipantsTable({
  participants,
  offset,
  newOffset,
  totalParticipants,
  status
}: {
  participants: SelectParticipant[];
  offset: number;
  newOffset: number;
  totalParticipants: number;
  status: string | undefined;
}) {
  let router = useRouter();
  let params = useParams();
  let participantsPerPage = 5;
  const [idNumber, setIdNumber] = useState("");
  const [isCardReading, setIsCardReading] = useState(false);
  const ID_LENGTH = 38; // Assuming your ID number is 9 digits


  useEffect(() => {
    const handleKeydown = async (e: any) => {
      if (!isCardReading) {
        setIsCardReading(true);
        setIdNumber("");
      }

      // Add digits to idNumber
      if (/^\d$/.test(e.key)) {
        setIdNumber((prev) => prev + e.key);
      }

      // If ID number length is reached, copy to clipboard
      if (idNumber.length + 1 >= ID_LENGTH) {
        const finalId = idNumber + e.key;
        navigator.clipboard.writeText(finalId);
        const numericId = finalId.replace(/[^0-9]/g, '')
        console.log("numericId:", numericId);
        const part1 = numericId.slice(0, 6);    // First 6 numbers
        const pn = numericId.slice(6, 13);    // Next 7
        const part3 = numericId.slice(13, 25);   // Next 12
        const nid = numericId.slice(25, 34);  // Last 9
        
        console.log("ID parts:", { part1, pn, part3, nid });

        console.log("ID copied to clipboard------:", params.event_id, Number(numericId));
        await registerParticipantAction(Number(params.event_id), Number(nid), Number(pn));        // Refresh the page to show new participant
        router.refresh();
        setIdNumber("");
        setIsCardReading(false);
      }
    };

    window.addEventListener("keydown", handleKeydown);

    return () => window.removeEventListener("keydown", handleKeydown);
  }, [idNumber, isCardReading]);


  function prevPage() {
    router.push(`/${params.event_id}?offset=${Math.max(0, newOffset - participantsPerPage)}&status=${status}`, { scroll: false });
  }

  function nextPage() {
    router.push(`/${params.event_id}?offset=${newOffset}&status=${status}`, { scroll: false });
  }

  return (
    <Card >
      <CardHeader>
        <CardTitle>Participants</CardTitle>
        <CardDescription>
          Manage your participants and track their attendance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
            <TableHead className="">Paticipants</TableHead>
            <TableHead className="">Name</TableHead>
              <TableHead className="">Email</TableHead>
              <TableHead className="">Arrived Time</TableHead>
              <TableHead className="">Exited Time</TableHead>
              <TableHead className="">
                Personal Number
              </TableHead>
              <TableHead className="">
                NID
              </TableHead>
              <TableHead className="">
                Actions
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
              disabled={offset < participantsPerPage}
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
