import { useState, useEffect, useCallback } from 'react';
import { MockProceso } from '../data/mocks';
import { supabase } from '../lib/supabase';
import { detectTableAndIdType, TableInfo } from '../lib/supabaseInspector';
import { isMockDataForced, mockStore } from '../lib/mockStore';

// Función helper para obtener un valor de un objeto usando múltiples posibles nombres de claves
const getValue = (obj: any, ...keys: string[]): any => {
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null) {
      return obj[key];
    }
  }
  return null;
};

const normalizeKey = (key: string): string =>
  String(key)
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '');

const resolveColumnName = (sampleRecord: any, candidates: string[]): string | null => {
  if (!sampleRecord) return null;

  const recordKeys = Object.keys(sampleRecord);

  for (const candidate of candidates) {
    if (recordKeys.includes(candidate)) {
      return candidate;
    }
  }

  const normalizedKeysMap = new Map<string, string>();
  for (const key of recordKeys) {
    normalizedKeysMap.set(normalizeKey(key), key);
  }

  for (const candidate of candidates) {
    const normalizedCandidate = normalizeKey(candidate);
    if (normalizedKeysMap.has(normalizedCandidate)) {
      return normalizedKeysMap.get(normalizedCandidate)!;
    }
  }

  return null;
};

// Función para transformar datos de Supabase al formato MockProceso
// Esta función es flexible y detecta automáticamente los nombres de columnas
export const transformSupabaseToMock = (data: any): MockProceso => {
  // Detectar nombres de columnas automáticamente
  const idValue = getValue(data, 'ID', 'id', 'Id');
  if (idValue === null || idValue === undefined) {
    throw new Error('No se encontró la columna "ID" en el registro de Supabase.');
  }
  const id = String(idValue);
  const cedula = getValue(data, 'cedula', 'Cedula', 'CÉDULA', 'cedula_cliente') || '';
  const estado = (getValue(data, 'estado', 'Estado', 'estado_interno') as 'activo' | 'finalizado' | 'en_espera') || 'activo';
  const estadoPublico = getValue(data, 'estado_publico', 'estadoPublico', 'Estado Publico', 'Estado Público', 'estado_para_cliente') || 'Evaluación Inicial';
  const estadoProceso = getValue(data, 'estado_proceso', 'Estado Proceso', 'ESTADO PROCESO') || undefined;
  const tipo = (getValue(data, 'tipo', 'Tipo', 'tipo_proceso') as 'civil' | 'penal' | 'laboral' | 'comercial') || 'civil';
  const claseProceso = getValue(data, 'clase_de_proceso', 'CLASE DE PROCESO', 'claseProceso', 'CLASE PROCESO') || undefined;
  const responsabilidad = getValue(data, 'responsabilidad', 'Responsabilidad', 'RESPONSABILIDAD') || undefined;
  const fecha = getValue(data, 'fecha', 'Fecha', 'fecha_proceso') || new Date().toISOString().split('T')[0];
  const fechaIngreso = getValue(data, 'fecha_ingreso', 'fechaIngreso', 'Fecha Ingreso', 'Fecha de Ingreso', 'fecha_ingreso_proceso', 'created_at') || fecha;
  const clienteNombre =
    getValue(
      data,
      'cliente_nombre',
      'clienteNombre',
      'Cliente Nombre',
      'Nombre Cliente',
      'nombre_cliente',
      'cliente',
      'Nombre',
      'nombre',
      'NOMBRE'
    ) || '';
  const clienteId = getValue(data, 'cliente_id', 'clienteId', 'Cliente ID', 'id_cliente', 'CLIENTE_ID', 'ID_CLIENTE') || 0;
  const demandado = getValue(data, 'demandado', 'Demandado', 'demandado_nombre') || '';
  const observaciones = getValue(data, 'observaciones', 'Observaciones', 'observaciones_generales');
  const observacionesInternas = getValue(data, 'observaciones_internas', 'observacionesInternas', 'Observaciones Internas', 'notas_internas');
  const observacionesCliente = getValue(data, 'observaciones_cliente', 'observacionesCliente', 'Observaciones Cliente', 'notas_cliente');
  const juzgado = getValue(data, 'juzgado', 'Juzgado', 'juzgado_nombre');
  const placaVehiculo = getValue(data, 'placa_vehiculo', 'placaVehiculo', 'Placa Vehículo', 'placa', 'Placa');
  const valorHonorarios = getValue(data, 'valor_honorarios', 'valorHonorarios', 'Valor Honorarios', 'honorarios');
  const valorPeritaje = getValue(data, 'valor_peritaje', 'valorPeritaje', 'Valor Peritaje', 'peritaje');
  const valorPrestamos = getValue(data, 'valor_prestamos', 'valorPrestamos', 'Valor Préstamos');
  const gastosAdicionales = getValue(data, 'gastos_adicionales', 'gastosAdicionales', 'Gastos Adicionales', 'gastos');
  const fechaRadicacion = getValue(data, 'fecha_radicacion', 'fechaRadicacion', 'Fecha Radicación', 'Fecha de Radicación');
  const radicado = getValue(data, 'radicado', 'Radicado', 'RADICADO');
  const fechaAccidente = getValue(data, 'fecha_accidente', 'Fecha Accidente', 'FECHA DE ACCIDENTE') || undefined;
  const caducidad = getValue(data, 'caducidad', 'Caducidad', 'CADUCIDAD') || undefined;
  const lugarAccidente = getValue(data, 'lugar_accidente', 'Lugar Accidente', 'LUGAR DE ACCIDENTE') || undefined;
  const ciudad1 = getValue(data, 'ciudad_1', 'Ciudad_1', 'CIUDAD_1') || undefined;
  const fechaQuerella = getValue(data, 'fecha_querella', 'Fecha Querella', 'FECHA QUERELLA') || undefined;
  const fiscalia = getValue(data, 'fiscalia', 'Fiscalia', 'FÍSCALIA', 'FISCALIA') || undefined;
  const ciudad2 = getValue(data, 'ciudad_2', 'Ciudad_2', 'CIUDAD_2') || undefined;
  const ciudad3 = getValue(data, 'ciudad_3', 'Ciudad_3', 'CIUDAD_3') || undefined;
  const aseguradora = getValue(data, 'aseguradora', 'Aseguradora', 'ASEGURADORA') || undefined;
  const actuacion = getValue(data, 'actuacion', 'Actuacion', 'ACTUACIÓN', 'ACTUACION') || undefined;
  const fechaReclamacion = getValue(data, 'fecha_reclamacion', 'Fecha Reclamación', 'FECHA RECLAMACIÓN', 'FECHA RECLAMACION') || undefined;
  const conciliacion = getValue(data, 'conciliacion', 'Conciliacion', 'CONCILIACIÓN', 'CONCILIACION') || undefined;
  const fechaPresentacionDemanda = getValue(
    data,
    'fecha_presentacion_demanda',
    'Fecha Presentación Demanda',
    'FECHA PRESENTACIÓN DEMANDA',
    'FECHA PRESENTACION DEMANDA'
  ) || undefined;
  const rama = getValue(data, 'rama', 'Rama', 'RAMA') || undefined;
  const radicado1 = getValue(data, 'radicado_1', 'RADICADO_1', 'Radicado_1') || undefined;
  const prestamos = getValue(data, 'prestamos', 'PRESTAMOS') || undefined;
  const celular = getValue(data, 'celular', 'Celular', 'CELULAR') || undefined;
  const celularSecundario = getValue(data, 'celular_1', 'Celular_1', 'CELULAR_1', 'CELULAR 1') || undefined;
  const telefono = getValue(data, 'telefono', 'Teléfono', 'Telefono', 'TELÉFONO') || undefined;
  const correoElectronico =
    getValue(
      data,
      'correo_electronico',
      'Correo Electronico',
      'CORREO ELECTRÓNICO',
      'CORREO ELECTRONICO',
      'correo',
      'Correo',
      'email',
      'EMAIL'
    ) || undefined;
  const direccion = getValue(data, 'direccion', 'Dirección', 'DIRECCIÓN', 'DIRECCION') || undefined;
  const ciudad = getValue(data, 'ciudad', 'Ciudad', 'CIUDAD') || undefined;

  return {
    id: String(id),
    cedula,
    estado,
    estadoPublico,
    estadoProceso,
    tipo,
    claseProceso,
    responsabilidad,
    fecha,
    fechaIngreso,
    fechaAccidente,
    caducidad,
    lugarAccidente,
    clienteNombre,
    clienteId: Number(clienteId),
    demandado,
    observaciones,
    observacionesInternas,
    observacionesCliente,
    juzgado,
    rama,
    placaVehiculo,
    valorHonorarios: valorHonorarios ? Number(valorHonorarios) : undefined,
    valorPeritaje: valorPeritaje ? Number(valorPeritaje) : undefined,
    valorPrestamos: valorPrestamos ? Number(valorPrestamos) : undefined,
    gastosAdicionales: gastosAdicionales ? Number(gastosAdicionales) : undefined,
    fechaRadicacion,
    radicado,
    ciudad,
    ciudad1,
    ciudad2,
    ciudad3,
    fechaQuerella,
    fiscalia,
    aseguradora,
    actuacion,
    fechaReclamacion,
    conciliacion,
    fechaPresentacionDemanda,
    radicado1,
    prestamos,
    celular,
    celularSecundario,
    telefono,
    correoElectronico,
    direccion
  };
};

// Hook para gestionar procesos con Supabase (fallback a datos mock locales)
export const useProcesses = () => {
  const [procesos, setProcesos] = useState<MockProceso[]>([]);
  const [procesosRaw, setProcesosRaw] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);
  const [tableInfo, setTableInfo] = useState<TableInfo | null>(null);

  const loadFromMockStore = useCallback(() => {
    const { procesos: mockProcesosData, raw } = mockStore.getAll();
    setProcesos(mockProcesosData);
    setProcesosRaw(raw);
    setUsingMockData(true);
    setError(null);
    console.info(`📦 Modo mock activo: ${mockProcesosData.length} procesos cargados localmente`);
  }, []);

  // Detectar tabla y tipo de ID una sola vez
  const detectTableInfo = async (): Promise<TableInfo> => {
    if (tableInfo) return tableInfo;
    
    try {
      const info = await detectTableAndIdType();
      setTableInfo(info);
      return info;
    } catch (err) {
      console.error('❌ Error al detectar información de la tabla:', err);
      throw err;
    }
  };

  // Función helper para ordenar los datos usando las columnas reales
  const sortDataByClient = (data: any[]): any[] => {
    if (!data || data.length === 0) return data;

    const sampleRow = data[0];
    const clienteColumn = 
      sampleRow.cliente_nombre !== undefined ? 'cliente_nombre' :
      sampleRow.clienteNombre !== undefined ? 'clienteNombre' :
      sampleRow['Nombre Cliente'] !== undefined ? 'Nombre Cliente' :
      sampleRow.nombre_cliente !== undefined ? 'nombre_cliente' :
      sampleRow.cliente !== undefined ? 'cliente' :
      sampleRow.nombre !== undefined ? 'nombre' :
      null;

    const fechaColumn = 
      sampleRow.fecha_ingreso !== undefined ? 'fecha_ingreso' :
      sampleRow.fechaIngreso !== undefined ? 'fechaIngreso' :
      sampleRow['Fecha Ingreso'] !== undefined ? 'Fecha Ingreso' :
      sampleRow.fecha !== undefined ? 'fecha' :
      sampleRow.created_at !== undefined ? 'created_at' :
      null;

    if (!clienteColumn && !fechaColumn) return data;

    return [...data].sort((a: any, b: any) => {
      if (clienteColumn) {
        const nameA = (a[clienteColumn] || '').toString().toLowerCase();
        const nameB = (b[clienteColumn] || '').toString().toLowerCase();
        if (nameA !== nameB) {
          return nameA.localeCompare(nameB);
        }
      }
      
      if (fechaColumn) {
        const dateA = a[fechaColumn] ? new Date(a[fechaColumn]).getTime() : 0;
        const dateB = b[fechaColumn] ? new Date(b[fechaColumn]).getTime() : 0;
        return dateB - dateA;
      }
      
      return 0;
    });
  };

  // Cargar procesos desde Supabase o mock local
  useEffect(() => {
    const loadProcesses = async () => {
      try {
        console.log('🔄 Iniciando carga de procesos...');
        setIsLoaded(false);
        setError(null);
        setUsingMockData(false);

        if (isMockDataForced() || !supabase) {
          loadFromMockStore();
          return;
        }

        console.log('✓ Cliente de Supabase inicializado correctamente');

        // Detectar tabla y tipo de ID
        console.log('🔍 Detectando tabla y tipo de ID...');
        const info = await detectTableInfo();
        console.log(`✓ Tabla: "${info.tableName}", Columna ID: "${info.idColumnName}" (tipo: ${info.idType})`);

        // Obtener los datos SIN ordenamiento primero para evitar errores de columnas
        console.log('📥 Obteniendo datos de Supabase...');
        const { data: rawData, error: supabaseError } = await supabase
          .from(info.tableName)
          .select('*');

        if (supabaseError) {
          console.error('❌ Error de Supabase:', supabaseError);
          console.error('Código:', supabaseError.code);
          console.error('Mensaje:', supabaseError.message);
          console.error('Detalles:', supabaseError.details);
          console.error('Hint:', supabaseError.hint);

          // Mejorar mensaje de error si la tabla no existe o columnas incorrectas
          if (supabaseError.message?.includes('relation') || supabaseError.message?.includes('does not exist')) {
            throw new Error(`Tabla "${info.tableName}" no encontrada. Verifica el nombre de la tabla en Supabase. Error: ${supabaseError.message}`);
          }
          if (supabaseError.message?.includes('column') && supabaseError.message?.includes('does not exist')) {
            // El error es de columnas, no de la tabla - aún podemos trabajar con los datos
            console.warn('⚠️ Advertencia sobre columnas:', supabaseError.message);
            // Intentar obtener datos sin ordenamiento
            const { data: fallbackData } = await supabase
              .from(info.tableName)
              .select('*');
            if (fallbackData) {
              const data = sortDataByClient(fallbackData);
              const transformedProcesses = data.map(transformSupabaseToMock);
              setProcesos(transformedProcesses);
              setIsLoaded(true);
              return;
            }
          }
          // Si es un error de permisos RLS
          if (supabaseError.code === 'PGRST301' || supabaseError.message?.includes('permission')) {
            throw new Error(`Error de permisos: La tabla requiere permisos de Row Level Security (RLS) configurados en Supabase. Error: ${supabaseError.message}`);
          }
          throw supabaseError;
        }

        // Mostrar en consola las columnas disponibles para debug
        if (rawData && rawData.length > 0) {
          console.log('✅ Datos obtenidos de Supabase exitosamente');
          console.log(`📊 Total de registros: ${rawData.length}`);
          console.log('📋 Columnas disponibles en el primer registro:', Object.keys(rawData[0]));
          console.log('📄 Primer registro completo:', rawData[0]);
        } else {
          console.warn('⚠️ No se encontraron datos en Supabase (tabla vacía)');
        }

        // Ordenar los datos en JavaScript usando las columnas reales
        const data = sortDataByClient(rawData || []);

        if (data && data.length > 0) {
          // Guardar datos crudos de Supabase
          setProcesosRaw(data);
          // Transformar los datos de Supabase al formato esperado
          const transformedProcesses = data.map(transformSupabaseToMock);
          console.log(`✅ ${transformedProcesses.length} procesos transformados y listos para mostrar`);
          setProcesos(transformedProcesses);
        } else {
          // Si no hay datos en Supabase, mostrar mensaje pero no usar mocks
          console.warn('⚠️ La tabla está vacía. No hay procesos registrados en Supabase.');
          setProcesos([]);
          setProcesosRaw([]);
          setError('La tabla de procesos está vacía. Crea tu primer proceso para comenzar.');
        }
      } catch (err) {
        console.warn('⚠️ Supabase no disponible, usando datos mock locales:', err);
        loadFromMockStore();
      } finally {
        setIsLoaded(true);
      }
    };

    loadProcesses();
  }, [loadFromMockStore]);

  const createProcess = async (processData: Omit<MockProceso, 'id'>) => {
    try {
      if (usingMockData || isMockDataForced() || !supabase) {
        const created = mockStore.create(processData);
        loadFromMockStore();
        return created;
      }

      const info = await detectTableInfo();
      const sampleRecord = info.sampleRecord || {};
      
      // Preparar datos para la API - incluir TODOS los campos de la tabla
      const insertData: Record<string, any> = {};
      const setField = (value: any, ...candidates: string[]) => {
        if (value === undefined || value === null) return;
        const key = resolveColumnName(sampleRecord, candidates);
        if (!key) return;
        insertData[key] = value;
      };

      const computeNextSequentialId = (): number => {
        let maxId = 0;
        const register = (value: any) => {
          const numericValue = Number(value);
          if (!Number.isNaN(numericValue) && numericValue > maxId) {
            maxId = numericValue;
          }
        };

        if (procesosRaw && procesosRaw.length > 0) {
          for (const record of procesosRaw) {
            if (!record) continue;
            const rawId =
              (info.idColumnName && record[info.idColumnName] !== undefined)
                ? record[info.idColumnName]
                : getValue(record, 'ID', 'id', 'Id');
            register(rawId);
          }
        } else if (procesos && procesos.length > 0) {
          for (const proceso of procesos) {
            register(proceso.id);
          }
        }

        return maxId + 1;
      };

      const nextSequentialId = computeNextSequentialId();
      if (info.idColumnName) {
        insertData[info.idColumnName] =
          info.idType === 'number' ? nextSequentialId : String(nextSequentialId);
      } else {
        const resolvedIdKey =
          resolveColumnName(sampleRecord, ['ID', 'id', 'Id']) || 'ID';
        insertData[resolvedIdKey] =
          info.idType === 'number' ? nextSequentialId : String(nextSequentialId);
      }

      setField(processData.clienteNombre, 'cliente_nombre', 'CLIENTE_NOMBRE', 'NOMBRE_CLIENTE', 'NOMBRE');
      setField(processData.cedula, 'cedula', 'CEDULA', 'CEDULA_NIT');
      setField(processData.estado, 'estado', 'ESTADO', 'Estado');
      setField(processData.estadoPublico, 'estado_publico', 'ESTADO_PUBLICO', 'ESTADO PUBLICO');
      setField(processData.estadoProceso, 'estado_proceso', 'ESTADO PROCESO');
      setField(processData.tipo, 'tipo', 'TIPO');
      setField(processData.claseProceso, 'clase_de_proceso', 'CLASE DE PROCESO', 'CLASE PROCESO');
      setField(processData.responsabilidad, 'responsabilidad', 'RESPONSABILIDAD');
      setField(processData.fecha, 'fecha', 'FECHA');
      setField(processData.fechaIngreso, 'fecha_ingreso', 'FECHA_INGRESO', 'FECHA DE INGRESO', 'CREATED_AT');
      setField(processData.fechaAccidente, 'fecha_accidente', 'FECHA DE ACCIDENTE');
      setField(processData.caducidad, 'caducidad', 'CADUCIDAD');
      setField(processData.fechaQuerella, 'fecha_querella', 'FECHA QUERELLA');
      setField(processData.demandado, 'demandado', 'DEMANDADO');
      setField(processData.observaciones, 'observaciones', 'OBSERVACIONES');
      setField(processData.observacionesInternas, 'observaciones_internas', 'OBSERVACIONES_INTERNAS');
      setField(processData.observacionesCliente, 'observaciones_cliente', 'OBSERVACIONES_CLIENTE');
      setField(processData.juzgado, 'juzgado', 'JUZGADO');
      setField(processData.rama, 'rama', 'RAMA');
      setField(processData.placaVehiculo, 'placa_vehiculo', 'PLACA_VEHICULO', 'PLACA');
      setField(processData.valorHonorarios, 'valor_honorarios', 'VALOR_HONORARIOS', 'HONORARIOS');
      setField(processData.valorPeritaje, 'valor_peritaje', 'VALOR_PERITAJE', 'PERITAJE');
      setField(processData.valorPrestamos, 'valor_prestamos', 'VALOR_PRESTAMOS');
      setField(processData.gastosAdicionales, 'gastos_adicionales', 'GASTOS_ADICIONALES', 'GASTOS');
      setField(processData.fechaRadicacion, 'fecha_radicacion', 'FECHA_RADICACION', 'FECHA RADICACION');
      setField(processData.lugarAccidente, 'lugar_accidente', 'LUGAR DE ACCIDENTE');
      setField(processData.fiscalia, 'fiscalia', 'FÍSCALIA', 'FISCALIA');
      setField(processData.ciudad, 'ciudad', 'CIUDAD');
      setField(processData.ciudad1, 'ciudad_1', 'CIUDAD_1');
      setField(processData.ciudad2, 'ciudad_2', 'CIUDAD_2');
      setField(processData.ciudad3, 'ciudad_3', 'CIUDAD_3');
      setField(processData.aseguradora, 'aseguradora', 'ASEGURADORA');
      setField(processData.actuacion, 'actuacion', 'ACTUACIÓN', 'ACTUACION');
      setField(processData.fechaReclamacion, 'fecha_reclamacion', 'FECHA RECLAMACIÓN', 'FECHA RECLAMACION');
      setField(processData.conciliacion, 'conciliacion', 'CONCILIACIÓN', 'CONCILIACION');
      setField(processData.fechaPresentacionDemanda, 'fecha_presentacion_demanda', 'FECHA PRESENTACIÓN DEMANDA', 'FECHA PRESENTACION DEMANDA');
      setField(processData.radicado, 'radicado', 'RADICADO');
      setField(processData.radicado1, 'radicado_1', 'RADICADO_1');
      setField(processData.prestamos, 'prestamos', 'PRESTAMOS');
      setField(processData.celular, 'celular', 'CELULAR');
      setField(processData.celularSecundario, 'celular_1', 'CELULAR_1', 'CELULAR 1');
      setField(processData.telefono, 'telefono', 'TELEFONO', 'TELÉFONO');
      setField(processData.correoElectronico, 'correo_electronico', 'CORREO ELECTRÓNICO', 'CORREO ELECTRONICO', 'correo', 'CORREO');
      setField(processData.direccion, 'direccion', 'DIRECCIÓN', 'DIRECCION');

      console.log('📝 Creando proceso directamente en Supabase:', insertData);

      const { data: insertedData, error: insertError } = await supabase
        .from(info.tableName)
        .insert(insertData)
        .select()
        .single();

      if (insertError) {
        console.error('Error de Supabase al crear proceso:', insertError);
        throw new Error(insertError.message);
      }

      if (!insertedData) {
        throw new Error('No se recibieron datos de Supabase tras la inserción');
      }

      const newProcess = transformSupabaseToMock(insertedData);
      await refreshProcesses();
      return newProcess;
    } catch (err) {
      console.error('Error al crear proceso:', err);
      throw err;
    }
  };

  const updateProcess = async (id: string, updates: Partial<MockProceso>) => {
    try {
      if (usingMockData || isMockDataForced() || !supabase) {
        mockStore.update(id, updates);
        loadFromMockStore();
        return;
      }

      const info = await detectTableInfo();
      const sampleRecord = info.sampleRecord || {};

      // Preparar datos actualizados usando los nombres reales de columna
      const updateData: Record<string, any> = {};
      const setField = (value: any, ...candidates: string[]) => {
        if (value === undefined) return;
        const key = resolveColumnName(sampleRecord, candidates);
        if (!key) return;
        updateData[key] = value;
      };
      
      setField(updates.clienteNombre, 'cliente_nombre', 'CLIENTE_NOMBRE', 'NOMBRE_CLIENTE', 'NOMBRE');
      setField(updates.cedula, 'cedula', 'CEDULA', 'CEDULA_NIT');
      setField(updates.estado, 'estado', 'ESTADO', 'Estado');
      setField(updates.estadoPublico, 'estado_publico', 'ESTADO_PUBLICO', 'ESTADO PUBLICO');
      setField(updates.estadoProceso, 'estado_proceso', 'ESTADO PROCESO');
      setField(updates.tipo, 'tipo', 'TIPO');
      setField(updates.claseProceso, 'clase_de_proceso', 'CLASE DE PROCESO', 'CLASE PROCESO');
      setField(updates.responsabilidad, 'responsabilidad', 'RESPONSABILIDAD');
      setField(updates.fecha, 'fecha', 'FECHA');
      setField(updates.fechaIngreso, 'fecha_ingreso', 'FECHA_INGRESO', 'FECHA DE INGRESO', 'CREATED_AT');
      setField(updates.fechaAccidente, 'fecha_accidente', 'FECHA DE ACCIDENTE');
      setField(updates.caducidad, 'caducidad', 'CADUCIDAD');
      setField(updates.fechaQuerella, 'fecha_querella', 'FECHA QUERELLA');
      setField(updates.demandado, 'demandado', 'DEMANDADO');
      setField(updates.observaciones, 'observaciones', 'OBSERVACIONES');
      setField(updates.observacionesInternas, 'observaciones_internas', 'OBSERVACIONES_INTERNAS');
      setField(updates.observacionesCliente, 'observaciones_cliente', 'OBSERVACIONES_CLIENTE');
      setField(updates.juzgado, 'juzgado', 'JUZGADO');
      setField(updates.rama, 'rama', 'RAMA');
      setField(updates.placaVehiculo, 'placa_vehiculo', 'PLACA_VEHICULO', 'PLACA');
      setField((updates as any).celular, 'celular', 'CELULAR', 'CELULAR_1', 'CELULAR 1');
      setField((updates as any).telefono, 'telefono', 'TELEFONO', 'TELÉFONO');
      setField((updates as any).celularSecundario, 'celular_1', 'CELULAR_1', 'CELULAR 1');
      setField((updates as any).correoElectronico, 'correo_electronico', 'CORREO ELECTRÓNICO', 'CORREO ELECTRONICO', 'correo', 'CORREO', 'EMAIL');
      setField((updates as any).direccion, 'direccion', 'DIRECCIÓN', 'DIRECCION');
      setField((updates as any).ciudad, 'ciudad', 'CIUDAD');
      setField(updates.ciudad1, 'ciudad_1', 'CIUDAD_1');
      setField(updates.ciudad2, 'ciudad_2', 'CIUDAD_2');
      setField(updates.ciudad3, 'ciudad_3', 'CIUDAD_3');
      setField(updates.valorHonorarios, 'valor_honorarios', 'VALOR_HONORARIOS', 'HONORARIOS');
      setField(updates.valorPeritaje, 'valor_peritaje', 'VALOR_PERITAJE', 'PERITAJE');
      setField(updates.valorPrestamos, 'valor_prestamos', 'VALOR_PRESTAMOS');
      setField(updates.gastosAdicionales, 'gastos_adicionales', 'GASTOS_ADICIONALES', 'GASTOS');
      setField(updates.fechaRadicacion, 'fecha_radicacion', 'FECHA_RADICACION', 'FECHA RADICACION');
      setField(updates.lugarAccidente, 'lugar_accidente', 'LUGAR DE ACCIDENTE');
      setField(updates.fiscalia, 'fiscalia', 'FÍSCALIA', 'FISCALIA');
      setField(updates.aseguradora, 'aseguradora', 'ASEGURADORA');
      setField(updates.actuacion, 'actuacion', 'ACTUACIÓN', 'ACTUACION');
      setField(updates.fechaReclamacion, 'fecha_reclamacion', 'FECHA RECLAMACIÓN', 'FECHA RECLAMACION');
      setField(updates.conciliacion, 'conciliacion', 'CONCILIACIÓN', 'CONCILIACION');
      setField(updates.fechaPresentacionDemanda, 'fecha_presentacion_demanda', 'FECHA PRESENTACIÓN DEMANDA', 'FECHA PRESENTACION DEMANDA');
      setField(updates.radicado, 'radicado', 'RADICADO');
      setField(updates.radicado1, 'radicado_1', 'RADICADO_1');
      setField(updates.prestamos, 'prestamos', 'PRESTAMOS');

      if (!supabase) {
        throw new Error('Cliente de Supabase no inicializado. Verifica tu archivo .env');
      }

      let filterValue: string | number = id;
      if (info.idType === 'number') {
        const numericId = Number(id);
        if (Number.isNaN(numericId)) {
          throw new Error(`ID inválido. Se esperaba un valor numérico y se recibió "${id}".`);
        }
        filterValue = numericId;
      } else {
        filterValue = id;
      }

      console.log('📝 Actualizando proceso directamente en Supabase:', { column: info.idColumnName, value: filterValue, updates: updateData });

      const { error: updateError } = await supabase
        .from(info.tableName)
        .update(updateData)
        .eq(info.idColumnName, filterValue);

      if (updateError) {
        console.error('Error de Supabase al actualizar proceso:', updateError);
        throw new Error(updateError.message);
      }

      await refreshProcesses();
    } catch (err) {
      console.error('Error al actualizar proceso:', err);
      throw err;
    }
  };

  const deleteProcess = async (id: string) => {
    try {
      if (usingMockData || isMockDataForced() || !supabase) {
        mockStore.delete(id);
        loadFromMockStore();
        return;
      }

      const info = await detectTableInfo();

      let filterValue: string | number = id;
      if (info.idType === 'number') {
        const numericId = Number(id);
        if (Number.isNaN(numericId)) {
          throw new Error(`ID inválido. Se esperaba un valor numérico y se recibió "${id}".`);
        }
        filterValue = numericId;
      } else {
        filterValue = id;
      }

      console.log('🗑️ Eliminando proceso directamente en Supabase:', { column: info.idColumnName, value: filterValue });

      const { error: deleteError } = await supabase
        .from(info.tableName)
        .delete()
        .eq(info.idColumnName, filterValue);

      if (deleteError) {
        console.error('Error de Supabase al eliminar proceso:', deleteError);
        throw new Error(deleteError.message);
      }

      await refreshProcesses();
    } catch (err) {
      console.error('Error al eliminar proceso:', err);
      throw err;
    }
  };

  const getProcess = (id: string) => {
    return procesos.find(p => p.id === id);
  };

  const refreshProcesses = async () => {
    if (usingMockData || isMockDataForced() || !supabase) {
      loadFromMockStore();
      return;
    }

    try {
      const info = await detectTableInfo();
      const { data, error: supabaseError } = await supabase
        .from(info.tableName)
        .select('*');

      if (supabaseError) throw supabaseError;

      if (data && data.length > 0) {
        const sortedData = sortDataByClient(data);
        // Guardar datos crudos de Supabase
        setProcesosRaw(sortedData);
        setProcesos(sortedData.map(transformSupabaseToMock));
      } else {
        setProcesosRaw([]);
        setProcesos([]);
      }
    } catch (err) {
      console.error('Error al refrescar procesos:', err);
    }
  };

  return {
    procesos,
    procesosRaw,
    isLoaded,
    error,
    usingMockData,
    createProcess,
    updateProcess,
    deleteProcess,
    getProcess,
    refreshProcesses,
    setProcesos
  };
};

