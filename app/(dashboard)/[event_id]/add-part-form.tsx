'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { addParticipantAction } from "../actions";
import { useRouter, useParams } from "next/navigation";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";

export function AddParticipantForm({eventId}: {eventId: number}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [pn, setPn] = useState<number | null>(null);
  const [nid, setNid] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      const result = await addParticipantAction(name, pn, nid, email, Number(eventId));
      if (result.success) {
        router.refresh();
        // Reset form fields
        setName('');
        setPn(null);
        setNid(null);
        setEmail('');
        setOpen(false); // Close the dialog on success
      } else {
        setError(result.error || 'An error occurred while adding the participant');
      }
      
    } catch (error) {
      setError('An unexpected error occurred');
      console.error('Error:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex-1 space-y-4">
            <div>
              <Label htmlFor="name">שם</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="pn">מספר אישי</Label>
              <Input
                id="pn"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{7}"
                maxLength={7}
                title="נא להזין 7 ספרות"
                value={pn ?? ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d{0,7}$/.test(value)) {
                    setPn(value ? Number(value) : null);
                  }
                }}
                onInvalid={(e: React.FormEvent<HTMLInputElement>) => {
                  e.currentTarget.setCustomValidity("נא להזין 7 ספרות");
                }}
                onInput={(e: React.FormEvent<HTMLInputElement>) => {
                  e.currentTarget.setCustomValidity("");
                }}
                required
              />
            </div>
            <div>
              <Label htmlFor="nid">תעודת זהות</Label>
              <Input
                id="nid"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{9}"
                maxLength={9}
                title="נא להזין 9 ספרות"
                value={nid ?? ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d{0,9}$/.test(value)) {
                    setNid(value ? Number(value) : null);
                  }
                }}
                onInvalid={(e: React.FormEvent<HTMLInputElement>) => {
                  e.currentTarget.setCustomValidity("נא להזין 9 ספרות");
                }}
                onInput={(e: React.FormEvent<HTMLInputElement>) => {
                  e.currentTarget.setCustomValidity("");
                }}
              />
            </div>
            <div>
              <Label htmlFor="name">דוא״ל</Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm text-center">
                {error}
              </div>
            )}
          </div>
          <Button type="submit" className="w-full">הוסף משתתף</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}