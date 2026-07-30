import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';
import { STAFF_PROFILES } from '../../data/staffCatalog';

interface AdminLoginFormProps {
  onLogin: (usuario: string, password: string) => void;
}

const AdminLoginForm = ({ onLogin }: AdminLoginFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({
    usuario: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(loginData.usuario, loginData.password);
  };

  const fillCredentials = (username: string, password: string) => {
    setLoginData({ usuario: username, password });
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-xl sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Usuario"
          type="text"
          id="usuario"
          value={loginData.usuario}
          onChange={(e) => setLoginData({ ...loginData, usuario: e.target.value })}
          required
          placeholder="Nombre de usuario"
        />

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
            Contraseña
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 pr-12 transition-colors duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              placeholder="Contraseña"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transform text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <Button type="submit" variant="primary" className="w-full">
          Iniciar Sesión
        </Button>
      </form>

      <div className="mt-6 rounded-lg bg-blue-50 p-4">
        <h4 className="mb-1 font-semibold text-blue-900">Acceso rápido del equipo</h4>
        <p className="mb-3 text-xs text-blue-800/80">
          Toca un nombre para rellenar usuario y contraseña
        </p>
        <ul className="space-y-2">
          {STAFF_PROFILES.map((staff) => (
            <li key={staff.id}>
              <button
                type="button"
                onClick={() => fillCredentials(staff.username, staff.password)}
                className="flex w-full items-center justify-between gap-2 rounded-xl border border-blue-200 bg-white px-3 py-2.5 text-left transition hover:border-blue-400 hover:bg-blue-50/80"
              >
                <span>
                  <span className="block text-sm font-semibold text-slate-900">{staff.nombre}</span>
                  <span className="block text-xs text-slate-500">
                    {staff.role === 'abogado_principal' ? 'Abogado principal' : 'Asistente'} ·{' '}
                    {staff.username}
                  </span>
                </span>
                <span className="shrink-0 rounded-full bg-blue-100 px-2 py-1 text-[11px] font-medium text-blue-800">
                  Usar
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[11px] text-blue-700/80">
          Contraseña temporal: <code className="rounded bg-white/80 px-1">prosejurix2024</code>
        </p>
      </div>
    </div>
  );
};

export default AdminLoginForm;
