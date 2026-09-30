import { Router, Request, Response } from 'express';
import authMiddleware from '../middleware/auth.js';
import {
  createTicket,
  getAllTickets,
  getTicketById,
  updateTicketStatus,
} from '../dal/tickets.js';
import { getTotalHoursForTicket, insertTimeLog } from '../dal/timeLogs.js';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const limit =
    req.query.limit !== undefined ? Number(req.query.limit) : undefined;
  const offset =
    req.query.offset !== undefined ? Number(req.query.offset) : undefined;
  const status =
    typeof req.query.status === 'string' ? req.query.status : undefined;

  const tickets = await getAllTickets({
    limit: Number.isFinite(limit) ? limit : undefined,
    offset: Number.isFinite(offset) ? offset : undefined,
    status,
  });

  res.status(200).json(tickets);
});

router.get('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  const ticket = await getTicketById(id);
  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  res.status(200).json(ticket);
});

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  const { title, description } = req.body ?? {};

  if (typeof title !== 'string') {
    res.status(400).json({ error: 'title is required' });
    return;
  }

  const ticket = await createTicket({
    title,
    description: typeof description === 'string' ? description : null,
    creator_id: res.locals.userId as number,
  });

  res.status(201).json(ticket);
});

router.patch(
  '/:id/status',
  authMiddleware,
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }

    const { status } = req.body ?? {};
    if (typeof status !== 'string') {
      res.status(400).json({ error: 'status is required' });
      return;
    }

    const ticket = await updateTicketStatus(id, status);
    if (!ticket) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }

    res.status(200).json(ticket);
  },
);

router.post(
  '/:id/time',
  authMiddleware,
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }

    const ticket = await getTicketById(id);
    if (!ticket) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }

    const { hours } = req.body ?? {};
    if (typeof hours !== 'number' || !Number.isFinite(hours) || hours <= 0) {
      res.status(400).json({ error: 'hours must be a positive number' });
      return;
    }

    const timeLog = await insertTimeLog(id, res.locals.userId as number, hours);
    res.status(201).json(timeLog);
  },
);

router.get('/:id/time', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  const ticket = await getTicketById(id);
  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  const totalHours = await getTotalHoursForTicket(id);
  res.status(200).json({
    ticket_id: id,
    total_hours: totalHours,
  });
});

export default router;
