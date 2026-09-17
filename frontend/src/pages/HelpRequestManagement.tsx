// src/pages/HelpRequestManagement.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface HelpRequest {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  area: string;
  software: boolean;
  softwareIssue: string | null;
  hardware: boolean;
  hardwareIssue: string | null;
  other: boolean;
  otherIssue: string | null;
  status: 'PENDING' | 'RESOLVED';
  resolvedBy: string | null;
  createdAt: string;
}

interface Area {
  id: number;
  nombre: string;
}

const monthNames = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
];

export default function HelpRequestManagement() {
  const [solicitudes, setSolicitudes]     = useState<HelpRequest[]>([]);
  const [areasList, setAreasList]         = useState<Area[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  const [areaFilter, setAreaFilter]       = useState('');
  const [typeFilter, setTypeFilter]       = useState('');
  const [resueltoFilter, setResueltoFilter] = useState('');
  const [mesFilter, setMesFilter]         = useState('');
  const [añoFilter, setAñoFilter]         = useState('');
  const [byFilter, setByFilter]           = useState('');

 
  useEffect(() => {
    (async () => {
      const token = localStorage.getItem('token') || '';
     
      const { data: reqs } = await axios.get<HelpRequest[]>(
        'http://localhost:4000/api/help-requests',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSolicitudes(reqs);

 
      const years = Array.from(
        new Set(
          reqs.map(r => new Date(r.createdAt).getFullYear())
        )
      ).sort((a,b) => b - a);
      setAvailableYears(years);

     
      const { data: areas } = await axios.get<Area[]>(
        'http://localhost:4000/api/areas',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAreasList(areas);
    })();
  }, []);


  const filtered = solicitudes.filter(s => {
  
    if (areaFilter && s.area !== areaFilter) return false;
    
    if (typeFilter) {
      if (typeFilter === 'software' && !s.software) return false;
      if (typeFilter === 'hardware' && !s.hardware) return false;
      if (typeFilter === 'other'    && !s.other)    return false;
    }
    
    if (resueltoFilter && s.status !== resueltoFilter) return false;
   
    const dt = new Date(s.createdAt);
    if (mesFilter && dt.getMonth() + 1 !== Number(mesFilter)) return false;
    if (añoFilter && dt.getFullYear()  !== Number(añoFilter)) return false;
    // resolvedBy
    if (byFilter && !(s.resolvedBy ?? '')
      .toLowerCase()
      .includes(byFilter.toLowerCase())
    ) return false;
    return true;
  });


  const exportExcel = async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Solicitudes');
    ws.columns = [
      { header: 'Solicitante',   key: 'solicitante', width: 25 },
      { header: 'Email',         key: 'email',       width: 30 },
      { header: 'Área',          key: 'area',        width: 15 },
      { header: 'Software',      key: 'sw',          width: 20 },
      { header: 'Hardware',      key: 'hw',          width: 20 },
      { header: 'Otros',         key: 'ot',          width: 20 },
      { header: 'Estado',        key: 'status',      width: 12 },
      { header: 'Resuelto Por',  key: 'by',          width: 25 },
      { header: 'Creación',      key: 'createdAt',   width: 20 }
    ];

    ws.getRow(1).eachCell(cell => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4F46E5' } // indigo oscuro
      };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });
    ws.autoFilter = { from: 'A1', to: 'I1' };

    filtered.forEach(s => {
      ws.addRow({
        solicitante: `${s.nombre} ${s.apellido}`,
        email:       s.email,
        area:        s.area,
        sw:          s.software   ? s.softwareIssue : '—',
        hw:          s.hardware   ? s.hardwareIssue : '—',
        ot:          s.other      ? s.otherIssue    : '—',
        status:      s.status === 'RESOLVED' ? 'Resuelto' : 'En Espera',
        by:          s.resolvedBy ?? '—',
        createdAt:   new Date(s.createdAt),
      });
    });
    ws.getColumn('createdAt').numFmt = 'dd/mm/yyyy hh:mm:ss';

    const buf = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buf]), `Solicitudes_${Date.now()}.xlsx`);
  };

  return (
    <div className="max-w-10/10 mx-auto bg-gray-50 p-6 rounded-2xl shadow-lg space-y-6">
  {/* Título */}
  <h2 className="text-3xl font-bold text-gray-800">Gestión de Solicitudes de Ayuda</h2>

  {/* Filtros */}
  <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
    <select
      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg
                 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
      value={areaFilter}
      onChange={e => setAreaFilter(e.target.value)}
    >
      <option value="">Todas las Áreas</option>
      {areasList.map(a => (
        <option key={a.id} value={a.nombre}>{a.nombre}</option>
      ))}
    </select>

    <select
      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg
                 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
      value={resueltoFilter}
      onChange={e => setResueltoFilter(e.target.value)}
    >
      <option value="">Todos los Estados</option>
      <option value="PENDING">En Espera</option>
      <option value="RESOLVED">Resuelto</option>
    </select>

    <select
      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg
                 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
      value={typeFilter}
      onChange={e => setTypeFilter(e.target.value)}
    >
      <option value="">Todos los Tipos</option>
      <option value="software">Software</option>
      <option value="hardware">Hardware</option>
      <option value="other">Otros</option>
    </select>

    <select
      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg
                 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
      value={mesFilter}
      onChange={e => setMesFilter(e.target.value)}
    >
      <option value="">Mes (Todos)</option>
      {monthNames.map((m, i) => (
        <option key={i} value={`${i+1}`}>{m}</option>
      ))}
    </select>

    <select
      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg
                 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
      value={añoFilter}
      onChange={e => setAñoFilter(e.target.value)}
    >
      <option value="">Año (Todos)</option>
      {availableYears.map(y => (
        <option key={y} value={`${y}`}>{y}</option>
      ))}
    </select>

    <input
      type="text"
      placeholder="Resuelto Por..."
      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg
                 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
      value={byFilter}
      onChange={e => setByFilter(e.target.value)}
    />
  </div>

  {/* Botón Exportar */}
  <div className="flex justify-end">
    <button
      onClick={exportExcel}
      className="px-5 py-2 bg-blue-500 text-white font-medium rounded-lg
                 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
    >
      Exportar Excel
    </button>
  </div>

  {/* Tabla de Solicitudes */}
  <div className="overflow-x-auto bg-white rounded-lg shadow divide-y divide-gray-200">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-100">
        <tr>
          {[
            'Solicitante','Área','Software',
            'Hardware','Otros','Estado',
            'Resuelto Por','Fecha Creación','Acciones'
          ].map(h => (
            <th
              key={h}
              className="px-6 py-3 text-left text-sm font-semibold text-gray-600"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {filtered.length > 0 ? (
          filtered.map(s => (
            <tr key={s.id} className="hover:bg-gray-50 transition">
              <td className="px-6 py-4 text-gray-700">
                {s.nombre} {s.apellido}
              </td>
              <td className="px-6 py-4 text-gray-700">{s.area}</td>
              <td className="px-6 py-4 text-gray-700">
                {s.software ? s.softwareIssue : '—'}
              </td>
              <td className="px-6 py-4 text-gray-700">
                {s.hardware ? s.hardwareIssue : '—'}
              </td>
              <td className="px-6 py-4 text-gray-700">
                {s.other ? s.otherIssue : '—'}
              </td>
              <td className="px-6 py-4 text-gray-700">
                {s.status === 'RESOLVED' ? 'Resuelto' : 'En Espera'}
              </td>
              <td className="px-6 py-4 text-gray-700">{s.resolvedBy ?? '—'}</td>
              <td className="px-6 py-4 text-gray-700">
                {new Date(s.createdAt).toLocaleString()}
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => window.location.href = `/dashboard-admin/chat/${s.id}`}
                    className="px-3 py-1 bg-indigo-500 text-white rounded-md text-sm
                               hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                  >
                    Chat
                  </button>
                  {s.status === 'PENDING' && (
                    <button
                      onClick={async () => {
                        const token = localStorage.getItem('token');
                        await axios.patch(
                          `http://localhost:4000/api/help-requests/${s.id}/resolve`,
                          { resolvedBy: `${localStorage.getItem('nombre')} ${localStorage.getItem('apellido')}` },
                          { headers: { Authorization: `Bearer ${token}` } }
                        );
                        setSolicitudes(prev =>
                          prev.map(x =>
                            x.id === s.id
                              ? { ...x, status: 'RESOLVED', resolvedBy: `${localStorage.getItem('nombre')} ${localStorage.getItem('apellido')}`, resolvedAt: new Date().toISOString() }
                              : x
                          )
                        );
                      }}
                      className="px-3 py-1 bg-green-500 text-white rounded-md text-sm
                                 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-200 transition"
                    >
                      Solucionado
                    </button>
                  )}
                  <button
                    onClick={async () => {
                      const token = localStorage.getItem('token');
                      await axios.delete(
                        `http://localhost:4000/api/help-requests/${s.id}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                      );
                      setSolicitudes(prev => prev.filter(x => x.id !== s.id));
                    }}
                    className="px-3 py-1 bg-red-500 text-white rounded-md text-sm
                               hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-200 transition"
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
              No hay solicitudes que coincidan.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>

  );
}
