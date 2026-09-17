import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo1_menu.png';

type LoginForm = {
  identifier: string;
  password: string;
};

const schema = yup.object({
  identifier: yup.string().required('Usuario o email es obligatorio'),
  password: yup.string().required('Contraseña es obligatoria'),
});

export default function Login() {
  const { login } = useAuth();
  const { register, handleSubmit, formState } = useForm<LoginForm>({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: LoginForm) => {
    login(data.identifier, data.password).catch((err) => {
      alert(err.response?.data?.message || 'Error al iniciar sesión');
    });
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-2xl shadow-lg">
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <img src={logo} alt="Logo" className="h-30 w-auto" />
      </div>

      {/* Título */}
      <h1 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">
        Iniciar Sesión
      </h1>

      {/* Formulario */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Usuario / Email */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Usuario o Email
          </label>
          <input
            {...register('identifier')}
            className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
            placeholder="ejemplo@correo.com"
          />
          {formState.errors.identifier && (
            <p className="mt-1 text-sm text-red-500">
              {formState.errors.identifier.message}
            </p>
          )}
        </div>

        {/* Contraseña */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <input
            type="password"
            {...register('password')}
            className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
            placeholder="••••••••"
          />
          {formState.errors.password && (
            <p className="mt-1 text-sm text-red-500">
              {formState.errors.password.message}
            </p>
          )}
        </div>

        {/* Botón de envío */}
        <button
          type="submit"
          className="w-full flex items-center justify-center py-3 bg-blue-600 text-white 
                     font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 
                     focus:ring-blue-200 transition"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
