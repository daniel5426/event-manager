'use server';

import { deleteEventById, deleteParticipantById } from '@/lib/db';
import { revalidatePath } from 'next/cache';

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
