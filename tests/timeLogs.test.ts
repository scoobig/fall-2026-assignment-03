import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';

describe('Part 2: Time Logs Tests', () => {
  async function createUserAndTicket() {
    const user = await request(app)
      .post('/users')
      .send({
        name: 'Time Logger',
        email: `logger-${Date.now()}@example.com`,
      });

    const ticket = await request(app)
      .post('/tickets')
      .set('X-User-Id', String(user.body.id))
      .send({
        title: 'Track hours',
        description: 'Time logging feature',
      });

    return { user, ticket };
  }

  it('rejects time logging without X-User-Id', async () => {
    const { ticket } = await createUserAndTicket();

    const res = await request(app)
      .post(`/tickets/${ticket.body.id}/time`)
      .send({ hours: 2 });

    expect(res.status).toBe(401);
  });

  it('logs hours and returns the correct aggregated total', async () => {
    const { user, ticket } = await createUserAndTicket();
    const ticketId = ticket.body.id as number;
    const userId = String(user.body.id);

    const first = await request(app)
      .post(`/tickets/${ticketId}/time`)
      .set('X-User-Id', userId)
      .send({ hours: 2 });
    expect(first.status).toBe(201);
    expect(first.body.hours).toBe(2);

    const second = await request(app)
      .post(`/tickets/${ticketId}/time`)
      .set('X-User-Id', userId)
      .send({ hours: 3 });
    expect(second.status).toBe(201);

    const third = await request(app)
      .post(`/tickets/${ticketId}/time`)
      .set('X-User-Id', userId)
      .send({ hours: 5 });
    expect(third.status).toBe(201);

    const total = await request(app).get(`/tickets/${ticketId}/time`);
    expect(total.status).toBe(200);
    expect(total.body).toEqual({
      ticket_id: ticketId,
      total_hours: 10,
    });
  });

  it('returns zero total hours when no time has been logged', async () => {
    const { ticket } = await createUserAndTicket();

    const total = await request(app).get(`/tickets/${ticket.body.id}/time`);
    expect(total.status).toBe(200);
    expect(total.body).toEqual({
      ticket_id: ticket.body.id,
      total_hours: 0,
    });
  });
});
