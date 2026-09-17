import { Router } from 'express';
import prisma from '../prisma';
import { verifyToken } from '../middleware/auth';
import { isAdmin } from '../middleware/role';

const router = Router();

router.get('/', verifyToken, async (_req, res) => {
  const list = await prisma.hardwareIssue.findMany();
  res.json(list);
});

router.post('/', verifyToken, isAdmin, async (req, res) => {
  const { descripcion } = req.body;
  const item = await prisma.hardwareIssue.create({ data: { descripcion } });
  res.status(201).json(item);
});

router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const { descripcion } = req.body;
  const item = await prisma.hardwareIssue.update({ where: { id }, data: { descripcion } });
  res.json(item);
});

router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  const id = Number(req.params.id);
  await prisma.hardwareIssue.delete({ where: { id } });
  res.status(204).send();
});

export default router;
