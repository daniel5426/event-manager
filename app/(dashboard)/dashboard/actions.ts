'use server';

import { db, events, participants } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { startOfMonth, subMonths, format } from 'date-fns';

export async function getEventsData() {
  const result = await db
    .select({
      eventName: events.name,
      participantCount: sql<number>`count(${participants.id})`
    })
    .from(events)
    .leftJoin(participants, sql`${events.id} = ${participants.eventId}`)
    .groupBy(events.id)
    .orderBy(events.id);

  return result.map(r => ({
    name: r.eventName,
    value: Number(r.participantCount)
  }));
}

export async function getMonthlyParticipants() {
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return format(startOfMonth(date), 'yyyy-MM');
  }).reverse();

  const result = await db
    .select({
      month: sql<string>`to_char(${participants.arrivedTime}, 'YYYY-MM')`,
      total: sql<number>`count(${participants.id})`,
      arriving: sql<number>`count(case when ${participants.exitedTime} is null then 1 end)`
    })
    .from(participants)
    .where(sql`${participants.arrivedTime} >= date_trunc('month', current_date - interval '6 months')`)
    .groupBy(sql`to_char(${participants.arrivedTime}, 'YYYY-MM')`);

  return last6Months.map(month => ({
    month,
    total: Math.round(Number(result.find(r => r.month === month)?.total || 0)),
    arriving: Math.round(Number(result.find(r => r.month === month)?.arriving || 0))
  }));
}

export async function getBimonthlyEvents() {
  const last12Months = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), i * 2);
    return format(startOfMonth(date), 'yyyy-MM');
  }).reverse();

  const result = await db
    .select({
      period: sql<string>`to_char(${events.eventDate}, 'YYYY-MM')`,
      eventCount: sql<number>`count(${events.id})`
    })
    .from(events)
    .where(sql`${events.eventDate} >= date_trunc('month', current_date - interval '12 months')`)
    .groupBy(sql`to_char(${events.eventDate}, 'YYYY-MM')`);

  return last12Months.map(month => ({
    period: month,
    events: Number(result.find(r => r.period === month)?.eventCount || 0)
  }));
} 