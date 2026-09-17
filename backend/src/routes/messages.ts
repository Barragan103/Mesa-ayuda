import { Router } from 'express';
import prisma from '../prisma';
import { verifyToken } from '../middleware/auth';
import { isAdmin, isEmployee } from '../middleware/role';
import { AuthRequest } from '../middleware/auth';

const router = Router({ mergeParams: true });


router.get(
  '/',
  verifyToken,
  async (req: AuthRequest, res) => {
    const helpRequestId = Number(req.params.helpRequestId);
    const me = req.user!;
    const msgs = await prisma.message.findMany({
      where: { helpRequestId },
      include: { sender: { select: { id: true, nombre: true, apellido: true, role: true } } },
      orderBy: { createdAt: 'asc' }
    });
    res.json(msgs);
  }
);


router.post(
  '/',
  verifyToken,
  async (req: AuthRequest, res) => {
    const helpRequestId = Number(req.params.helpRequestId);
    const senderId = req.user!.id;
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'El mensaje no puede estar vacío' });
    const msg = await prisma.message.create({
      data: { helpRequestId, senderId, content }
    });
    res.status(201).json(msg);
  }
);

router.get(
  '/help-requests/:id/messages',
  verifyToken,
  async (req: AuthRequest, res) => {
    const ticketId = Number(req.params.id);

    if (req.user!.role === 'EMPLOYEE') {
      const existe = await prisma.helpRequest.findUnique({
        where: { id: ticketId },
        select: { solicitanteId: true }
      });
      if (!existe || existe.solicitanteId !== req.user!.id) {
        return res.status(403).json({ message: 'Acceso denegado' });
      }
    }

    const msgs = await prisma.message.findMany({
      where: { helpRequestId: ticketId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: { id: true, nombre: true, apellido: true, role: true }
        }
      }
    });
    res.json(msgs);
  }
);


router.post(
  '/help-requests/:id/messages',
  verifyToken,
  async (req: AuthRequest, res) => {
    const ticketId = Number(req.params.id);
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Mensaje vacío' });


    if (req.user!.role === 'EMPLOYEE') {
      const existe = await prisma.helpRequest.findUnique({
        where: { id: ticketId },
        select: { solicitanteId: true }
      });
      if (!existe || existe.solicitanteId !== req.user!.id) {
        return res.status(403).json({ message: 'Acceso denegado' });
      }
    }

    const msg = await prisma.message.create({
      data: {
        content,
        helpRequest: { connect: { id: ticketId } },
        sender:      { connect: { id: req.user!.id } }
      },
      include: {
        sender: { select: { id: true, nombre: true, apellido: true } }
      }
    });
    res.status(201).json(msg);
  }
);

export default router;
