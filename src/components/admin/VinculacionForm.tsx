import { useMemo, useState } from 'react';
import Button from '../common/Button';
import { computeCaducidadFromAccidente, formatFechaEs } from '../../lib/caducidad';

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
  fechaEstructuracion?: string;
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

  const caducidadPreview = useMemo(
    () => computeCaducidadFromAccidente(form.fechaAccidente, form.responsabilidad),
    [form.fechaAccidente, form.responsabilidad]
  );

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
          Prioriza fechas del caso: accidente, estructuración y caducidad según el tipo.
        </p>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">
          Plazos prioritarios
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-semibold text-slate-800">Fecha accidente *</span>
            <input
              type="date"
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5"
              value={form.fechaAccidente || ''}
              onChange={(e) => set('fechaAccidente', e.target.value)}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold text-slate-800">Fecha estructuración</span>
            <input
              type="date"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5"
              value={form.fechaEstructuracion || ''}
              onChange={(e) => set('fechaEstructuracion', e.target.value)}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold text-slate-800">Tipo de responsabilidad</span>
            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5"
              value={form.responsabilidad || ''}
              onChange={(e) => set('responsabilidad', e.target.value)}
            >
              <option value="Extracontractual">Extracontractual (5 años)</option>
              <option value="Contractual">Contractual (2 años)</option>
            </select>
          </label>
          <div className="rounded-xl border border-amber-200 bg-white px-3 py-2.5 text-sm">
            <p className="font-semibold text-slate-800">Caducidad calculada</p>
            <p className="mt-1 text-base font-bold text-amber-900">
              {caducidadPreview ? formatFechaEs(caducidadPreview) : 'Completa fecha y tipo'}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Contractual = 2 años · Extracontractual = 5 años desde el accidente
            </p>
          </div>
        </div>
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
