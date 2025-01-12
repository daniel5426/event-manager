'use client';

import { useEffect, useRef, useState } from 'react';
import { BrowserQRCodeReader } from '@zxing/browser';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { QrCode } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { checkParticipantStatusAction, registerParticipantAction } from '../actions';
import ReactConfetti from 'react-confetti';
import { useWindowSize } from 'react-use';

export function QRScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [open, setOpen] = useState(false);
  const codeReaderRef = useRef<BrowserQRCodeReader | null>(null);
  const params = useParams();
  const router = useRouter();
  const [showWelcome, setShowWelcome] = useState(false);
  const [messageType, setMessageType] = useState<'welcome' | 'goodbye' | 'detected' | 'not_invited'>('welcome');
  const [welcomeName, setWelcomeName] = useState('');
  const { width, height } = useWindowSize();

  useEffect(() => {
    if (isScanning && videoRef.current) {
      const codeReader = new BrowserQRCodeReader();
      codeReaderRef.current = codeReader;

      codeReader
        .decodeFromVideoDevice(
          undefined, 
          videoRef.current, 
          (result, error) => {
            if (result) {
              handleScan(result.getText());
            }
            // Ignore errors as they occur frequently when no QR code is present
          }
        )
        .catch(error => {
          console.error("Error accessing camera:", error);
        });
    }

    return () => {
      if (codeReaderRef.current && videoRef.current) {
        const tracks = videoRef.current.srcObject as MediaStream;
        if (tracks) {
          tracks.getTracks().forEach(track => track.stop());
        }
      }
    };
  }, [isScanning]);

  const handleDialogChange = (open: boolean) => {
    setOpen(open);
    setTimeout(() => {
      setIsScanning(open);
    }, 100);
    
    if (!open) {
      if (codeReaderRef.current && videoRef.current) {
        const tracks = videoRef.current.srcObject as MediaStream;
        if (tracks) {
          tracks.getTracks().forEach(track => track.stop());
        }
      }
    }
  };

  const handleScan = async (result: string) => {
    if (result) {
      if (codeReaderRef.current && videoRef.current) {
        const tracks = videoRef.current.srcObject as MediaStream;
        if (tracks) {
          tracks.getTracks().forEach(track => track.stop());
        }
      }
      setIsScanning(false);
      setOpen(false);

      const status = await checkParticipantStatusAction(Number(params.event_id), 0, Number(result));
      
      if (status.status === 'not_registered') {
        setMessageType('not_invited');
        setShowWelcome(true);
        setTimeout(() => {
          setShowWelcome(false);
        }, 5000);
        return;
      }

      if (status.status === 'new') {
        setMessageType('welcome');
      } else if (status.status === 'active') {
        setMessageType('goodbye');
      } else {
        setMessageType('detected');
      }
      await registerParticipantAction(Number(params.event_id), Number(result));

      setWelcomeName(status.name || '');
      setShowWelcome(true);
      setTimeout(() => {
        setShowWelcome(false);
      }, 5000);
    }
  };

  return (
    <>
      {showWelcome && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
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
                {messageType === 'detected' && 'כרטיס זוהה'}
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

      <Dialog open={open} onOpenChange={handleDialogChange}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <QrCode className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>סריקת קוד QR</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center">
            <video
              ref={videoRef}
              style={{ width: '100%', maxWidth: '400px' }}
            />
            <p className="mt-4 text-sm text-muted-foreground">
              יש למקם את קוד ה-QR מול המצלמה
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 