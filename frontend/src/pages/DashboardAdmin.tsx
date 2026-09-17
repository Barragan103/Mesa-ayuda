// src/pages/DashboardAdmin.tsx
import React, { useEffect, useState, useMemo, useRef } from 'react'
import domtoimage from 'dom-to-image-more'
import { saveAs } from 'file-saver'
import api from '../services/api'
import ExcelJS from 'exceljs'
import {
  ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip as PieTooltip, Legend as PieLegend,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as LineTooltip, Legend as LineLegend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip as RadarTooltip, Legend as RadarLegend
} from 'recharts'

interface HelpRequest {
  id: number
  nombre: string
  apellido: string
  area: string
  software: boolean
  hardware: boolean
  other: boolean
  status: 'PENDING' | 'RESOLVED'
  createdAt: string
  resolvedAt?: string | null
}

interface Area {
  id: number
  nombre: string
}

export default function DashboardAdmin() {

  const radialRef = useRef<HTMLDivElement>(null)
  const lineRef  = useRef<HTMLDivElement>(null)
  const radarRef = useRef<HTMLDivElement>(null)


  const [requests,  setRequests ] = useState<HelpRequest[]>([])
  const [areasList, setAreasList] = useState<Area[]>([])


  const [areaFilter,     setAreaFilter    ] = useState<string>('')
  const [stateFilter,    setStateFilter   ] = useState<string>('')  
  const [genMonthFilter, setGenMonthFilter] = useState<number | ''>('')
  const [genYearFilter,  setGenYearFilter ] = useState<number | ''>('')


  const [lineMonthFilter, setLineMonthFilter] = useState<number>(new Date().getMonth() + 1)
  const [lineYearFilter,  setLineYearFilter ] = useState<number>(new Date().getFullYear())


  useEffect(() => {
    api.get<HelpRequest[]>('/help-requests')
      .then(r => setRequests(r.data))
      .catch(console.error)

    api.get<Area[]>('/areas')
      .then(r => setAreasList(r.data))
      .catch(console.error)
  }, [])


  const filtered = useMemo(() => {
    return requests.filter(r => {
      if (areaFilter && r.area !== areaFilter) return false
      if (stateFilter && r.status !== stateFilter) return false
      const c = new Date(r.createdAt)
      if (genMonthFilter && c.getMonth() + 1 !== genMonthFilter) return false
      if (genYearFilter  && c.getFullYear()    !== genYearFilter)  return false
      return true
    })
  }, [requests, areaFilter, stateFilter, genMonthFilter, genYearFilter])


  const pendingCount  = filtered.filter(r => r.status === 'PENDING').length
  const resolvedCount = filtered.filter(r => r.status === 'RESOLVED').length


  const total = filtered.length || 1
  const radialData = useMemo(() => ([
    { key: 'Software', value: filtered.filter(r => r.software).length, color: '#1f618d' },
    { key: 'Hardware', value: filtered.filter(r => r.hardware).length, color: '#48BB78' },
    { key: 'Otros',    value: filtered.filter(r => r.other).length,    color: '#5DADE2' }
  ]), [filtered])


  const lineData = useMemo(() => {
    const days = new Date(lineYearFilter, lineMonthFilter, 0).getDate()
    const arr = Array.from({ length: days }, (_, i) => ({ day: i + 1, created: 0, resolved: 0 }))
    requests.forEach(r => {
      const c = new Date(r.createdAt)
      if (c.getMonth()+1 === lineMonthFilter && c.getFullYear() === lineYearFilter) {
        arr[c.getDate()-1].created++
      }
      if (r.resolvedAt) {
        const d = new Date(r.resolvedAt)
        if (d.getMonth()+1 === lineMonthFilter && d.getFullYear() === lineYearFilter) {
          arr[d.getDate()-1].resolved++
        }
      }
    })
    return arr
  }, [requests, lineMonthFilter, lineYearFilter])


  const radarData = useMemo(() => {
    return areasList.map(a => {
      const areaReqs = filtered.filter(r => r.area === a.nombre)
      return {
        area:     a.nombre,
        software: areaReqs.filter(r => r.software).length,
        hardware: areaReqs.filter(r => r.hardware).length,
        other:    areaReqs.filter(r => r.other).length
      }
    })
  }, [areasList, filtered])


  const maxRadar = Math.max(
    ...radarData.flatMap(d => [d.software, d.hardware, d.other]),
    1
  )


  const downloadChart = (ref: React.RefObject<HTMLDivElement>, name: string) => {
    const node = ref.current
    if (!node) return


    const style = {
      width:  `${node.offsetWidth}px`,
      height: `${node.offsetHeight}px`
    }

    domtoimage.toBlob(node, { style, cacheBust: true })
      .then(blob => saveAs(blob!, `${name}-${Date.now()}.png`))
      .catch(console.error)
  }


  const exportExcel = async () => {
    const wb = new ExcelJS.Workbook()

    const ws1 = wb.addWorksheet('Distribución')
    ws1.columns = [
      { header: 'Tipo',     key: 'key',     width: 20 },
      { header: 'Cantidad', key: 'value',   width: 12 }
    ]
    radialData.forEach(d => ws1.addRow(d))


    const ws2 = wb.addWorksheet('Por Día')
    ws2.columns = [
      { header: 'Día',      key: 'day',      width: 8  },
      { header: 'Creadas',  key: 'created',  width: 12 },
      { header: 'Resueltas',key: 'resolved', width: 12 }
    ]
    lineData.forEach(d => ws2.addRow(d))


    const ws3 = wb.addWorksheet('Por Área')
    ws3.columns = [
      { header: 'Área',     key: 'area',     width: 20 },
      { header: 'Software', key: 'software', width: 12 },
      { header: 'Hardware', key: 'hardware', width: 12 },
      { header: 'Otros',    key: 'other',    width: 12 }
    ]
    radarData.forEach(d => ws3.addRow(d))

    const buf = await wb.xlsx.writeBuffer()
    saveAs(new Blob([buf]), `Dashboard_${Date.now()}.xlsx`)
  }

  return (
    <div className="max-w-10/10 mx-auto bg-gray-50 text-gray-900 p-6 rounded-2xl shadow-lg space-y-6">
  {/* Título */}
  <h1 className="text-3xl font-extrabold">Panel de Administración</h1>

  {/* Filtros generales */}
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
    {[ 
      { value: areaFilter, onChange: e => setAreaFilter(e.target.value), options: ['Todas las Áreas', ...areasList.map(a=>a.nombre)] },
      { value: stateFilter, onChange: e => setStateFilter(e.target.value), options: ['Todos los Estados', 'PENDING', 'RESOLVED'] },
      { value: genMonthFilter, onChange: e => setGenMonthFilter(e.target.value?+e.target.value:''), options: ['Mes (Todos)', ...Array.from({length:12},(_,i)=>new Date(0,i).toLocaleDateString('es',{month:'long'}))] },
      { value: genYearFilter, onChange: e => setGenYearFilter(e.target.value?+e.target.value:''), options: ['Año (Todos)', ...Array.from(new Set(requests.map(r=>new Date(r.createdAt).getFullYear()))).sort((a,b)=>b-a)] }
    ].map((filter, idx) => (
      <select
        key={idx}
        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg
                   focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
        value={filter.value}
        onChange={filter.onChange}
      >
        {filter.options.map(opt => (
          <option key={opt} value={opt === filter.options[0] ? '' : opt}>
            {opt}
          </option>
        ))}
      </select>
    ))}
  </div>

  {/* Tarjetas de conteo */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:shadow-md transition">
      <p className="text-sm uppercase text-gray-500">En Espera</p>
      <p className="mt-2 text-4xl font-bold text-blue-600">{pendingCount}</p>
    </div>
    <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:shadow-md transition">
      <p className="text-sm uppercase text-gray-500">Resueltas</p>
      <p className="mt-2 text-4xl font-bold text-green-600">{resolvedCount}</p>
    </div>
  </div>

  {/* Gráficas */}
  <div className="grid md:grid-cols-3 gap-6">
    {/* Radial */}
    <div className="bg-white rounded-lg border border-gray-200 shadow p-4 flex flex-col" ref={radialRef}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-gray-700">Distribución por Tipo</h2>
        <button
          onClick={exportExcel}
          className="px-3 py-1 bg-blue-500 text-white rounded-lg
                     hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
        >
          Exportar Excel
        </button>
      </div>
      <ResponsiveContainer width="100%" height={310}>
        <PieChart>
          {radialData.map((c,i) => (
            <Pie
              key={c.key}
              data={[{ name: c.key, value: c.value }, { name: 'resto', value: total - c.value }]}
              dataKey="value"
              innerRadius={50 + i*30}
              outerRadius={70 + i*30}
              startAngle={90}
              endAngle={-270}
              paddingAngle={2}
            >
              <Cell fill={c.color} />
              <Cell fill="#F3F4F6" />
            </Pie>
          ))}
          <PieTooltip />
          <PieLegend
            payload={radialData.map(c=>({ value:c.key, type:'circle', color:c.color }))}
            layout="vertical"
            align="right"
            verticalAlign="middle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>

    {/* Line */}
    <div className="bg-white rounded-lg border border-gray-200 shadow p-4 flex flex-col" ref={lineRef}>
      <div className="flex gap-2 mb-4">
        {[ 
          { value: lineMonthFilter, onChange: e=>setLineMonthFilter(+e.target.value), options: Array.from({length:12},(_,i)=>new Date(0,i).toLocaleDateString('es',{month:'long'})) },
          { value: lineYearFilter, onChange: e=>setLineYearFilter(+e.target.value), options: Array.from(new Set(requests.map(r=>new Date(r.createdAt).getFullYear()))).sort((a,b)=>b-a) }
        ].map((f, idx) => (
          <select
            key={idx}
            className="px-3 py-1 bg-white border border-gray-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
            value={f.value}
            onChange={f.onChange}
          >
            {f.options.map(opt => (
              <option key={opt} value={opt === f.options[0] ? '' : opt}>
                {opt}
              </option>
            ))}
          </select>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={310}>
        <LineChart data={lineData} margin={{ top:5,right:20,bottom:5,left:0 }}>
          <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
          <XAxis dataKey="day" stroke="#6B7280" />
          <YAxis allowDecimals={false} stroke="#6B7280" />
          <LineTooltip />
          <LineLegend />
          <Line type="monotone" dataKey="created" name="Creadas" stroke="#3B82F6" />
          <Line type="monotone" dataKey="resolved" name="Resueltas" stroke="#10B981" />
        </LineChart>
      </ResponsiveContainer>
    </div>

    {/* Radar */}
    <div className="bg-white rounded-lg border border-gray-200 shadow p-4 flex flex-col" ref={radarRef}>
      <h2 className="font-semibold text-gray-700 mb-4">Detalle por Área</h2>
      <ResponsiveContainer width="100%" height={310}>
        <RadarChart data={radarData} margin={{ top:20,right:20,bottom:20,left:20 }}>
          <PolarGrid stroke="#E5E7EB" />
          <PolarAngleAxis dataKey="area" stroke="#6B7280" />
          <PolarRadiusAxis domain={[0, maxRadar]} stroke="#9CA3AF" />
          <Radar name="Software" dataKey="software" stroke="#60A5FA" fill="#BFDBFE" fillOpacity={0.6} />
          <Radar name="Hardware" dataKey="hardware" stroke="#34D399" fill="#A7F3D0" fillOpacity={0.6} />
          <Radar name="Otros" dataKey="other" stroke="#C084FC" fill="#E9D5FF" fillOpacity={0.6} />
          <RadarTooltip />
          <RadarLegend verticalAlign="bottom" height={36} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  </div>

  {/* Tablas de detalle */}
  <div className="grid md:grid-cols-2 gap-6">
    {[
      { title: 'Solicitudes En Espera', data: filtered.filter(r=>r.status==='PENDING'), color: 'text-blue-600' },
      { title: 'Solicitudes Resueltas', data: filtered.filter(r=>r.status==='RESOLVED'), color: 'text-green-600' }
    ].map((section, idx) => (
      <div key={idx} className="bg-white rounded-lg border border-gray-200 shadow p-4">
        <h3 className="font-semibold text-gray-700 mb-2">{section.title}</h3>
        <table className="w-full text-sm text-gray-700">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="py-1 text-left">Solicitante</th>
              <th className="py-1 text-left">Área</th>
              <th className="py-1 text-left">Estado</th>
            </tr>
          </thead>
          <tbody>
            {section.data.length > 0 ? section.data.map(r => (
              <tr key={r.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                <td className="py-1">{r.nombre} {r.apellido}</td>
                <td className="py-1">{r.area}</td>
                <td className={`py-1 font-medium ${section.color}`}>
                  {section.title.includes('Espera') ? 'En Espera' : 'Resuelta'}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={3} className="py-2 text-center text-gray-500">—</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    ))}
  </div>
</div>


  )
}
