// @pca:start
// @id(admin.feature.rbacmatrix.dependencies)
// @kind(dependencies)
// @limit(lines: 120)
// @contract(gateway: external imports and adapters for AdminRbacMatrix)
// @relates(admin.feature.rbacmatrix.interface)
// @desc(Aduana de importaciones externas y adaptadores del módulo AdminRbacMatrix)
// @pca:end

/**
 * FIDA - Dependencies Layer (D)
 *
 * Import Gateway ("Aduana") for: AdminRbacMatrix
 * Created: 2026-10-31
 *
 * Único punto de entrada para librerías externas, componentes globales o servicios.
 * Ningún archivo en implementation/ o components/ puede importar del exterior sin pasar por aquí.
 */

export type {
  RbacSecurityLevel,
  IAdminRbacMatrixProps,
  IAdminRbacMatrixEvents,
  AdminRbacMatrixContract,
} from "../interfaces/IAdminRbacMatrix";

// === Iconos Autorizados ===
export { KeyRound, Lock, ShieldCheck } from "lucide-react";
