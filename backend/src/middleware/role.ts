// backend/src/middleware/role.ts
import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const isAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== 'ADMIN')
    return res.status(403).json({ message: 'Requiere rol ADMIN' });
  next();
};

export const isEmployee = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== 'EMPLOYEE')
    return res.status(403).json({ message: 'Requiere rol EMPLOYEE' });
  next();
};
