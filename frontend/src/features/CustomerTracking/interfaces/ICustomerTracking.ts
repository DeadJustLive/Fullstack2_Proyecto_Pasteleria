/**
 * Module Public Contract
 *
 * Contract for: CustomerTracking
 * Created: 2026-10-31
 *
 * Define estrictamente qué datos entran (Props) y qué eventos salen (Events).
 */

export interface ICustomerTrackingProps {
  trackingCode: string;
  orderStatus: string;
  deliveryType: "RETIRO" | "DELIVERY";
}

export type CustomerTrackingContract = ICustomerTrackingProps;
