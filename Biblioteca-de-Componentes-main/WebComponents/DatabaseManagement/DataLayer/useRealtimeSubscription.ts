import { useEffect } from 'react';
import { supabase } from '../lib/supabase'; // Asegúrate de que esta ruta apunte a tu cliente de supabase
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export interface UseRealtimeSubscriptionOptions<T extends Record<string, any>> {
  /** Nombre de la tabla a escuchar (ej: 'products', 'orders') */
  table: string;
  /** Esquema de la tabla, por defecto 'public' */
  schema?: string;
  /** Evento a escuchar, por defecto '*' (todos) */
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  /** Callback opcional que se ejecuta cuando se inserta un registro */
  onInsert?: (newRecord: T) => void;
  /** Callback opcional que se ejecuta cuando se actualiza un registro */
  onUpdate?: (newRecord: T, oldRecord: Partial<T>) => void;
  /** Callback opcional que se ejecuta cuando se elimina un registro */
  onDelete?: (oldRecord: Partial<T>) => void;
  /** Callback general por si necesitas manejar todo manualmente */
  onChange?: (payload: RealtimePostgresChangesPayload<T>) => void;
  /** Filtro condicional, si devuelve false, no se suscribe */
  enabled?: boolean;
}

/**
 * Hook Agnóstico para sincronización en tiempo real con Supabase.
 * En lugar de tener la lógica de negocio (orders, products) atada adentro,
 * expone callbacks genéricos para que el componente padre decida qué hacer.
 */
export function useRealtimeSubscription<T extends Record<string, any>>({
  table,
  schema = 'public',
  event = '*',
  onInsert,
  onUpdate,
  onDelete,
  onChange,
  enabled = true,
}: UseRealtimeSubscriptionOptions<T>) {
  useEffect(() => {
    if (!enabled) return;

    console.log(`[realtime] Subscribing to channel: ${schema}:${table}`);

    const subscription = supabase
      .channel(`${schema}:${table}_changes`)
      .on(
        'postgres_changes',
        { event, schema, table },
        (payload: RealtimePostgresChangesPayload<T>) => {
          // Callback general
          onChange?.(payload);

          // Callbacks específicos de ciclo de vida
          if (payload.eventType === 'INSERT' && onInsert) {
            onInsert(payload.new as T);
          } else if (payload.eventType === 'UPDATE' && onUpdate) {
            onUpdate(payload.new as T, payload.old as Partial<T>);
          } else if (payload.eventType === 'DELETE' && onDelete) {
            onDelete(payload.old as Partial<T>);
          }
        }
      )
      .subscribe();

    return () => {
      console.log(`[realtime] Removing channel: ${schema}:${table}`);
      supabase.removeChannel(subscription);
    };
  }, [table, schema, event, enabled, onInsert, onUpdate, onDelete, onChange]);
}
