// @pca:start
// @id(feature.[MODULE_ID].interface)
// @kind(interface)
// @limit(lines: 150)
// @contract(I[MODULE_NAME]Props, I[MODULE_NAME]Events, [MODULE_NAME]Contract)
// @desc(Contrato público de datos y eventos para el módulo [MODULE_NAME])
// @pca:end

/**
 * FIDA - Interface Layer (I)
 *
 * Contract for: [MODULE_NAME]
 * Created: [DATE]
 *
 * Define estrictamente qué datos entran (Props) y qué eventos salen (Events).
 * ⚠️ Nivel de Impacto FIDA: ALTO (+50 pts) — Cambios aquí disparan el WAL documental.
 */

export interface I[MODULE_NAME]Props {
  title?: string;
}

export interface I[MODULE_NAME]Events {
  onAction?: () => void;
}

export type [MODULE_NAME]Contract = I[MODULE_NAME]Props & I[MODULE_NAME]Events;
