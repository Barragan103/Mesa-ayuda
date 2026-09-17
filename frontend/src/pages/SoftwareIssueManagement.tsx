import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function SoftwareIssueManagement() {
  const [items, setItems] = useState<{id:number;descripcion:string}[]>([]);
  const [newDesc, setNewDesc] = useState('');
  const [editing, setEditing] = useState<number|null>(null);
  const [editDesc, setEditDesc] = useState('');

  useEffect(() => {
    
    async function fetchItems() {
      try {
        const res = await api.get('/issues/software');
        setItems(res.data);
      } catch (err) {
        console.error('Error cargando software issues', err);
      }
    }
    
    fetchItems();
    
  }, []);
  const fetch = () => api.get('/issues/software').then(r=>setItems(r.data));

  const create = () => {
    api.post('/issues/software',{ descripcion:newDesc }).then(()=>{ setNewDesc(''); fetch(); });
  };
  const update = () => {
    if(editing==null) return;
    api.put(`/issues/software/${editing}`,{ descripcion:editDesc }).then(()=>{
      setEditing(null); fetch();
    });
  };
  const remove = (id:number) => {
    if(window.confirm('Eliminar?')) api.delete(`/issues/software/${id}`).then(fetch);
  };

  return (
    <div className="max-w-3xl mx-auto bg-gray-50 p-6 rounded-2xl shadow-lg space-y-6">
  {/* Título */}
  <h1 className="text-3xl font-bold text-gray-800">Gestor Software Issues</h1>

  {/* Formulario de creación */}
  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
    <input
      value={newDesc}
      onChange={e => setNewDesc(e.target.value)}
      placeholder="Nueva descripción"
      className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg
                 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
    />
    <button
      onClick={create}
      className="px-6 py-2 bg-green-500 text-white font-medium rounded-lg
                 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-200 transition"
    >
      Crear
    </button>
  </div>

  {/* Lista de items */}
  <ul className="space-y-4">
    {items.map(i => (
      <li
        key={i.id}
        className="bg-white p-4 rounded-lg shadow flex flex-col sm:flex-row items-start sm:items-center
                   justify-between hover:shadow-md transition"
      >
        {editing === i.id ? (
          <div className="flex flex-col sm:flex-row flex-1 items-stretch sm:items-center gap-3 w-full">
            <input
              value={editDesc}
              onChange={e => setEditDesc(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
            />
            <button
              onClick={update}
              className="px-4 py-1 bg-blue-500 text-white rounded-lg
                         hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
            >
              Guardar
            </button>
            <button
              onClick={() => setEditing(null)}
              className="px-4 py-1 text-gray-600 rounded-lg
                         hover:text-gray-800 transition"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between flex-1 w-full">
            <span className="text-gray-700 flex-1">{i.descripcion}</span>
            <div className="mt-3 sm:mt-0 flex gap-3">
              <button
                onClick={() => { setEditing(i.id); setEditDesc(i.descripcion); }}
                className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm
                           hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
              >
                Editar
              </button>
              <button
                onClick={() => remove(i.id)}
                className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm
                           hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-200 transition"
              >
                Eliminar
              </button>
            </div>
          </div>
        )}
      </li>
    ))}
    {items.length === 0 && (
      <li className="text-center text-gray-500 py-6">No hay issues registrados.</li>
    )}
  </ul>
</div>

  );
}
