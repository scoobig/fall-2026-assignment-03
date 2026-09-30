/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely, sql } from 'kysely';

// TODO: Student implementation - Part 2: Database Migration for time_logs
// Create a `time_logs` table with:
// - id: serial primary key
// - ticket_id: foreign key referencing tickets(id)
// - user_id: foreign key referencing users(id)
// - hours: integer or numeric
// - logged_at: timestamp with time zone, defaulting to current timestamp
//
// The down() method should drop the `time_logs` table.

export async function up(db: Kysely<any>): Promise<void> {
  // TODO: Student implementation
  await db.schema
    .createTable('time_logs')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('ticket_id', 'integer', (col) =>
      col.notNull().references('tickets.id').onDelete('cascade'),
    )
    .addColumn('user_id', 'integer', (col) =>
      col.notNull().references('users.id').onDelete('cascade'),
    )
    .addColumn('hours', 'integer', (col) => col.notNull())
    .addColumn('logged_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // TODO: Student implementation
  await db.schema.dropTable('time_logs').execute();
}
