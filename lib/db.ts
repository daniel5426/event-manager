import 'server-only';

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import {
  pgTable,
  text,
  timestamp,
  serial,
  integer,
  pgEnum
} from 'drizzle-orm/pg-core';
import { count, eq, ilike, and, isNull } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';

export const db = drizzle(neon(process.env.POSTGRES_URL!));

export const eventStatusEnum = pgEnum('event_status', [
  'scheduled',
  'ongoing',
  'completed',
  'cancelled'
]);

export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  imageUrl: text('image_url'),
  name: text('name').notNull(),
  status: eventStatusEnum('status').notNull(),
  eventDate: timestamp('event_date')
});

export const participants = pgTable('participants', {
  id: integer('id').primaryKey(),
  eventId: integer('event_id').notNull().references(() => events.id),
  secondId: integer('second_id'),
  arrivedTime: timestamp('arrived_time').notNull(),
  exitedTime: timestamp('exited_time')
});

export type SelectEvent = typeof events.$inferSelect;
export const insertEventSchema = createInsertSchema(events);

export async function getEvents(
  search: string,
  offset: number
): Promise<{
  events: SelectEvent[];
  newOffset: number | null;
  totalEvents: number;
}> {
  // Always search the full table, not per page
  if (search) {
    return {
      events: await db
        .select()
        .from(events)
        .where(ilike(events.name, `%${search}%`))
        .limit(1000),
      newOffset: null,
      totalEvents: 0
    };
  }

  if (offset === null) {
    return { events: [], newOffset: null, totalEvents: 0 };
  }

  let totalEvents = await db.select({ count: count() }).from(events);
  let moreEvents = await db.select().from(events).limit(5).offset(offset);
  let newOffset = moreEvents.length >= 5 ? offset + 5 : null;

  return {
    events: moreEvents,
    newOffset,
    totalEvents: totalEvents[0].count
  };
}

export async function deleteEventById(id: number) {
  await db.delete(events).where(eq(events.id, id));
}

export async function addParticipant(eventId: number, id: number) {
  const result = await db
    .insert(participants)
    .values({
      eventId,
      id,
      arrivedTime: new Date()
    })
    .returning();
  
  return result[0];
}

export async function registerParticipant(eventId: number, id: number) {
  // First, try to find existing participant
  const existingParticipant = await db
    .select()
    .from(participants)
    .where(
      and(
        eq(participants.eventId, eventId),
        eq(participants.id, id)
      )
    )
    .limit(1);

  if (existingParticipant.length > 0) {
    // Update existing participant's exitedTime
    const result = await db
      .update(participants)
      .set({
        exitedTime: new Date()
      })
      .where(eq(participants.id, existingParticipant[0].id))
      .returning();
    
    return result[0];
  } else {
    // Create new participant
    return addParticipant(eventId, id);
  }
}

export async function getEventParticipantCount(
  eventId: number, 
  activeOnly: boolean = false
): Promise<number> {
  const query = db
    .select({ count: count() })
    .from(participants)
    .where(
      activeOnly 
        ? and(
            eq(participants.eventId, eventId),
            isNull(participants.exitedTime)
          )
        : eq(participants.eventId, eventId)
    );
  
  const result = await query;
  return result[0].count;
}
