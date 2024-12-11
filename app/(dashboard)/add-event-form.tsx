'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { addEventAction } from "./actions";
import Image from "next/image";
import { PartyPopper, PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
export function AddEventForm() {
  const [name, setName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [participantsFile, setParticipantsFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setSelectedFile(e.target.files[0]);
  };

  const handleParticipantsFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setParticipantsFile(e.target.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Event date:", eventDate);
    try {
      setUploading(true);
      
      await addEventAction(name, selectedFile ?? null, new Date(eventDate), participantsFile);
      router.refresh();
      setOpen(false);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild>
      <Button size="sm" className="h-8 gap-1">
        <PlusCircle className="h-3.5 w-3.5" />
        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
          Add Event
        </span>
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add New Event</DialogTitle>
      </DialogHeader>

    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex gap-6">
        {/* Left side - Image upload */}
        <div className="w-[225px] flex-shrink-0">
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
            className="hidden"
          />
          {selectedFile ? (
            <div 
              className="w-[225px] h-[225px] relative border rounded-md overflow-hidden cursor-pointer"
              onClick={() => document.getElementById('image')?.click()}
            >
              <Image
                src={URL.createObjectURL(selectedFile)}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div 
              className="w-[225px] h-[225px] border rounded-md bg-muted flex items-center justify-center text-muted-foreground cursor-pointer hover:bg-muted/80"
              onClick={() => document.getElementById('image')?.click()}
            >
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="h-16 w-16 flex items-center justify-center">
                  <PartyPopper className="h-20 w-20 text-gray-400" />
                </div>
                <span className="text-md mt-2">Upload an image</span>
              </div>
            </div>
          )}
        </div>

        {/* Right side - Name, Date, and Excel inputs */}
        <div className="flex-1 space-y-4">
          <div>
            <Label htmlFor="name">Event Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="date">Event Date</Label>
            <Input
              id="date"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="participants">Participants List (Excel)</Label>
            <Input
              id="participants"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleParticipantsFileUpload}
              className="cursor-pointer"
            />
            {participantsFile && (
              <p className="text-sm text-muted-foreground mt-1">
                Selected file: {participantsFile.name}
              </p>
            )}
          </div>
        </div>
      </div>
      <Button type="submit" className="w-full">Save Event</Button>
    </form>
    </DialogContent>
    </Dialog>

  );
}