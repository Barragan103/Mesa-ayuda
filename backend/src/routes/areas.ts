import { Router } from 'express';
import prisma from '../prisma';
import { verifyToken } from '../middleware/auth';
import { isAdmin } from '../middleware/role';

const router = Router();

router.get('/', verifyToken, async (_req, res) => {
  const areas = await prisma.area.findMany();
  res.json(areas);
});

router.post('/', verifyToken, isAdmin, async (req, res) => {
  const { nombre } = req.body;
  const area = await prisma.area.create({ data: { nombre } });
  res.status(201).json(area);
});

router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const { nombre } = req.body;
  const area = await prisma.area.update({ where: { id }, data: { nombre } });
  res.json(area);
});

router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  const id = Number(req.params.id);
  await prisma.area.delete({ where: { id } });
  res.status(204).send();
});

export default router;
