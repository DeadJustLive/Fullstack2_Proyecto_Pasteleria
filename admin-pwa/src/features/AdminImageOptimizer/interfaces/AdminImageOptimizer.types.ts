/**
 * Module Public Contract
 * Modulo: AdminImageOptimizer
 */

export interface ImageOptimizationResult {
  dataUrl: string;
  format: string; // 'image/webp'
  originalSizeKb: number;
  optimizedSizeKb: number;
  savingsPercent: number;
  width: number;
  height: number;
}

export interface IAdminImageOptimizerProps {
  value?: string;
  initialUrl?: string;
  label?: string;
  maxWidth?: number; // default: 800
  quality?: number; // default: 0.78
  disabled?: boolean;
}

export interface IAdminImageOptimizerEvents {
  onImageReady?: (dataUrl: string, result?: ImageOptimizationResult) => void;
  onChange?: (value: string) => void;
  onReset?: () => void;
}

export type AdminImageOptimizerContract = IAdminImageOptimizerProps & IAdminImageOptimizerEvents;
