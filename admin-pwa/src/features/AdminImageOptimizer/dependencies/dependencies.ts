// @pca:start
// @id(feature.adminimageoptimizer.dependencies)
// @kind(dependencies)
// @limit(lines: 100)
// @contract(gateway: external imports and adapters for AdminImageOptimizer)
// @relates(feature.adminimageoptimizer.interface)
// @desc(Aduana de importaciones externas y adaptadores del modulo AdminImageOptimizer)
// @pca:end

/**
 * FIDA - Dependencies Layer (D)
 * Aduana de importaciones autorizadas para AdminImageOptimizer.
 */

export { useState, useRef, useCallback, useEffect } from "react";
export type { ChangeEvent, DragEvent } from "react";

export {
  Upload,
  Image as ImageIcon,
  Check,
  RefreshCw,
  AlertCircle,
  Link as LinkIcon,
  FileCheck,
  Sliders,
} from "lucide-react";

export type {
  ImageOptimizationResult,
  IAdminImageOptimizerProps,
  IAdminImageOptimizerEvents,
  AdminImageOptimizerContract,
} from "../interfaces/AdminImageOptimizer.types";
