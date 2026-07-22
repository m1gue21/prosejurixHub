import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogIn, ArrowLeft, KeyRound, MessageCircle } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';

interface ClientLoginFormProps {
  onLogin: (clienteId: string) => void;
}

const ClientLoginForm = ({ onLogin }: ClientLoginFormProps) => {
  const [clienteId, setClienteId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(clienteId);
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
      <div className="bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 px-6 py-6 sm:px-8">
        <div className="flex items-center gap-3 text-white">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
            <KeyRound className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-2xl font-semibold sm:text-3xl">Ingresa a tu portal</h2>
            <p className="mt-1 text-sm text-blue-100/80">Introduce tu ID de usuario para continuar</p>
          </div>
        </div>
      </div>

      <div className="space-y-6 px-6 py-8 sm:px-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="ID de usuario"
            type="number"
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            required
            placeholder="Escribe tu número de cliente"
            className="rounded-2xl border-slate-200 bg-white/60 focus:border-sky-400 focus:ring-sky-400"
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full rounded-xl bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 px-5 py-3 text-sm font-semibold shadow-lg shadow-blue-900/30 transition hover:from-sky-400 hover:via-blue-500 hover:to-indigo-500"
          >
            <span className="inline-flex items-center justify-center gap-2">
              <LogIn className="h-5 w-5" />
              Ingresar al Portal
            </span>
          </Button>
        </form>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-500">
              <MessageCircle className="h-5 w-5" />
            </span>
            <div>
              <h4 className="font-semibold text-slate-900">¿Dónde encuentro mi ID?</h4>
              <p className="mt-1 text-sm text-slate-600">
                Tu asesor Prosejurix lo comparte en los reportes y documentos enviados por correo. También lo puedes solicitar al instante al equipo de soporte.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-5">
          <p className="text-sm font-semibold text-emerald-900">¿Sin ID o necesitas actualizar tus datos?</p>
          <p className="mt-1 text-sm text-emerald-700">Comunícate con nosotros para ayudarte con la recuperación o actualización.</p>
          <a
            href="https://wa.me/573001234567"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-800"
          >
            → Contactar por WhatsApp
          </a>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/70 p-4 text-sm text-slate-500">
          <span>¿Volver al inicio?</span>
          <Link
            to="/"
            aria-label="Volver al sitio web"
            title="Volver"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ClientLoginForm;

