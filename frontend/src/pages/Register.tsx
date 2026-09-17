import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext';

type RegisterForm = {
  nombre: string;
  apellido: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'ADMIN' | 'EMPLOYEE';
};

const schema = yup.object({
  nombre: yup.string().required('Nombre es obligatorio'),
  apellido: yup.string().required('Apellido es obligatorio'),
  username: yup.string().required('Username es obligatorio'),
  email: yup.string().email('Email inválido').required('Email es obligatorio'),
  password: yup
    .string()
    .required('Contraseña es obligatoria')
    .min(6, 'Mínimo 6 caracteres')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/, 'Debe incluir letras y números'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Las contraseñas deben coincidir')
    .required('Confirma tu contraseña'),
  role: yup
    .mixed<'ADMIN' | 'EMPLOYEE'>()
    .oneOf(['ADMIN', 'EMPLOYEE'], 'Debes escoger un rol')
    .required('Rol es obligatorio'),
});

export default function Register() {
  const { register: doRegister } = useAuth();
  const { register, handleSubmit, formState } = useForm<RegisterForm>({
    resolver: yupResolver(schema),
    defaultValues: { role: 'EMPLOYEE' },
  });

  const onSubmit = (data: RegisterForm) => {
   
    const { nombre, apellido, username, email, password, role } = data;
    doRegister({ nombre, apellido, username, email, password, role }).catch(err => {
      alert(err.response?.data?.message || 'Error al registrarse');
    });
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl mb-4">Registro de Usuario</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {['nombre','apellido','username','email','password','confirmPassword'].map((field) => (
          <div key={field}>
            <label className="capitalize">{field.replace('confirmPassword','confirmar contraseña')}</label>
            <input
              type={field.toLowerCase().includes('password') ? 'password' : 'text'}
              {...register(field as keyof RegisterForm)}
              className="w-full border p-2 rounded"
            />
            {formState.errors[field as keyof RegisterForm] && (
              <p className="text-red-500">
                {formState.errors[field as keyof RegisterForm]?.message}
              </p>
            )}
            
          </div>
          
        ))}
        <div>
          <label>Rol</label>
          <select {...register('role')} className="w-full border p-2 rounded">
            <option value="EMPLOYEE">Empleado</option>
            <option value="ADMIN">Administrador</option>
          </select>
          {formState.errors.role && (
            <p className="text-red-500">{formState.errors.role.message}</p>
          )}
        </div>
        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded">
          Registrar
        </button>
      </form>
    </div>
  );
}
