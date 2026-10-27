import { useEffect, useState, useCallback } from "react";
import type { Producto } from "@/types/product";
import { productos as productosEstaticos } from "@/data/products";
import { api } from "@/services/api";

const CHANNEL_NAME = "cremeco_products_realtime";
const STORAGE_KEY = "cremeco_products_availability";

export function getStoredAvailability(): Record<number, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveStoredAvailability(overrides: Record<number, boolean>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  } catch {
    // Ignore localStorage errors
  }
}

export function applyAvailability(lista: Producto[]): Producto[] {
  const overrides = getStoredAvailability();
  return lista.map((p) => ({
    ...p,
    disponible: overrides[p.id] !== undefined ? overrides[p.id] : (p.disponible ?? true),
  }));
}

export function useRealtimeProducts() {
  const [items, setItems] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const remotos = await api.catalog.getProducts();
      if (Array.isArray(remotos) && remotos.length > 0) {
        setItems(applyAvailability(remotos));
      } else {
        setItems(applyAvailability(productosEstaticos));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al conectar con el catálogo");
      setItems(applyAvailability(productosEstaticos));
    } finally {
      setCargando(false);
    }
  }, []);

  const recargar = useCallback(() => {
    cargar();
  }, [cargar]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  useEffect(() => {
    // Escuchar canal de comunicacion en tiempo real (BroadcastChannel API)
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channel.onmessage = (event: MessageEvent) => {
        const data = event.data;
        if (data && data.type === "AVAILABILITY_CHANGED" && typeof data.id === "number") {
          setItems((prev) =>
            prev.map((prod) =>
              prod.id === data.id ? { ...prod, disponible: Boolean(data.disponible) } : prod
            )
          );
        } else if (data && data.type === "CATALOG_RELOAD") {
          recargar();
        }
      };
    } catch {
      // Fallback si BroadcastChannel no esta soportado
    }

    // Escuchar eventos de storage entre diferentes pestañas/ventanas
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setItems((prev) => applyAvailability(prev));
      }
    };
    window.addEventListener("storage", handleStorage);

    // Escuchar eventos locales en la misma ventana
    const handleCustom = (e: Event) => {
      const customEvent = e as CustomEvent<{ id: number; disponible: boolean }>;
      if (customEvent.detail) {
        setItems((prev) =>
          prev.map((prod) =>
            prod.id === customEvent.detail.id
              ? { ...prod, disponible: customEvent.detail.disponible }
              : prod
          )
        );
      }
    };
    window.addEventListener("cremeco:product-updated", handleCustom);

    return () => {
      if (channel) {
        channel.close();
      }
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("cremeco:product-updated", handleCustom);
    };
  }, [recargar]);

  const actualizarDisponibilidad = useCallback((id: number, disponible: boolean) => {
    // 1. Guardar en localStorage
    const overrides = getStoredAvailability();
    overrides[id] = disponible;
    saveStoredAvailability(overrides);

    // 2. Actualizar estado local
    setItems((prev) =>
      prev.map((prod) => (prod.id === id ? { ...prod, disponible } : prod))
    );

    // 3. Emitir evento por BroadcastChannel
    try {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.postMessage({
        type: "AVAILABILITY_CHANGED",
        id,
        disponible,
        timestamp: Date.now(),
      });
      channel.close();
    } catch {
      // Ignore
    }

    // 4. Emitir evento local
    window.dispatchEvent(
      new CustomEvent("cremeco:product-updated", { detail: { id, disponible } })
    );
  }, []);

  return {
    productos: items,
    cargando,
    error,
    actualizarDisponibilidad,
    recargar,
  };
}
