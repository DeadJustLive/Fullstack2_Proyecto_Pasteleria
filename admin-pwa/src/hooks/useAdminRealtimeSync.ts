// @pca:start
// @id(admin.hooks.realtimeSync)
// @kind(service)
// @limit(lines: 90)
// @contract(useAdminRealtimeSync(onSync, intervalMs?), broadcastAdminSync(payload))
// @relates(docs.especificacion_pwa_admin)
// @desc(Hook compartido de sincronizacion en tiempo real por BroadcastChannel, visibilidad y foco)
// @pca:end
import { useEffect, useRef } from "react";

export const ADMIN_REALTIME_CHANNEL = "cremeco_products_realtime";

export interface AdminRealtimeMessage {
  type:
    | "ORDER_PLACED"
    | "STOCK_UPDATED"
    | "STOCK_DECREMENTED"
    | "KARDEX_UPDATED"
    | "AVAILABILITY_UPDATED"
    | "AVAILABILITY_CHANGED"
    | "CATALOG_RELOAD";
  id?: number;
  disponible?: boolean;
  stock?: number;
  cantidad?: number;
  timestamp?: number;
}

export function broadcastAdminSync(payload: AdminRealtimeMessage): void {
  try {
    const channel = new BroadcastChannel(ADMIN_REALTIME_CHANNEL);
    channel.postMessage(payload);
    channel.close();
  } catch {
    // Fallback silencioso en entornos sin BroadcastChannel
  }
}

export function useAdminRealtimeSync(
  onSync: (message?: AdminRealtimeMessage) => void,
  intervalMs = 5000
): void {
  const onSyncRef = useRef(onSync);
  onSyncRef.current = onSync;

  useEffect(() => {
    const handleFocus = () => {
      onSyncRef.current();
    };

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        onSyncRef.current();
      }
    }, intervalMs);

    window.addEventListener("focus", handleFocus);

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(ADMIN_REALTIME_CHANNEL);
      channel.onmessage = (event: MessageEvent<AdminRealtimeMessage>) => {
        const data = event?.data;
        if (!data || !data.type) return;
        onSyncRef.current(data);
      };
    } catch {
      // BroadcastChannel no soportado
    }

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      if (channel) {
        channel.close();
      }
    };
  }, [intervalMs]);
}
