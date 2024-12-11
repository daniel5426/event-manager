'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { addParticipantAction } from "../actions";
import { useRouter, useParams } from "next/navigation";

export function AddParticipantForm() {
  const [name, setName] = useState('');
  const [pn, setPn] = useState<number | null>(null);
  const [nid, setNid] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const router = useRouter();
  const params = useParams();
  const eventId = params.event_id as string;

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
      // Emit a custom event that the parent component can listen to
      const closeEvent = new CustomEvent('closeAddParticipantForm');
      window.dispatchEvent(closeEvent);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex-1 space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="pn">PN</Label>
            <Input
              id="pn"
              type="number"
              value={pn ?? ''}
              onChange={(e) => setPn(e.target.value ? Number(e.target.value) : null)}
              required
            />
          </div>
          <div>
            <Label htmlFor="nid">NID</Label>
            <Input
              id="nid"
              type="number"
              value={nid ?? ''}
              onChange={(e) => setNid(e.target.value ? Number(e.target.value) : null)}
            />
          </div>
          <div>
            <Label htmlFor="name">Email</Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
      <Button type="submit" className="w-full">Add Participant</Button>
    </form>
  );
}
