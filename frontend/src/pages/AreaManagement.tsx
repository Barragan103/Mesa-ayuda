import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function AreaManagement() {
  const [areas, setAreas] = useState<{id:number;nombre:string}[]>([]);
  const [newName, setNewName] = useState('');
  const [editing, setEditing] = useState<number|null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => { fetchAreas() }, []);
  const fetchAreas = () => api.get('/areas').then(r => setAreas(r.data));

  const createArea = () => {
    api.post('/areas',{ nombre:newName }).then(()=>{ setNewName(''); fetchAreas(); });
  };

  const updateArea = () => {
    if(editing==null) return;
    api.put(`/areas/${editing}`,{ nombre:editName }).then(()=>{
      setEditing(null); fetchAreas();
    });
  };

  const deleteArea = (id:number) => {
    if(window.confirm('Eliminar área?')) {
      api.delete(`/areas/${id}`).then(fetchAreas);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-50 rounded-2xl shadow-lg">
      <header className="mb-6">
        <h1 className="text-4xl font-bold text-gray-800">Gestor de Áreas</h1>
      </header>

      {/* Formulario de creación */}
      <div className="mb-8 grid grid-cols-[1fr_auto] gap-4">
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="Nombre de nueva área"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-blue-200 transition-shadow"
        />
        <button
          onClick={createArea}
          className="px-6 py-3 bg-blue-500 text-white font-medium rounded-lg
                     hover:bg-blue-600 focus:ring-2 focus:ring-blue-200 transition"
        >
          Crear
        </button>
      </div>

      {/* Lista de áreas */}
      <ul className="space-y-4">
        {areas.map(a => (
          <li
            key={a.id}
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition
                       flex flex-col sm:flex-row sm:items-center sm:justify-between"
          >
            {editing === a.id ? (
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 w-full">
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50
                             focus:outline-none focus:ring-2 focus:ring-green-200 transition"
                />
                <button
                  onClick={updateArea}
                  className="mt-2 sm:mt-0 px-4 py-2 bg-green-500 text-white rounded-lg
                             hover:bg-green-600 focus:ring-2 focus:ring-green-200 transition"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setEditing(null)}
                  className="mt-2 sm:mt-0 px-4 py-2 text-gray-600 rounded-lg
                             hover:text-gray-800 transition"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
                <span className="text-gray-700 font-medium">{a.nombre}</span>
                <div className="mt-3 sm:mt-0 flex gap-3">
                  <button
                    onClick={() => { setEditing(a.id); setEditName(a.nombre); }}
                    className="px-3 py-1 text-blue-600 font-medium rounded-lg
                               hover:bg-blue-50 transition"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => deleteArea(a.id)}
                    className="px-3 py-1 text-red-600 font-medium rounded-lg
                               hover:bg-red-50 transition"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
);
}
