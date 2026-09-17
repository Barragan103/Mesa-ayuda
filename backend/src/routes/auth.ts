import { Router } from 'express';
import prisma from '../prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = Router();

interface LoginBody {
  identifier: string;
  password: string;
}

interface RegisterBody {
  nombre: string;
  apellido: string;
  username: string;
  email: string;
  password: string;
}

router.post('/login', async (req, res) => {
  const { identifier, password } = req.body as LoginBody;

  if (!identifier || !password) {
    return res.status(400).json({ message: 'Faltan credenciales' });
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: identifier },
        { username: identifier }
      ]
    }
  });
  if (!user) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }

  if (!user) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: '8h' }
  );

  return res.json({
    token,
    role: user.role,
    nombre: user.nombre,
    apellido: user.apellido,
    username: user.username,
    email: user.email,
  });
});

router.post('/register', async (req, res) => {
  const { nombre, apellido, username, email, password, role } = req.body as RegisterBody;

  if (!nombre || !apellido || !username || !email || !password) {
    return res.status(400).json({ message: 'Faltan datos obligatorios' });
  }
  if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(password)) {
    return res.status(400).json({
      message:
        'La contraseña debe tener al menos 6 caracteres, incluir letras y números',
    });
  }

  const exists = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });
  if (exists) {
    return res
      .status(409)
      .json({ message: 'El usuario o email ya están en uso' });
  }


  const hashed = await bcrypt.hash(password, 10);


  const user = await prisma.user.create({
  data: { nombre, apellido, username, email, password: hashed, role },
});


  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: '8h' }
  );

  return res.status(201).json({
    token,
    role: user.role,
    nombre: user.nombre,
    apellido: user.apellido,
    username: user.username,
    email: user.email,
  });
});

export default router;
