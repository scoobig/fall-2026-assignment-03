// TODO: Student implementation - Part 2: DAL for time logs

import { db } from '../db/database.js';

export async function insertTimeLog(
  ticketId: number,
  userId: number,
  hours: number,
): Promise<any> {
  // TODO: Student implementation
  return await db
    .insertInto('time_logs')
    .values({
      ticket_id: ticketId,
      user_id: userId,
      hours: hours,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function getTotalHoursForTicket(
  ticketId: number,
): Promise<number> {
  // TODO: Student implementation
  const result = await db
    .selectFrom('time_logs')
    .select(({ fn }) => fn.sum<number>('hours').as('total'))
    .where('ticket_id', '=', ticketId)
    .executeTakeFirst();

  return Number(result?.total ?? 0);
}
