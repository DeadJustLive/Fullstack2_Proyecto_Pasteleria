// @pca:start
// @id(feature.[MODULE_ID].dependencies)
// @kind(dependencies)
// @limit(lines: 120)
// @contract(gateway: external imports and adapters for [MODULE_NAME])
// @relates(feature.[MODULE_ID].interface)
// @desc(Aduana de importaciones externas y adaptadores del módulo [MODULE_NAME])
// @pca:end

/**
 * FIDA - Dependencies Layer (D)
 *
 * Import Gateway ("Aduana") for: [MODULE_NAME]
 * Created: [DATE]
 *
 * Único punto de entrada para librerías externas, componentes globales o servicios.
 * Ningún archivo en implementation/ o components/ puede importar del exterior sin pasar por aquí.
 * ⚠️ Nivel de Impacto FIDA: ALTO (+40 pts) — Cambios aquí disparan revisión WAL.
 */

export type {
  I[MODULE_NAME]Props,
  I[MODULE_NAME]Events,
  [MODULE_NAME]Contract,
} from "../interfaces/I[MODULE_NAME]";

// === Componentes Globales / UI ===
// export { Button } from "@/shared/ui/Button";

// === Hooks / Servicios Externos ===
// export { apiClient } from "@/core/apiClient";
