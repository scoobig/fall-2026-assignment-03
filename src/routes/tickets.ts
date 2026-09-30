import { Router, Request, Response } from 'express';
import * as ticketDal from '../dal/tickets.js';
import * as timeLogDal from '../dal/timeLogs.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// TODO: Student implementation - Part 1: Ticket Routes
// GET /tickets
router.get('/', async (req: Request, res: Response) => {
  const limit =
    req.query.limit !== undefined ? Number(req.query.limit) : undefined;
  const offset =
    req.query.offset !== undefined ? Number(req.query.offset) : undefined;
  const status =
    req.query.status !== undefined ? String(req.query.status) : undefined;

  const tickets = await ticketDal.getAllTickets({ limit, offset, status });
  res.json(tickets);
});

// GET /tickets/:id
router.get('/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const ticket = await ticketDal.getTicketById(id);

  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  res.json(ticket);
});

// POST /tickets
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  const { title, description } = req.body;
  const creatorId = res.locals.userId;

  const newTicket = await ticketDal.createTicket({
    title,
    description,
    creator_id: creatorId,
  });
  res.status(201).json(newTicket);
});

// PATCH /tickets/:id/status
router.patch(
  '/:id/status',
  authMiddleware,
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;

    const updatedTicket = await ticketDal.updateTicketStatus(id, status);

    if (!updatedTicket) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }

    res.status(200).json(updatedTicket);
  },
);

// TODO: Student implementation - Part 2: Time Log Routes
// POST /tickets/:id/time
router.post(
  '/:id/time',
  authMiddleware,
  async (req: Request, res: Response) => {
    const ticketId = parseInt(req.params.id, 10);
    const userId = res.locals.userId;
    const { hours } = req.body;

    const log = await timeLogDal.insertTimeLog(ticketId, userId, hours);
    res.status(201).json(log);
  },
);

// GET /tickets/:id/time
router.get('/:id/time', async (req: Request, res: Response) => {
  const ticketId = parseInt(req.params.id, 10);
  const totalHours = await timeLogDal.getTotalHoursForTicket(ticketId);

  res.json({ ticket_id: ticketId, total_hours: totalHours });
});

export default router;
