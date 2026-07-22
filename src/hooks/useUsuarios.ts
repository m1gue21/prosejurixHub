import { useCallback, useEffect, useState } from 'react';
import { mockUserStore } from '../lib/mockUserStore';
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

  const refresh = useCallback(() => {
    setUsuarios(mockUserStore.getAll());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createUsuario = (
    data: Parameters<typeof mockUserStore.createUsuario>[0]
  ) => {
    const created = mockUserStore.createUsuario(data);
    refresh();
    return created;
  };

  const updateUsuario = (id: number, updates: Partial<Usuario>) => {
    const updated = mockUserStore.updateUsuario(id, updates);
    refresh();
    return updated;
  };

  const deleteUsuario = (id: number) => {
    mockUserStore.deleteUsuario(id);
    refresh();
  };

  const getUsuario = (id: number) => mockUserStore.getUsuario(id);

  const updateTramite = (id: string, updates: Partial<Tramite>) => {
    const updated = mockUserStore.updateTramite(id, updates);
    refresh();
    return updated;
  };

  const updateEtapa = (
    tramiteId: string,
    etapaTipo: TipoEtapa,
    updates: Partial<EtapaTramite> & { checklist?: ChecklistItem[] }
  ) => {
    const updated = mockUserStore.updateEtapa(tramiteId, etapaTipo, updates);
    refresh();
    return updated;
  };

  const setEtapaActual = (tramiteId: string, etapaTipo: TipoEtapa) => {
    const updated = mockUserStore.setEtapaActual(tramiteId, etapaTipo);
    refresh();
    return updated;
  };

  const createCasoAdicional = (
    usuarioId: number,
    data: Parameters<typeof mockUserStore.createCasoAdicional>[1]
  ) => {
    const created = mockUserStore.createCasoAdicional(usuarioId, data);
    refresh();
    return created;
  };

  const upsertDocumento = (
    tramiteId: string,
    etapaTipo: TipoEtapa,
    checklistItemId: string,
    archivo: DocumentoArchivo
  ) => {
    const updated = mockUserStore.upsertDocumento(tramiteId, etapaTipo, checklistItemId, archivo);
    refresh();
    return updated;
  };

  const removeDocumento = (
    tramiteId: string,
    etapaTipo: TipoEtapa,
    checklistItemId: string
  ) => {
    const updated = mockUserStore.removeDocumento(tramiteId, etapaTipo, checklistItemId);
    refresh();
    return updated;
  };

  const getComunicaciones = (usuarioId: number, tramiteId?: string) =>
    mockUserStore.getComunicaciones(usuarioId, tramiteId);

  const createComunicacion = (data: Omit<Comunicacion, 'id'> & { id?: string }) => {
    const created = mockUserStore.createComunicacion(data);
    refresh();
    return created;
  };

  const updateComunicacion = (id: string, updates: Partial<Comunicacion>) => {
    const updated = mockUserStore.updateComunicacion(id, updates);
    refresh();
    return updated;
  };

  const deleteComunicacion = (id: string) => {
    mockUserStore.deleteComunicacion(id);
    refresh();
  };

  return {
    usuarios,
    isLoaded,
    refresh,
    stats: mockUserStore.getStats(),
    createUsuario,
    updateUsuario,
    deleteUsuario,
    getUsuario,
    updateTramite,
    updateEtapa,
    setEtapaActual,
    createCasoAdicional,
    upsertDocumento,
    removeDocumento,
    getComunicaciones,
    createComunicacion,
    updateComunicacion,
    deleteComunicacion
  };
};
