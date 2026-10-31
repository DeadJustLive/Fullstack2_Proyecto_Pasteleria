// @pca:start
// @id(feature.homeview.interface)
// @kind(interface)
// @limit(lines: 150)
// @contract(IHomeViewProps, IHomeViewEvents, HomeViewContract)
// @desc(Contrato público de datos y eventos para el módulo HomeView)
// @pca:end

/**
 * FIDA - Interface Layer (I)
 *
 * Contract for: HomeView
 * Created: 2026-10-31
 *
 * Define estrictamente qué datos entran (Props) y qué eventos salen (Events).
 * ⚠️ Nivel de Impacto FIDA: ALTO (+50 pts) — Cambios aquí disparan el WAL documental.
 */

export interface IHomeViewProps {
  title?: string;
}

export interface IHomeViewEvents {
  onAction?: () => void;
}

export type HomeViewContract = IHomeViewProps & IHomeViewEvents;
