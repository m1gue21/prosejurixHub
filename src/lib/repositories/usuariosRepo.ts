import { supabase } from '../supabase';
import { createInitialEtapas } from '../../data/tramitesCatalog';
import { computeCaducidadFromAccidente } from '../caducidad';
import { AgendaNota } from '../../types/agenda';
import {
  ChecklistItem,
  Comunicacion,
  DocumentoArchivo,
  EtapaTramite,
  TipoEtapa,
  Tramite,
  Usuario,
  UsuarioConTramites
} from '../../types/tramite';
import { upsertChecklistArchivo } from '../documentHelpers';

const requireClient = () => {
  if (!supabase) throw new Error('Supabase no configurado');
  return supabase;
};

const mapUsuario = (row: Record<string, unknown>): Usuario => ({
  id: Number(row.id),
  nombre: String(row.nombre),
  cedula: String(row.cedula),
  telefono: (row.telefono as string) || undefined,
  celular: (row.celular as string) || undefined,
  celularSecundario: (row.celular_secundario as string) || undefined,
  email: (row.email as string) || undefined,
  direccion: (row.direccion as string) || undefined,
  ciudad: (row.ciudad as string) || undefined,
  fechaVinculacion: String(row.fecha_vinculacion).slice(0, 10),
  poderesFirmados: Boolean(row.poderes_firmados),
  casoEntregado: Boolean(row.caso_entregado),
  tieneVehiculoInvolucrado: Boolean(row.tiene_vehiculo_involucrado)
});

const mapEtapa = (row: Record<string, unknown>): EtapaTramite => ({
  id: String(row.id),
  tipo: row.tipo as TipoEtapa,
  estado: row.estado as EtapaTramite['estado'],
  subestado: (row.subestado as string) || undefined,
  fechaInicio: row.fecha_inicio ? String(row.fecha_inicio).slice(0, 10) : undefined,
  fechaFin: row.fecha_fin ? String(row.fecha_fin).slice(0, 10) : undefined,
  notasInternas: (row.notas_internas as string) || undefined,
  notasCliente: (row.notas_cliente as string) || undefined,
  checklist: (row.checklist as ChecklistItem[]) || []
});

const mapTramite = (row: Record<string, unknown>, etapas: EtapaTramite[]): Tramite => ({
  id: String(row.id),
  usuarioId: Number(row.usuario_id),
  titulo: String(row.titulo),
  casoLabel: (row.caso_label as string) || undefined,
  estadoGeneral: row.estado_general as Tramite['estadoGeneral'],
  etapaActual: row.etapa_actual as TipoEtapa,
  esCasoAdicional: Boolean(row.es_caso_adicional),
  fechaAccidente: row.fecha_accidente ? String(row.fecha_accidente).slice(0, 10) : undefined,
  fechaEstructuracion: row.fecha_estructuracion
    ? String(row.fecha_estructuracion).slice(0, 10)
    : undefined,
  lugarAccidente: (row.lugar_accidente as string) || undefined,
  responsabilidad: (row.responsabilidad as string) || undefined,
  caducidad: row.caducidad ? String(row.caducidad).slice(0, 10) : undefined,
  aseguradora: (row.aseguradora as string) || undefined,
  radicado: (row.radicado as string) || undefined,
  fiscalia: (row.fiscalia as string) || undefined,
  juzgado: (row.juzgado as string) || undefined,
  placaVehiculo: (row.placa_vehiculo as string) || undefined,
  demandado: (row.demandado as string) || undefined,
  valorHonorarios: row.valor_honorarios != null ? Number(row.valor_honorarios) : undefined,
  valorPeritaje: row.valor_peritaje != null ? Number(row.valor_peritaje) : undefined,
  valorPrestamos: row.valor_prestamos != null ? Number(row.valor_prestamos) : undefined,
  gastosAdicionales: row.gastos_adicionales != null ? Number(row.gastos_adicionales) : undefined,
  alcance: (row.alcance as string) || undefined,
  gestion: (row.gestion as string) || undefined,
  observaciones: (row.observaciones as string) || undefined,
  observacionesInternas: (row.observaciones_internas as string) || undefined,
  observacionesCliente: (row.observaciones_cliente as string) || undefined,
  fechaIngreso: String(row.fecha_ingreso).slice(0, 10),
  origenKey: (row.origen_key as string) || undefined,
  etapas
});

const tramiteToRow = (t: Partial<Tramite> & { id: string; usuarioId: number }) => ({
  id: t.id,
  usuario_id: t.usuarioId,
  titulo: t.titulo,
  caso_label: t.casoLabel ?? null,
  estado_general: t.estadoGeneral,
  etapa_actual: t.etapaActual,
  es_caso_adicional: t.esCasoAdicional ?? false,
  fecha_accidente: t.fechaAccidente ?? null,
  fecha_estructuracion: t.fechaEstructuracion ?? null,
  lugar_accidente: t.lugarAccidente ?? null,
  responsabilidad: t.responsabilidad ?? null,
  caducidad: t.caducidad ?? null,
  aseguradora: t.aseguradora ?? null,
  radicado: t.radicado ?? null,
  fiscalia: t.fiscalia ?? null,
  juzgado: t.juzgado ?? null,
  placa_vehiculo: t.placaVehiculo ?? null,
  demandado: t.demandado ?? null,
  valor_honorarios: t.valorHonorarios ?? null,
  valor_peritaje: t.valorPeritaje ?? null,
  valor_prestamos: t.valorPrestamos ?? null,
  gastos_adicionales: t.gastosAdicionales ?? null,
  alcance: t.alcance ?? null,
  gestion: t.gestion ?? null,
  observaciones: t.observaciones ?? null,
  observaciones_internas: t.observacionesInternas ?? null,
  observaciones_cliente: t.observacionesCliente ?? null,
  fecha_ingreso: t.fechaIngreso,
  origen_key: t.origenKey ?? null
});

const withCaducidad = <T extends Partial<Tramite>>(tramite: T): T => {
  const computed = computeCaducidadFromAccidente(tramite.fechaAccidente, tramite.responsabilidad);
  return { ...tramite, caducidad: computed || tramite.caducidad };
};

const loadEtapasFor = async (tramiteIds: string[]): Promise<Map<string, EtapaTramite[]>> => {
  const client = requireClient();
  const map = new Map<string, EtapaTramite[]>();
  if (!tramiteIds.length) return map;

  // PostgREST limita ~1000 filas; con 9 etapas/trámite hay que pedir por lotes.
  const chunkSize = 40;
  for (let i = 0; i < tramiteIds.length; i += chunkSize) {
    const slice = tramiteIds.slice(i, i + chunkSize);
    const { data, error } = await client.from('etapas').select('*').in('tramite_id', slice);
    if (error) throw error;
    for (const row of data || []) {
      const list = map.get(String(row.tramite_id)) || [];
      list.push(mapEtapa(row));
      map.set(String(row.tramite_id), list);
    }
  }
  return map;
};

export const usuariosRepo = {
  async getAll(): Promise<UsuarioConTramites[]> {
    const client = requireClient();
    const { data: users, error } = await client.from('usuarios').select('*').order('id');
    if (error) throw error;
    const { data: tramites, error: tErr } = await client.from('tramites').select('*');
    if (tErr) throw tErr;
    const etapasMap = await loadEtapasFor((tramites || []).map((t) => String(t.id)));
    return (users || []).map((u) => {
      const usuario = mapUsuario(u);
      const own = (tramites || [])
        .filter((t) => Number(t.usuario_id) === usuario.id)
        .map((t) => mapTramite(t, etapasMap.get(String(t.id)) || []))
        .sort((a, b) => Number(a.esCasoAdicional) - Number(b.esCasoAdicional));
      return { ...usuario, tramites: own };
    });
  },

  async getUsuario(id: number): Promise<UsuarioConTramites | undefined> {
    const all = await this.getAll();
    return all.find((u) => u.id === id);
  },

  async getTramite(id: string): Promise<Tramite | undefined> {
    const client = requireClient();
    const { data, error } = await client.from('tramites').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    if (!data) return undefined;
    const etapasMap = await loadEtapasFor([id]);
    return mapTramite(data, etapasMap.get(id) || []);
  },

  async getComunicaciones(usuarioId: number, tramiteId?: string): Promise<Comunicacion[]> {
    const client = requireClient();
    let q = client.from('comunicaciones').select('*').eq('usuario_id', usuarioId);
    if (tramiteId) q = q.eq('tramite_id', tramiteId);
    const { data, error } = await q.order('fecha', { ascending: false });
    if (error) throw error;
    return (data || []).map((c) => ({
      id: String(c.id),
      usuarioId: Number(c.usuario_id),
      tramiteId: c.tramite_id ? String(c.tramite_id) : undefined,
      tipo: c.tipo,
      direccion: c.direccion,
      fecha: String(c.fecha),
      asunto: c.asunto || undefined,
      contenido: String(c.contenido),
      registradoPor: c.registrado_por || undefined,
      duracionMinutos: c.duracion_minutos ?? undefined
    }));
  },

  async createComunicacion(data: Omit<Comunicacion, 'id'> & { id?: string }): Promise<Comunicacion> {
    const client = requireClient();
    const id = data.id || `c-${Date.now()}`;
    const row = {
      id,
      usuario_id: data.usuarioId,
      tramite_id: data.tramiteId ?? null,
      tipo: data.tipo,
      direccion: data.direccion,
      fecha: data.fecha,
      asunto: data.asunto ?? null,
      contenido: data.contenido,
      registrado_por: data.registradoPor ?? null,
      duracion_minutos: data.duracionMinutos ?? null
    };
    const { error } = await client.from('comunicaciones').insert(row);
    if (error) throw error;
    return { ...data, id };
  },

  async deleteComunicacion(id: string): Promise<void> {
    const client = requireClient();
    const { error } = await client.from('comunicaciones').delete().eq('id', id);
    if (error) throw error;
  },

  async getNotasAgenda(): Promise<AgendaNota[]> {
    const client = requireClient();
    const { data, error } = await client.from('agenda_notas').select('*').order('fecha');
    if (error) throw error;
    return (data || []).map((n) => ({
      id: String(n.id),
      tipo: n.tipo,
      fecha: String(n.fecha).slice(0, 10),
      titulo: String(n.titulo),
      detalle: n.detalle || undefined,
      usuarioId: n.usuario_id != null ? Number(n.usuario_id) : undefined,
      tramiteId: n.tramite_id ? String(n.tramite_id) : undefined,
      hecho: Boolean(n.hecho),
      creadoPor: n.creado_por || undefined,
      creadoEn: String(n.creado_en)
    }));
  },

  async createNotaAgenda(
    data: Omit<AgendaNota, 'id' | 'creadoEn' | 'hecho'> & { hecho?: boolean }
  ): Promise<AgendaNota> {
    const client = requireClient();
    const id = `n-${Date.now()}`;
    const creadoEn = new Date().toISOString();
    const row = {
      id,
      tipo: data.tipo,
      fecha: data.fecha,
      titulo: data.titulo,
      detalle: data.detalle ?? null,
      usuario_id: data.usuarioId ?? null,
      tramite_id: data.tramiteId ?? null,
      hecho: data.hecho ?? false,
      creado_por: data.creadoPor ?? null,
      creado_en: creadoEn
    };
    const { error } = await client.from('agenda_notas').insert(row);
    if (error) throw error;
    return { ...data, id, hecho: data.hecho ?? false, creadoEn };
  },

  async updateNotaAgenda(id: string, updates: Partial<AgendaNota>): Promise<AgendaNota> {
    const client = requireClient();
    const row: Record<string, unknown> = {};
    if (updates.tipo != null) row.tipo = updates.tipo;
    if (updates.fecha != null) row.fecha = updates.fecha;
    if (updates.titulo != null) row.titulo = updates.titulo;
    if (updates.detalle !== undefined) row.detalle = updates.detalle ?? null;
    if (updates.usuarioId !== undefined) row.usuario_id = updates.usuarioId ?? null;
    if (updates.tramiteId !== undefined) row.tramite_id = updates.tramiteId ?? null;
    if (updates.hecho != null) row.hecho = updates.hecho;
    if (updates.creadoPor !== undefined) row.creado_por = updates.creadoPor ?? null;
    const { data, error } = await client.from('agenda_notas').update(row).eq('id', id).select().single();
    if (error) throw error;
    return {
      id: String(data.id),
      tipo: data.tipo,
      fecha: String(data.fecha).slice(0, 10),
      titulo: String(data.titulo),
      detalle: data.detalle || undefined,
      usuarioId: data.usuario_id != null ? Number(data.usuario_id) : undefined,
      tramiteId: data.tramite_id ? String(data.tramite_id) : undefined,
      hecho: Boolean(data.hecho),
      creadoPor: data.creado_por || undefined,
      creadoEn: String(data.creado_en)
    };
  },

  async deleteNotaAgenda(id: string): Promise<void> {
    const client = requireClient();
    const { error } = await client.from('agenda_notas').delete().eq('id', id);
    if (error) throw error;
  },

  async getSnapshot() {
    const users = await this.getAll();
    const notasAgenda = await this.getNotasAgenda();
    const comunicaciones = (
      await Promise.all(users.map((u) => this.getComunicaciones(u.id)))
    ).flat();
    return {
      usuarios: users.map(({ tramites: _t, ...u }) => u),
      tramites: users.flatMap((u) => u.tramites),
      comunicaciones,
      notasAgenda
    };
  },

  async createUsuario(
    data: Omit<Usuario, 'id'> & {
      tituloTramite?: string;
      fechaAccidente?: string;
      fechaEstructuracion?: string;
      lugarAccidente?: string;
      aseguradora?: string;
      responsabilidad?: string;
    }
  ): Promise<UsuarioConTramites> {
    const client = requireClient();
    const { data: inserted, error } = await client
      .from('usuarios')
      .insert({
        nombre: data.nombre,
        cedula: data.cedula,
        telefono: data.telefono ?? null,
        celular: data.celular ?? null,
        celular_secundario: data.celularSecundario ?? null,
        email: data.email ?? null,
        direccion: data.direccion ?? null,
        ciudad: data.ciudad ?? null,
        fecha_vinculacion: data.fechaVinculacion,
        poderes_firmados: data.poderesFirmados ?? true,
        caso_entregado: data.casoEntregado ?? true,
        tiene_vehiculo_involucrado: data.tieneVehiculoInvolucrado ?? false
      })
      .select()
      .single();
    if (error) throw error;
    const usuario = mapUsuario(inserted);
    const tramiteId = `t-${Date.now()}`;
    const etapas = createInitialEtapas(usuario.tieneVehiculoInvolucrado);
    const tramite = withCaducidad({
      id: tramiteId,
      usuarioId: usuario.id,
      titulo: data.tituloTramite || 'Nuevo trámite',
      estadoGeneral: 'activo' as const,
      etapaActual: 'accion_penal' as const,
      esCasoAdicional: false,
      fechaAccidente: data.fechaAccidente,
      fechaEstructuracion: data.fechaEstructuracion,
      lugarAccidente: data.lugarAccidente,
      aseguradora: data.aseguradora,
      responsabilidad: data.responsabilidad || 'Extracontractual',
      fechaIngreso: usuario.fechaVinculacion,
      etapas,
      observacionesCliente: 'Tu caso ha sido vinculado. Pronto tendrás novedades.'
    });
    const { error: tErr } = await client.from('tramites').insert(tramiteToRow(tramite));
    if (tErr) throw tErr;
    const { error: eErr } = await client.from('etapas').insert(
      etapas.map((e) => ({
        id: e.id,
        tramite_id: tramiteId,
        tipo: e.tipo,
        estado: e.estado,
        subestado: e.subestado ?? null,
        fecha_inicio: e.fechaInicio ?? null,
        fecha_fin: e.fechaFin ?? null,
        notas_internas: e.notasInternas ?? null,
        notas_cliente: e.notasCliente ?? null,
        checklist: e.checklist
      }))
    );
    if (eErr) throw eErr;
    return { ...usuario, tramites: [tramite] };
  },

  async updateUsuario(id: number, updates: Partial<Usuario>): Promise<UsuarioConTramites> {
    const client = requireClient();
    const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (updates.nombre != null) row.nombre = updates.nombre;
    if (updates.cedula != null) row.cedula = updates.cedula;
    if (updates.telefono !== undefined) row.telefono = updates.telefono ?? null;
    if (updates.celular !== undefined) row.celular = updates.celular ?? null;
    if (updates.celularSecundario !== undefined) {
      row.celular_secundario = updates.celularSecundario ?? null;
    }
    if (updates.email !== undefined) row.email = updates.email ?? null;
    if (updates.direccion !== undefined) row.direccion = updates.direccion ?? null;
    if (updates.ciudad !== undefined) row.ciudad = updates.ciudad ?? null;
    if (updates.fechaVinculacion != null) row.fecha_vinculacion = updates.fechaVinculacion;
    if (updates.poderesFirmados != null) row.poderes_firmados = updates.poderesFirmados;
    if (updates.casoEntregado != null) row.caso_entregado = updates.casoEntregado;
    if (updates.tieneVehiculoInvolucrado != null) {
      row.tiene_vehiculo_involucrado = updates.tieneVehiculoInvolucrado;
    }
    const { error } = await client.from('usuarios').update(row).eq('id', id);
    if (error) throw error;
    const u = await this.getUsuario(id);
    if (!u) throw new Error(`Usuario ${id} no encontrado`);
    return u;
  },

  async deleteUsuario(id: number): Promise<void> {
    const client = requireClient();
    const { error } = await client.from('usuarios').delete().eq('id', id);
    if (error) throw error;
  },

  async updateTramite(id: string, updates: Partial<Tramite>): Promise<Tramite> {
    const current = await this.getTramite(id);
    if (!current) throw new Error(`Trámite ${id} no encontrado`);
    const merged = withCaducidad({ ...current, ...updates, id, usuarioId: current.usuarioId });
    const client = requireClient();
    const { error } = await client
      .from('tramites')
      .update({ ...tramiteToRow(merged), updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    return merged;
  },

  async updateEtapa(
    tramiteId: string,
    etapaTipo: TipoEtapa,
    updates: Partial<EtapaTramite> & { checklist?: ChecklistItem[] }
  ): Promise<Tramite> {
    const client = requireClient();
    const tramite = await this.getTramite(tramiteId);
    if (!tramite) throw new Error(`Trámite ${tramiteId} no encontrado`);
    const etapa = tramite.etapas.find((e) => e.tipo === etapaTipo);
    if (!etapa) throw new Error(`Etapa ${etapaTipo} no encontrada`);
    const next = { ...etapa, ...updates, tipo: etapa.tipo, id: etapa.id };
    const { error } = await client
      .from('etapas')
      .update({
        estado: next.estado,
        subestado: next.subestado ?? null,
        fecha_inicio: next.fechaInicio ?? null,
        fecha_fin: next.fechaFin ?? null,
        notas_internas: next.notasInternas ?? null,
        notas_cliente: next.notasCliente ?? null,
        checklist: next.checklist,
        updated_at: new Date().toISOString()
      })
      .eq('id', etapa.id);
    if (error) throw error;
    if (next.estado === 'en_curso') {
      await client.from('tramites').update({ etapa_actual: etapaTipo }).eq('id', tramiteId);
    }
    const refreshed = await this.getTramite(tramiteId);
    if (!refreshed) throw new Error(`Trámite ${tramiteId} no encontrado`);
    return refreshed;
  },

  async setEtapaActual(tramiteId: string, etapaTipo: TipoEtapa): Promise<Tramite> {
    return this.updateEtapa(tramiteId, etapaTipo, {
      estado: 'en_curso',
      fechaInicio: new Date().toISOString().slice(0, 10)
    });
  },

  async createCasoAdicional(
    usuarioId: number,
    data: Partial<Pick<Tramite, 'titulo' | 'fechaAccidente' | 'aseguradora' | 'lugarAccidente' | 'responsabilidad' | 'fechaEstructuracion'>>
  ): Promise<Tramite> {
    const client = requireClient();
    const usuario = await this.getUsuario(usuarioId);
    if (!usuario) throw new Error(`Usuario ${usuarioId} no encontrado`);
    const id = `t-${Date.now()}`;
    const etapas = createInitialEtapas(usuario.tieneVehiculoInvolucrado);
    const tramite = withCaducidad({
      id,
      usuarioId,
      titulo: data.titulo || 'Caso adicional',
      estadoGeneral: 'activo' as const,
      etapaActual: 'accion_penal' as const,
      esCasoAdicional: true,
      fechaAccidente: data.fechaAccidente,
      fechaEstructuracion: data.fechaEstructuracion,
      lugarAccidente: data.lugarAccidente,
      aseguradora: data.aseguradora,
      responsabilidad: data.responsabilidad || 'Extracontractual',
      fechaIngreso: new Date().toISOString().slice(0, 10),
      etapas,
      observacionesCliente: 'Se ha abierto un caso adicional en tu cuenta.'
    });
    const { error } = await client.from('tramites').insert(tramiteToRow(tramite));
    if (error) throw error;
    const { error: eErr } = await client.from('etapas').insert(
      etapas.map((e) => ({
        id: e.id,
        tramite_id: id,
        tipo: e.tipo,
        estado: e.estado,
        subestado: e.subestado ?? null,
        fecha_inicio: e.fechaInicio ?? null,
        fecha_fin: e.fechaFin ?? null,
        notas_internas: e.notasInternas ?? null,
        notas_cliente: e.notasCliente ?? null,
        checklist: e.checklist
      }))
    );
    if (eErr) throw eErr;
    return tramite;
  },

  async upsertDocumento(
    tramiteId: string,
    etapaTipo: TipoEtapa,
    checklistItemId: string,
    archivo: DocumentoArchivo
  ): Promise<Tramite> {
    const tramite = await this.getTramite(tramiteId);
    if (!tramite) throw new Error(`Trámite ${tramiteId} no encontrado`);
    const etapa = tramite.etapas.find((e) => e.tipo === etapaTipo);
    if (!etapa) throw new Error(`Etapa ${etapaTipo} no encontrada`);
    return this.updateEtapa(tramiteId, etapaTipo, {
      checklist: upsertChecklistArchivo(etapa.checklist, checklistItemId, archivo)
    });
  },

  async removeDocumento(
    tramiteId: string,
    etapaTipo: TipoEtapa,
    checklistItemId: string
  ): Promise<Tramite> {
    const tramite = await this.getTramite(tramiteId);
    if (!tramite) throw new Error(`Trámite ${tramiteId} no encontrado`);
    const etapa = tramite.etapas.find((e) => e.tipo === etapaTipo);
    if (!etapa) throw new Error(`Etapa ${etapaTipo} no encontrada`);
    return this.updateEtapa(tramiteId, etapaTipo, {
      checklist: upsertChecklistArchivo(etapa.checklist, checklistItemId, undefined)
    });
  },

  getStats() {
    // sync helper unused for supabase path; keep shape
    return {
      totalUsuarios: 0,
      totalTramites: 0,
      activos: 0,
      finalizados: 0,
      enReclamacion: 0,
      enConciliacion: 0,
      enJudicial: 0
    };
  }
};
