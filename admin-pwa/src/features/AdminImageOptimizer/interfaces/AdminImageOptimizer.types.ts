// @pca:start
// @id(feature.adminimageoptimizer.interface)
// @kind(interface)
// @limit(lines: 100)
// @contract(ImageOptimizationResult, IAdminImageOptimizerProps, IAdminImageOptimizerEvents, AdminImageOptimizerContract)
// @desc(Contrato e interfaces de tipos para el optimizador de imagenes WebP AdminImageOptimizer)
// @pca:end

/**
 * FIDA - Interface Layer (I)
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
