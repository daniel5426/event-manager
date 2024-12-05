'use server';

import { deleteEventById } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function deleteEvent(formData: FormData) {
  let id = Number(formData.get('id'));
  await deleteEventById(id);
  revalidatePath('/');
}
