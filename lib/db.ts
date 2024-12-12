import 'server-only';

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import {
  pgTable,
  text,
  timestamp,
  serial,
  integer
} from 'drizzle-orm/pg-core';
import { count, eq, ilike, and, isNull, isNotNull, or } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { sql } from 'drizzle-orm';
import { put } from '@vercel/blob';

export const db = drizzle(neon(process.env.POSTGRES_URL!));


export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  imageUrl: text('image_url'),
  name: text('name').notNull(),
  eventDate: timestamp('event_date')
});

export const participants = pgTable('participants', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull().references(() => events.id),
  pn: integer('pn'),
  nid: integer('nid'),
  name: text('name'),
  email: text('email'),
  arrivedTime: timestamp('arrived_time').notNull(),
  exitedTime: timestamp('exited_time')
});

export type SelectEvent = typeof events.$inferSelect;
export const insertEventSchema = createInsertSchema(events);

export type SelectParticipant = typeof participants.$inferSelect;
export const insertParticipantSchema = createInsertSchema(participants);

export async function getEvent(eventId: number): Promise<any> {
  return await db.select().from(events).where(eq(events.id, eventId)).limit(1);
}

export async function getEvents(
  search: string,
  offset: number,
  status?: 'upcoming' | 'ongoing' | 'past'
): Promise<{
  events: any[];
  newOffset: number | null;
  totalEvents: number;
}> {
  console.log("Status:", status);
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

  let query = db
    .select({
      id: events.id,
      imageUrl: events.imageUrl,
      name: events.name,
      eventDate: sql`to_char(${events.eventDate}, 'YYYY-MM-DD')`
    })
    .from(events);

  if (status) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (status === 'upcoming') {
      query = query.where(sql`date(${events.eventDate}) > current_date`) as typeof query;
    } else if (status === 'ongoing') {
      query = query.where(sql`date(${events.eventDate}) = current_date`) as typeof query;
    } else if (status === 'past') {
      query = query.where(sql`date(${events.eventDate}) < current_date`) as typeof query;
    }
  }

  const totalEvents = await db.select({ count: count() }).from(events).where(
    status === 'upcoming' ? sql`date(${events.eventDate}) > current_date` :
      status === 'ongoing' ? sql`date(${events.eventDate}) = current_date` :
        status === 'past' ? sql`date(${events.eventDate}) < current_date` :
          undefined
  );
  let moreEvents = await query
    .orderBy(sql`${events.eventDate} DESC`)
    .limit(5)
    .offset(offset);


  let newOffset = moreEvents.length >= 5 ? offset + 5 : null;

  return {
    events: moreEvents,
    newOffset,
    totalEvents: totalEvents[0].count
  };
}

export async function addEvent(name: string, imageUrl: File | null, eventDate: Date) {
  let blob_url: { url: string } | null = null;
  if (imageUrl) {
    blob_url = await put(imageUrl.name, imageUrl, {
      access: 'public',
    });
  }
  const result = await db
    .insert(events)
    .values({
      name,
      imageUrl: blob_url?.url ?? null,
      eventDate: eventDate
    })
    .returning();
  return result[0];
}

export async function deleteEventById(id: number) {
  // First delete all participants associated with this event
  await db.delete(participants).where(eq(participants.eventId, id));
  // Then delete the event
  await db.delete(events).where(eq(events.id, id));
}

export async function addParticipant(eventId: number, nid: number | null, pn: number | null, name: string | null = null, email: string | null = null) {
  // First, check if participant with same pn exists
  if (pn !== null) {
    const existingParticipant = await db
      .select()
      .from(participants)
      .where(
        and(
          eq(participants.eventId, eventId),
          eq(participants.pn, pn)
        )
      )
      .limit(1);

    if (existingParticipant.length > 0) {
      return existingParticipant[0];
    }
  }

  // If no existing participant found, create new one
  const result = await db
    .insert(participants)
    .values({
      eventId,
      nid,
      pn,
      name,
      email,
      arrivedTime: new Date()
    })
    .returning();

  return result[0];
}

export async function registerParticipant(eventId: number, nid: number, pn: number) {
  // First, try to find existing participant
  const existingParticipant = await db
    .select()
    .from(participants)
    .where(
      and(
        eq(participants.eventId, eventId),
        eq(participants.nid, nid)
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
    return addParticipant(eventId, nid, pn);
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
          isNotNull(participants.arrivedTime)
        )
        : eq(participants.eventId, eventId)
    );

  const result = await query;
  const participantArrived = result[0].count;
  return participantArrived;
}

export async function getParticipants(
  eventId: number,
  search: string,
  offset: number,
  status?: 'arrived' | 'exited'
): Promise<{
  participants: SelectParticipant[];
  newOffset: number | null;
  totalParticipants: number;
}> {
  // Always search the full table, not per page
  if (search) {
    return {
      participants: await db
        .select()
        .from(participants)
        .where(
          or(
            ilike(participants.name, `%${search}%`),
            // Only search pn/nid if search string is a number
            sql`${participants.pn}::text = ${search} OR ${participants.nid}::text = ${search}`
          )
        )
        .limit(1000),
      newOffset: null,
      totalParticipants: 0
    };
  }

  if (offset === null) {
    return { participants: [], newOffset: null, totalParticipants: 0 };
  }

  let query = db
    .select()
    .from(participants)
    .where(
      status === 'arrived' 
        ? and(eq(participants.eventId, eventId), isNull(participants.exitedTime))
        : status === 'exited'
        ? and(eq(participants.eventId, eventId), isNotNull(participants.exitedTime))
        : eq(participants.eventId, eventId)
    );

  const totalParticipants = await db
    .select({ count: count() })
    .from(participants)
    .where(
      and(
        eq(participants.eventId, eventId),
        status === 'arrived' ? isNull(participants.exitedTime) :
        status === 'exited' ? isNotNull(participants.exitedTime) :
        undefined
      )
    );

  let moreParticipants = await query
    .limit(10)
    .offset(offset);

  let newOffset = moreParticipants.length >= 10 ? offset + 10 : null;

  return {
    participants: moreParticipants,
    newOffset,
    totalParticipants: totalParticipants[0].count
  };
}

export async function deleteParticipantById(id: number) {
  await db.delete(participants).where(eq(participants.id, id));
}

export async function checkParticipantStatus(eventId: number, pn: number): Promise<'new' | 'active' | 'exited'> {
  const existingParticipant = await db
    .select()
    .from(participants)
    .where(
      and(
        eq(participants.eventId, eventId),
        eq(participants.pn, pn)
      )
    )
    .limit(1);

  if (existingParticipant.length === 0) {
    return 'new';
  }

  return existingParticipant[0].exitedTime ? 'exited' : 'active';
}