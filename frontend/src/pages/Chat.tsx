// frontend/src/pages/Chat.tsx
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

type User = { id: number; nombre: string; apellido: string };
type Message = {
  id: number;
  content: string;
  createdAt: string;
  sender: User;
};

export default function Chat() {
  const { id } = useParams<{ id: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);


  const fetchMessages = async () => {
    try {
      const res = await api.get<Message[]>(`/help-requests/${id}/messages`);
      setMessages(res.data);
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (err) {
      alert('Error cargando mensajes');
    }
  };

  useEffect(() => {
    fetchMessages();
    const iv = setInterval(fetchMessages, 3000);
    return () => clearInterval(iv);
  }, [id]);

  const send = async () => {
    if (!draft.trim()) return;
    try {
      await api.post(`/help-requests/${id}/messages`, { content: draft });
      setDraft('');
      fetchMessages();
    } catch {
      alert('Error enviando mensaje');
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-gray-50 rounded-2xl shadow-lg flex flex-col h-[80vh]">
  {/* Título */}
  <h1 className="text-3xl font-bold text-gray-800 mb-4">
    Chat del Ticket #{id}
  </h1>

  {/* Área de mensajes */}
  <div className="flex-1 overflow-y-auto bg-white border border-gray-200 rounded-lg p-4 space-y-4">
    {loading ? (
      <p className="text-center text-gray-500 animate-pulse">Cargando chat…</p>
    ) : (
      messages.map((m) => {
        const isMe = localStorage.getItem('nombre') === m.sender.nombre;
        return (
          <div
            key={m.id}
            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-md
                ${isMe ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}`}
            >
              <p className="text-sm font-semibold">
                {m.sender.nombre} {m.sender.apellido}
              </p>
              <p className="mt-1">{m.content}</p>
              <p className="mt-2 text-xs text-gray-500 text-right">
                {new Date(m.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        );
      })
    )}
    <div ref={bottomRef} />
  </div>

  {/* Entrada de mensaje */}
  <div className="mt-4 flex">
    <input
      type="text"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && send()}
      placeholder="Escribe tu mensaje…"
      className="flex-1 bg-white border border-gray-200 rounded-l-lg px-4 py-2 placeholder-gray-500
                 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
    />
    <button
      onClick={send}
      className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-r-lg font-medium
                 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
    >
      Enviar
    </button>
  </div>
</div>

  );
}
