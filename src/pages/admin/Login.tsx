import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import AdminLoginForm from '../../components/admin/AdminLoginForm';
import LoadingChecklist from '../../components/common/LoadingChecklist';
import { useNotifications } from '../../components/common/NotificationProvider';

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
    { id: '4', label: 'Preparando panel administrativo...', status: 'pending' },
  ]);
  const { notify } = useNotifications();

  const updateChecklistItem = (id: string, status: ChecklistItem['status']) => {
    setChecklistItems(items =>
      items.map(item => (item.id === id ? { ...item, status } : item))
    );
  };

  const handleLogin = async (usuario: string, password: string) => {
    // Validar credenciales
    if (usuario !== 'admin' || password !== 'prosejurix2024') {
      notify({
        type: 'warning',
        title: 'Credenciales incorrectas',
        message: 'Usa admin / prosejurix2024 para ingresar.'
      });
      return;
    }

    setIsLoading(true);

    try {
      // Paso 1: Validar credenciales
      updateChecklistItem('1', 'loading');
      await new Promise(resolve => setTimeout(resolve, 800));
      updateChecklistItem('1', 'completed');

      // Paso 2: Verificar identidad
      updateChecklistItem('2', 'loading');
      await new Promise(resolve => setTimeout(resolve, 600));
      updateChecklistItem('2', 'completed');

      // Paso 3: Inicializar sistema
      updateChecklistItem('3', 'loading');
      await new Promise(resolve => setTimeout(resolve, 700));
      updateChecklistItem('3', 'completed');

      // Paso 4: Preparar panel
      updateChecklistItem('4', 'loading');
      await new Promise(resolve => setTimeout(resolve, 500));
      updateChecklistItem('4', 'completed');

      // Esperar un momento antes de navegar para que se vea el último check
      await new Promise(resolve => setTimeout(resolve, 300));

      // Navegar al panel de usuarios
      navigate('/admin/usuarios');
    } catch (error) {
      console.error('Error en login:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      notify({
        type: 'error',
        title: 'Error al iniciar sesión',
        message: errorMessage
      });
      
      // Marcar el paso actual como error
      const currentItem = checklistItems.find(item => item.status === 'loading');
      if (currentItem) {
        updateChecklistItem(currentItem.id, 'error');
      }
      
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Shield className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Panel Administrativo</h2>
            <p className="text-blue-200">Acceso exclusivo para el equipo de Prosejurix</p>
          </div>

          <AdminLoginForm onLogin={handleLogin} />

          <div className="text-center">
            <a
              href="/"
              className="text-white hover:text-blue-200 text-sm"
            >
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

