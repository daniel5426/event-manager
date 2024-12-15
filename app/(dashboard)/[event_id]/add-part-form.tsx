'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { addParticipantAction } from "../actions";
import { useRouter, useParams } from "next/navigation";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";

export function AddParticipantForm( {eventId}: {eventId: number}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [pn, setPn] = useState<number | null>(null);
  const [nid, setNid] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await addParticipantAction(name, pn, nid, email, Number(eventId));
      router.refresh();
      // Reset form fields
      setName('');
      setPn(null);
      setNid(null);
      setEmail('');
      setOpen(false);
      // Emit a custom event that the parent component can listen to
      const closeEvent = new CustomEvent('closeAddParticipantForm');
      window.dispatchEvent(closeEvent);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
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
              type="number"
              value={pn ?? ''}
              onChange={(e) => setPn(e.target.value ? Number(e.target.value) : null)}
              required
            />
          </div>
          <div>
            <Label htmlFor="nid">תעודת זהות</Label>
            <Input
              id="nid"
              type="number"
              value={nid ?? ''}
              onChange={(e) => setNid(e.target.value ? Number(e.target.value) : null)}
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
        </div>
      <Button type="submit" className="w-full">הוסף משתתף</Button>
    </form>
    </DialogContent>
  </Dialog>
  );
}