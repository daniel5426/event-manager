'use server';

import { deleteEventById, deleteParticipantById, addEvent, registerParticipant, addParticipant, checkParticipantStatus, getEventById } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { db, participants, events } from '@/lib/db';
import { eq } from 'drizzle-orm';
import * as XLSX from 'xlsx';
import { z } from 'zod';
import { signIn } from '@/lib/auth';
import { sendInvitationEmail } from '@/lib/email';

export async function getParticipants(eventId: number) {
  return await db.select().from(participants).where(eq(participants.eventId, eventId));
}

export async function exportParticipants(eventId: number) {
  // Get all participants for the event
  const allParticipants = await db
    .select()
    .from(participants)
    .where(eq(participants.eventId, eventId));

  // Format data for Excel
  const data = allParticipants.map(p => ({
    'Name': p.name,
    'Email': p.email,
    'PN': p.pn,
    'NID': p.nid,
    'Arrived Time': p.arrivedTime ? new Date(p.arrivedTime).toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' }) : '',
    'Exited Time': p.exitedTime ? new Date(p.exitedTime).toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' }) : ''
  }));

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Participants');

  // Generate buffer
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  
  return buf;
}

export async function deleteEvent(formData: FormData) {
  let id = Number(formData.get('id'));
  await deleteEventById(id);
  revalidatePath('/');
}

export async function deleteParticipant(formData: FormData) {
  let id = Number(formData.get('id'));
  await deleteParticipantById(id);
  revalidatePath('/');
}

export async function addParticipantAction(
  name: string, 
  pn: number | null,
  nid: number | null,
  email: string | null,
  eventId: number
) {
  try {
    await addParticipant(eventId, nid, pn, name, email);
    return { success: true, error: null };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unknown error occurred' };
  }
}

export async function addEventAction(
  name: string, 
  imageUrl: File | null, 
  eventDate: Date, 
  participantsFile: File | null
) {
  // First create the event
  const event = await addEvent(name, imageUrl, eventDate);

  // If there's a participants file, process it asynchronously
  if (participantsFile) {
    // Start processing in the background
    processParticipantsFile(participantsFile, event.id).catch(error => {
      console.error('Error processing participants file:', error);
      // You might want to add some error tracking/logging here
    });
  }

  return event;
}

async function processParticipantsFile(file: File, eventId: number) {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(worksheet);

  // Get event details
  const event = await getEventById(eventId);
  console.log(event);
  if (!event) throw new Error('Event not found');

  // Prepare bulk insert data
  const participantsData = data.map(row => ({
    eventId,
    nid: (row as any).NID || null,
    pn: (row as any).PN || null,
    name: (row as any).Name || null,
    email: (row as any).Email || null,
    arrivedTime: null,
  }));

  // Perform bulk insert in chunks to avoid memory issues
  const chunkSize = 100;
  for (let i = 0; i < participantsData.length; i += chunkSize) {
    const chunk = participantsData.slice(i, i + chunkSize);
    await db.insert(participants).values(chunk);

    // Send invitation emails to participants with email addresses
    for (const participant of chunk) {
      if (participant.email && participant.nid && event[0].eventDate) {
        try {
          await sendInvitationEmail(
            participant.email,
            participant.name || 'אורח/ת יקר/ה',
            event[0].name,
            event[0].eventDate,
            participant.nid
          );
        } catch (error) {
          console.error(`Failed to send email to ${participant.email}:`, error);
        }
      }
    }
  }
}

export async function registerParticipantAction(eventId: number, nid: number = 0, pn: number = 0) {
  await registerParticipant(eventId, nid, pn);
  revalidatePath('/');
}

export async function updateParticipantExit(formData: FormData) {
  let id = Number(formData.get('id'));
  await db
    .update(participants)
    .set({ exitedTime: new Date() })
    .where(eq(participants.id, id));
  revalidatePath('/');
}

export async function updateParticipantArrival(formData: FormData) {
  let id = Number(formData.get('id'));
  await db
    .update(participants)
    .set({ arrivedTime: new Date() })
    .where(eq(participants.id, id));
  revalidatePath('/');
}

export async function checkParticipantStatusAction(eventId: number, pn: number, nid: number = 0) {
  return await checkParticipantStatus(eventId, pn, nid);
}

const authFormSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export interface LoginActionState {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_data';
}

export const login = async (
  _: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      username: formData.get('username'),
      password: formData.get('password'),
    });

    const result = await signIn('credentials', {
      username: validatedData.username,
      password: validatedData.password,
      redirect: false,
    });

    if (result?.error) {
      return { status: 'failed' };
    }

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }
    return { status: 'failed' };
  }
};
