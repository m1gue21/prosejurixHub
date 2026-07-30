import { useCallback, useEffect, useState } from 'react';
import { getDataStore } from '../lib/dataProvider';
import { Tarea } from '../types/tarea';

export const useTareas = () => {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const refresh = useCallback(async () => {
    const data = await Promise.resolve(getDataStore().getTareas());
    setTareas(data);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createTarea = async (
    data: Omit<Tarea, 'id' | 'creadoEn' | 'estado' | 'origen'> & {
      id?: string;
      estado?: Tarea['estado'];
      origen?: Tarea['origen'];
    }
  ) => {
    const created = await Promise.resolve(getDataStore().createTarea(data));
    await refresh();
    return created;
  };

  const updateTarea = async (id: string, updates: Partial<Tarea>) => {
    const updated = await Promise.resolve(getDataStore().updateTarea(id, updates));
    await refresh();
    return updated;
  };

  const deleteTarea = async (id: string) => {
    await Promise.resolve(getDataStore().deleteTarea(id));
    await refresh();
  };

  return {
    tareas,
    isLoaded,
    refresh,
    createTarea,
    updateTarea,
    deleteTarea
  };
};
