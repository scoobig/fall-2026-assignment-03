import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';

describe('Part 2: Time Logs Tests', () => {
  // TODO: Student implementation - Part 2: Time Logging Tests
  // Log hours for a ticket (POST /tickets/:id/time)
  // Fetch total hours for a ticket (GET /tickets/:id/time)
  // Verify aggregation math
  it('should calculate total hours for a ticket correctly', async () => {
    const userResponse = await request(app)
      .post('/users')
      .send({ name: 'Time Log User', email: 'timelog@example.com' });
    const userId = userResponse.body.id;

    const ticketResponse = await request(app)
      .post('/tickets')
      .set('X-User-Id', String(userId))
      .send({
        title: 'Time Log Ticket',
        description: 'Ticket for testing time logging',
      });

    const ticketId = ticketResponse.body.id;

    await request(app)
      .post(`/tickets/${ticketId}/time`)
      .set('X-User-Id', String(userId))
      .send({ hours: 2 })
      .expect(201);

    await request(app)
      .post(`/tickets/${ticketId}/time`)
      .set('X-User-Id', String(userId))
      .send({ hours: 3 })
      .expect(201);

    await request(app)
      .post(`/tickets/${ticketId}/time`)
      .set('X-User-Id', String(userId))
      .send({ hours: 5 })
      .expect(201);

    const response = await request(app)
      .get(`/tickets/${ticketId}/time`)
      .expect(200);

    expect(response.body.ticket_id).toBe(ticketId);
    expect(response.body.total_hours).toBe(10);
  });
});
