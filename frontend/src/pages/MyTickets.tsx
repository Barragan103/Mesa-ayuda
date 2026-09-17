// src/pages/MyTickets.tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

type Ticket = {
  id: number
  area: string
  software: boolean
  softwareIssue: string | null
  hardware: boolean
  hardwareIssue: string | null
  other: boolean
  otherIssue: string | null
  status: 'PENDING' | 'RESOLVED'
  resolvedBy: string | null
  createdAt: string
}

export default function MyTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    ;(async () => {
      try {
        const res = await api.get<Ticket[]>('/help-requests/me')
        setTickets(res.data)
      } catch (err) {
        console.error(err)
        alert('Error cargando tus tickets')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) return <p className="p-6">Cargando tus tickets…</p>

  return (
    <div className="max-w-9/10 mx-auto bg-white p-6 rounded-2xl shadow-lg space-y-6">
  <h1 className="text-3xl font-bold text-gray-800">Mis Tickets de Ayuda</h1>

  {tickets.length === 0 ? (
    <p className="text-center text-gray-500 italic">No tienes tickets registrados.</p>
  ) : (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-blue-50">
          <tr>
            {['Área','Software','Hardware','Otros','Estado','Creado','Acciones'].map(h => (
              <th
                key={h}
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wide"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tickets.map(t => (
            <tr
              key={t.id}
              className="hover:bg-gray-50 transition"
            >
              <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                {t.area}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                {t.software ? t.softwareIssue : '—'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                {t.hardware ? t.hardwareIssue : '—'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                {t.other ? t.otherIssue : '—'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {t.status === 'RESOLVED' ? (
                  <span className="inline-block px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                    Resuelto
                  </span>
                ) : (
                  <span className="inline-block px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">
                    En Espera
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                {new Date(t.createdAt).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => navigate(`/dashboard-employee/chat/${t.id}`)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
                >
                  Chat
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>

  )
}
