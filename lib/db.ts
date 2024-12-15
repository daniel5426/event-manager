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
  arrivedTime: timestamp('arrived_time'),
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
  // Check for existing participant with same pn or nid
  const existingParticipant = await db
    .select()
    .from(participants)
    .where(
      and(
        eq(participants.eventId, eventId),
        or(
          pn ? eq(participants.pn, pn) : undefined,
          nid ? eq(participants.nid, nid) : undefined
        )
      )
    )
    .limit(1);

  // If participant already exists, throw error
  if (existingParticipant.length > 0) {
    throw new Error('משתתף עם מספר אישי או תעודת זהות זה כבר קיים');
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
      arrivedTime: null,
      exitedTime: null
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
        or(
          pn ? eq(participants.pn, pn) : undefined,
          nid ? eq(participants.nid, nid) : undefined
        )
      )
    )
    .limit(1);

  if (existingParticipant.length > 0 && existingParticipant[0].arrivedTime !== null) {
    console.log("Updating exitedTime for existing participant");
    // Update existing participant's exitedTime
    const result = await db
      .update(participants)
      .set({
        exitedTime: new Date(),
        nid: nid,
        pn: pn
      })
      .where(eq(participants.id, existingParticipant[0].id))
      .returning();

    return result[0];
  } else if (existingParticipant.length > 0 && existingParticipant[0].arrivedTime === null) {
    console.log("Updating arrivedTime for existing participant");
    // Update existing participant's arrivedTime
    const result = await db
      .update(participants)
      .set({
        arrivedTime: new Date(),
        nid: nid,
        pn: pn
      })
      .where(eq(participants.id, existingParticipant[0].id))
      .returning();
    return result[0];
  } else {
    console.log("Creating new participant");
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
  status?: 'hasnt_arrived' | 'arrived' | 'exited'
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
          and(
            eq(participants.eventId, eventId),
            or(
              ilike(participants.name, `%${search}%`),
              // Only search pn/nid if search string is a number
              ilike(participants.name, `%${search}%`),
              sql`CAST(${participants.pn} AS TEXT) ILIKE ${`%${search}%`}`,
              sql`CAST(${participants.nid} AS TEXT) ILIKE ${`%${search}%`}`
            )
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
        ? and(eq(participants.eventId, eventId), isNull(participants.exitedTime), isNotNull(participants.arrivedTime))
        : status === 'exited'
        ? and(eq(participants.eventId, eventId), isNotNull(participants.exitedTime), isNotNull(participants.arrivedTime))
        : status === 'hasnt_arrived'
        ? and(eq(participants.eventId, eventId), isNull(participants.arrivedTime))
        : eq(participants.eventId, eventId)
    );

  const totalParticipants = await db
    .select({ count: count() })
    .from(participants)
    .where(
      and(
        status === 'arrived' 
        ? and(eq(participants.eventId, eventId), isNull(participants.exitedTime), isNotNull(participants.arrivedTime))
        : status === 'exited'
        ? and(eq(participants.eventId, eventId), isNotNull(participants.exitedTime), isNotNull(participants.arrivedTime))
        : status === 'hasnt_arrived'
        ? and(eq(participants.eventId, eventId), isNull(participants.arrivedTime))
        : eq(participants.eventId, eventId)
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

export async function checkParticipantStatus(eventId: number, pn: number): Promise<{status: 'new' | 'active' | 'exited' | 'not_registered', name: string | null}> {
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
  const allParticipants = await db.select().from(participants).where(eq(participants.eventId, eventId));
  console.log(allParticipants);
  console.log(pn);


  if (existingParticipant.length === 0) {
    return { status: 'not_registered', name: null };
  }

  console.log("Existing participant:", existingParticipant);

  let status: 'new' | 'active' | 'exited' = 'new';
  if (existingParticipant[0].arrivedTime === null) {
    status = 'new';
  } else if (existingParticipant[0].exitedTime === null) {
    status = 'active';
  } else {
    status = 'exited';
  }

  return {
    status,
    name: existingParticipant[0].name
  };
}
