import { StaffId, StaffProfile, findStaffByLogin, getStaffById } from '../data/staffCatalog';

const SESSION_KEY = 'prosejurix_staff_session';

export interface StaffSession {
  staffId: StaffId;
  nombre: string;
  role: StaffProfile['role'];
  loggedAt: string;
}

export const loginStaff = (username: string, password: string): StaffSession | null => {
  const profile = findStaffByLogin(username, password);
  if (!profile) return null;
  const session: StaffSession = {
    staffId: profile.id,
    nombre: profile.nombre,
    role: profile.role,
    loggedAt: new Date().toISOString()
  };
  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
  return session;
};

export const logoutStaff = (): void => {
  if (typeof window !== 'undefined') {
    window.sessionStorage.removeItem(SESSION_KEY);
  }
};

export const getStaffSession = (): StaffSession | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StaffSession;
    if (!getStaffById(parsed.staffId)) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const requireStaffSession = (): StaffSession | null => getStaffSession();
