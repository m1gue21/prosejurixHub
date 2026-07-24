/// <reference types="vite/client" />
import controlCsv from '../../actualizadoPROCESOS MANIZALES.xlsx - CONTROL PROCESOS ACCIDENTES(1).csv?raw';
import activosCsv from '../../actualizadoPROCESOS MANIZALES.xlsx - ACTIVOS(1).csv?raw';
import { mergeManizalesCsvs } from '../lib/csvManizales';
import { Comunicacion, Usuario } from '../types/tramite';
import { AgendaNota } from '../types/agenda';

export interface SeedData {
  usuarios: Usuario[];
  tramites: ReturnType<typeof mergeManizalesCsvs>['tramites'];
  comunicaciones: Comunicacion[];
  notasAgenda: AgendaNota[];
}

export const buildSeedFromMocks = (): SeedData => {
  const { usuarios, tramites, stats } = mergeManizalesCsvs(controlCsv, activosCsv);
  if (typeof console !== 'undefined') {
    console.info('[seed Manizales]', stats);
  }

  const today = new Date();
  const toIsoDay = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };
  const offsetDay = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return toIsoDay(d);
  };

  const comunicaciones: Comunicacion[] = [];
  const notasAgenda: AgendaNota[] = [];
  const sample = usuarios.slice(0, 12);

  sample.forEach((u, i) => {
    const tramite = tramites.find((t) => t.usuarioId === u.id && !t.esCasoAdicional);
    comunicaciones.push({
      id: `c-seed-${u.id}-1`,
      usuarioId: u.id,
      tramiteId: tramite?.id,
      tipo: 'llamada',
      direccion: 'hacia_cliente',
      fecha: `${offsetDay(-2)}T15:00:00.000Z`,
      asunto: 'Seguimiento del caso',
      contenido: 'Llamada de seguimiento sobre documentos y próximos pasos.',
      registradoPor: 'Asesoría',
      duracionMinutos: 10
    });
    if (i % 2 === 0) {
      comunicaciones.push({
        id: `c-seed-${u.id}-2`,
        usuarioId: u.id,
        tramiteId: tramite?.id,
        tipo: 'mensaje',
        direccion: 'desde_cliente',
        fecha: `${offsetDay(-1)}T11:30:00.000Z`,
        asunto: 'Consulta WhatsApp',
        contenido: 'Cliente preguntó por el estado de la reclamación.',
        registradoPor: 'Mesa de entrada'
      });
    }

    notasAgenda.push({
      id: `n-seed-${u.id}-1`,
      tipo: i % 2 === 0 ? 'recordatorio' : 'novedad',
      fecha: offsetDay(i % 5 === 0 ? 0 : i % 3),
      titulo:
        i % 2 === 0
          ? `Llamar a ${u.nombre.split(' ')[0]}`
          : `Novedad caso ${u.nombre.split(' ')[0]}`,
      detalle: tramite?.gestion || tramite?.alcance || 'Revisar avance del trámite',
      usuarioId: u.id,
      tramiteId: tramite?.id,
      hecho: false,
      creadoPor: 'Equipo',
      creadoEn: new Date().toISOString()
    });
  });

  return { usuarios, tramites, comunicaciones, notasAgenda };
};
