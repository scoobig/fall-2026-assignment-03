import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';

describe('Part 1: API Integration Tests', () => {
  it('creates a user and returns 201', async () => {
    const res = await request(app).post('/users').send({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
    });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
    });
    expect(res.body.id).toBeDefined();
  });

  it('returns all users and a single user by id', async () => {
    const created = await request(app).post('/users').send({
      name: 'Grace Hopper',
      email: 'grace@example.com',
    });

    const list = await request(app).get('/users');
    expect(list.status).toBe(200);
    expect(list.body).toHaveLength(1);
    expect(list.body[0].email).toBe('grace@example.com');

    const single = await request(app).get(`/users/${created.body.id}`);
    expect(single.status).toBe(200);
    expect(single.body.name).toBe('Grace Hopper');
  });

  it('returns 404 for a non-existent user', async () => {
    const res = await request(app).get('/users/99999');
    expect(res.status).toBe(404);
  });

  it('rejects ticket creation without X-User-Id', async () => {
    const res = await request(app).post('/tickets').send({
      title: 'Missing auth',
      description: 'should fail',
    });

    expect(res.status).toBe(401);
  });

  it('rejects ticket creation with an invalid X-User-Id', async () => {
    const res = await request(app)
      .post('/tickets')
      .set('X-User-Id', 'not-a-number')
      .send({
        title: 'Invalid auth',
        description: 'should fail',
      });

    expect(res.status).toBe(401);
  });

  it('creates a ticket and returns 201', async () => {
    const user = await request(app).post('/users').send({
      name: 'Ticket Creator',
      email: 'creator@example.com',
    });

    const res = await request(app)
      .post('/tickets')
      .set('X-User-Id', String(user.body.id))
      .send({
        title: 'Implement API',
        description: 'Build Express routes',
      });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      title: 'Implement API',
      description: 'Build Express routes',
      creator_id: user.body.id,
      status: 'TODO',
    });
  });

  it('returns 404 for a non-existent ticket', async () => {
    const res = await request(app).get('/tickets/99999');
    expect(res.status).toBe(404);
  });

  it('supports pagination and status filtering on GET /tickets', async () => {
    const user = await request(app).post('/users').send({
      name: 'Pager',
      email: 'pager@example.com',
    });

    for (let i = 1; i <= 5; i++) {
      await request(app)
        .post('/tickets')
        .set('X-User-Id', String(user.body.id))
        .send({ title: `Ticket ${i}`, description: `Desc ${i}` });
    }

    const firstPage = await request(app).get('/tickets?limit=2&offset=0');
    expect(firstPage.status).toBe(200);
    expect(firstPage.body).toHaveLength(2);
    expect(firstPage.body[0].title).toBe('Ticket 1');
    expect(firstPage.body[1].title).toBe('Ticket 2');

    const secondPage = await request(app).get('/tickets?limit=2&offset=2');
    expect(secondPage.status).toBe(200);
    expect(secondPage.body).toHaveLength(2);
    expect(secondPage.body[0].title).toBe('Ticket 3');

    const todoTickets = await request(app).get('/tickets?status=TODO');
    expect(todoTickets.status).toBe(200);
    expect(todoTickets.body).toHaveLength(5);
    expect(
      todoTickets.body.every((t: { status: string }) => t.status === 'TODO'),
    ).toBe(true);
  });

  it('updates a ticket status with auth middleware', async () => {
    const user = await request(app).post('/users').send({
      name: 'Updater',
      email: 'updater@example.com',
    });

    const ticket = await request(app)
      .post('/tickets')
      .set('X-User-Id', String(user.body.id))
      .send({ title: 'Status change', description: 'Move to in progress' });

    const updated = await request(app)
      .patch(`/tickets/${ticket.body.id}/status`)
      .set('X-User-Id', String(user.body.id))
      .send({ status: 'IN_PROGRESS' });

    expect(updated.status).toBe(200);
    expect(updated.body.status).toBe('IN_PROGRESS');
  });
});
