export type StaffRole = 'abogado_principal' | 'asistente';

export type StaffId = 'giovanni' | 'leidy' | 'salome';

export interface StaffProfile {
  id: StaffId;
  nombre: string;
  /** Login username (lowercase) */
  username: string;
  password: string;
  role: StaffRole;
  /** Reserved for future permission matrix */
  permissions: {
    verTodasLasTareas: boolean;
    verAgendaCompleta: boolean;
  };
}

/** Perfiles del equipo. Por ahora todos ven lo mismo; permissions listos para roles. */
export const STAFF_PROFILES: StaffProfile[] = [
  {
    id: 'giovanni',
    nombre: 'Giovanni',
    username: 'giovanni',
    password: 'prosejurix2024',
    role: 'abogado_principal',
    permissions: { verTodasLasTareas: true, verAgendaCompleta: true }
  },
  {
    id: 'leidy',
    nombre: 'Leidy',
    username: 'leidy',
    password: 'prosejurix2024',
    role: 'asistente',
    permissions: { verTodasLasTareas: true, verAgendaCompleta: true }
  },
  {
    id: 'salome',
    nombre: 'Salomé',
    username: 'salome',
    password: 'prosejurix2024',
    role: 'asistente',
    permissions: { verTodasLasTareas: true, verAgendaCompleta: true }
  }
];

export const findStaffByLogin = (
  username: string,
  password: string
): StaffProfile | undefined => {
  const u = username.trim().toLowerCase();
  // Compat: admin → Giovanni
  const alias = u === 'admin' ? 'giovanni' : u;
  return STAFF_PROFILES.find((s) => s.username === alias && s.password === password);
};

export const getStaffById = (id: string | null | undefined): StaffProfile | undefined =>
  STAFF_PROFILES.find((s) => s.id === id);

export const staffLabel = (id: string | null | undefined): string => {
  if (!id || id === 'por_asignar') return 'Por asignar';
  if (id === 'cliente') return 'Cliente';
  return getStaffById(id)?.nombre || id;
};
