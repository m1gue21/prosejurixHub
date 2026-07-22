import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, LogOut } from 'lucide-react';
import DashboardCards from '../../components/admin/DashboardCards';
import ProcessTable from '../../components/admin/ProcessTable';
import SearchBar from '../../components/common/SearchBar';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ProcessForm from '../../components/admin/ProcessForm';
import { mockClientes, estadosInternos, MockProceso } from '../../data/mocks';
import { useProcesses } from '../../hooks/useProcesses';
import { useNotifications } from '../../components/common/NotificationProvider';
import { useConfirm } from '../../components/common/ConfirmProvider';

const normalizeText = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const collectNameCandidates = (record: any): string[] => {
  if (!record) return [];

  const candidates: string[] = [];
  const directKeys = [
    'cliente_nombre',
    'CLIENTE_NOMBRE',
    'CLIENTENOMBRE',
    'clienteNombre',
    'Cliente Nombre',
    'Nombre Cliente',
    'nombre_cliente',
    'cliente',
    'Nombre',
    'nombre',
    'NOMBRE',
    'Nombres',
    'nombres',
    'NOMBRES',
    'Apellido',
    'apellido',
    'APELLIDO',
    'Apellidos',
    'apellidos',
    'APELLIDOS'
  ];

  for (const key of directKeys) {
    if (record[key]) {
      candidates.push(String(record[key]));
    }
  }

  const composedGroups = [
    ['PRIMER_NOMBRE', 'SEGUNDO_NOMBRE', 'PRIMER_APELLIDO', 'SEGUNDO_APELLIDO'],
    ['PRIMERNOMBRE', 'SEGUNDONOMBRE', 'PRIMERAPELLIDO', 'SEGUNDOAPELLIDO'],
    ['primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido'],
    ['Primer Nombre', 'Segundo Nombre', 'Primer Apellido', 'Segundo Apellido']
  ];

  for (const group of composedGroups) {
    const parts = group.map((key) => record[key]).filter(Boolean);
    if (parts.length > 0) {
      candidates.push(parts.map(String).join(' '));
    }
  }

  const pairGroups = [
    ['NOMBRES', 'APELLIDOS'],
    ['nombres', 'apellidos'],
    ['Nombres', 'Apellidos']
  ];

  for (const group of pairGroups) {
    const parts = group.map((key) => record[key]).filter(Boolean);
    if (parts.length > 0) {
      candidates.push(parts.map(String).join(' '));
    }
  }

  return candidates;
};

const extractRawId = (record: any): string | number | undefined => {
  if (!record) return undefined;
  return (
    record.ID ??
    record.id ??
    record.Id ??
    record.id_proceso ??
    record.ID_PROCESO ??
    record.proceso_id ??
    record.PROCESO_ID
  );
};

const compareIdsAsc = (
  a: string | number | undefined | null,
  b: string | number | undefined | null
): number => {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;

  const numA = Number(a);
  const numB = Number(b);
  const isNumericA = !Number.isNaN(numA);
  const isNumericB = !Number.isNaN(numB);

  if (isNumericA && isNumericB) {
    return numA - numB;
  }

  if (isNumericA) return -1;
  if (isNumericB) return 1;

  return String(a).localeCompare(String(b), undefined, {
    sensitivity: 'base',
    numeric: true
  });
};

const Procesos = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const { notify } = useNotifications();
  const { confirm } = useConfirm();

  // Usar hook personalizado para gestionar procesos
  const { procesos, procesosRaw, createProcess, updateProcess, deleteProcess, isLoaded, error, usingMockData } = useProcesses();
  const clientes = mockClientes;

  // Helper para leer valores desde tabla cruda o mock
  const getValue = (obj: any, ...keys: string[]): any => {
    for (const key of keys) {
      if (obj && obj[key] !== undefined && obj[key] !== null && obj[key] !== '') return obj[key];
    }
    return null;
  };

  const normalizedSearchTerm = useMemo(
    () => (searchTerm ? normalizeText(searchTerm.trim()) : ''),
    [searchTerm]
  );

  const procesosRawMap = useMemo(() => {
    const map = new Map<string, any>();
    if (!procesosRaw) return map;

    for (const record of procesosRaw) {
      if (!record) continue;
      const rawId = extractRawId(record);
      if (rawId !== undefined && rawId !== null) {
        map.set(String(rawId), record);
      }
    }

    return map;
  }, [procesosRaw]);

  // Estadísticas basadas en tabla si existe, con fallback a mocks
  const stats = useMemo(() => {
    const origin = (procesosRaw && procesosRaw.length > 0) ? procesosRaw : procesos;
    const totalProcesos = origin.length;

    let activos = 0, finalizados = 0, enRevision = 0, enNegociacion = 0;
    for (const p of origin) {
      const estado = String(getValue(p, 'estado', 'Estado', 'ESTADO') ?? p.estado ?? '').toLowerCase();
      const estadoPublico = String(getValue(p, 'estado_publico', 'estadoPublico', 'ESTADO_PUBLICO') ?? p.estadoPublico ?? '').toLowerCase();

      if (estado === 'activo') activos++;
      if (estado === 'finalizado' || estado === 'cerrado') finalizados++;
      if (estado === 'en_espera' || estado.includes('revision') || estado.includes('revisión')) enRevision++;
      if (estadoPublico.includes('negociacion') || estadoPublico.includes('negociación')) enNegociacion++;
    }

    return {
      totalProcesos,
      procesosActivos: activos,
      procesosFinalizados: finalizados,
      procesosEnRevision: enRevision,
      procesosEnNegociacion: enNegociacion,
      totalClientes: clientes.length
    };
  }, [procesos, procesosRaw, clientes]);

  // Filtrar procesos por búsqueda (nombre y apellidos, insensible a mayúsculas/acentos)
  const filteredProcesos = useMemo(() => {
    if (!normalizedSearchTerm) {
      return [...procesos].sort((a, b) => compareIdsAsc(a.id, b.id));
    }

    const filtered = procesos.filter((p) => {
      const candidates: string[] = [];

      if (p.clienteNombre) {
        candidates.push(String(p.clienteNombre));
      }

      const rawRecord = procesosRawMap.get(p.id);
      if (rawRecord) {
        candidates.push(...collectNameCandidates(rawRecord));
      }

      return candidates.some((value) => {
        if (!value) return false;
        return normalizeText(String(value)).includes(normalizedSearchTerm);
      });
    });

    return filtered.sort((a, b) => compareIdsAsc(a.id, b.id));
  }, [normalizedSearchTerm, procesos, procesosRawMap]);

  const openModal = (proceso?: any) => {
    setEditingItem(proceso || null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const handleView = (proceso: any) => {
    // Obtener el ID del proceso desde diferentes posibles columnas
    const procId = proceso.ID || proceso.id || proceso.Id;
    if (!procId) {
      console.error('❌ No se pudo determinar el ID del proceso para la navegación', proceso);
      notify({
        type: 'error',
        title: 'No se pudo abrir el proceso',
        message: 'No encontramos el identificador de este proceso. Intenta refrescar la página.'
      });
      return;
    }

    console.log('🔍 Navegando a detalles con ID:', procId, 'Proceso completo:', proceso);
    navigate(`/admin/procesos/${encodeURIComponent(String(procId))}?mode=view`);
  };

  const handleEdit = (proceso: any) => {
    // Obtener el ID del proceso desde diferentes posibles columnas
    const procId = proceso.ID || proceso.id || proceso.Id;
    if (!procId) {
      console.error('❌ No se pudo determinar el ID del proceso para edición', proceso);
      notify({
        type: 'error',
        title: 'No se pudo editar el proceso',
        message: 'No encontramos el identificador de este proceso. Intenta refrescar la página.'
      });
      return;
    }

    console.log('🔍 Navegando a edición con ID:', procId, 'Proceso completo:', proceso);
    navigate(`/admin/procesos/${encodeURIComponent(String(procId))}?mode=edit`);
  };

  const handleDelete = async (id: string | number) => {
    const confirmed = await confirm({
      title: 'Eliminar proceso',
      message: 'Esta acción no se puede deshacer. ¿Deseas eliminar definitivamente este proceso?',
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      tone: 'danger'
    });

    if (!confirmed) return;

    try {
      await deleteProcess(String(id));
      notify({
        type: 'success',
        title: 'Proceso eliminado',
        message: 'El proceso fue eliminado correctamente.'
      });
    } catch (error) {
      console.error('Error:', error);
      notify({
        type: 'error',
        title: 'No se pudo eliminar',
        message: 'Ocurrió un error al eliminar el proceso. Intenta nuevamente.'
      });
    }
  };

  const handleSubmit = async (data: any) => {
    let action: 'create' | 'update' | null = null;
    try {
      if (editingItem) {
        // Actualizar proceso existente
        const nombreCliente = (data.clienteNombre ?? editingItem.clienteNombre ?? '').trim();
        if (!nombreCliente) {
          notify({
            type: 'warning',
            title: 'Falta el nombre del cliente',
            message: 'Por favor escribe el nombre completo del cliente antes de guardar.'
          });
          return;
        }

        const payload: Partial<MockProceso> & Record<string, any> = {
          clienteNombre: nombreCliente,
          cedula: data.cedula ?? editingItem.cedula ?? '',
          estado: (data.estadoInterno as MockProceso['estado']) || editingItem.estado || 'activo',
          estadoPublico: data.estadoPublico ?? editingItem.estadoPublico ?? 'Evaluación Inicial',
          estadoProceso: data.estadoProceso ?? editingItem.estadoProceso,
          tipo: (data.tipo as MockProceso['tipo']) || editingItem.tipo || 'civil',
          claseProceso: data.claseProceso ?? editingItem.claseProceso,
          responsabilidad: data.responsabilidad ?? editingItem.responsabilidad,
          fecha: data.fecha ?? editingItem.fecha,
          fechaIngreso: data.fechaIngreso ?? editingItem.fechaIngreso,
          fechaAccidente: data.fechaAccidente ?? editingItem.fechaAccidente,
          caducidad: data.caducidad ?? editingItem.caducidad,
          fechaQuerella: data.fechaQuerella ?? editingItem.fechaQuerella,
          fechaReclamacion: data.fechaReclamacion ?? editingItem.fechaReclamacion,
          conciliacion: data.conciliacion ?? editingItem.conciliacion,
          fechaPresentacionDemanda:
            data.fechaPresentacionDemanda ?? editingItem.fechaPresentacionDemanda,
          demandado: data.demandado ?? editingItem.demandado,
          observaciones: data.observaciones ?? editingItem.observaciones,
          observacionesInternas: data.observacionesInternas ?? editingItem.observacionesInternas,
          observacionesCliente: data.observacionesCliente ?? editingItem.observacionesCliente,
          juzgado: data.juzgado ?? editingItem.juzgado,
          rama: data.rama ?? editingItem.rama,
          placaVehiculo: data.placaVehiculo ?? editingItem.placaVehiculo,
          valorHonorarios: data.valorHonorarios ?? editingItem.valorHonorarios,
          valorPeritaje: data.valorPeritaje ?? editingItem.valorPeritaje,
          valorPrestamos: data.valorPrestamos ?? editingItem.valorPrestamos,
          gastosAdicionales: data.gastosAdicionales ?? editingItem.gastosAdicionales,
          fechaRadicacion: data.fechaRadicacion ?? editingItem.fechaRadicacion,
          lugarAccidente: data.lugarAccidente ?? editingItem.lugarAccidente,
          fiscalia: data.fiscalia ?? editingItem.fiscalia,
          ciudad1: data.ciudad1 ?? editingItem.ciudad1,
          ciudad2: data.ciudad2 ?? editingItem.ciudad2,
          ciudad3: data.ciudad3 ?? editingItem.ciudad3,
          aseguradora: data.aseguradora ?? editingItem.aseguradora,
          actuacion: data.actuacion ?? editingItem.actuacion,
          radicado1: data.radicado1 ?? editingItem.radicado1,
          prestamos: data.prestamos ?? editingItem.prestamos
        };

        const clienteIdValue = data.clienteId ?? editingItem.clienteId;
        if (clienteIdValue !== undefined && clienteIdValue !== null) {
          payload.clienteId = Number(clienteIdValue);
        }

        if (data.celular !== undefined) payload.celular = data.celular;
        if (data.telefono !== undefined) payload.telefono = data.telefono;
        if (data.celularSecundario !== undefined) payload.celularSecundario = data.celularSecundario;
        if (data.correoElectronico !== undefined) payload.correoElectronico = data.correoElectronico;
        if (data.direccion !== undefined) payload.direccion = data.direccion;
        if (data.ciudad !== undefined) payload.ciudad = data.ciudad;
        if (data.radicado !== undefined) payload.radicado = data.radicado;

        await updateProcess(editingItem.id, payload);
        action = 'update';
      } else {
        const nombreCliente = (data.clienteNombre ?? '').trim();
        if (!nombreCliente) {
          notify({
            type: 'warning',
            title: 'Falta el nombre del cliente',
            message: 'Por favor escribe el nombre completo del cliente antes de guardar.'
          });
          return;
        }

        const nuevoProceso: (Omit<MockProceso, 'id'> & Record<string, any>) = {
          cedula: data.cedula || '',
          estado: (data.estadoInterno || 'activo') as MockProceso['estado'],
          estadoPublico: data.estadoPublico || 'Evaluación Inicial',
          estadoProceso: data.estadoProceso || undefined,
          tipo: (data.tipo || 'civil') as MockProceso['tipo'],
          claseProceso: data.claseProceso || undefined,
          responsabilidad: data.responsabilidad || undefined,
          fecha: data.fecha || new Date().toISOString().split('T')[0],
          fechaIngreso: data.fechaIngreso || new Date().toISOString().split('T')[0],
          fechaAccidente: data.fechaAccidente || undefined,
          caducidad: data.caducidad || undefined,
          fechaQuerella: data.fechaQuerella || undefined,
          fechaReclamacion: data.fechaReclamacion || undefined,
          conciliacion: data.conciliacion || undefined,
          fechaPresentacionDemanda: data.fechaPresentacionDemanda || undefined,
          clienteNombre: nombreCliente,
          clienteId: data.clienteId ?? 0,
          demandado: data.demandado || '',
          observaciones: data.observaciones || undefined,
          observacionesInternas: data.observacionesInternas || undefined,
          observacionesCliente: data.observacionesCliente || undefined,
          juzgado: data.juzgado || undefined,
          rama: data.rama || undefined,
          placaVehiculo: data.placaVehiculo || undefined,
          valorHonorarios: data.valorHonorarios || undefined,
          valorPeritaje: data.valorPeritaje || undefined,
          valorPrestamos: data.valorPrestamos || undefined,
          gastosAdicionales: data.gastosAdicionales || undefined,
          fechaRadicacion: data.fechaRadicacion || undefined,
          lugarAccidente: data.lugarAccidente || undefined,
          fiscalia: data.fiscalia || undefined,
          ciudad1: data.ciudad1 || undefined,
          ciudad2: data.ciudad2 || undefined,
          ciudad3: data.ciudad3 || undefined,
          aseguradora: data.aseguradora || undefined,
          actuacion: data.actuacion || undefined,
          radicado1: data.radicado1 || undefined,
          prestamos: data.prestamos || undefined
        };

        if (data.celular) nuevoProceso.celular = data.celular;
        if (data.telefono) nuevoProceso.telefono = data.telefono;
        if (data.celularSecundario) nuevoProceso.celularSecundario = data.celularSecundario;
        if (data.correoElectronico) nuevoProceso.correoElectronico = data.correoElectronico;
        if (data.direccion) nuevoProceso.direccion = data.direccion;
        if (data.ciudad) nuevoProceso.ciudad = data.ciudad;
        if (data.radicado) nuevoProceso.radicado = data.radicado;
        
        console.log('📝 Creando nuevo proceso con todos los campos:', nuevoProceso);
        await createProcess(nuevoProceso);
        action = 'create';
      }
      closeModal();
      if (action === 'create') {
        notify({
          type: 'success',
          title: 'Proceso creado',
          message: 'El nuevo proceso fue registrado correctamente.'
        });
      } else if (action === 'update') {
        notify({
          type: 'success',
          title: 'Cambios guardados',
          message: 'Actualizamos la información del proceso.'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      notify({
        type: 'error',
        title: 'No se pudo guardar',
        message: 'Ocurrió un error al guardar el proceso. Intenta nuevamente.'
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.35),_transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(79,70,229,0.25),_transparent_45%)]" />
        <div className="relative mx-auto w-full max-w-7xl px-4 pb-10 pt-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <div className="rounded-3xl border border-white/30 bg-white/20 p-3 shadow-2xl shadow-blue-900/20 backdrop-blur">
                <img
                  src="/prosejurix-rounded.png"
                  alt="Prosejurix Logo"
                  className="h-16 w-16 sm:h-18 sm:w-18 rounded-2xl border border-white/40"
                />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-blue-200/70">Panel Administrativo</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Gestión Integral de Procesos
                </h1>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2 border-transparent bg-white/10 text-white hover:bg-white/20"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Salir</span>
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => openModal()}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 px-5 py-2 shadow-lg shadow-blue-900/40 hover:from-sky-400 hover:via-blue-500 hover:to-indigo-500"
              >
                <Plus className="h-4 w-4" />
                Nuevo Proceso
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative pb-16 sm:pb-20">
        <div className="mt-12 sm:mt-16">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/10">
        {usingMockData && (
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded">
            <p className="text-sm text-amber-800">
              <strong>Modo demo local:</strong> Supabase no está disponible. Estás trabajando con {procesos.length} procesos de prueba guardados en el navegador.
            </p>
            <p className="mt-1 text-xs text-amber-700">
              Portal cliente: prueba con IDs <strong>1</strong>, <strong>2</strong>, <strong>4</strong> o <strong>5</strong>. Admin: <strong>admin / prosejurix2024</strong>.
            </p>
          </div>
        )}
        {error && !usingMockData && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm text-red-700">
                  <strong>Error de conexión:</strong> {error}
                </p>
                <div className="mt-2 text-xs text-red-600">
                  <p>Posibles soluciones:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Verifica que el archivo .env esté configurado correctamente</li>
                    <li>Verifica que la tabla "CTRANTECEDENTES" exista en Supabase</li>
                    <li>Verifica los permisos RLS (Row Level Security) en Supabase</li>
                    <li>Abre la consola del navegador (F12) para más detalles</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <DashboardCards
          totalProcesos={stats.totalProcesos}
          procesosActivos={stats.procesosActivos}
          procesosEnNegociacion={stats.procesosEnNegociacion}
          procesosFinalizados={stats.procesosFinalizados}
          procesosEnRevision={stats.procesosEnRevision}
        />

        <div className="mb-8 flex flex-col gap-5 lg:flex-row">
          <div className="flex-1 rounded-3xl border border-slate-100 bg-white p-4 shadow-md">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              Filtros rápidos
            </p>
            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
            <SearchBar
              placeholder="Buscar usuario"
              value={searchTerm}
              onChange={setSearchTerm}
              className="flex-1"
            />
          </div>
        </div>
          <div className="rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 p-[1px] shadow-lg shadow-slate-900/30">
            <div className="h-full rounded-3xl bg-white px-6 py-6 text-sm text-slate-600">
              <p className="text-xs uppercase tracking-[0.5em] text-slate-400">Resumen</p>
              <p className="mt-3 text-lg font-semibold text-slate-900">
                {filteredProcesos.length} procesos listos para gestionar
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Revisa la tabla para acceder al detalle, editar o eliminar cada proceso en cuestión de
                segundos.
              </p>
            </div>
          </div>
        </div>

        {!isLoaded ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-md">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-slate-500">Cargando procesos desde Supabase...</p>
              <p className="text-xs text-slate-400">Por favor espera mientras se conecta a la base de datos</p>
            </div>
          </div>
        ) : (
          <>
            {filteredProcesos.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-md">
                <div className="max-w-md mx-auto">
                  {error ? (
                    <>
                      <div className="mb-4">
                        <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-slate-700 mb-2 font-semibold">Error al cargar los procesos</p>
                      <p className="text-sm text-slate-500 mb-4">{error}</p>
                      <p className="text-xs text-slate-400 mb-4">
                        Verifica la consola del navegador (F12) para más detalles sobre el error.
                      </p>
                    </>
                  ) : searchTerm ? (
                    <>
                      <p className="text-slate-500 mb-4">
                        No se encontraron procesos con los filtros seleccionados
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchTerm('');
                        }}
                        className="inline-flex items-center"
                      >
                        Limpiar Filtros
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="mb-4">
                        <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-slate-700 mb-2 font-semibold">No hay procesos registrados</p>
                      <p className="text-sm text-slate-500 mb-4">
                        La tabla "CTRANTECEDENTES" está vacía. Crea tu primer proceso para comenzar.
                      </p>
                      <Button
                        variant="primary"
                        onClick={() => openModal()}
                        className="inline-flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Crear Primer Proceso
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="rounded-3xl border border-slate-200 bg-white p-4 mb-4 shadow-sm">
                  <p className="text-sm text-slate-600">
                    Mostrando <span className="font-semibold text-slate-900">{filteredProcesos.length}</span> de{' '}
                    <span className="font-semibold text-slate-900">{procesos.length}</span> procesos
                  </p>
                </div>
                <ProcessTable
                  processes={filteredProcesos.map(p => ({
                    id: p.id,
                    clienteId: p.clienteId,
                    clienteNombre: p.clienteNombre,
                    fechaIngreso: p.fechaIngreso,
                    estadoInterno: p.estado,
                    estadoPublico: p.estadoPublico,
                    demandado: p.demandado
                  }))}
                  procesosRaw={
                    procesosRaw && procesosRaw.length > 0
                      ? procesosRaw
                          .filter((record: any) => {
                            if (!normalizedSearchTerm) return true;

                            const candidates = collectNameCandidates(record);
                            const directNombre =
                              record?.NOMBRE ??
                              record?.nombre ??
                              record?.cliente_nombre ??
                              record?.Nombre ??
                              '';

                            if (directNombre) {
                              candidates.push(String(directNombre));
                            }

                            return candidates.some((value) =>
                              value
                                ? normalizeText(String(value)).includes(normalizedSearchTerm)
                                : false
                            );
                          })
                          .sort((a: any, b: any) =>
                            compareIdsAsc(extractRawId(a), extractRawId(b))
                          )
                      : undefined
                  }
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={handleView}
                />
              </>
            )}
          </>
        )}
          </div>
        </div>
      </div>
    </main>

      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingItem ? 'Editar Proceso' : 'Nuevo Proceso'}
        showCloseButton={false}
      >
        <ProcessForm
          initialData={editingItem}
          estadosInternos={estadosInternos}
          onSubmit={handleSubmit}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
};

export default Procesos;
