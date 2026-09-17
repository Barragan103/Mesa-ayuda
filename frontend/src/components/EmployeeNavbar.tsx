import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function EmployeeNavbar() {
  const { logout } = useAuth();
  const nombre = localStorage.getItem('nombre');
  const apellido = localStorage.getItem('apellido');

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between bg-blue-50 px-6 py-4 shadow-sm">
  {/* Saludo */}
  <div className="text-xl font-semibold text-gray-800">
    Bienvenido, {nombre} {apellido}
  </div>

  {/* Navegación */}
  <nav className="flex items-center space-x-3">
    <Link
      to="/dashboard-employee"
      className="px-3 py-2 text-gray-700 rounded-lg hover:bg-white hover:shadow transition"
    >
      Inicio
    </Link>
    <Link
      to="/dashboard-employee/request-help"
      className="px-3 py-2 text-gray-700 rounded-lg hover:bg-white hover:shadow transition"
    >
      Pedir Ayuda
    </Link>
    <Link
      to="/dashboard-employee/mis-tickets"
      className="px-3 py-2 text-gray-700 rounded-lg hover:bg-white hover:shadow transition"
    >
      Mis Tickets
    </Link>

    {/* Botón Cerrar sesión */}
    <button
      onClick={logout}
      className="ml-4 px-4 py-2 bg-red-400 text-white font-medium rounded-lg
                 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-200 transition"
    >
      Cerrar sesión
    </button>
  </nav>
</header>

  );
}
