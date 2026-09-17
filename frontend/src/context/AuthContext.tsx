import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

type State = {
  token: string | null;
  role: 'ADMIN' | 'EMPLOYEE' | null;
};

type Action =
  | { type: 'LOGIN'; payload: { token: string; role: State['role'] } }
  | { type: 'LOGOUT' };

const initialState: State = {
  token: localStorage.getItem('token'),
  role: (localStorage.getItem('role') as State['role']) || null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOGIN':
      return { token: action.payload.token, role: action.payload.role };
    case 'LOGOUT':
      return { token: null, role: null };
    default:
      return state;
  }
}

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const navigate = useNavigate();

  const login = async (identifier: string, password: string) => {
    const res = await api.post('/auth/login', { identifier, password });
    const { token, role, nombre, apellido, email } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('nombre', nombre);
    localStorage.setItem('apellido', apellido);
    localStorage.setItem('email', email);
    dispatch({ type: 'LOGIN', payload: { token, role } });
    navigate(role === 'ADMIN' ? '/dashboard-admin' : '/dashboard-employee');
  };

  const logout = () => {
    localStorage.clear();
    dispatch({ type: 'LOGOUT' });
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
