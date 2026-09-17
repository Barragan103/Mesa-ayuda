// src/pages/HelpRequest.tsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  FaUser,
  FaEnvelope,
  FaBuilding,
  FaPaperPlane
} from 'react-icons/fa';
import api from '../services/api';

type Area = { id: number; nombre: string };
type Issue = { id: number; descripcion: string };

interface FormValues {
  nombre: string;
  apellido: string;
  email: string;
  area: string;
  software: boolean;
  softwareIssue: string;
  hardware: boolean;
  hardwareIssue: string;
  other: boolean;
  otherIssue: string;
}


const TYPE_LABELS: Record<'software'|'hardware'|'other',string> = {
  software: 'Daños digital',
  hardware: 'Daños físicos',
  other:    'Otros',
};

const schema = yup
  .object({
    nombre: yup.string().required('Nombre es obligatorio'),
    apellido: yup.string().required('Apellido es obligatorio'),
    email: yup.string().email('Email inválido').required('Correo es obligatorio'),
    area: yup.string().required('Selecciona un área'),
    software: yup.boolean(),
    softwareIssue: yup.string().when('software', {
      is: true,
      then: s => s.required(`Selecciona un problema de ${TYPE_LABELS.software.toLowerCase()}`),
      otherwise: s => s.notRequired(),
    }),
    hardware: yup.boolean(),
    hardwareIssue: yup.string().when('hardware', {
      is: true,
      then: s => s.required(`Selecciona un problema de ${TYPE_LABELS.hardware.toLowerCase()}`),
      otherwise: s => s.notRequired(),
    }),
    other: yup.boolean(),
    otherIssue: yup.string().when('other', {
      is: true,
      then: s => s.required(`Selecciona un problema de ${TYPE_LABELS.other.toLowerCase()}`),
      otherwise: s => s.notRequired(),
    }),
  })
  .test(
    'at-least-one',
    'Debes seleccionar al menos un tipo de problema',
    value => !!value && (value.software || value.hardware || value.other)
  )
  .required();

export default function HelpRequest() {
  const storedNombre   = localStorage.getItem('nombre')   || '';
  const storedApellido = localStorage.getItem('apellido') || '';
  const storedEmail    = localStorage.getItem('email')    || '';

  const [areas, setAreas] = useState<Area[]>([]);
  const [issues, setIssues] = useState<Record<string, Issue[]>>({
    software: [], hardware: [], other: []
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      nombre:   storedNombre,
      apellido: storedApellido,
      email:    storedEmail,
      area: '',
      software: false,
      softwareIssue: '',
      hardware: false,
      hardwareIssue: '',
      other: false,
      otherIssue: ''
    }
  });

  const watchSoftware = watch('software');
  const watchHardware = watch('hardware');
  const watchOther    = watch('other');

  useEffect(() => {

    api.get<Area[]>('/areas').then(r => setAreas(r.data));
    api.get<Issue[]>('/issues/software').then(r => setIssues(i => ({ ...i, software: r.data })));
    api.get<Issue[]>('/issues/hardware').then(r => setIssues(i => ({ ...i, hardware: r.data })));
    api.get<Issue[]>('/issues/other').then(r => setIssues(i => ({ ...i, other: r.data })));
  }, []);

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    setMessage('');
    try {
      await api.post('/help-requests', {
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        area: data.area,
        software: data.software,
        softwareIssue: data.software ? data.softwareIssue : null,
        hardware: data.hardware,
        hardwareIssue: data.hardware ? data.hardwareIssue : null,
        other: data.other,
        otherIssue: data.other ? data.otherIssue : null
      });
      setMessage('✅ Solicitud enviada con éxito');
      reset({
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        area: '',
        software: false,
        softwareIssue: '',
        hardware: false,
        hardwareIssue: '',
        other: false,
        otherIssue: ''
      });
    } catch {
      setMessage('❌ Error enviando la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-8 p-8 bg-white rounded-2xl shadow-lg">
  <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
    Crea tu Solicitud
  </h2>
  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
    {/* Nombre y Apellido */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre
        </label>
        <div className="flex items-center bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-200 transition">
          <FaUser className="text-gray-400 mr-2" />
          <input
            {...register('nombre')}
            aria-label="Nombre"
            className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-400"
            placeholder="Tu nombre"
          />
        </div>
        {errors.nombre && (
          <p className="mt-1 text-sm text-red-500">{errors.nombre.message}</p>
        )}
      </div>
      {/* Apellido */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Apellido
        </label>
        <div className="flex items-center bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-200 transition">
          <FaUser className="text-gray-400 mr-2" />
          <input
            {...register('apellido')}
            aria-label="Apellido"
            className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-400"
            placeholder="Tu apellido"
          />
        </div>
        {errors.apellido && (
          <p className="mt-1 text-sm text-red-500">{errors.apellido.message}</p>
        )}
      </div>
    </div>

    {/* Correo */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Correo electrónico
      </label>
      <div className="flex items-center bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-200 transition">
        <FaEnvelope className="text-gray-400 mr-2" />
        <input
          {...register('email')}
          type="email"
          aria-label="Correo electrónico"
          className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-400"
          placeholder="usuario@ejemplo.com"
        />
      </div>
      {errors.email && (
        <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
      )}
    </div>

    {/* Área */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Área
      </label>
      <div className="flex items-center bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-200 transition">
        <FaBuilding className="text-gray-400 mr-2" />
        <select
          {...register('area')}
          aria-label="Área"
          className="w-full bg-transparent outline-none text-gray-800"
        >
          <option value="">Selecciona un área...</option>
          {areas.map(a => (
            <option key={a.id} value={a.nombre}>
              {a.nombre}
            </option>
          ))}
        </select>
      </div>
      {errors.area && (
        <p className="mt-1 text-sm text-red-500">{errors.area.message}</p>
      )}
    </div>

    {/* Tipo de problema */}
    <fieldset className="space-y-4 border-t border-gray-200 pt-4">
      <legend className="font-medium text-gray-700">Tipo de problema</legend>
      {(['software', 'hardware', 'other'] as const).map(type => {
        const isChecked =
          type === 'software'
            ? watchSoftware
            : type === 'hardware'
            ? watchHardware
            : watchOther;
        const issueField =
          type === 'software'
            ? 'softwareIssue'
            : type === 'hardware'
            ? 'hardwareIssue'
            : 'otherIssue';
        return (
          <div key={type}>
            <label className="inline-flex items-center space-x-2">
              <input
                type="checkbox"
                {...register(type)}
                className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-200"
              />
              <span className="text-gray-700">{TYPE_LABELS[type]}</span>
            </label>
            {isChecked && (
              <div className="mt-2">
                <select
                  {...register(issueField as any)}
                  aria-label={`Problema ${TYPE_LABELS[type]}`}
                  className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                >
                  <option value="">
                    Selecciona un problema de{' '}
                    {TYPE_LABELS[type].toLowerCase()}
                  </option>
                  {issues[type].map(i => (
                    <option key={i.id} value={i.descripcion}>
                      {i.descripcion}
                    </option>
                  ))}
                </select>
                {errors[issueField as keyof FormValues] && (
                  <p className="mt-1 text-sm text-red-500">
                    {
                      errors[issueField as keyof FormValues]
                        ?.message as string
                    }
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
      {errors?.['at-least-one'] && (
        <p className="mt-1 text-sm text-red-500">
          {errors['at-least-one']?.message}
        </p>
      )}
    </fieldset>

    {/* Botón de envío */}
    <button
      type="submit"
      disabled={isSubmitting || loading}
      className="w-full flex items-center justify-center bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 transition disabled:opacity-50"
    >
      {loading ? 'Enviando...' : 'Enviar Solicitud'}
      <FaPaperPlane className="ml-2 text-lg" />
    </button>

    {message && (
      <p
        className={`mt-4 text-center ${
          message.startsWith('✅') ? 'text-green-600' : 'text-red-600'
        }`}
      >
        {message}
      </p>
    )}
  </form>
</div>

  );
}
