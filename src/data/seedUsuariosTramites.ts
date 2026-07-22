import { mockClientes, mockProcesos, MockProceso } from './mocks';
import { createInitialEtapas, getEtapaCatalog } from './tramitesCatalog';
import { createDocumentoFromUrl } from '../lib/documentHelpers';
import { addMonthsIso, computeCaducidadFromAccidente } from '../lib/caducidad';
import {
  Comunicacion,
  EstadoGeneralTramite,
  EtapaTramite,
  TipoEtapa,
  Tramite,
  Usuario
} from '../types/tramite';

const SAMPLE_PDF = 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';

const attachSampleDocs = (etapas: EtapaTramite[]): EtapaTramite[] =>
  etapas.map((etapa) => {
    if (etapa.tipo === 'vinculacion') {
      return {
        ...etapa,
        checklist: etapa.checklist.map((item) => {
          if (item.id !== 'poderes') return item;
          return {
            ...item,
            completado: true,
            archivo: {
              ...createDocumentoFromUrl('poderes-firmados.pdf', SAMPLE_PDF),
              fechaAnadido: etapa.fechaInicio
                ? `${etapa.fechaInicio}T10:00:00.000Z`
                : new Date().toISOString()
            }
          };
        })
      };
    }
    if (etapa.tipo === 'accion_penal' && etapa.estado === 'en_curso') {
      return {
        ...etapa,
        checklist: etapa.checklist.map((item) => {
          if (item.id !== 'querella') return item;
          return {
            ...item,
            completado: true,
            archivo: {
              ...createDocumentoFromUrl('querella-radicada.pdf', SAMPLE_PDF),
              fechaAnadido: etapa.fechaInicio
                ? `${etapa.fechaInicio}T14:30:00.000Z`
                : new Date().toISOString()
            }
          };
        })
      };
    }
    if (etapa.estado === 'completada') {
      return {
        ...etapa,
        checklist: etapa.checklist.map((item, idx) => {
          if (!item.requiereDocumento || idx > 0) return { ...item, completado: true };
          return {
            ...item,
            completado: true,
            archivo: {
              ...createDocumentoFromUrl(`${item.id}.pdf`, SAMPLE_PDF),
              fechaAnadido: etapa.fechaFin
                ? `${etapa.fechaFin}T09:00:00.000Z`
                : new Date().toISOString()
            }
          };
        })
      };
    }
    return etapa;
  });

const inferEtapaFromProceso = (p: MockProceso): TipoEtapa => {
  const blob = [
    p.estadoPublico,
    p.estadoProceso,
    p.actuacion,
    p.estado,
    p.conciliacion,
    p.fechaPresentacionDemanda
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (p.estado === 'finalizado' || blob.includes('cerrado') || blob.includes('sentencia')) {
    if (
      blob.includes('sentencia') ||
      blob.includes('demanda') ||
      blob.includes('judicial') ||
      blob.includes('audiencia')
    ) {
      return 'proceso_judicial';
    }
    return 'reclamacion_aseguradora';
  }
  if (
    blob.includes('audiencia') ||
    blob.includes('demanda') ||
    blob.includes('notific') ||
    blob.includes('judicial')
  ) {
    return 'proceso_judicial';
  }
  if (blob.includes('concili')) {
    return 'conciliacion_prejudicial';
  }
  if (blob.includes('pcl') || (blob.includes('laboral') && blob.includes('dictamen'))) {
    return 'medico_laboral';
  }
  if (blob.includes('negociacion') || blob.includes('negociación') || blob.includes('reclam')) {
    return 'reclamacion_aseguradora';
  }
  if (blob.includes('dictamen') || blob.includes('medico legal') || blob.includes('médico legal')) {
    return 'medico_legal';
  }
  if (
    blob.includes('historia clinica') ||
    blob.includes('tratamiento') ||
    blob.includes('incapacidad')
  ) {
    return 'medico_clinico';
  }
  if (blob.includes('liberacion') || blob.includes('peritaje') || blob.includes('croquis')) {
    return p.placaVehiculo ? 'liberacion_vehiculos' : 'accion_penal';
  }
  if (
    blob.includes('querella') ||
    blob.includes('fiscal') ||
    blob.includes('investigación') ||
    blob.includes('investigacion')
  ) {
    return 'accion_penal';
  }
  if (blob.includes('evaluacion') || blob.includes('evaluación') || blob.includes('inicial')) {
    return 'accion_penal';
  }
  return 'accion_penal';
};

const inferSubestado = (etapa: TipoEtapa, p: MockProceso): string | undefined => {
  const blob = `${p.estadoPublico} ${p.actuacion} ${p.estadoProceso}`.toLowerCase();
  const catalog = getEtapaCatalog(etapa);
  if (!catalog.subestados?.length) return undefined;

  if (etapa === 'reclamacion_aseguradora') {
    if (blob.includes('negoci')) return 'negociacion';
    if (blob.includes('complement')) return 'complementacion';
    if (blob.includes('fracaso') || blob.includes('pendiente demanda')) return 'fracaso';
    if (blob.includes('acuerdo') || blob.includes('concert')) return 'concertacion';
    if (p.estado === 'finalizado') return 'finalizacion';
    if (blob.includes('radic')) return 'radicacion';
    return 'radicacion';
  }
  if (etapa === 'conciliacion_prejudicial') {
    if (blob.includes('fracaso') || blob.includes('no acuerdo')) return 'fracaso';
    if (blob.includes('acuerdo')) return 'concertacion';
    if (blob.includes('acta')) return 'acta';
    if (blob.includes('diligencia')) return 'diligencia';
    return 'radicacion_solicitud';
  }
  if (etapa === 'proceso_judicial') {
    if (blob.includes('sentencia')) return 'sentencia';
    if (blob.includes('audiencia')) return 'audiencia_inicial';
    if (blob.includes('notific')) return 'notificaciones';
    if (blob.includes('admision') || blob.includes('admisión') || blob.includes('subsan')) {
      return 'admision_subsanacion';
    }
    if (blob.includes('demanda')) return 'radicacion_demanda';
    return 'radicacion_demanda';
  }
  if (etapa === 'medico_laboral') {
    if (blob.includes('pcl') || blob.includes('dictamen')) return 'dictamen_pcl';
    if (blob.includes('historia')) return 'complementacion_hc';
    return 'agendamiento';
  }
  return catalog.subestados[0]?.value;
};

const applyEtapaProgress = (
  etapas: EtapaTramite[],
  etapaActual: TipoEtapa,
  p: MockProceso
): EtapaTramite[] => {
  const order = getEtapaCatalog(etapaActual).orden;
  const today = p.fechaIngreso || new Date().toISOString().split('T')[0];

  return etapas.map((etapa) => {
    const etapaOrder = getEtapaCatalog(etapa.tipo).orden;
    if (etapa.estado === 'no_aplica') return etapa;

    if (etapaOrder < order) {
      return {
        ...etapa,
        estado: 'completada',
        fechaInicio: etapa.fechaInicio || today,
        fechaFin: etapa.fechaFin || today,
        checklist: etapa.checklist.map((c) => ({ ...c, completado: true }))
      };
    }

    if (etapa.tipo === etapaActual) {
      return {
        ...etapa,
        estado: p.estado === 'finalizado' ? 'completada' : 'en_curso',
        subestado: inferSubestado(etapaActual, p) || etapa.subestado,
        fechaInicio: etapa.fechaInicio || today,
        fechaFin: p.estado === 'finalizado' ? today : undefined,
        notasCliente: p.observacionesCliente || p.observaciones,
        notasInternas: p.observacionesInternas
      };
    }

    return etapa;
  });
};

function mapProcesoToTramite(
  p: MockProceso,
  usuarioId: number,
  esCasoAdicional: boolean
): Tramite {
  const tieneVehiculo = Boolean(p.placaVehiculo);
  const etapaActual = inferEtapaFromProceso(p);
  let etapas = createInitialEtapas(tieneVehiculo);
  etapas = applyEtapaProgress(etapas, etapaActual, p);
  etapas = attachSampleDocs(etapas);

  const estadoGeneral: EstadoGeneralTramite =
    p.estado === 'finalizado' ? 'finalizado' : p.estado === 'en_espera' ? 'en_espera' : 'activo';

  const responsabilidad = p.responsabilidad || 'Extracontractual';
  const fechaAccidente = p.fechaAccidente || p.fecha;
  const caducidad =
    computeCaducidadFromAccidente(fechaAccidente, responsabilidad) ||
    p.caducidad ||
    undefined;

  // Demo: algunos casos con estructuración ~8 meses después del accidente
  const fechaEstructuracion =
    fechaAccidente && Number(String(p.id).replace(/\D/g, '')) % 3 === 0
      ? addMonthsIso(fechaAccidente, 8) || undefined
      : undefined;

  return {
    id: `t-${p.id}`,
    usuarioId,
    titulo: p.claseProceso || `Caso ${p.demandado || p.aseguradora || p.id}`,
    casoLabel: [p.aseguradora || p.demandado, fechaAccidente]
      .filter(Boolean)
      .join(' · '),
    estadoGeneral,
    etapaActual,
    esCasoAdicional,
    fechaAccidente,
    fechaEstructuracion,
    lugarAccidente: p.lugarAccidente,
    responsabilidad,
    caducidad,
    aseguradora: p.aseguradora || p.demandado,
    radicado: p.radicado,
    fiscalia: p.fiscalia,
    juzgado: p.juzgado,
    placaVehiculo: p.placaVehiculo,
    demandado: p.demandado,
    valorHonorarios: p.valorHonorarios,
    valorPeritaje: p.valorPeritaje,
    valorPrestamos: p.valorPrestamos,
    gastosAdicionales: p.gastosAdicionales,
    observaciones: p.observaciones,
    observacionesInternas: p.observacionesInternas,
    observacionesCliente: p.observacionesCliente,
    fechaIngreso: p.fechaIngreso,
    etapas
  };
}

export interface SeedData {
  usuarios: Usuario[];
  tramites: Tramite[];
  comunicaciones: Comunicacion[];
}

export const buildSeedFromMocks = (): SeedData => {
  const usuarios: Usuario[] = [];
  const tramites: Tramite[] = [];
  const seenCedulas = new Map<string, number>();

  for (const c of mockClientes) {
    const procesos = mockProcesos.filter(
      (p) =>
        p.clienteId === c.id || p.cedula.replace(/\D/g, '') === c.cedula.replace(/\D/g, '')
    );
    const first = procesos[0];
    const tieneVehiculo = procesos.some((p) => Boolean(p.placaVehiculo));

    const usuario: Usuario = {
      id: c.id,
      nombre: c.nombre,
      cedula: c.cedula,
      telefono: c.telefono,
      celular: first?.celular || c.telefono,
      celularSecundario: first?.celularSecundario,
      email: first?.correoElectronico || c.email,
      direccion: first?.direccion || c.direccion,
      ciudad: first?.ciudad || first?.ciudad1 || '',
      fechaVinculacion: c.fechaRegistro,
      poderesFirmados: true,
      casoEntregado: true,
      tieneVehiculoInvolucrado: tieneVehiculo
    };
    usuarios.push(usuario);
    seenCedulas.set(c.cedula.replace(/\D/g, ''), c.id);

    procesos.forEach((p, index) => {
      tramites.push(mapProcesoToTramite(p, c.id, index > 0));
    });

    if (procesos.length === 0) {
      tramites.push({
        id: `t-u-${c.id}`,
        usuarioId: c.id,
        titulo: 'Caso en vinculación',
        estadoGeneral: 'activo',
        etapaActual: 'accion_penal',
        esCasoAdicional: false,
        fechaIngreso: c.fechaRegistro,
        etapas: createInitialEtapas(false)
      });
    }
  }

  for (const p of mockProcesos) {
    const key = p.cedula.replace(/\D/g, '');
    if (seenCedulas.has(key)) continue;

    const nextId = Math.max(0, ...usuarios.map((u) => u.id)) + 1;
    const usuario: Usuario = {
      id: nextId,
      nombre: p.clienteNombre,
      cedula: p.cedula,
      celular: p.celular,
      celularSecundario: p.celularSecundario,
      email: p.correoElectronico,
      direccion: p.direccion,
      ciudad: p.ciudad || p.ciudad1,
      fechaVinculacion: p.fechaIngreso,
      poderesFirmados: true,
      casoEntregado: true,
      tieneVehiculoInvolucrado: Boolean(p.placaVehiculo)
    };
    usuarios.push(usuario);
    seenCedulas.set(key, nextId);
    tramites.push(mapProcesoToTramite(p, nextId, false));
  }

  const comunicaciones: Comunicacion[] = [];

  usuarios.forEach((u, i) => {
    const tramite = tramites.find((t) => t.usuarioId === u.id && !t.esCasoAdicional);
    const baseDate = u.fechaVinculacion || '2025-11-01';
    const day = (offset: number) => {
      const d = new Date(`${baseDate}T12:00:00`);
      if (Number.isNaN(d.getTime())) {
        return new Date().toISOString();
      }
      d.setDate(d.getDate() + offset);
      return d.toISOString();
    };

    comunicaciones.push({
      id: `c-seed-${u.id}-1`,
      usuarioId: u.id,
      tramiteId: tramite?.id,
      tipo: 'llamada',
      direccion: 'hacia_cliente',
      fecha: day(1),
      asunto: 'Bienvenida y próximos pasos',
      contenido:
        'Llamada de vinculación: se explicó el flujo del trámite y se confirmó documentación pendiente.',
      registradoPor: 'Asesoría',
      duracionMinutos: 12
    });

    comunicaciones.push({
      id: `c-seed-${u.id}-2`,
      usuarioId: u.id,
      tramiteId: tramite?.id,
      tipo: i % 2 === 0 ? 'mensaje' : 'correo',
      direccion: 'desde_cliente',
      fecha: day(4),
      asunto: i % 2 === 0 ? 'Consulta por WhatsApp' : 'Solicitud de actualización',
      contenido:
        i % 2 === 0
          ? 'Cliente preguntó por el estado de la reclamación y envió fotos adicionales.'
          : 'Cliente escribió solicitando copia del poder y fecha estimada de respuesta de la aseguradora.',
      registradoPor: 'Mesa de entrada'
    });

    if (i % 3 === 0) {
      comunicaciones.push({
        id: `c-seed-${u.id}-3`,
        usuarioId: u.id,
        tramiteId: tramite?.id,
        tipo: 'visita_oficina',
        direccion: 'desde_cliente',
        fecha: day(10),
        asunto: 'Entrega de documentos',
        contenido: 'Cliente asistió a la oficina a entregar historia clínica y poder firmado.',
        registradoPor: 'Recepción',
        duracionMinutos: 25
      });
    }

    if (i % 4 === 0) {
      comunicaciones.push({
        id: `c-seed-${u.id}-4`,
        usuarioId: u.id,
        tramiteId: tramite?.id,
        tipo: 'visita_cliente',
        direccion: 'hacia_cliente',
        fecha: day(14),
        asunto: 'Visita domiciliaria',
        contenido: 'Visita al domicilio del cliente para firma de documentos y explicación del avance.',
        registradoPor: 'Gestión de campo',
        duracionMinutos: 40
      });
    }
  });

  return { usuarios, tramites, comunicaciones };
};
