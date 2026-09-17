// backend/src/middleware/auth.ts

import { Request, Response, NextFunction } from 'express';
import jwt, { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import prisma from '../prisma';

interface JwtPayload {
  userId: number;
  role: 'ADMIN' | 'EMPLOYEE';
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: 'ADMIN' | 'EMPLOYEE';
      };
    }
  }
}

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token faltante' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      return res.status(401).json({ message: 'Usuario no existe' });
    }

    req.user = { id: payload.userId, role: payload.role };
    next();

  } catch (err: any) {
    if (err instanceof TokenExpiredError) {
      return res.status(401).json({ message: 'Token expirado' });
    }
    if (err instanceof JsonWebTokenError) {
      return res.status(401).json({ message: 'Token inválido' });
    }
    // Otros errores
    return res.status(500).json({ message: 'Error verificando el token' });
  }
};
