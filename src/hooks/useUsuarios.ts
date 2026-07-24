import { useCallback, useEffect, useState } from 'react';
import { getActiveDataSource, getDataStore } from '../lib/dataProvider';
import {
  ChecklistItem,
  Comunicacion,
  DocumentoArchivo,
  EtapaTramite,
  TipoEtapa,
  Tramite,
  Usuario,
  UsuarioConTramites
} from '../types/tramite';

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState<UsuarioConTramites[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [source] = useState(getActiveDataSource);

  const refresh = useCallback(async () => {
    const store = getDataStore();
    const data = await Promise.resolve(store.getAll());
    setUsuarios(data);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createUsuario = async (data: Parameters<ReturnType<typeof getDataStore>['createUsuario']>[0]) => {
    const created = await Promise.resolve(getDataStore().createUsuario(data));
    await refresh();
    return created;
  };

  const updateUsuario = async (id: number, updates: Partial<Usuario>) => {
    const updated = await Promise.resolve(getDataStore().updateUsuario(id, updates));
    await refresh();
    return updated;
  };

  const deleteUsuario = async (id: number) => {
    await Promise.resolve(getDataStore().deleteUsuario(id));
    await refresh();
  };

  const getUsuario = (id: number) => {
    // sync cache first
    const cached = usuarios.find((u) => u.id === id);
    if (cached) return cached;
    return undefined;
  };

  const getUsuarioAsync = async (id: number) => {
    const found = await Promise.resolve(getDataStore().getUsuario(id));
    return found;
  };

  const updateTramite = async (id: string, updates: Partial<Tramite>) => {
    const updated = await Promise.resolve(getDataStore().updateTramite(id, updates));
    await refresh();
    return updated;
  };

  const updateEtapa = async (
    tramiteId: string,
    etapaTipo: TipoEtapa,
    updates: Partial<EtapaTramite> & { checklist?: ChecklistItem[] }
  ) => {
    const updated = await Promise.resolve(getDataStore().updateEtapa(tramiteId, etapaTipo, updates));
    await refresh();
    return updated;
  };

  const setEtapaActual = async (tramiteId: string, etapaTipo: TipoEtapa) => {
    const updated = await Promise.resolve(getDataStore().setEtapaActual(tramiteId, etapaTipo));
    await refresh();
    return updated;
  };

  const createCasoAdicional = async (
    usuarioId: number,
    data: Parameters<ReturnType<typeof getDataStore>['createCasoAdicional']>[1]
  ) => {
    const created = await Promise.resolve(getDataStore().createCasoAdicional(usuarioId, data));
    await refresh();
    return created;
  };

  const upsertDocumento = async (
    tramiteId: string,
    etapaTipo: TipoEtapa,
    checklistItemId: string,
    archivo: DocumentoArchivo
  ) => {
    const updated = await Promise.resolve(
      getDataStore().upsertDocumento(tramiteId, etapaTipo, checklistItemId, archivo)
    );
    await refresh();
    return updated;
  };

  const removeDocumento = async (
    tramiteId: string,
    etapaTipo: TipoEtapa,
    checklistItemId: string
  ) => {
    const updated = await Promise.resolve(
      getDataStore().removeDocumento(tramiteId, etapaTipo, checklistItemId)
    );
    await refresh();
    return updated;
  };

  const getComunicaciones = async (usuarioId: number, tramiteId?: string) =>
    Promise.resolve(getDataStore().getComunicaciones(usuarioId, tramiteId));

  const createComunicacion = async (data: Omit<Comunicacion, 'id'> & { id?: string }) => {
    const created = await Promise.resolve(getDataStore().createComunicacion(data));
    await refresh();
    return created;
  };

  const deleteComunicacion = async (id: string) => {
    await Promise.resolve(getDataStore().deleteComunicacion(id));
    await refresh();
  };

  const stats = (() => {
    const tramites = usuarios.flatMap((u) => u.tramites);
    return {
      totalUsuarios: usuarios.length,
      totalTramites: tramites.length,
      activos: tramites.filter((t) => t.estadoGeneral === 'activo').length,
      finalizados: tramites.filter((t) => t.estadoGeneral === 'finalizado').length,
      enReclamacion: tramites.filter((t) => t.etapaActual === 'reclamacion_aseguradora').length,
      enConciliacion: tramites.filter((t) => t.etapaActual === 'conciliacion_prejudicial').length,
      enJudicial: tramites.filter((t) => t.etapaActual === 'proceso_judicial').length
    };
  })();

  return {
    usuarios,
    isLoaded,
    source,
    refresh,
    stats,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    getUsuario,
    getUsuarioAsync,
    updateTramite,
    updateEtapa,
    setEtapaActual,
    createCasoAdicional,
    upsertDocumento,
    removeDocumento,
    getComunicaciones,
    createComunicacion,
    deleteComunicacion
  };
};
