// backend/src/routes/helpRequests.ts
import { Router } from 'express'
import prisma from '../prisma'
import { AuthRequest, verifyToken } from '../middleware/auth'
import { isEmployee, isAdmin } from '../middleware/role'
import { sendHelpRequestNotification } from '../utils/mail'

const router = Router()

router.use(verifyToken)

router.post(
  '/',
  isEmployee,
  async (req: AuthRequest, res) => {
    const {
      nombre,
      apellido,
      email,
      area,
      software,
      softwareIssue,
      hardware,
      hardwareIssue,
      other,
      otherIssue,
    } = req.body


    if (!nombre || !apellido || !email || !area) {
      return res.status(400).json({ message: 'Faltan datos obligatorios' })
    }

    try {
      const help = await prisma.helpRequest.create({
        data: {
          nombre,
          apellido,
          email,
          area,
          software,
          softwareIssue: software ? softwareIssue : null,
          hardware,
          hardwareIssue: hardware ? hardwareIssue : null,
          other,
          otherIssue: other ? otherIssue : null,
          status: 'PENDING',
          solicitanteId: req.user!.id,
        },
      })

      //await sendHelpRequestNotification({
      //  id:       help.id,
      //  nombre:   help.nombre,
      //  apellido: help.apellido,
      //  area:     help.area,
      // })

      res.status(201).json(help)

    } catch (err: any) {
      console.error('Error en POST /api/help-requests →', err)
      res
        .status(500)
        .json({ message: 'Error creando la solicitud o enviando el correo' })
    }
  }
)

router.get(
  '/me',
  isEmployee,
  async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id
      const tickets = await prisma.helpRequest.findMany({
        where: { solicitanteId: userId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          nombre: true,
          apellido: true,
          email: true,
          area: true,
          software: true,
          softwareIssue: true,
          hardware: true,
          hardwareIssue: true,
          other: true,
          otherIssue: true,
          status: true,
          resolvedBy: true,
          createdAt: true,
        },
      })
      res.json(tickets)
    } catch (err) {
      console.error('Error en GET /api/help-requests/me →', err)
      res.status(500).json({ message: 'Error interno al listar tus tickets' })
    }
  }
)


router.get(
  '/',
  isAdmin,
  async (req, res) => {
    try {
      const { mes, año, resolvedBy } = req.query
      const where: any = {}

      if (mes && año) {
        const month = Number(mes)
        const year = Number(año)
        where.resolvedAt = {
          gte: new Date(year, month - 1, 1),
          lt:  new Date(year, month, 1),
        }
      }
      if (resolvedBy) {
        where.resolvedBy = String(resolvedBy)
      }

      const list = await prisma.helpRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      })
      res.json(list)
    } catch (err) {
      console.error('Error en GET /api/help-requests →', err)
      res.status(500).json({ message: 'Error al listar solicitudes' })
    }
  }
)


router.patch(
  '/:id/resolve',
  isAdmin,
  async (req, res) => {
    const id = Number(req.params.id)
    const { resolvedBy } = req.body
    if (!resolvedBy) {
      return res.status(400).json({ message: 'resolvedBy es obligatorio' })
    }
    try {
      const updated = await prisma.helpRequest.update({
        where: { id },
        data: {
          status:     'RESOLVED',
          resolvedBy,
          resolvedAt: new Date(),
        },
      })
      res.json(updated)
    } catch (err) {
      console.error(`Error en PATCH /api/help-requests/${id}/resolve →`, err)
      res.status(404).json({ message: 'Solicitud no encontrada' })
    }
  }
)

router.delete(
  '/:id',
  isAdmin,
  async (req, res) => {
    const id = Number(req.params.id)
    try {
      await prisma.helpRequest.delete({ where: { id } })
      res.status(204).send()
    } catch (err) {
      console.error(`Error en DELETE /api/help-requests/${id} →`, err)
      res.status(404).json({ message: 'Solicitud no encontrada' })
    }
  }
)

export default router
