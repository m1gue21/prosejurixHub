import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Building2, FileText, Tag, DollarSign, AlertCircle, Phone, Mail } from 'lucide-react';
import Button from '../../components/common/Button';
import ProcessForm from '../../components/admin/ProcessForm';
import { transformSupabaseToMock } from '../../hooks/useProcesses';
import { mockClientes, estadosInternos } from '../../data/mocks';
import { useProcesses } from '../../hooks/useProcesses';
import { useNotifications } from '../../components/common/NotificationProvider';
import { ControlProcesoAntecedente } from '../../types/supabase';
import { supabase } from '../../lib/supabase';
import { isMockDataForced, mockStore } from '../../lib/mockStore';
import { detectTableAndIdType } from '../../lib/supabaseInspector';

const ProcesoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'view';
  const { updateProcess } = useProcesses();
  const { notify } = useNotifications();

  const [proceso, setProceso] = useState<any>(null);
  const [rawProcessData, setRawProcessData] = useState<ControlProcesoAntecedente | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(mode === 'edit');

  // Función helper para obtener valores de diferentes posibles nombres de columna
  const getValue = (obj: any, ...keys: string[]): any => {
    for (const key of keys) {
      if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
        return obj[key];
      }
    }
    return null;
  };

  const formatDate = (value: string | null | undefined) => {
    if (!value) return 'No especificado';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return String(value);
    }
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const fetchProcessById = async (targetId: string): Promise<ControlProcesoAntecedente | null> => {
    if (isMockDataForced() || !supabase) {
      return (mockStore.getRawById(targetId) as ControlProcesoAntecedente | undefined) ?? null;
    }

    try {
      const tableInfo = await detectTableAndIdType();
      let searchValue: string | number = targetId;

      if (tableInfo.idType === 'number') {
        const numericId = Number(targetId);
        if (Number.isNaN(numericId)) {
          throw new Error(`El ID "${targetId}" no es válido. Se esperaba un número.`);
        }
        searchValue = numericId;
      }

      const { data, error } = await supabase
        .from(tableInfo.tableName)
        .select('*')
        .eq(tableInfo.idColumnName, searchValue)
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        return data;
      }
    } catch (err) {
      console.warn('⚠️ Supabase no disponible en detalle admin, usando mock:', err);
    }

    return (mockStore.getRawById(targetId) as ControlProcesoAntecedente | undefined) ?? null;
  };

  // Cargar proceso completo desde Supabase por ID
  useEffect(() => {
    const loadProcess = async () => {
      if (!id) {
        navigate('/admin/procesos');
        return;
      }

      // Validar ID antes de procesar
      if (id.trim().length < 1) {
        setError('ID inválido: El ID no puede estar vacío');
        setIsLoading(false);
        return;
      }

      // Decodificar el ID si viene codificado en la URL
      const decodedId = decodeURIComponent(id);
      console.log('🔍 Buscando proceso con ID:', decodedId);

      setIsLoading(true);
      setError(null);

      try {
        const procesoData = await fetchProcessById(decodedId);

        if (procesoData) {
          console.log('✅ Usando datos encontrados en Supabase');
          setRawProcessData(procesoData);
          const transformedProcess = transformSupabaseToMock(procesoData);
          setProceso(transformedProcess);
        } else {
          console.error('❌ No se encontró el proceso en Supabase');
          setError(`No se encontró el proceso con el ID "${decodedId}". Verifica que el ID sea correcto.`);
          setProceso(null);
          setRawProcessData(null);
        }
      } catch (err) {
        console.error('Error al cargar proceso:', err);
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        
        // Mensaje de error más descriptivo
        if (errorMessage.includes('Tabla') && errorMessage.includes('no encontrada')) {
          setError(`Error de configuración: ${errorMessage}`);
        } else if (errorMessage.includes('No se encontró')) {
          setError(`No se encontró el proceso con ID "${decodedId}". Verifica el ID o contacta al administrador.`);
        } else {
          setError(`Error al cargar el proceso: ${errorMessage}`);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProcess();
  }, [id, navigate, supabase]);

  // Si no existe, redirigir
  useEffect(() => {
    if (!isLoading && !proceso && !error && id) {
      navigate('/admin/procesos');
    }
  }, [proceso, isLoading, error, id, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-900/10">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
          <p className="text-slate-600">Cargando proceso...</p>
        </div>
      </div>
    );
  }

  if (error || !proceso) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-xl shadow-rose-200/40">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-rose-500" />
          <p className="mb-2 text-lg font-semibold text-rose-600">Error al cargar el proceso</p>
          <p className="mb-6 text-sm text-slate-500">{error || 'No se encontró el proceso'}</p>
          <Button variant="primary" onClick={() => navigate('/admin/procesos')}>
            Volver a Procesos
          </Button>
        </div>
      </div>
    );
  }

  // Obtener datos originales completos para mostrar todos los campos
  const rawData = rawProcessData || proceso as any;

  // Valores derivados desde la tabla (rawData) con fallback a transformado
  const view_procesoId = getValue(rawData, 'ID', 'id', 'Id') || proceso?.id;
  const view_clienteNombre = getValue(rawData, 'NOMBRE', 'nombre', 'Nombre', 'cliente_nombre', 'clienteNombre', 'Cliente Nombre') || proceso?.clienteNombre;
  const view_cedula = getValue(rawData, 'CEDULA', 'cedula', 'Cedula', 'CÉDULA', 'nit', 'NIT') || proceso?.cedula;
  const view_clienteId = getValue(rawData, 'cliente_id', 'clienteId', 'CLIENTE_ID') || proceso?.clienteId;
  const view_celular = getValue(rawData, 'celular', 'Celular', 'CELULAR', 'telefono_celular') || rawData?.celular;
  const view_telefono = getValue(rawData, 'telefono', 'Telefono', 'TELEFONO', 'telefono_fijo') || rawData?.telefono;
  const view_tipo = getValue(rawData, 'CLASE DE PROCESO', 'CLASE_DE_PROCESO', 'clase_proceso', 'tipo', 'Tipo') || proceso?.tipo;
  const view_estadoInterno = getValue(rawData, 'estado', 'Estado', 'ESTADO') || proceso?.estado;
  const view_estadoPublico = getValue(rawData, 'estado_publico', 'estadoPublico', 'Estado Público') || proceso?.estadoPublico;
  const view_demandado = getValue(rawData, 'demandado', 'Demandado', 'DEMANDADO') || proceso?.demandado;
  const view_juzgado = getValue(rawData, 'juzgado', 'Juzgado', 'JUZGADO') || proceso?.juzgado;
  const view_placaVehiculo = getValue(rawData, 'placa_vehiculo', 'placaVehiculo', 'Placa Vehículo', 'PLACA', 'placa') || proceso?.placaVehiculo;
  const view_fechaIngreso = getValue(rawData, 'fecha_ingreso', 'FECHA DE INGRESO', 'fechaIngreso', 'created_at') || proceso?.fechaIngreso;
  const view_fecha = getValue(rawData, 'fecha', 'FECHA', 'fecha_accidente', 'FECHA DE ACCIDENTE') || proceso?.fecha;
  const view_fechaRadicacion = getValue(rawData, 'fecha_radicacion', 'fechaRadicacion', 'Fecha Radicación', 'FECHA_RADICACION') || proceso?.fechaRadicacion;
  const view_correo = getValue(
    rawData,
    'correo',
    'Correo',
    'CORREO',
    'correo_electronico',
    'Correo Electrónico',
    'CORREO ELECTRÓNICO',
    'email',
    'Email',
    'EMAIL'
  );
  const view_direccion = getValue(rawData, 'direccion', 'Direccion', 'DIRECCION', 'dirección');
  const view_ciudad = getValue(rawData, 'ciudad', 'Ciudad', 'CIUDAD');
  const view_radicado = getValue(rawData, 'radicado', 'RADICADO', 'Radicado');

  // Normalizador de claves para evitar duplicados por acentos o formatos
  const normalizeKey = (key: string): string => {
    return String(key)
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '') // quita acentos
      .replace(/[^a-z0-9]+/g, '_')     // reemplaza separadores por _
      .replace(/^_+|_+$/g, '');        // recorta guiones bajos extremos
  };

  // Conjunto de claves que ya se muestran arriba (sin duplicados, normalizadas)
  const shownKeysNormalized = new Set<string>([
    // Identificadores
    'id','cliente_id',
    // Cliente
    'cliente_nombre','nombre','cedula','cedula_nit','nit','cedula_nit','cedula__nit',
    'celular','telefono','telefono_fijo','telefono_celular',
    'correo','correo_electronico','email',
    'direccion','dirección',
    'ciudad','ciudad_1','ciudad_2','ciudad_3',
    // Proceso
    'tipo','clase_de_proceso','clase_proceso',
    'estado','estado_publico',
    // Legal
    'demandado','juzgado','placa_vehiculo','placa','radicado','radicado_1',
    // Fechas
    'fecha','fecha_accidente','fecha_ingreso','created_at','fecha_radicacion',
  ]);

  // UI helpers: chips de color para estado y tipo
  const chipClass =
    'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border';
  const estadoChipClass = (estado: string | null | undefined) => {
    const v = String(estado || '').toLowerCase();
    if (v.includes('final')) return `${chipClass} bg-emerald-50 text-emerald-700 border-emerald-200`;
    if (v.includes('espera') || v.includes('revision') || v.includes('revisión'))
      return `${chipClass} bg-amber-50 text-amber-700 border-amber-200`;
    if (v.includes('negoci')) return `${chipClass} bg-sky-50 text-sky-700 border-sky-200`;
    if (v.includes('error') || v.includes('rechaz'))
      return `${chipClass} bg-rose-50 text-rose-700 border-rose-200`;
    return `${chipClass} bg-indigo-50 text-indigo-700 border-indigo-200`;
  };

  const tipoChipClass = (tipo: string | null | undefined) => {
    const v = String(tipo || '').toLowerCase();
    if (v.includes('civil')) return `${chipClass} bg-blue-50 text-blue-700 border-blue-200`;
    if (v.includes('penal')) return `${chipClass} bg-rose-50 text-rose-700 border-rose-200`;
    if (v.includes('laboral')) return `${chipClass} bg-amber-50 text-amber-700 border-amber-200`;
    if (v.includes('comercial')) return `${chipClass} bg-emerald-50 text-emerald-700 border-emerald-200`;
    return `${chipClass} bg-slate-50 text-slate-700 border-slate-200`;
  };

  // Elegir icono por clave normalizada
  const getIconForKey = (nk: string) => {
    if (nk.includes('fecha')) return <Calendar className="h-4 w-4 text-blue-600" />;
    if (nk.includes('telefono') || nk.includes('celular')) return <Phone className="h-4 w-4 text-blue-600" />;
    if (nk.includes('correo') || nk.includes('email')) return <Mail className="h-4 w-4 text-blue-600" />;
    if (nk.includes('valor') || nk.includes('monto') || nk.includes('precio')) return <DollarSign className="h-4 w-4 text-blue-600" />;
    if (nk.includes('ciudad') || nk.includes('direccion') || nk.includes('ubicacion') || nk.includes('lugar')) return <Building2 className="h-4 w-4 text-blue-600" />;
    if (nk.includes('juzgado') || nk.includes('fiscalia') || nk.includes('radicado')) return <FileText className="h-4 w-4 text-blue-600" />;
    if (nk.includes('placa')) return <Tag className="h-4 w-4 text-blue-600" />;
    return <Tag className="h-4 w-4 text-blue-600" />;
  };

  const handleSubmit = async (data: any) => {
    const cliente = mockClientes.find(c => c.id === data.clienteId);
    
    try {
      await updateProcess(proceso.id, {
        clienteId: data.clienteId,
        clienteNombre: data.clienteNombre || cliente?.nombre || proceso.clienteNombre || '',
        cedula: data.cedula || cliente?.cedula || proceso.cedula || '',
        celular: data.celular,
        telefono: data.telefono,
        celularSecundario: data.celularSecundario,
        correoElectronico: data.correoElectronico,
        direccion: data.direccion,
        ciudad: data.ciudad,
        estado: data.estadoInterno as 'activo' | 'finalizado' | 'en_espera',
        estadoPublico: data.estadoPublico,
        estadoProceso: data.estadoProceso,
        tipo: data.tipo as 'civil' | 'penal' | 'laboral' | 'comercial',
        claseProceso: data.claseProceso,
        responsabilidad: data.responsabilidad,
        fecha: data.fecha,
        fechaIngreso: data.fechaIngreso,
        fechaAccidente: data.fechaAccidente,
        caducidad: data.caducidad,
        fechaQuerella: data.fechaQuerella,
        demandado: data.demandado,
        observaciones: data.observaciones,
        observacionesInternas: data.observacionesInternas,
        observacionesCliente: data.observacionesCliente,
        juzgado: data.juzgado,
        rama: data.rama,
        placaVehiculo: data.placaVehiculo,
        valorHonorarios: data.valorHonorarios,
        valorPeritaje: data.valorPeritaje,
        valorPrestamos: data.valorPrestamos,
        gastosAdicionales: data.gastosAdicionales,
        fechaRadicacion: data.fechaRadicacion,
        radicado: data.radicado,
        lugarAccidente: data.lugarAccidente,
        ciudad1: data.ciudad1,
        ciudad2: data.ciudad2,
        ciudad3: data.ciudad3,
        fiscalia: data.fiscalia,
        aseguradora: data.aseguradora,
        actuacion: data.actuacion,
        fechaReclamacion: data.fechaReclamacion,
        conciliacion: data.conciliacion,
        fechaPresentacionDemanda: data.fechaPresentacionDemanda,
        radicado1: data.radicado1,
        prestamos: data.prestamos
      } as any);
      
      // Recargar los datos del proceso
      if (id) {
        try {
          const decodedId = decodeURIComponent(id);
          const refreshed = await fetchProcessById(decodedId);
          if (refreshed) {
            setRawProcessData(refreshed);
            const transformedProcess = transformSupabaseToMock(refreshed);
            setProceso(transformedProcess);
          }
        } catch (err) {
          console.error('Error al recargar proceso:', err);
        }
      }
      
      setIsEditing(false);
      // Volver a modo vista en la URL
      navigate(`/admin/procesos/${encodeURIComponent(String(proceso.id))}?mode=view`);
      notify({
        type: 'success',
        title: 'Proceso actualizado',
        message: 'Los cambios del proceso se guardaron correctamente.'
      });
    } catch (error) {
      console.error('Error:', error);
      notify({
        type: 'error',
        title: 'No se pudo actualizar',
        message: 'Ocurrió un error al guardar el proceso. Intenta nuevamente.'
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    navigate(`/admin/procesos/${encodeURIComponent(String(proceso.id))}?mode=view`);
  };

  const enterEditMode = () => {
    if (!proceso) return;
    setIsEditing(true);
    navigate(`/admin/procesos/${encodeURIComponent(String(proceso.id))}?mode=edit`, { replace: true });
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.35),_transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(79,70,229,0.25),_transparent_45%)]" />
        <div className="relative mx-auto w-full max-w-7xl px-4 pb-10 pt-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <button
                onClick={() => navigate('/admin/procesos')}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white shadow-lg shadow-slate-900/50 backdrop-blur transition hover:bg-white/25"
                aria-label="Volver a la lista de procesos"
                title="Volver"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-blue-200/70">Detalle del Proceso</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  {view_clienteNombre || 'Proceso'} · #{String(view_procesoId)}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-blue-100/80">
                    {isEditing ? 'Editando información del proceso' : 'Vista completa del proceso'}
                  </span>
                  {view_tipo && <span className={tipoChipClass(view_tipo)}>{view_tipo}</span>}
                  {view_estadoPublico && <span className={estadoChipClass(view_estadoPublico)}>{view_estadoPublico}</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!isEditing && (
                <Button
                  variant="primary"
                  onClick={enterEditMode}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 px-5 py-2 text-white shadow-lg shadow-blue-900/40 hover:from-sky-400 hover:via-blue-500 hover:to-indigo-500"
                >
                  Editar Proceso
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="relative pb-16 sm:pb-20">
        <div className="mt-12 sm:mt-16">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            {!isEditing ? (
              <div className="space-y-8">
                <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
                  <div className="bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 px-6 py-6 sm:px-8">
                    <div className="flex flex-col gap-4 text-white sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="text-2xl font-semibold sm:text-3xl">{view_clienteNombre || 'Cliente'}</h2>
                        <p className="mt-1 text-sm text-blue-100/80">ID Proceso: {String(view_procesoId)}</p>
                      </div>
                      {view_estadoPublico && (
                        <span className="inline-flex items-center rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
                          {view_estadoPublico}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-8 px-6 py-8 sm:px-8">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 shadow-sm">
                        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Información del Cliente</h3>
                        <div className="mt-4 space-y-3 text-sm text-slate-600">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cliente</p>
                            <p className="mt-1 font-medium text-slate-900">{view_clienteNombre || 'No especificado'}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cédula</p>
                            <p className="mt-1 text-slate-900">{view_cedula || 'No especificado'}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">ID Cliente</p>
                            <p className="mt-1 text-slate-900">{view_clienteId || 'N/A'}</p>
                          </div>
                          {view_celular && (
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Celular</p>
                              <p className="mt-1 text-slate-900">{view_celular}</p>
                            </div>
                          )}
                          {view_telefono && (
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Teléfono</p>
                              <p className="mt-1 text-slate-900">{view_telefono}</p>
                            </div>
                          )}
                          {view_correo && (
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Correo</p>
                              <p className="mt-1 break-words text-slate-900">{view_correo}</p>
                            </div>
                          )}
                          {view_direccion && (
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Dirección</p>
                              <p className="mt-1 break-words text-slate-900">{view_direccion}</p>
                            </div>
                          )}
                          {view_ciudad && (
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ciudad</p>
                              <p className="mt-1 text-slate-900">{view_ciudad}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 shadow-sm">
                        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Información del Proceso</h3>
                        <div className="mt-4 space-y-3 text-sm text-slate-600">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">ID Proceso</p>
                            <p className="mt-1 font-mono text-slate-900">{String(view_procesoId)}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tipo</p>
                            <span className={`mt-2 inline-flex ${tipoChipClass(view_tipo)}`}>{view_tipo || 'No especificado'}</span>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Estado Interno</p>
                            <span className={`mt-2 inline-flex ${estadoChipClass(view_estadoInterno)}`}>
                              {view_estadoInterno || 'No especificado'}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Estado Público</p>
                            <span className={`mt-2 inline-flex ${estadoChipClass(view_estadoPublico)}`}>
                              {view_estadoPublico || 'No especificado'}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Fecha de Ingreso</p>
                            <p className="mt-1 text-slate-900">{formatDate(view_fechaIngreso)}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Fecha del Proceso</p>
                            <p className="mt-1 text-slate-900">{formatDate(view_fecha)}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Fecha Radicación</p>
                            <p className="mt-1 text-slate-900">{formatDate(view_fechaRadicacion)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 shadow-sm">
                        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Información Legal</h3>
                        <div className="mt-4 space-y-3 text-sm text-slate-600">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Demandado</p>
                            <p className="mt-1 text-slate-900">{view_demandado || 'No especificado'}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Juzgado</p>
                            <p className="mt-1 text-slate-900">{view_juzgado || 'No especificado'}</p>
                          </div>
                          {view_placaVehiculo && (
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Placa Vehículo</p>
                              <p className="mt-1 font-mono text-slate-900">{view_placaVehiculo}</p>
                            </div>
                          )}
                          {view_radicado && (
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Radicado</p>
                              <p className="mt-1 break-words text-slate-900">{view_radicado}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {rawData && (() => {
                      const camposAdicionales = Object.entries(rawData)
                        .filter(([key]) => !shownKeysNormalized.has(normalizeKey(String(key))))
                        .filter(([_, value]) => value !== null && value !== undefined && value !== '')
                        .map(([key, value]) => ({ key, value }));
                      if (camposAdicionales.length === 0) return null;

                      const formatFieldName = (fieldName: string): string => {
                        return String(fieldName)
                          .replace(/_/g, ' ')
                          .replace(/\//g, ' / ')
                          .split(' ')
                          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                          .join(' ');
                      };

                      return (
                        <section className="rounded-3xl border border-slate-200 bg-white shadow-inner shadow-slate-900/5">
                          <div className="border-b border-slate-200 px-6 py-4 sm:px-8">
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                              Todos los Campos de la Tabla
                            </h3>
                          </div>
                          <div className="grid grid-cols-1 gap-4 px-6 py-6 sm:px-8 md:grid-cols-2 lg:grid-cols-3">
                            {camposAdicionales.map(({ key, value }) => {
                              const nk = normalizeKey(String(key));
                              return (
                                <div
                                  key={String(key)}
                                  className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="mt-0.5">{getIconForKey(nk)}</div>
                                    <div className="flex-1">
                                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                        {formatFieldName(String(key))}
                                      </p>
                                      <p className="mt-1 break-words text-sm leading-6 text-slate-900">
                                        {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </section>
                      );
                    })()}
                  </div>
                </section>
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
                <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">Editar Información</h3>
                  <Button variant="outline" onClick={handleCancel} className="flex items-center gap-2">
                    Cancelar
                  </Button>
                </div>
                <div className="p-4 sm:p-6">
                  <ProcessForm
                    initialData={{
                      clienteId: getValue(rawData, 'cliente_id', 'clienteId', 'CLIENTE_ID') || proceso.clienteId,
                      clienteNombre: view_clienteNombre || proceso.clienteNombre,
                      cedula: getValue(rawData, 'CEDULA', 'cedula', 'Cedula', 'CÉDULA', 'nit', 'NIT') || proceso.cedula || '',
                      celular: getValue(rawData, 'celular', 'Celular', 'CELULAR', 'telefono_celular') || rawData?.celular || proceso.celular || '',
                      telefono: getValue(rawData, 'telefono', 'Telefono', 'TELEFONO', 'telefono_fijo') || rawData?.telefono || proceso.telefono || '',
                      celularSecundario: getValue(rawData, 'celular_1', 'Celular_1', 'CELULAR_1', 'CELULAR 1') || proceso.celularSecundario || '',
                      correoElectronico: view_correo || proceso.correoElectronico || '',
                      direccion: view_direccion || proceso.direccion || '',
                      ciudad: view_ciudad || proceso.ciudad || '',
                      estadoInterno: getValue(rawData, 'estado', 'Estado', 'ESTADO') || proceso.estado || '',
                      estadoPublico: getValue(rawData, 'estado_publico', 'estadoPublico', 'Estado Público', 'ESTADO_PUBLICO') || proceso.estadoPublico || '',
                      estadoProceso: getValue(rawData, 'estado_proceso', 'Estado Proceso', 'ESTADO PROCESO') || proceso.estadoProceso || '',
                      tipo: getValue(rawData, 'CLASE DE PROCESO', 'CLASE_DE_PROCESO', 'clase_proceso', 'tipo', 'Tipo') || proceso.tipo || '',
                      claseProceso: getValue(rawData, 'CLASE DE PROCESO', 'CLASE_DE_PROCESO', 'clase_proceso') || proceso.claseProceso || '',
                      responsabilidad: getValue(rawData, 'responsabilidad', 'Responsabilidad', 'RESPONSABILIDAD') || proceso.responsabilidad || '',
                      fecha: getValue(rawData, 'fecha', 'FECHA', 'fecha_accidente', 'FECHA DE ACCIDENTE', 'FECHA_ACCIDENTE') || proceso.fecha || '',
                      fechaIngreso: getValue(rawData, 'fecha_ingreso', 'FECHA DE INGRESO', 'fechaIngreso', 'created_at') || proceso.fechaIngreso || '',
                      fechaAccidente: getValue(rawData, 'fecha_accidente', 'FECHA DE ACCIDENTE') || proceso.fechaAccidente || '',
                      caducidad: getValue(rawData, 'caducidad', 'CADUCIDAD') || proceso.caducidad || '',
                      fechaQuerella: getValue(rawData, 'fecha_querella', 'FECHA QUERELLA') || proceso.fechaQuerella || '',
                      demandado: getValue(rawData, 'demandado', 'Demandado', 'DEMANDADO') || proceso.demandado || '',
                      observaciones: getValue(rawData, 'observaciones', 'Observaciones', 'OBSERVACIONES') || proceso.observaciones || '',
                      observacionesInternas: getValue(rawData, 'observaciones_internas', 'observacionesInternas', 'OBSERVACIONES_INTERNAS') || proceso.observacionesInternas || '',
                      observacionesCliente: getValue(rawData, 'observaciones_cliente', 'observacionesCliente', 'OBSERVACIONES_CLIENTE') || proceso.observacionesCliente || '',
                      juzgado: getValue(rawData, 'juzgado', 'Juzgado', 'JUZGADO') || proceso.juzgado || '',
                      placaVehiculo: getValue(rawData, 'placa_vehiculo', 'placaVehiculo', 'Placa Vehículo', 'PLACA', 'placa') || proceso.placaVehiculo || '',
                      valorHonorarios: getValue(rawData, 'valor_honorarios', 'valorHonorarios', 'Valor Honorarios', 'honorarios', 'HONORARIOS') ? Number(getValue(rawData, 'valor_honorarios', 'valorHonorarios', 'Valor Honorarios', 'honorarios', 'HONORARIOS')) : proceso.valorHonorarios,
                      valorPeritaje: getValue(rawData, 'valor_peritaje', 'valorPeritaje', 'Valor Peritaje', 'peritaje', 'PERITAJE') ? Number(getValue(rawData, 'valor_peritaje', 'valorPeritaje', 'Valor Peritaje', 'peritaje', 'PERITAJE')) : proceso.valorPeritaje,
                      valorPrestamos: getValue(rawData, 'valor_prestamos', 'valorPrestamos', 'Valor Préstamos') ? Number(getValue(rawData, 'valor_prestamos', 'valorPrestamos', 'Valor Préstamos')) : proceso.valorPrestamos,
                      gastosAdicionales: getValue(rawData, 'gastos_adicionales', 'gastosAdicionales', 'Gastos Adicionales', 'gastos', 'GASTOS') ? Number(getValue(rawData, 'gastos_adicionales', 'gastosAdicionales', 'Gastos Adicionales', 'gastos', 'GASTOS')) : proceso.gastosAdicionales,
                      fechaRadicacion: getValue(rawData, 'fecha_radicacion', 'fechaRadicacion', 'Fecha Radicación', 'FECHA_RADICACION') || proceso.fechaRadicacion || '',
                      radicado: view_radicado || proceso.radicado || '',
                      lugarAccidente: getValue(rawData, 'lugar_accidente', 'LUGAR DE ACCIDENTE') || proceso.lugarAccidente || '',
                      ciudad1: getValue(rawData, 'ciudad_1', 'CIUDAD_1') || proceso.ciudad1 || '',
                      ciudad2: getValue(rawData, 'ciudad_2', 'CIUDAD_2') || proceso.ciudad2 || '',
                      ciudad3: getValue(rawData, 'ciudad_3', 'CIUDAD_3') || proceso.ciudad3 || '',
                      fiscalia: getValue(rawData, 'fiscalia', 'FÍSCALIA', 'FISCALIA') || proceso.fiscalia || '',
                      aseguradora: getValue(rawData, 'aseguradora', 'ASEGURADORA') || proceso.aseguradora || '',
                      actuacion: getValue(rawData, 'actuacion', 'ACTUACIÓN', 'ACTUACION') || proceso.actuacion || '',
                      fechaReclamacion: getValue(rawData, 'fecha_reclamacion', 'FECHA RECLAMACIÓN', 'FECHA RECLAMACION') || proceso.fechaReclamacion || '',
                      conciliacion: getValue(rawData, 'conciliacion', 'CONCILIACIÓN', 'CONCILIACION') || proceso.conciliacion || '',
                      fechaPresentacionDemanda: getValue(rawData, 'fecha_presentacion_demanda', 'FECHA PRESENTACIÓN DEMANDA', 'FECHA PRESENTACION DEMANDA') || proceso.fechaPresentacionDemanda || '',
                      radicado1: getValue(rawData, 'radicado_1', 'RADICADO_1') || proceso.radicado1 || '',
                      prestamos: getValue(rawData, 'prestamos', 'PRESTAMOS') || proceso.prestamos || ''
                    }}
                    clienteNombre={view_clienteNombre || proceso.clienteNombre}
                    clienteCedula={view_cedula || proceso.cedula}
                    estadosInternos={estadosInternos}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProcesoDetalle;

