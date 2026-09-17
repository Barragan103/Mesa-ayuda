import { Router } from 'express';
import prisma from '../prisma';
import { verifyToken } from '../middleware/auth';
import { isAdmin } from '../middleware/role';

const router = Router();

router.get('/', verifyToken, async (_req, res) => {
  const list = await prisma.otherIssue.findMany();
  res.json(list);
});

router.post('/', verifyToken, isAdmin, async (req, res) => {
  const { descripcion } = req.body;
  const item = await prisma.otherIssue.create({ data: { descripcion } });
  res.status(201).json(item);
});

router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const { descripcion } = req.body;
  const item = await prisma.otherIssue.update({ where: { id }, data: { descripcion } });
  res.json(item);
});

router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  const id = Number(req.params.id);
  await prisma.otherIssue.delete({ where: { id } });
  res.status(204).send();
});

export default router;
