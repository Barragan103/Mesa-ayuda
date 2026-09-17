import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminSidebar() {
  const { logout } = useAuth();
  const nombre = localStorage.getItem('nombre');
  const apellido = localStorage.getItem('apellido');

  return (
      <aside
      className="
        flex flex-col
        justify-between
        w-64
        h-screen
        sticky top-0
        bg-gray-900 text-gray-100
        shadow-2xl
      "
    >
        {/* Cabecera */}
        <div className="p-4 text-xl font-extrabold border-b border-gray-800">
          {nombre} {apellido}
        </div>

        {/* Navegación */}
        <nav className="flex-1 p-4 space-y-3 overflow-y-auto">
          {[
            { to: "/dashboard-admin", label: "Dashboard" },
            { to: "/dashboard-admin/help-requests", label: "Solicitudes" },
            { to: "/dashboard-admin/problem-stats", label: "Estadísticas" },
            { to: "/dashboard-admin/users", label: "Gestión Usuarios" },
            { to: "/dashboard-admin/software-issue", label: "Software Issues" },
            { to: "/dashboard-admin/hardware-issue", label: "Hardware Issues" },
            { to: "/dashboard-admin/other-issue", label: "Other Issues" },
            { to: "/dashboard-admin/area", label: "Áreas" },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="group flex items-center px-4 py-3 rounded-lg transition-all
                         hover:bg-gray-800 hover:pl-6 border-l-4 border-transparent
                         hover:border-indigo-400"
            >
              <span className="text-indigo-400 group-hover:text-indigo-300">•</span>
              <span className="ml-3 font-medium">{label}</span>
            </Link>
          ))}
        </nav>

        {/* Botón cerrar sesión siempre al pie */}
        <div className="px-6 pb-6">
        <button
          onClick={logout}
          className="
            w-full            /* ocupa todo el ancho */
            text-center       /* texto centrado */
            bg-red-600        /* color fondo */
            hover:bg-red-700
            text-white
            py-2
            rounded
          "
        >
           Cerrar sesión
        </button>
        </div>
      </aside>

  );
}
