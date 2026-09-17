// backend/src/routes/users.ts

import { Router } from 'express';
import prisma from '../prisma';
import bcrypt from 'bcrypt';
import { AuthRequest } from '../middleware/auth';
import { verifyToken } from '../middleware/auth';
import { isAdmin } from '../middleware/role';

const router = Router();


router.get('/', async (_req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, nombre: true, apellido: true, username: true, email: true, role: true, areaId: true, createdAt: true }
  });
  res.json(users);
});


router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, nombre: true, apellido: true, username: true, email: true, role: true, areaId: true, createdAt: true }
  });
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  res.json(user);
});


router.post('/', async (req: AuthRequest, res) => {
  const { nombre, apellido, username, email, password, role, areaId } = req.body;
  if (!nombre || !apellido || !username || !email || !password || !role) {
    return res.status(400).json({ message: 'Faltan datos obligatorios' });
  }

  const exists = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] }
  });
  if (exists) {
    return res.status(409).json({ message: 'Email o username ya en uso' });
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { nombre, apellido, username, email, password: hashed, role, areaId: areaId || null }
  });
  res.status(201).json({
    id: user.id,
    nombre: user.nombre,
    apellido: user.apellido,
    username: user.username,
    email: user.email,
    role: user.role,
    areaId: user.areaId,
    createdAt: user.createdAt
  });
});


router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { nombre, apellido, username, email, role, areaId } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id },
      data: { nombre, apellido, username, email, role, areaId: areaId || null }
    });
    res.json({
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      username: user.username,
      email: user.email,
      role: user.role,
      areaId: user.areaId,
      createdAt: user.createdAt
    });
  } catch {
    res.status(404).json({ message: 'Usuario no encontrado' });
  }
});


router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    await prisma.user.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(404).json({ message: 'Usuario no encontrado' });
  }
});


router.patch('/:id/area', verifyToken, isAdmin, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const { areaId } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id },
      data: { areaId: areaId || null }
    });
    res.json(user);
  } catch {
    res.status(404).json({ message: 'Usuario no encontrado' });
  }
});


router.patch('/:id/password', verifyToken, isAdmin, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ message: 'La nueva contraseña es obligatoria' });
  }
  try {
    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.update({ where: { id }, data: { password: hashed } });
    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch {
    res.status(404).json({ message: 'Usuario no encontrado' });
  }
});

export default router;
