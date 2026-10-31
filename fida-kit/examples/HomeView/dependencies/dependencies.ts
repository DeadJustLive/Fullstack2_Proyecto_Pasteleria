// @pca:start
// @id(feature.homeview.dependencies)
// @kind(dependencies)
// @limit(lines: 120)
// @contract(gateway: external imports and adapters for HomeView)
// @relates(feature.homeview.interface)
// @desc(Aduana de importaciones externas y adaptadores del módulo HomeView)
// @pca:end

/**
 * FIDA - Dependencies Layer (D)
 *
 * Import Gateway ("Aduana") for: HomeView
 * Created: 2026-10-31
 *
 * Único punto de entrada para librerías externas, componentes globales o servicios.
 * Ningún archivo en implementation/ o components/ puede importar del exterior sin pasar por aquí.
 * ⚠️ Nivel de Impacto FIDA: ALTO (+40 pts) — Cambios aquí disparan revisión WAL.
 */

export type {
  IHomeViewProps,
  IHomeViewEvents,
  HomeViewContract,
} from "../interfaces/IHomeView";

// === Componentes Globales / UI ===
// export { Button } from "@/shared/ui/Button";

// === Hooks / Servicios Externos ===
// export { apiClient } from "@/core/apiClient";
