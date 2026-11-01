// @pca:start
// @id(frontend.types.ticket)
// @kind(component)
// @limit(lines: 200)
// @contract(ItemTicket)
// @desc(Archivo component auto-registrado por FIDA/OPL bootstrap (ticket.ts))
// @pca:end
import type { Producto } from "@/types/product";

export interface ItemTicket {
  producto: Producto;
  cantidad: number;
}
