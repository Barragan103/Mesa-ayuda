import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../services/api';


type User = {
  id: number;
  nombre: string;
  apellido: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'EMPLOYEE';
  createdAt: string;
};

type FormValues = {
  nombre: string;
  apellido: string;
  username: string;
  email: string;
  password?: string;
  role: 'ADMIN' | 'EMPLOYEE';
};

type ResetValues = {
  password: string;
  confirmPassword: string;
};


const createUserSchema = yup.object({
  nombre: yup.string().required('Nombre es obligatorio'),
  apellido: yup.string().required('Apellido es obligatorio'),
  username: yup.string().required('Username es obligatorio'),
  email: yup.string().email('Email inválido').required('Email es obligatorio'),
  password: yup
    .string()
    .required('Contraseña es obligatoria')
    .min(6, 'Mínimo 6 caracteres')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/, 'Debe incluir letras y números'),
  role: yup
    .mixed<'ADMIN' | 'EMPLOYEE'>()
    .oneOf(['ADMIN', 'EMPLOYEE'], 'Debes escoger un rol')
    .required('Rol es obligatorio'),
});

const editUserSchema = yup.object({
  nombre: yup.string().required('Nombre es obligatorio'),
  apellido: yup.string().required('Apellido es obligatorio'),
  username: yup.string().required('Username es obligatorio'),
  email: yup.string().email('Email inválido').required('Email es obligatorio'),
  role: yup
    .mixed<'ADMIN' | 'EMPLOYEE'>()
    .oneOf(['ADMIN', 'EMPLOYEE'], 'Debes escoger un rol')
    .required('Rol es obligatorio'),
});

const resetSchema = yup.object({
  password: yup
    .string()
    .required('Contraseña es obligatoria')
    .min(6, 'Mínimo 6 caracteres')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/, 'Debe incluir letras y números'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Las contraseñas deben coincidir')
    .required('Confirma tu contraseña'),
});

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetUser, setResetUser] = useState<User | null>(null);

  const isEdit = Boolean(editing);
  const schema = isEdit ? editUserSchema : createUserSchema;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { nombre: '', apellido: '', username: '', email: '', password: '', role: 'EMPLOYEE' },
  });

  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    reset: resetReset,
    formState: { errors: resetErrors, isSubmitting: isResetting },
  } = useForm<ResetValues>({
    resolver: yupResolver(resetSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await api.get<User[]>('/users');
      setUsers(res.data);
    } finally {
      setLoading(false);
    }
  }

  function openNew() {
    setEditing(null);
    reset({ nombre: '', apellido: '', username: '', email: '', password: '', role: 'EMPLOYEE' });
    setModalOpen(true);
  }

  function openEdit(user: User) {
    setEditing(user);
    reset({ nombre: user.nombre, apellido: user.apellido, username: user.username, email: user.email, password: '', role: user.role });
    setModalOpen(true);
  }

  function openReset(user: User) {
    setResetUser(user);
    resetReset({ password: '', confirmPassword: '' });
    setResetModalOpen(true);
  }

  async function onSubmit(data: FormValues) {
    try {
      if (isEdit && editing) {
        await api.put(`/users/${editing.id}`, { nombre: data.nombre, apellido: data.apellido, username: data.username, email: data.email, role: data.role });
      } else {
        await api.post('/users', data);
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error en la operación');
    }
  }

  async function onReset(data: ResetValues) {
    if (!resetUser) return;
    try {
      await api.patch(`/users/${resetUser.id}/password`, { password: data.password });
      setResetModalOpen(false);
      alert('Contraseña restablecida');
    } catch {
      alert('Error al restablecer contraseña');
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('¿Seguro que quieres eliminar este usuario?')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch {
      alert('No se pudo eliminar');
    }
  }

  return (
    <div className="max-w-9/10 mx-auto bg-gray-50 p-6 rounded-2xl shadow-lg">
  {/* Cabecera */}
  <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
    <h1 className="text-4xl font-bold text-gray-800 mb-4 sm:mb-0">
      Gestión de Usuarios
    </h1>
    <button
      onClick={openNew}
      className="px-5 py-2 bg-green-500 text-white font-medium rounded-lg
                 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-200 transition"
    >
      Nuevo Usuario
    </button>
  </div>

  {/* Tabla o estado de carga */}
  {loading ? (
    <div className="text-center py-10 text-gray-500 animate-pulse">
      Cargando usuarios…
    </div>
  ) : (
    <div className="overflow-x-auto bg-white rounded-lg shadow divide-y divide-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            {['Nombre','Apellido','Username','Email','Rol','Creado','Acciones'].map(h => (
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
          {users.map(u => (
            <tr key={u.id} className="hover:bg-gray-50 transition">
              <td className="px-6 py-4 text-gray-700">{u.nombre}</td>
              <td className="px-6 py-4 text-gray-700">{u.apellido}</td>
              <td className="px-6 py-4 text-gray-700">{u.username}</td>
              <td className="px-6 py-4 text-gray-700">{u.email}</td>
              <td className="px-6 py-4 text-gray-700 capitalize">
                {u.role.toLowerCase()}
              </td>
              <td className="px-6 py-4 text-gray-700">
                {new Date(u.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 space-x-2 ">
                <button
                  onClick={() => openEdit(u)}
                  className="px-3 py-1 mx-8 text-sm bg-blue-500 text-white rounded-lg
                             hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(u.id)}
                  className="px-3 py-1 mx-8 text-sm bg-red-500 text-white rounded-lg
                             hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-200 transition"
                >
                  Eliminar
                </button>
                <button
                  onClick={() => openReset(u)}
                  className="px-3 py-1 mx-8 text-sm bg-yellow-500 text-white rounded-lg
                             hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-200 transition"
                >
                  Restablecer
                </button>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td
                colSpan={7}
                className="px-6 py-4 text-center text-gray-500"
              >
                No hay usuarios registrados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )}

  {/* Modal Crear/Editar */}
  {modalOpen && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 transform transition-all"
      >
        <h2 className="text-2xl font-semibold text-gray-800">
          {isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
        </h2>

        {/* Campos de texto */}
        {[
          { name: 'nombre', label: 'Nombre' },
          { name: 'apellido', label: 'Apellido' },
          { name: 'username', label: 'Username' },
          { name: 'email', label: 'Email', type: 'email' }
        ].map(({ name, label, type = 'text' }) => (
          <div key={name}>
            <label htmlFor={name} className="block mb-1 text-gray-600">
              {label}
            </label>
            <input
              id={name}
              type={type}
              {...register(name)}
              className="w-full px-4 py-2 border border-gray-300 bg-gray-50 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
            />
            {errors[name] && (
              <p className="mt-1 text-sm text-red-500">
                {errors[name]?.message}
              </p>
            )}
          </div>
        ))}

        {/* Contraseña solo en creación */}
        {!isEdit && (
          <div>
            <label htmlFor="password" className="block mb-1 text-gray-600">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              {...register('password')}
              className="w-full px-4 py-2 border border-gray-300 bg-gray-50 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>
        )}

        {/* Selector de rol */}
        <div>
          <label htmlFor="role" className="block mb-1 text-gray-600">
            Rol
          </label>
          <select
            id="role"
            {...register('role')}
            className="w-full px-4 py-2 border border-gray-300 bg-gray-50 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
          >
            <option value="EMPLOYEE">Empleado</option>
            <option value="ADMIN">Administrador</option>
          </select>
          {errors.role && (
            <p className="mt-1 text-sm text-red-500">
              {errors.role.message}
            </p>
          )}
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => setModalOpen(false)}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg
                       hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-green-500 text-white rounded-lg
                       hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-200 transition"
          >
            {isEdit ? 'Guardar' : 'Crear'}
          </button>
        </div>
      </form>
    </div>
  )}

  {/* Modal Restablecer contraseña */}
  {resetModalOpen && resetUser && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <form
        onSubmit={handleResetSubmit(onReset)}
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 transform transition-all"
      >
        <h2 className="text-2xl font-semibold text-gray-800">
          Restablecer contraseña de {resetUser.username}
        </h2>

        <div>
          <label className="block mb-1 text-gray-600">
            Nueva contraseña
          </label>
          <input
            type="password"
            {...registerReset('password')}
            className="w-full px-4 py-2 border border-gray-300 bg-gray-50 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
          />
          {resetErrors.password && (
            <p className="mt-1 text-sm text-red-500">
              {resetErrors.password.message}
            </p>
          )}
        </div>

        <div>
          <label className="block mb-1 text-gray-600">
            Confirmar contraseña
          </label>
          <input
            type="password"
            {...registerReset('confirmPassword')}
            className="w-full px-4 py-2 border border-gray-300 bg-gray-50 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
          />
          {resetErrors.confirmPassword && (
            <p className="mt-1 text-sm text-red-500">
              {resetErrors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => setResetModalOpen(false)}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg
                       hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isResetting}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg
                       hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-200 transition"
          >
            Restablecer
          </button>
        </div>
      </form>
    </div>
  )}
</div>

  );
}
