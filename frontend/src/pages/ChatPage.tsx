import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

type UserInfo = { id: number; nombre: string; apellido: string; role: string };
type Message = {
  id: number;
  sender: UserInfo;
  content: string;
  createdAt: string;
};

export default function ChatPage() {
  const { helpRequestId } = useParams<{ helpRequestId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token')!;


  const loadMessages = async () => {
    try {
      const res = await axios.get<Message[]>(
        `http://localhost:4000/api/help-requests/${helpRequestId}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(res.data);
    } catch (err) {
      console.error('Error cargando mensajes', err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadMessages();
    const iv = setInterval(loadMessages, 3000);
    return () => clearInterval(iv);
  }, [helpRequestId]);


  const sendMessage = async () => {
    if (!newMsg.trim()) return;
    try {
      await axios.post(
        `http://localhost:4000/api/help-requests/${helpRequestId}/messages`,
        { content: newMsg },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewMsg('');
      loadMessages();
    } catch (err) {
      console.error('Error enviando mensaje', err);
    }
  };

  if (loading) return <p className="p-6">Cargando chat…</p>;

  return (
    <div className="max-w-xl mx-auto h-full flex flex-col bg-white p-6 rounded-2xl shadow-lg">
  {/* Encabezado */}
  <h2 className="text-2xl font-bold text-gray-800 mb-4">
    Chat Solicitud #{helpRequestId}
  </h2>

  {/* Área de mensajes */}
  <div className="flex-1 overflow-y-auto bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
    {messages.map((m) => (
      <div
        key={m.id}
        className={`max-w-[80%] p-3 rounded-2xl shadow-sm transition 
          ${
            m.sender.role === 'ADMIN'
              ? 'self-end bg-blue-100'
              : 'self-start bg-white'
          }`}
      >
        <div className="text-sm font-medium text-gray-700">
          {m.sender.nombre} {m.sender.apellido}
        </div>
        <div className="mt-1 text-gray-800">{m.content}</div>
        <div className="mt-2 text-xs text-gray-500">
          {new Date(m.createdAt).toLocaleTimeString()}
        </div>
      </div>
    ))}
  </div>

  {/* Caja de entrada */}
  <div className="mt-4 flex items-center">
    <input
      value={newMsg}
      onChange={(e) => setNewMsg(e.target.value)}
      placeholder="Escribe un mensaje…"
      className="flex-1 bg-white border border-gray-300 rounded-l-lg px-4 py-2
                 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
    />
    <button
      onClick={sendMessage}
      className="ml-2 bg-blue-600 text-white px-6 py-2 rounded-r-lg font-medium
                 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
    >
      Enviar
    </button>
  </div>
</div>

  );
}
