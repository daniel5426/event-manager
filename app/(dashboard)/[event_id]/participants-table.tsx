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
import { checkParticipantStatusAction, registerParticipantAction } from '../actions';
import ReactConfetti from 'react-confetti';
import { useWindowSize } from 'react-use';

const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768;
};

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
  let participantsPerPage = 10;
  const [idNumber, setIdNumber] = useState("");
  const [isCardReading, setIsCardReading] = useState(false);
  const ID_LENGTH = 37; // Assuming your ID number is 9 digits
  const { width, height } = useWindowSize();
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeName, setWelcomeName] = useState('');
  const [messageType, setMessageType] = useState<'welcome' | 'goodbye' | 'detected' | 'not_invited'>('welcome');
  
  useEffect( () => {
    console.log(idNumber);
    const saveId = async () => {
      if (idNumber.length === ID_LENGTH) {
        const finalId = idNumber;
        navigator.clipboard.writeText(finalId);
        const numericId = finalId.replace(/[^0-9]/g, '')
        const part1 = numericId.slice(0, 6);    // First 6 numbers
        const pn = numericId.slice(6, 13);    // Next 7
        const part3 = numericId.slice(13, 25);   // Next 12
        const nid = numericId.slice(25, 34);  // Last 9
        console.log(pn);
        
        // Check participant status before registration
        const status = await checkParticipantStatusAction(Number(params.event_id), Number(pn));
        
        if (status.status === 'not_registered') {
          setMessageType('not_invited');
          setShowWelcome(true);
          setTimeout(() => setShowWelcome(false), 5000);
          setIdNumber("");
          setIsCardReading(false);
          return; // Exit early if participant is not registered
        }

        if (status.status === 'new') {
          setMessageType('welcome');
        } else if (status.status === 'active') {
          setMessageType('goodbye');
        } else {
          setMessageType('detected');
        }

        setWelcomeName(status.name ?? pn);
        setShowWelcome(true);
        setTimeout(() => setShowWelcome(false), 3000);

        await registerParticipantAction(Number(params.event_id), Number(nid), Number(pn));
        router.refresh();
        setIdNumber("");
        setIsCardReading(false);
      }
    }
    saveId();
  }, [idNumber]);

  useEffect(() => {
    let lastKeyTime = 0;
    
    const handleKeydown = async (e: any) => {
      const currentTime = Date.now();
      
      // If more than 1 second has passed since the last keypress
      if (currentTime - lastKeyTime > 500) {
        setIdNumber(""); // Reset the idNumber
      }
      
      lastKeyTime = currentTime;

      if (!isCardReading) {
        setIsCardReading(true);
        setIdNumber("");
      }

      // Add digits to idNumber
      if (/^\d$/.test(e.key)) {
        setIdNumber((prev) => prev + e.key);
      }
    };

    window.addEventListener("keydown", handleKeydown);

    return () => window.removeEventListener("keydown", handleKeydown);
  }, [isCardReading]);

  function prevPage() {
    router.push(`/${params.event_id}?offset=${Math.max(0, offset - participantsPerPage)}&status=${status}`, { scroll: false });
  }

  function nextPage() {
    router.push(`/${params.event_id}?offset=${offset + participantsPerPage}&status=${status}`, { scroll: false });
  }

  return (
    <>
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-hidden">
          {messageType !== 'not_invited' && (
            <ReactConfetti
              width={width}
              height={height}
              recycle={false}
              numberOfPieces={200}
              style={{ position: 'fixed', top: 0, left: 0, zIndex: 51 }}
            />
          )}
          <div className="relative w-full max-w-sm mx-auto">
            <div className="bg-white rounded-lg p-8 text-center shadow-lg">
              <h2 className="text-2xl font-bold mb-4">
                {messageType === 'welcome' && 'ברוך הבא!'}
                {messageType === 'goodbye' && 'להתראות!'}
                {messageType === 'detected' && 'כרטיס ז��הה'}
                {messageType === 'not_invited' && 'לא רשום'}
              </h2>
              <p className="text-xl">
                {messageType === 'welcome' && `משתתף ${welcomeName} הגיע`}
                {messageType === 'goodbye' && `משתתף ${welcomeName} יצא`}
                {messageType === 'detected' && `הכרטיס של ${welcomeName} זוהה`}
                {messageType === 'not_invited' && 'המשתתף אינו רשום לאירוע'}
              </p>
            </div>
          </div>
        </div>
      )}
      <Card className="w-full" dir='rtl'>
        <CardHeader>
          <CardTitle>משתתפים</CardTitle>
          <CardDescription>
            נהל את המשתתפים ועקוב אחר הנוכחות שלהם
          </CardDescription>
        </CardHeader>
        <CardContent className="max-w-[91vw] overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right min-w-[80px]">משתתפים</TableHead>
                  <TableHead className="text-right min-w-[120px]">שם</TableHead>
                  <TableHead className="text-right min-w-[100px]">מספר אישי</TableHead>
                  <TableHead className="text-right min-w-[100px]">זמן הגעה</TableHead>
                  <TableHead className="text-right min-w-[100px]">זמן יציאה</TableHead>
                  <TableHead className="text-right min-w-[150px]">אימייל</TableHead>
                  <TableHead className="text-right min-w-[120px]">תעודת זהות</TableHead>
                  <TableHead className="text-right min-w-[80px]">פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.map((participant) => (
                  <Participant key={participant.id} participant={participant} isMobile={isMobile()} />
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter>
          <form className="flex items-center w-full justify-between">
            <div className="text-xs text-muted-foreground">
              מציג{' '}
              <strong>
                {Math.max(0, Math.min(offset ) + 1)}-{offset + participantsPerPage}
              </strong>{' '}
              מתוך <strong>{totalParticipants}</strong> משתתפים
            </div>
            <div className="flex">
              <Button
                formAction={prevPage}
                variant="ghost"
                size="sm"
                type="submit"
                disabled={offset < participantsPerPage}
              >
                <ChevronRight className="ml-2 h-4 w-4" />
                הקודם
              </Button>
              <Button
                formAction={nextPage}
                variant="ghost"
                size="sm"
                type="submit"
                disabled={offset + participantsPerPage >= totalParticipants}
              >
                הבא
                <ChevronLeft className="mr-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardFooter>
      </Card>
    </>
  );
}
