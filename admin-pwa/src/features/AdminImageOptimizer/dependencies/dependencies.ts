/**
 * Module Dependencies Gateway
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
