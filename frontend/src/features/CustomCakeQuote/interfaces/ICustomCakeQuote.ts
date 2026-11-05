/**
 * Module Public Contract
 *
 * Contract for: CustomCakeQuote
 * Created: 2026-10-31
 *
 * Define estrictamente qué datos entran (Props) y qué eventos salen (Events).
 */

export interface ICustomCakeQuoteProps {
  portions: number;
  selectedFlavorsCount: number;
  estimatedAmount: number;
}

export type CustomCakeQuoteContract = ICustomCakeQuoteProps;
