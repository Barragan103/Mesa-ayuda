// src/pages/ProblemStatsInteractive.tsx
import React, { useEffect, useState, useMemo } from 'react'
import api from '../services/api'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

interface HelpRequest {
  area:         string
  software:     boolean
  softwareIssue: string | null
  hardware:     boolean
  hardwareIssue: string | null
  other:        boolean
  otherIssue:   string | null
  createdAt:    string
}
interface Area { id: number; nombre: string }
type CountMap = Record<string, number>

export default function ProblemStatsInteractive() {
 
  const [requests,   setRequests]   = useState<HelpRequest[]>([])
  const [areas,      setAreas]      = useState<Area[]>([])
  const [areaFilter, setAreaFilter] = useState<string>('')
  const [month,      setMonth]      = useState<number|''>('')
  const [year,       setYear]       = useState<number|''>('')

  
  useEffect(() => {
    api.get<HelpRequest[]>('/help-requests')
      .then(r => setRequests(r.data))
      .catch(console.error)
    api.get<Area[]>('/areas')
      .then(r => setAreas(r.data))
      .catch(console.error)
  }, [])

  
  const filtered = useMemo(() => {
    return requests.filter(r => {
      const d = new Date(r.createdAt)
      if (areaFilter && r.area !== areaFilter) return false
      if (month    && d.getMonth()+1 !== month)    return false
      if (year     && d.getFullYear() !== year)    return false
      return true
    })
  }, [requests, areaFilter, month, year])

  
  const tally = (arr: string[]) =>
    arr.reduce<CountMap>((acc, cur) => {
      if (!cur) return acc
      acc[cur] = (acc[cur] || 0) + 1
      return acc
    }, {})

  
  const softwareAll = tally(
    filtered.filter(r=>r.software).map(r=>r.softwareIssue!)
  )
  const hardwareAll = tally(
    filtered.filter(r=>r.hardware).map(r=>r.hardwareIssue!)
  )
  const otherAll = tally(
    filtered.filter(r=>r.other).map(r=>r.otherIssue!)
  )
 
  const totalSoftware = Object.values(softwareAll).reduce((a,b)=>a+b,0)
  const totalHardware = Object.values(hardwareAll).reduce((a,b)=>a+b,0)
  const totalOther    = Object.values(otherAll).reduce((a,b)=>a+b,0)

 
  const areaStats = useMemo(() => {
    return areas.map(a => {
      const byArea = filtered.filter(r=>r.area===a.nombre)
      return {
        nombre: a.nombre,
        sw: tally(byArea.filter(r=>r.software).map(r=>r.softwareIssue!)),
        hw: tally(byArea.filter(r=>r.hardware).map(r=>r.hardwareIssue!)),
        ot: tally(byArea.filter(r=>r.other).map(r=>r.otherIssue!)),
      }
    })
  }, [areas, filtered])

  
  const sortDesc = (m:CountMap) =>
    Object.entries(m).sort(([,a],[,b])=>b-a)

   
  const exportExcel = async () => {
    
    const wb = new ExcelJS.Workbook();

    const pastel = {
      general:  'FFEEEAF5',
      software: 'FFFAE5E5',
      hardware: 'FFE8F6EF',
      other:    'FFF5F3E7',
      area:     'FFE8F1FA'
    };

    
    const g = wb.addWorksheet('Resumen General');
    g.columns = [
      { header: 'Tipo',  key: 'tipo', width: 15 },
      { header: 'Total', key: 'tot',  width: 10 },
    ];
    [
      ['Software', totalSoftware],
      ['Hardware', totalHardware],
      ['Otros',    totalOther],
    ].forEach(([t, v]) =>
      g.addRow({ tipo: t, tot: v as number })
    );
    g.getRow(1).eachCell(c => {
      c.fill = {
        type: 'pattern', pattern: 'solid',
        fgColor: { argb: pastel.general },
      };
      c.font = { bold: true };
    });

    
    if (areaStats && Array.isArray(areaStats)) {
      areaStats.forEach(area => {
        const ws = wb.addWorksheet(area.nombre);
        ws.columns = [
          { header: 'Tipo',  key: 'tipo',  width: 12 },
          { header: 'Issue', key: 'issue', width: 30 },
          { header: 'Veces', key: 'count', width: 10 },
        ];
        ws.getRow(1).eachCell(c => {
          c.fill = {
            type: 'pattern', pattern: 'solid',
            fgColor: { argb: pastel.area },
          };
          c.font = { bold: true };
        });

        
        sortDesc(area.sw).forEach(([iss, cnt]) => {
          ws.addRow({ tipo: 'Software', issue: iss, count: cnt });
        });
        
        sortDesc(area.hw).forEach(([iss, cnt]) => {
          ws.addRow({ tipo: 'Hardware', issue: iss, count: cnt });
        });
       
        sortDesc(area.ot).forEach(([iss, cnt]) => {
          ws.addRow({ tipo: 'Otros', issue: iss, count: cnt });
        });
      });
    }

   
    const buf = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buf]), `Stats_${Date.now()}.xlsx`);
  };


  
  return (
    <div className="max-w-5xl mx-auto bg-gray-50 p-6 rounded-2xl shadow-lg space-y-6">
  {/* Título */}
  <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-2">
    📊 Estadísticas de Problemas
  </h1>

  {/* Filtros */}
  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
    <select
      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg
                 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
      onChange={e => setAreaFilter(e.target.value)}
      value={areaFilter}
    >
      <option value="">Todas las Áreas</option>
      {areas.map(a => (
        <option key={a.id} value={a.nombre}>{a.nombre}</option>
      ))}
    </select>

    <select
      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg
                 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
      onChange={e => setMonth(e.target.value ? +e.target.value : '')}
      value={month}
    >
      <option value="">Mes (Todos)</option>
      {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
        <option key={m} value={m}>
          {new Date(0, m - 1).toLocaleDateString('es', { month: 'long' })}
        </option>
      ))}
    </select>

    <select
      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg
                 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
      onChange={e => setYear(e.target.value ? +e.target.value : '')}
      value={year}
    >
      <option value="">Año (Todos)</option>
      {[...new Set(requests.map(r => new Date(r.createdAt).getFullYear()))]
        .sort((a, b) => b - a)
        .map(y => (
          <option key={y} value={y}>{y}</option>
        ))}
    </select>

    <button
      onClick={exportExcel}
      className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white font-medium rounded-lg
                 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
    >
       Exportar Excel
    </button>
  </div>

  {/* Resumen general */}
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center
                    hover:shadow-lg transition">
      <h2 className="text-gray-600 font-semibold mb-2">Software</h2>
      <p className="text-4xl font-bold text-red-600">{totalSoftware}</p>
    </div>
    <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center
                    hover:shadow-lg transition">
      <h2 className="text-gray-600 font-semibold mb-2">Hardware</h2>
      <p className="text-4xl font-bold text-green-600">{totalHardware}</p>
    </div>
    <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center
                    hover:shadow-lg transition">
      <h2 className="text-gray-600 font-semibold mb-2">Otros</h2>
      <p className="text-4xl font-bold text-blue-600">{totalOther}</p>
    </div>
  </div>

  {/* Tablas por área */}
  <div className="space-y-4">
    {areaStats.map(({ nombre, sw, hw, ot }) => (
      <details
        key={nombre}
        className="bg-white rounded-lg shadow divide-y divide-gray-200 overflow-hidden"
      >
        <summary className="px-5 py-3 bg-gray-100 hover:bg-gray-200 cursor-pointer
                            transition text-gray-700 font-medium flex justify-between items-center">
          <span>{nombre}</span>
          <span className="text-sm text-gray-500">Ver detalles</span>
        </summary>

        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Software', data: sw, color: 'text-red-600' },
            { title: 'Hardware', data: hw, color: 'text-green-600' },
            { title: 'Otros',    data: ot, color: 'text-blue-600' }
          ].map(({ title, data, color }) => (
            <div key={title} className="space-y-2">
              <h3 className="text-gray-700 font-semibold">{title}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm divide-y divide-gray-100">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-gray-600">Issue</th>
                      <th className="px-3 py-2 text-right text-gray-600">Veces</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortDesc(data).map(([iss, c]) => (
                      <tr key={iss} className="hover:bg-gray-50 transition">
                        <td className="px-3 py-2 text-gray-700">{iss}</td>
                        <td className={`px-3 py-2 text-right font-semibold ${color}`}>{c}</td>
                      </tr>
                    ))}
                    {!Object.keys(data).length && (
                      <tr>
                        <td colSpan={2} className="px-3 py-4 text-center text-gray-500">—</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </details>
    ))}
  </div>
</div>
  )
}
