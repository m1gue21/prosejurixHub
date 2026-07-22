import { MockProceso, mockProcesos } from '../data/mocks';

const STORAGE_KEY = 'prosejurix_mock_ctrantec';
const SEED_VERSION = '2026-03-21';
const VERSION_KEY = 'prosejurix_mock_seed_version';

export const isMockDataForced = (): boolean =>
  import.meta.env.VITE_USE_MOCK_DATA === 'true';

const estadoToLabel = (estado: MockProceso['estado']): string => {
  if (estado === 'activo') return 'Activo';
  if (estado === 'finalizado') return 'Finalizado';
  if (estado === 'en_espera') return 'En espera';
  return estado;
};

export const mockProcesoToRaw = (proceso: MockProceso): Record<string, unknown> => ({
  ID: Number(proceso.id) || proceso.id,
  id: proceso.id,
  NOMBRE: proceso.clienteNombre,
  CEDULA_NIT: proceso.cedula,
  CEDULA: proceso.cedula,
  cliente_id: proceso.clienteId,
  Estado: estadoToLabel(proceso.estado),
  estado: proceso.estado,
  estado_publico: proceso.estadoPublico,
  ESTADO_PROCESO: proceso.estadoProceso ?? '',
  tipo: proceso.tipo,
  CLASE_DE_PROCESO: proceso.claseProceso ?? proceso.tipo,
  RESPONSABILIDAD: proceso.responsabilidad ?? '',
  FECHA_DE_ACCIDENTE: proceso.fechaAccidente ?? '',
  CADUCIDAD: proceso.caducidad ?? '',
  LUGAR_DE_ACCIDENTE: proceso.lugarAccidente ?? '',
  CIUDAD_ACCIDENTE: proceso.ciudad1 ?? proceso.ciudad ?? '',
  FECHA_QUERELLA: proceso.fechaQuerella ?? '',
  FISCALIA: proceso.fiscalia ?? '',
  CIUDAD_FISCALIA: proceso.ciudad2 ?? '',
  RADICADO: proceso.radicado ?? '',
  ASEGURADORA: proceso.aseguradora ?? '',
  ACTUACION: proceso.actuacion ?? '',
  FECHA_RECLAMACION: proceso.fechaReclamacion ?? '',
  CONCILIACION: proceso.conciliacion ?? '',
  FECHA_PRESENTACION_DEMANDA: proceso.fechaPresentacionDemanda ?? '',
  JUZGADO: proceso.juzgado ?? '',
  RAMA: proceso.rama ?? '',
  RADICADO_JUZGADO: proceso.radicado1 ?? '',
  CIUDAD_JUZGADO: proceso.ciudad3 ?? '',
  PRESTAMOS: proceso.prestamos ?? '',
  CELULAR: proceso.celular ?? '',
  CELULAR_2: proceso.celularSecundario ?? '',
  TELEFONO: proceso.telefono ?? '',
  CORREO_ELECTRONICO: proceso.correoElectronico ?? '',
  DIRECCION: proceso.direccion ?? '',
  CIUDAD: proceso.ciudad ?? '',
  PLACA: proceso.placaVehiculo ?? '',
  valor_honorarios: proceso.valorHonorarios ?? 0,
  valor_peritaje: proceso.valorPeritaje ?? 0,
  valor_prestamos: proceso.valorPrestamos ?? 0,
  gastos_adicionales: proceso.gastosAdicionales ?? 0,
  fecha_ingreso: proceso.fechaIngreso,
  fecha: proceso.fecha,
  observaciones: proceso.observaciones ?? '',
  observaciones_internas: proceso.observacionesInternas ?? '',
  observaciones_cliente: proceso.observacionesCliente ?? proceso.observaciones ?? '',
  demandado: proceso.demandado ?? '',
  fecha_radicacion: proceso.fechaRadicacion ?? ''
});

const readStore = (): MockProceso[] => {
  if (typeof window === 'undefined') {
    return [...mockProcesos];
  }

  try {
    const savedVersion = window.localStorage.getItem(VERSION_KEY);
    if (savedVersion !== SEED_VERSION) {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.setItem(VERSION_KEY, SEED_VERSION);
    }

    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as MockProceso[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Ignorar datos corruptos y re-sembrar
  }

  return [...mockProcesos];
};

const writeStore = (procesos: MockProceso[]): void => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(procesos));
};

const sortById = (items: MockProceso[]): MockProceso[] =>
  [...items].sort((a, b) => Number(a.id) - Number(b.id));

export const mockStore = {
  getAll(): { procesos: MockProceso[]; raw: Record<string, unknown>[] } {
    const procesos = sortById(readStore());
    return {
      procesos,
      raw: procesos.map(mockProcesoToRaw)
    };
  },

  getById(id: string): MockProceso | undefined {
    return readStore().find((p) => String(p.id) === String(id));
  },

  getRawById(id: string): Record<string, unknown> | undefined {
    const proceso = this.getById(id);
    return proceso ? mockProcesoToRaw(proceso) : undefined;
  },

  getByClienteId(clienteId: number): Record<string, unknown>[] {
    const procesos = readStore().filter((p) => Number(p.clienteId) === Number(clienteId));
    const cedula = procesos[0]?.cedula;

    let matches = procesos;
    if (cedula) {
      const normalized = cedula.replace(/\D/g, '');
      matches = readStore().filter((p) => {
        const pCedula = String(p.cedula ?? '').replace(/\D/g, '');
        return pCedula !== '' && pCedula === normalized;
      });
    }

    return matches.map(mockProcesoToRaw);
  },

  create(processData: Omit<MockProceso, 'id'>): MockProceso {
    const current = readStore();
    const nextId =
      current.reduce((max, item) => {
        const numeric = Number(item.id);
        return Number.isNaN(numeric) ? max : Math.max(max, numeric);
      }, 0) + 1;

    const newProcess: MockProceso = {
      ...processData,
      id: String(nextId)
    };

    writeStore([...current, newProcess]);
    return newProcess;
  },

  update(id: string, updates: Partial<MockProceso>): MockProceso {
    const current = readStore();
    const index = current.findIndex((p) => String(p.id) === String(id));
    if (index === -1) {
      throw new Error(`Proceso mock con ID "${id}" no encontrado.`);
    }

    const updated: MockProceso = { ...current[index], ...updates, id: current[index].id };
    const next = [...current];
    next[index] = updated;
    writeStore(next);
    return updated;
  },

  delete(id: string): void {
    const current = readStore();
    writeStore(current.filter((p) => String(p.id) !== String(id)));
  },

  reset(): void {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(STORAGE_KEY);
  }
};

/** IDs de cliente disponibles para pruebas en el portal */
export const MOCK_CLIENTE_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
