import {
  ChecklistItem,
  EtapaTramite,
  TipoEtapa,
  SubestadoConciliacion,
  SubestadoJudicial,
  SubestadoMedicoLaboral,
  SubestadoReclamacion
} from '../types/tramite';

type ChecklistTemplateItem = Omit<ChecklistItem, 'completado' | 'archivo'>;

export interface EtapaCatalogEntry {
  tipo: TipoEtapa;
  label: string;
  labelPublico: string;
  orden: number;
  paraleloCon?: TipoEtapa[];
  condicional?: 'vehiculo';
  subestados?: { value: string; label: string }[];
  checklistTemplate: ChecklistTemplateItem[];
}

const doc = (id: string, label: string): ChecklistTemplateItem => ({
  id,
  label,
  requiereDocumento: true
});

const action = (id: string, label: string): ChecklistTemplateItem => ({
  id,
  label,
  requiereDocumento: false
});

export const ETAPAS_CATALOG: EtapaCatalogEntry[] = [
  {
    tipo: 'vinculacion',
    label: 'Vinculación del usuario',
    labelPublico: 'Vinculación',
    orden: 1,
    checklistTemplate: [
      doc('poderes', 'Poderes firmados'),
      action('caso_entregado', 'Caso entregado a la oficina'),
      action('datos_guardados', 'Datos del usuario guardados')
    ]
  },
  {
    tipo: 'liberacion_vehiculos',
    label: 'Liberación de vehículos',
    labelPublico: 'Liberación de vehículo',
    orden: 2,
    condicional: 'vehiculo',
    checklistTemplate: [
      doc('peritaje', 'Peritaje'),
      doc('certificado_tradicion', 'Certificado de tradición'),
      doc('poder', 'Poder'),
      doc('declaracion', 'Declaración (si víctima no es dueño)'),
      doc('licencias', 'Copia de licencias'),
      doc('cedulas', 'Copia de cédulas'),
      doc('soat', 'SOAT'),
      doc('tecno', 'Tecnomecánica')
    ]
  },
  {
    tipo: 'accion_penal',
    label: 'Acción penal',
    labelPublico: 'Acción penal',
    orden: 3,
    checklistTemplate: [
      doc('querella', 'Querella radicada (máx. 6 meses del accidente)'),
      doc('poder_penal', 'Poder radicado'),
      action('conciliaciones', 'Asistencia a conciliaciones'),
      action('proceso_penal', 'Asistencia a proceso penal (si aplica)'),
      doc('expediente', 'Expediente penal solicitado')
    ]
  },
  {
    tipo: 'medico_clinico',
    label: 'Seguimiento médico clínico',
    labelPublico: 'Tratamiento médico',
    orden: 4,
    paraleloCon: ['medico_legal'],
    checklistTemplate: [
      doc('historia_clinica', 'Historia clínica'),
      doc('incapacidad', 'Incapacidades'),
      doc('conceptos', 'Conceptos de especialidades'),
      doc('diagnosticos', 'Diagnósticos'),
      doc('alta', 'Alta médica (fin de rehabilitación)')
    ]
  },
  {
    tipo: 'medico_legal',
    label: 'Valoración médico legal',
    labelPublico: 'Valoración médico legal',
    orden: 5,
    paraleloCon: ['medico_clinico'],
    checklistTemplate: [
      doc('oficios', 'Oficios petitorios'),
      doc('dictamenes', 'Dictámenes'),
      action('alta_legal', 'Alta de valoración médico legal')
    ]
  },
  {
    tipo: 'reclamacion_aseguradora',
    label: 'Reclamación ante aseguradora',
    labelPublico: 'Reclamación a aseguradora',
    orden: 6,
    subestados: [
      { value: 'radicacion', label: 'Radicación' },
      { value: 'complementacion', label: 'Complementación' },
      { value: 'negociacion', label: 'Negociación' },
      { value: 'concertacion', label: 'Concertación (acuerdo)' },
      { value: 'fracaso', label: 'Fracaso de negociación' },
      { value: 'finalizacion', label: 'Finalización' }
    ] as { value: SubestadoReclamacion; label: string }[],
    checklistTemplate: [
      doc('radicacion', 'Reclamación radicada'),
      doc('docs_adicionales', 'Documentos adicionales (si aplica)'),
      action('negociacion', 'Negociación adelantada'),
      action('cierre', 'Cierre de reclamación')
    ]
  },
  {
    tipo: 'medico_laboral',
    label: 'Valoración médico / laboral (PCL)',
    labelPublico: 'Calificación PCL',
    orden: 7,
    subestados: [
      { value: 'agendamiento', label: 'Agendamiento con médico' },
      { value: 'complementacion_hc', label: 'Complementación historia clínica' },
      { value: 'dictamen_pcl', label: 'Dictamen PCL' }
    ] as { value: SubestadoMedicoLaboral; label: string }[],
    checklistTemplate: [
      action('cita', 'Valoración agendada'),
      doc('hc_completa', 'Historia clínica complementada'),
      doc('dictamen_pcl', 'Dictamen de pérdida de capacidad laboral')
    ]
  },
  {
    tipo: 'conciliacion_prejudicial',
    label: 'Conciliación prejudicial',
    labelPublico: 'Conciliación prejudicial',
    orden: 8,
    subestados: [
      { value: 'radicacion_solicitud', label: 'Radicación de solicitud' },
      { value: 'diligencia', label: 'Fecha de diligencia' },
      { value: 'concertacion', label: 'Concertación' },
      { value: 'fracaso', label: 'Fracaso' },
      { value: 'acta', label: 'Acta de conclusión' }
    ] as { value: SubestadoConciliacion; label: string }[],
    checklistTemplate: [
      doc('solicitud', 'Solicitud radicada'),
      action('diligencia', 'Diligencia realizada'),
      doc('acta', 'Acta de acuerdo / no acuerdo')
    ]
  },
  {
    tipo: 'proceso_judicial',
    label: 'Proceso judicial',
    labelPublico: 'Proceso judicial',
    orden: 9,
    subestados: [
      { value: 'radicacion_demanda', label: 'Radicación de demanda' },
      { value: 'admision_subsanacion', label: 'Admisión o subsanación' },
      { value: 'notificaciones', label: 'Notificaciones' },
      { value: 'contestacion', label: 'Contestación / excepciones' },
      { value: 'pronunciamiento', label: 'Pronunciamiento' },
      { value: 'audiencia_inicial', label: 'Audiencia inicial' },
      { value: 'conciliacion', label: 'Conciliación' },
      { value: 'desarrollo', label: 'Desarrollo del proceso' },
      { value: 'sentencia', label: 'Sentencia' }
    ] as { value: SubestadoJudicial; label: string }[],
    checklistTemplate: [
      doc('demanda', 'Demanda radicada'),
      doc('admision', 'Admisión / subsanación'),
      doc('notificaciones', 'Notificaciones'),
      doc('sentencia', 'Sentencia')
    ]
  }
];

export const getEtapaCatalog = (tipo: TipoEtapa): EtapaCatalogEntry => {
  const entry = ETAPAS_CATALOG.find((e) => e.tipo === tipo);
  if (!entry) {
    throw new Error(`Etapa desconocida: ${tipo}`);
  }
  return entry;
};

export const getEtapaLabel = (tipo: TipoEtapa, publico = false): string => {
  const entry = getEtapaCatalog(tipo);
  return publico ? entry.labelPublico : entry.label;
};

export const buildChecklistFromTemplate = (tipo: TipoEtapa): ChecklistItem[] =>
  getEtapaCatalog(tipo).checklistTemplate.map((item) => ({
    ...item,
    completado: false
  }));

export const createInitialEtapas = (tieneVehiculo: boolean): EtapaTramite[] => {
  const today = new Date().toISOString().split('T')[0];

  return ETAPAS_CATALOG.map((entry) => {
    const checklist = buildChecklistFromTemplate(entry.tipo);
    let estado: EtapaTramite['estado'] = 'pendiente';
    let fechaInicio: string | undefined;
    let fechaFin: string | undefined;
    let subestado: string | undefined;

    if (entry.tipo === 'vinculacion') {
      estado = 'completada';
      fechaInicio = today;
      fechaFin = today;
      checklist.forEach((item) => {
        item.completado = true;
      });
    } else if (entry.tipo === 'liberacion_vehiculos' && !tieneVehiculo) {
      estado = 'no_aplica';
    } else if (entry.tipo === 'accion_penal') {
      estado = 'en_curso';
      fechaInicio = today;
    } else if (entry.tipo === 'reclamacion_aseguradora') {
      subestado = 'radicacion';
    } else if (entry.tipo === 'medico_laboral') {
      subestado = 'agendamiento';
    } else if (entry.tipo === 'conciliacion_prejudicial') {
      subestado = 'radicacion_solicitud';
    } else if (entry.tipo === 'proceso_judicial') {
      subestado = 'radicacion_demanda';
      estado = 'pendiente';
    }

    return {
      id: `${entry.tipo}-${Math.random().toString(36).slice(2, 8)}`,
      tipo: entry.tipo,
      estado,
      subestado,
      fechaInicio,
      fechaFin,
      checklist
    };
  });
};

export const PIPELINE_LAYOUT: Array<TipoEtapa | TipoEtapa[]> = [
  'vinculacion',
  'liberacion_vehiculos',
  'accion_penal',
  ['medico_clinico', 'medico_legal'],
  'reclamacion_aseguradora',
  'medico_laboral',
  'conciliacion_prejudicial',
  'proceso_judicial'
];
