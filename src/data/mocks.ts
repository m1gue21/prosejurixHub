// Mock data para procesos, clientes y administradores

export interface MockProceso {
  id: string;
  cedula: string;
  estado: 'activo' | 'finalizado' | 'en_espera';
  estadoPublico: string;
  tipo: 'civil' | 'penal' | 'laboral' | 'comercial';
  fecha: string;
  fechaIngreso: string;
  clienteNombre: string;
  clienteId: number;
  demandado: string;
  observaciones?: string;
  observacionesInternas?: string;
  observacionesCliente?: string;
  juzgado?: string;
  placaVehiculo?: string;
  valorHonorarios?: number;
  valorPeritaje?: number;
  valorPrestamos?: number;
  gastosAdicionales?: number;
  fechaRadicacion?: string;
  celular?: string;
  celularSecundario?: string;
  telefono?: string;
  correoElectronico?: string;
  direccion?: string;
  ciudad?: string;
  radicado?: string;
  claseProceso?: string;
  responsabilidad?: string;
  fechaAccidente?: string;
  caducidad?: string;
  lugarAccidente?: string;
  ciudad1?: string;
  fechaQuerella?: string;
  fiscalia?: string;
  ciudad2?: string;
  aseguradora?: string;
  actuacion?: string;
  fechaReclamacion?: string;
  conciliacion?: string;
  fechaPresentacionDemanda?: string;
  rama?: string;
  radicado1?: string;
  ciudad3?: string;
  estadoProceso?: string;
  prestamos?: string;
}

export interface MockCliente {
  id: number;
  nombre: string;
  cedula: string;
  telefono: string;
  email: string;
  direccion: string;
  fechaRegistro: string;
}

export const mockClientes: MockCliente[] = [
  {
    id: 1,
    nombre: 'María González Pérez',
    cedula: '12345678',
    telefono: '300 123 4567',
    email: 'maria.gonzalez@email.com',
    direccion: 'Calle 50 #25-30, Manizales',
    fechaRegistro: '2024-01-15'
  },
  {
    id: 2,
    nombre: 'Carlos Rodríguez López',
    cedula: '87654321',
    telefono: '301 987 6543',
    email: 'carlos.rodriguez@email.com',
    direccion: 'Carrera 15 #40-20, Manizales',
    fechaRegistro: '2024-01-10'
  },
  {
    id: 3,
    nombre: 'Ana Martínez Silva',
    cedula: '11223344',
    telefono: '302 555 1234',
    email: 'ana.martinez@email.com',
    direccion: 'Avenida 12 #45-67, Manizales',
    fechaRegistro: '2024-01-20'
  },
  {
    id: 4,
    nombre: 'Juan Diego Adarve Ceballos',
    cedula: '1053871986',
    telefono: '312 446 4921',
    email: '',
    direccion: 'Cuchilla del Salado, Manizales',
    fechaRegistro: '2023-02-03'
  },
  {
    id: 5,
    nombre: 'Jorge Ernesto Aguirre Gómez',
    cedula: '16076957',
    telefono: '311 717 5935',
    email: '',
    direccion: 'Carrera 11A # 3-22, Villamaría',
    fechaRegistro: '2024-02-06'
  },
  {
    id: 6,
    nombre: 'Luisa Ximena Aguirre Sánchez',
    cedula: '1053797429',
    telefono: '320 632 6262',
    email: 'luisaximenaas@gmail.com',
    direccion: 'Calle 65 # 33-47 Fátima, Manizales',
    fechaRegistro: '2025-01-14'
  },
  {
    id: 7,
    nombre: 'Manuel Alexander Alcoba Díaz',
    cedula: '2789032',
    telefono: '314 853 6356',
    email: 'manuelalcoba035@gmail.com',
    direccion: 'Casa 232 Bajo Tablazo, Manizales',
    fechaRegistro: '2025-05-09'
  },
  {
    id: 8,
    nombre: 'Francisco Javier Álvarez Márquez',
    cedula: '94304299',
    telefono: '322 683 7478',
    email: '',
    direccion: 'Carrera 32A # 103-32 La Enea, Manizales',
    fechaRegistro: '2021-01-29'
  },
  {
    id: 9,
    nombre: 'Daniel Eduardo Álzate Segura',
    cedula: '1053766211',
    telefono: '314 605 6854',
    email: 'danieleduardosegura20@gmail.com',
    direccion: 'Calle 47A # 26-46 Bavaria, Manizales',
    fechaRegistro: '2024-04-08'
  },
  {
    id: 10,
    nombre: 'Luis Carlos Arias Garcés',
    cedula: '1002717373',
    telefono: '310 671 6462',
    email: 'luisk959@gmail.com',
    direccion: 'Carrera 9 Este # 1B-02 Sur Este, Bogotá',
    fechaRegistro: '2024-06-05'
  },
  {
    id: 11,
    nombre: 'Mariana Arredondo Bermúdez',
    cedula: '1060649660',
    telefono: '314 874 6048',
    email: 'marianabermu301@gmail.com',
    direccion: 'Carrera 5 # 4-18 Polideportivo, Villamaría',
    fechaRegistro: '2025-01-29'
  }
];

export const mockProcesos: MockProceso[] = [
  {
    id: '1',
    cedula: '12345678',
    estado: 'activo',
    estadoPublico: 'En investigación',
    tipo: 'civil',
    fecha: '2025-01-01',
    fechaIngreso: '2024-01-15',
    clienteNombre: 'María González Pérez',
    clienteId: 1,
    demandado: 'Seguros Bolívar S.A.',
    observaciones: 'Estamos recopilando las pruebas necesarias para su caso. El peritaje del vehículo está programado para la próxima semana.',
    observacionesInternas: 'Pendiente peritaje del vehículo. Contactar perito la próxima semana.',
    observacionesCliente: 'Estamos recopilando las pruebas necesarias para su caso. El peritaje del vehículo está programado para la próxima semana.',
    juzgado: 'Juzgado Civil del Circuito de Manizales',
    placaVehiculo: 'ABC123',
    valorHonorarios: 5000000,
    valorPeritaje: 800000,
    valorPrestamos: 0,
    gastosAdicionales: 200000,
    fechaRadicacion: ''
  },
  {
    id: '2',
    cedula: '12345678',
    estado: 'activo',
    estadoPublico: 'En negociación',
    tipo: 'civil',
    fecha: '2025-01-05',
    fechaIngreso: '2023-11-20',
    clienteNombre: 'María González Pérez',
    clienteId: 1,
    demandado: 'SURA S.A.',
    observaciones: 'Hemos presentado la reclamación a la aseguradora. Esperamos respuesta en los próximos 15 días hábiles.',
    observacionesInternas: 'Aseguradora ofreció $15M. Cliente quiere $20M. Programar reunión.',
    observacionesCliente: 'Hemos presentado la reclamación a la aseguradora. Esperamos respuesta en los próximos 15 días hábiles.',
    juzgado: '',
    placaVehiculo: 'XYZ789',
    valorHonorarios: 8000000,
    valorPeritaje: 1200000,
    valorPrestamos: 2000000,
    gastosAdicionales: 500000,
    fechaRadicacion: ''
  },
  {
    id: '3',
    cedula: '87654321',
    estado: 'finalizado',
    estadoPublico: 'Caso Cerrado',
    tipo: 'penal',
    fecha: '2024-12-20',
    fechaIngreso: '2023-08-10',
    clienteNombre: 'Carlos Rodríguez López',
    clienteId: 2,
    demandado: 'Allianz Seguros',
    observaciones: 'Caso resuelto exitosamente. Indemnización otorgada.',
    observacionesInternas: 'Caso cerrado. Pagos completados.',
    observacionesCliente: 'Caso resuelto exitosamente. Indemnización otorgada.',
    juzgado: 'Juzgado Civil del Circuito de Manizales',
    placaVehiculo: 'DEF456',
    valorHonorarios: 6000000,
    valorPeritaje: 1000000,
    valorPrestamos: 0,
    gastosAdicionales: 300000,
    fechaRadicacion: '2024-12-15'
  },
  {
    id: '4',
    cedula: '11223344',
    estado: 'activo',
    estadoPublico: 'En Audiencia',
    tipo: 'laboral',
    fecha: '2025-01-10',
    fechaIngreso: '2024-02-01',
    clienteNombre: 'Ana Martínez Silva',
    clienteId: 3,
    demandado: 'Empresa XYZ S.A.',
    observaciones: 'Proceso en etapa de audiencias. Próxima audiencia programada para la próxima semana.',
    observacionesInternas: 'Audiencia programada. Preparar documentación adicional.',
    observacionesCliente: 'Proceso en etapa de audiencias. Próxima audiencia programada para la próxima semana.',
    juzgado: 'Juzgado Laboral de Manizales',
    placaVehiculo: '',
    valorHonorarios: 4500000,
    valorPeritaje: 500000,
    valorPrestamos: 1000000,
    gastosAdicionales: 250000,
    fechaRadicacion: '2024-03-15'
  },
  {
    id: '5',
    cedula: '87654321',
    estado: 'en_espera',
    estadoPublico: 'Evaluación Inicial',
    tipo: 'comercial',
    fecha: '2025-01-15',
    fechaIngreso: '2025-01-15',
    clienteNombre: 'Carlos Rodríguez López',
    clienteId: 2,
    demandado: 'Empresa ABC Ltda.',
    observaciones: 'Caso en evaluación inicial. Próximos pasos a definir.',
    observacionesInternas: 'Revisar documentación. Esperar respuesta del cliente.',
    observacionesCliente: 'Caso en evaluación inicial. Próximos pasos a definir.',
    juzgado: '',
    placaVehiculo: '',
    valorHonorarios: 0,
    valorPeritaje: 0,
    valorPrestamos: 0,
    gastosAdicionales: 0,
    fechaRadicacion: ''
  },
  {
    id: '6',
    cedula: '1053871986',
    estado: 'activo',
    estadoPublico: 'En investigación',
    estadoProceso: 'Pendiente corrección croquis',
    tipo: 'civil',
    claseProceso: 'Accidente',
    responsabilidad: 'Extracontractual',
    fecha: '2023-02-03',
    fechaIngreso: '2023-02-03',
    fechaAccidente: '2022-10-11',
    caducidad: '2027-10-11',
    lugarAccidente: 'Calle 52 Carrera 36 El Guamal',
    ciudad1: 'Manizales',
    fechaQuerella: '2023-02-03',
    fiscalia: '03 Local',
    ciudad2: 'Manizales',
    radicado: '60 - 2022 - 01812',
    aseguradora: 'EQUIDAD',
    actuacion: 'Pendiente corrección croquis',
    clienteNombre: 'Juan Diego Adarve Ceballos',
    clienteId: 4,
    demandado: 'EQUIDAD Seguros',
    observaciones: 'Estamos recopilando documentación adicional para completar la reclamación.',
    observacionesInternas: 'Pendiente corrección de croquis del accidente.',
    observacionesCliente: 'Estamos recopilando documentación adicional para completar la reclamación.',
    celular: '3124464921',
    direccion: 'Cuchilla del Salado',
    ciudad: 'Manizales',
    valorHonorarios: 3500000,
    valorPeritaje: 600000,
    gastosAdicionales: 150000
  },
  {
    id: '7',
    cedula: '16076957',
    estado: 'activo',
    estadoPublico: 'En negociación',
    estadoProceso: 'Pendiente demanda',
    tipo: 'civil',
    claseProceso: 'Accidente',
    responsabilidad: 'Extracontractual',
    fecha: '2024-02-06',
    fechaIngreso: '2024-02-06',
    fechaAccidente: '2024-02-06',
    caducidad: '2029-02-06',
    lugarAccidente: 'Carrera 39 Calle 48 Sector La Fuente',
    ciudad1: 'Manizales',
    fiscalia: '22 Local',
    ciudad2: 'Manizales',
    radicado: '60 - 2024 - 10211',
    actuacion: 'Pendiente demanda',
    clienteNombre: 'Jorge Ernesto Aguirre Gómez',
    clienteId: 5,
    demandado: 'Parte contraria',
    observaciones: 'Caso en etapa previa a demanda. Esperamos definir estrategia en los próximos días.',
    observacionesInternas: 'Demanda pendiente de radicación.',
    observacionesCliente: 'Caso en etapa previa a demanda. Te mantendremos informado.',
    celular: '3117175935',
    direccion: 'Carrera 11A # 3-22',
    ciudad: 'Villamaría',
    valorHonorarios: 4200000,
    gastosAdicionales: 180000
  },
  {
    id: '8',
    cedula: '1053797429',
    estado: 'en_espera',
    estadoPublico: 'Evaluación Inicial',
    estadoProceso: 'Pendiente dictamen',
    tipo: 'civil',
    claseProceso: 'Accidente',
    responsabilidad: 'Contractual',
    fecha: '2025-01-14',
    fechaIngreso: '2025-01-14',
    fechaAccidente: '2024-12-06',
    caducidad: '2026-12-06',
    lugarAccidente: 'Calle 48 Carrera 40A La Fuente',
    ciudad1: 'Manizales',
    fechaQuerella: '2025-01-14',
    fiscalia: '21 Local',
    ciudad2: 'Manizales',
    radicado: '60 - 2024 - 11532',
    aseguradora: 'SEGUROS DEL ESTADO',
    actuacion: 'Reclamación radicada',
    fechaReclamacion: '2025-06-25',
    clienteNombre: 'Luisa Ximena Aguirre Sánchez',
    clienteId: 6,
    demandado: 'Seguros del Estado',
    observaciones: 'Reclamación radicada. En espera de dictamen pericial.',
    observacionesInternas: 'Pendiente dictamen de la aseguradora.',
    observacionesCliente: 'Reclamación radicada. En espera de dictamen pericial.',
    celular: '3206326262',
    correoElectronico: 'luisaximenaas@gmail.com',
    direccion: 'Calle 65 # 33-47 Fátima',
    ciudad: 'Manizales',
    valorHonorarios: 3800000,
    valorPeritaje: 750000
  },
  {
    id: '9',
    cedula: '2789032',
    estado: 'activo',
    estadoPublico: 'En investigación',
    estadoProceso: 'Reclamación radicada',
    tipo: 'civil',
    claseProceso: 'Accidente',
    responsabilidad: 'Extracontractual',
    fecha: '2025-05-09',
    fechaIngreso: '2025-05-09',
    fechaAccidente: '2025-03-08',
    caducidad: '2030-03-08',
    lugarAccidente: 'Estación Uriber Sector Agro Turística',
    ciudad1: 'Manizales',
    fechaQuerella: '2025-05-09',
    fiscalia: '21 Local',
    ciudad2: 'Manizales',
    radicado: '60 - 2025 - 10741',
    aseguradora: 'SEGUROS BOLIVAR',
    actuacion: 'Reclamación radicada',
    fechaReclamacion: '2025-08-26',
    clienteNombre: 'Manuel Alexander Alcoba Díaz',
    clienteId: 7,
    demandado: 'Seguros Bolívar',
    observaciones: 'Reclamación presentada ante la aseguradora. Seguimiento activo.',
    observacionesInternas: 'Esperar respuesta de Bolívar.',
    observacionesCliente: 'Reclamación presentada ante la aseguradora. Seguimiento activo.',
    celular: '3148536356',
    correoElectronico: 'manuelalcoba035@gmail.com',
    direccion: 'Casa 232 Bajo Tablazo',
    ciudad: 'Manizales',
    valorHonorarios: 4100000,
    valorPeritaje: 900000
  },
  {
    id: '10',
    cedula: '94304299',
    estado: 'finalizado',
    estadoPublico: 'Caso Cerrado',
    estadoProceso: 'Notificación demandados',
    tipo: 'civil',
    claseProceso: 'Accidente',
    responsabilidad: 'Extracontractual',
    fecha: '2021-01-29',
    fechaIngreso: '2021-01-29',
    fechaAccidente: '2021-01-29',
    lugarAccidente: 'Km 06 + 200 Vía Tres Puertas Puente de la Libertad',
    ciudad1: 'Manizales',
    fiscalia: '13 Seccional',
    ciudad2: 'Manizales',
    radicado: '60 - 2021 - 00218',
    aseguradora: 'Reparación Directa',
    actuacion: 'Demanda reparación directa',
    conciliacion: '2023-01-25',
    fechaPresentacionDemanda: '2023-01-25',
    juzgado: 'Segundo Administrativo Circuito',
    rama: 'Administrativo',
    radicado1: '2023 - 00165',
    ciudad3: 'Manizales',
    clienteNombre: 'Francisco Javier Álvarez Márquez',
    clienteId: 8,
    demandado: 'Entidad demandada',
    observaciones: 'Proceso con demanda en curso administrativo. Caso archivado por el cliente.',
    observacionesInternas: 'Caso cerrado por inactividad del cliente.',
    observacionesCliente: 'Proceso con demanda en curso administrativo.',
    celularSecundario: '3226837478',
    direccion: 'Carrera 32A # 103-32 La Enea',
    ciudad: 'Manizales',
    valorHonorarios: 5500000,
    valorPeritaje: 1100000,
    gastosAdicionales: 320000,
    fechaRadicacion: '2023-01-25'
  },
  {
    id: '11',
    cedula: '1053766211',
    estado: 'activo',
    estadoPublico: 'En negociación',
    estadoProceso: 'Pendiente conciliación',
    tipo: 'civil',
    claseProceso: 'Accidente',
    responsabilidad: 'Extracontractual',
    fecha: '2024-04-08',
    fechaIngreso: '2024-04-08',
    fechaAccidente: '2024-03-02',
    caducidad: '2029-03-02',
    lugarAccidente: 'Carrera 24B Calle 45 Sector La Estación',
    ciudad1: 'Manizales',
    fechaQuerella: '2024-04-08',
    fiscalia: '22 Local',
    ciudad2: 'Manizales',
    radicado: '60 - 2024 - 10323',
    aseguradora: 'PREVISORA',
    actuacion: 'Reclamación solo daños radicada',
    fechaReclamacion: '2024-05-23',
    clienteNombre: 'Daniel Eduardo Álzate Segura',
    clienteId: 9,
    demandado: 'Previsora Seguros',
    observaciones: 'Reclamación por daños radicada. Próximo paso: conciliación.',
    observacionesInternas: 'Pendiente agendar conciliación.',
    observacionesCliente: 'Reclamación por daños radicada. Próximo paso: conciliación.',
    celular: '3146056854',
    correoElectronico: 'danieleduardosegura20@gmail.com',
    direccion: 'Calle 47A # 26-46 Bavaria',
    ciudad: 'Manizales',
    valorHonorarios: 3900000,
    valorPeritaje: 700000
  },
  {
    id: '12',
    cedula: '1002717373',
    estado: 'activo',
    estadoPublico: 'En Audiencia',
    estadoProceso: 'Reclamación radicada',
    tipo: 'civil',
    claseProceso: 'Accidente',
    responsabilidad: 'Extracontractual',
    fecha: '2024-06-05',
    fechaIngreso: '2024-06-05',
    fechaAccidente: '2023-12-12',
    caducidad: '2028-12-12',
    lugarAccidente: 'Km 18 - 950 Vía Puente de la Libertad',
    ciudad1: 'Manizales',
    fechaQuerella: '2024-06-05',
    fiscalia: '22 Local',
    ciudad2: 'Manizales',
    radicado: '60 - 2023 - 11657',
    aseguradora: 'ALLIANZ',
    actuacion: 'Reclamación radicada',
    fechaReclamacion: '2025-08-26',
    clienteNombre: 'Luis Carlos Arias Garcés',
    clienteId: 10,
    demandado: 'Allianz Seguros',
    observaciones: 'Reclamación activa. Pendiente nueva valoración médica.',
    observacionesInternas: 'Solicitar historia clínica para valoración.',
    observacionesCliente: 'Reclamación activa. Te avisaremos cuando haya novedades.',
    celular: '3106716462',
    correoElectronico: 'luisk959@gmail.com',
    direccion: 'Carrera 9 Este # 1B-02 Sur Este',
    ciudad: 'Bogotá',
    valorHonorarios: 4800000,
    valorPeritaje: 950000
  },
  {
    id: '13',
    cedula: '1060649660',
    estado: 'en_espera',
    estadoPublico: 'Evaluación Inicial',
    estadoProceso: 'Pendiente dictamen',
    tipo: 'civil',
    claseProceso: 'Accidente',
    responsabilidad: 'Extracontractual',
    fecha: '2025-01-29',
    fechaIngreso: '2025-01-29',
    fechaAccidente: '2024-11-06',
    caducidad: '2029-11-06',
    lugarAccidente: 'Carrera 37 Calle 66 Sector Universitaria',
    ciudad1: 'Manizales',
    fechaQuerella: '2025-01-29',
    fiscalia: '03 Local',
    ciudad2: 'Manizales',
    radicado: '60 - 2024 - 11437',
    aseguradora: 'SEGUROS DEL ESTADO',
    actuacion: 'Reclamación radicada',
    fechaReclamacion: '2025-02-27',
    clienteNombre: 'Mariana Arredondo Bermúdez',
    clienteId: 11,
    demandado: 'Seguros del Estado',
    observaciones: 'Caso en revisión inicial. Esperando dictamen.',
    observacionesInternas: 'Pendiente dictamen pericial.',
    observacionesCliente: 'Caso en revisión inicial. Esperando dictamen.',
    celular: '3148746048',
    correoElectronico: 'marianabermu301@gmail.com',
    direccion: 'Carrera 5 # 4-18 Polideportivo',
    ciudad: 'Villamaría',
    valorHonorarios: 3600000
  }
];

export const estadosInternos = [
  { value: 'inicial', label: 'Evaluación Inicial' },
  { value: 'investigacion', label: 'En Investigación' },
  { value: 'negociacion', label: 'En Negociación' },
  { value: 'demanda', label: 'Demanda Presentada' },
  { value: 'audiencia', label: 'En Audiencia' },
  { value: 'sentencia', label: 'Sentencia' },
  { value: 'ejecucion', label: 'En Ejecución' },
  { value: 'cerrado', label: 'Caso Cerrado' }
];

