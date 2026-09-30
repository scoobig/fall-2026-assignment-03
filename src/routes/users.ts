import { Router, Request, Response } from 'express';
import * as userDal from '../dal/users.js';

const router = Router();

// TODO: Student implementation - Part 1: User Routes
// GET /users
router.get('/', async (req: Request, res: Response) => {
  const users = await userDal.getAllUsers();
  res.json(users);
});

// GET /users/:id
router.get('/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const user = await userDal.getUserById(id);

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json(user);
});

// POST /users
router.post('/', async (req: Request, res: Response) => {
  const { name, email } = req.body;
  const newUser = await userDal.createUser({ name, email });
  res.status(201).json(newUser);
});

export default router;
