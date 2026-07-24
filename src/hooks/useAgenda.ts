import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AgendaFilter,
  buildAllAgendaItems,
  filterAgendaItems,
  todayIso
} from '../lib/agendaItems';
import { getDataStore } from '../lib/dataProvider';
import { AgendaNota } from '../types/agenda';

export const useAgenda = (filter: AgendaFilter) => {
  const [tick, setTick] = useState(0);
  const [allItems, setAllItems] = useState(buildAllAgendaItems({
    usuarios: [],
    tramites: [],
    comunicaciones: [],
    notasAgenda: []
  }));

  const refresh = useCallback(async () => {
    const snap = await Promise.resolve(getDataStore().getSnapshot());
    setAllItems(
      buildAllAgendaItems({
        usuarios: snap.usuarios,
        tramites: snap.tramites,
        comunicaciones: snap.comunicaciones,
        notasAgenda: snap.notasAgenda
      })
    );
    setTick((t) => t + 1);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const items = useMemo(() => filterAgendaItems(allItems, filter), [allItems, filter, tick]);

  const createNota = async (
    data: Omit<AgendaNota, 'id' | 'creadoEn' | 'hecho'> & { hecho?: boolean }
  ) => {
    const created = await Promise.resolve(getDataStore().createNotaAgenda(data));
    await refresh();
    return created;
  };

  const updateNota = async (id: string, updates: Partial<AgendaNota>) => {
    const updated = await Promise.resolve(getDataStore().updateNotaAgenda(id, updates));
    await refresh();
    return updated;
  };

  const deleteNota = async (id: string) => {
    await Promise.resolve(getDataStore().deleteNotaAgenda(id));
    await refresh();
  };

  return {
    allItems,
    items,
    refresh,
    createNota,
    updateNota,
    deleteNota,
    today: todayIso()
  };
};
