// @pca:start
// @id(interfaces.index)
// @kind(model)
// @limit(lines: 30)
// @contract(export *)
// @relates(interfaces.entity.common)
// @relates(interfaces.entity.user)
// @relates(interfaces.entity.rbac)
// @relates(interfaces.entity.catalog)
// @relates(interfaces.entity.order)
// @relates(interfaces.entity.payment)
// @relates(interfaces.entity.inventory)
// @relates(interfaces.entity.blog)
// @relates(interfaces.entity.audit)
// @desc(Barril central de exportacion para todas las interfaces de dominio)
// @pca:end
/**
 * @file index.ts
 * @description Punto de entrada unificado para todas las interfaces y entidades del backend y base de datos.
 */

export * from "./common.entity";
export * from "./user.entity";
export * from "./rbac.entity";
export * from "./catalog.entity";
export * from "./order.entity";
export * from "./payment.entity";
export * from "./inventory.entity";
export * from "./blog.entity";
export * from "./audit.entity";
