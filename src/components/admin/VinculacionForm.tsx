import { useState } from 'react';
import Button from '../common/Button';

export interface VinculacionFormData {
  nombre: string;
  cedula: string;
  telefono?: string;
  celular?: string;
  email?: string;
  direccion?: string;
  ciudad?: string;
  fechaVinculacion: string;
  poderesFirmados: boolean;
  casoEntregado: boolean;
  tieneVehiculoInvolucrado: boolean;
  tituloTramite?: string;
  fechaAccidente?: string;
  lugarAccidente?: string;
  aseguradora?: string;
  responsabilidad?: string;
}

interface VinculacionFormProps {
  onSubmit: (data: VinculacionFormData) => void;
  onCancel: () => void;
}

const VinculacionForm = ({ onSubmit, onCancel }: VinculacionFormProps) => {
  const [form, setForm] = useState<VinculacionFormData>({
    nombre: '',
    cedula: '',
    fechaVinculacion: new Date().toISOString().split('T')[0],
    poderesFirmados: true,
    casoEntregado: true,
    tieneVehiculoInvolucrado: false,
    tituloTramite: 'Trámite por accidente',
    responsabilidad: 'Extracontractual'
  });

  const set = <K extends keyof VinculacionFormData>(key: K, value: VinculacionFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (!form.nombre.trim() || !form.cedula.trim()) return;
        onSubmit(form);
      }}
    >
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Vinculación del usuario</h3>
        <p className="text-sm text-slate-500">
          Crea el usuario, guarda sus datos y abre el trámite principal con las etapas del diagrama.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block font-medium">Nombre completo</span>
          <input
            required
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
            value={form.nombre}
            onChange={(e) => set('nombre', e.target.value)}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium">Cédula / NIT</span>
          <input
            required
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
            value={form.cedula}
            onChange={(e) => set('cedula', e.target.value)}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium">Fecha de vinculación</span>
          <input
            type="date"
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
            value={form.fechaVinculacion}
            onChange={(e) => set('fechaVinculacion', e.target.value)}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium">Celular</span>
          <input
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
            value={form.celular || ''}
            onChange={(e) => set('celular', e.target.value)}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium">Correo</span>
          <input
            type="email"
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
            value={form.email || ''}
            onChange={(e) => set('email', e.target.value)}
          />
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block font-medium">Dirección</span>
          <input
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
            value={form.direccion || ''}
            onChange={(e) => set('direccion', e.target.value)}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium">Ciudad</span>
          <input
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
            value={form.ciudad || ''}
            onChange={(e) => set('ciudad', e.target.value)}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium">Título del trámite</span>
          <input
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
            value={form.tituloTramite || ''}
            onChange={(e) => set('tituloTramite', e.target.value)}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium">Fecha accidente</span>
          <input
            type="date"
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
            value={form.fechaAccidente || ''}
            onChange={(e) => set('fechaAccidente', e.target.value)}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium">Aseguradora</span>
          <input
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
            value={form.aseguradora || ''}
            onChange={(e) => set('aseguradora', e.target.value)}
          />
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block font-medium">Lugar del accidente</span>
          <input
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
            value={form.lugarAccidente || ''}
            onChange={(e) => set('lugarAccidente', e.target.value)}
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-4 rounded-2xl bg-slate-50 p-4 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.poderesFirmados}
            onChange={(e) => set('poderesFirmados', e.target.checked)}
          />
          Poderes firmados
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.casoEntregado}
            onChange={(e) => set('casoEntregado', e.target.checked)}
          />
          Caso entregado a la oficina
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.tieneVehiculoInvolucrado}
            onChange={(e) => set('tieneVehiculoInvolucrado', e.target.checked)}
          />
          Víctima se conducía en vehículo (activa liberación)
        </label>
      </div>

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end sm:gap-3">
        <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="w-full sm:w-auto">
          Vincular usuario
        </Button>
      </div>
    </form>
  );
};

export default VinculacionForm;
