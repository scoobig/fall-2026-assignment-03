import { Request, Response, NextFunction } from 'express';

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const header = req.header('X-User-Id');

  if (header === undefined || header === '') {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const userId = Number(header);
  if (!Number.isInteger(userId) || userId <= 0) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  res.locals.userId = userId;
  next();
}

export default authMiddleware;
