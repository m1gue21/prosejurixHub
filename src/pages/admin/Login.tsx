import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import AdminLoginForm from '../../components/admin/AdminLoginForm';
import LoadingChecklist from '../../components/common/LoadingChecklist';
import { useNotifications } from '../../components/common/NotificationProvider';
import { loginStaff } from '../../lib/staffSession';

interface ChecklistItem {
  id: string;
  label: string;
  status: 'pending' | 'loading' | 'completed' | 'error';
}

const AdminLogin = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([
    { id: '1', label: 'Validando credenciales...', status: 'pending' },
    { id: '2', label: 'Verificando identidad...', status: 'pending' },
    { id: '3', label: 'Inicializando sistema...', status: 'pending' },
    { id: '4', label: 'Preparando panel administrativo...', status: 'pending' }
  ]);
  const { notify } = useNotifications();

  const updateChecklistItem = (id: string, status: ChecklistItem['status']) => {
    setChecklistItems((items) => items.map((item) => (item.id === id ? { ...item, status } : item)));
  };

  const handleLogin = async (usuario: string, password: string) => {
    const session = loginStaff(usuario, password);
    if (!session) {
      notify({
        type: 'warning',
        title: 'Credenciales incorrectas',
        message: 'Usa giovanni, leidy o salome / prosejurix2024'
      });
      return;
    }

    setIsLoading(true);

    try {
      updateChecklistItem('1', 'loading');
      await new Promise((r) => setTimeout(r, 400));
      updateChecklistItem('1', 'completed');
      updateChecklistItem('2', 'loading');
      await new Promise((r) => setTimeout(r, 300));
      updateChecklistItem('2', 'completed');
      updateChecklistItem('3', 'loading');
      await new Promise((r) => setTimeout(r, 300));
      updateChecklistItem('3', 'completed');
      updateChecklistItem('4', 'loading');
      await new Promise((r) => setTimeout(r, 300));
      updateChecklistItem('4', 'completed');
      await new Promise((r) => setTimeout(r, 200));
      notify({
        type: 'success',
        title: `Hola, ${session.nombre}`,
        message: 'Misma vista para todo el equipo por ahora'
      });
      navigate('/admin/usuarios');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      notify({ type: 'error', title: 'Error al iniciar sesión', message: errorMessage });
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white">
              <Shield className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="mb-2 text-3xl font-bold text-white">Panel Administrativo</h2>
            <p className="text-blue-200">Acceso por perfil del equipo Prosejurix</p>
          </div>

          <AdminLoginForm onLogin={handleLogin} />

          <div className="text-center">
            <a href="/" className="text-sm text-white hover:text-blue-200">
              ← Volver al sitio web
            </a>
          </div>
        </div>
      </div>

      {isLoading && (
        <LoadingChecklist
          items={checklistItems}
          title="Iniciando sesión..."
          subtitle="Estamos preparando tu panel administrativo"
        />
      )}
    </>
  );
};

export default AdminLogin;
