// @pca:start
// @id(feature.customcakequote.interface)
// @kind(interface)
// @limit(lines: 150)
// @contract(ICustomCakeQuoteProps, CustomCakeQuoteContract)
// @desc(Contrato público de datos y eventos para el módulo FIDA CustomCakeQuote)
// @pca:end

/**
 * FIDA - Interface Layer (I)
 *
 * Contract for: CustomCakeQuote
 * Created: 2026-10-31
 *
 * Define estrictamente qué datos entran (Props) y qué eventos salen (Events).
 * ⚠️ Nivel de Impacto FIDA: ALTO (+60 pts) — Cambios aquí disparan el WAL documental.
 */

export interface ICustomCakeQuoteProps {
  portions: number;
  selectedFlavorsCount: number;
  estimatedAmount: number;
}

export type CustomCakeQuoteContract = ICustomCakeQuoteProps;
