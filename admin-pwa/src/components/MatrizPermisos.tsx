// @pca:start
// @id(admin.components.matrizPermisos)
// @kind(component)
// @limit(lines: 150)
// @contract(MatrizPermisos())
// @relates(admin.pages.usuarios)
// @desc(Tabla referencial de roles y privilegios del sistema)
// @pca:end
import React from "react";
import { Check, Lock } from "lucide-react";

interface PermisoItem {
  modulo: string;
  desc: string;
  roles: string[];
}

const MATRIZ_PERMISOS: PermisoItem[] = [
  { modulo: "Dashboard & Reportes", desc: "Ver recaudación diaria, tickets y rankings", roles: ["ADMIN", "PASTELERO"] },
  { modulo: "Catálogo & Precios", desc: "Crear tortas, cambiar precios y pausar web", roles: ["ADMIN", "PASTELERO"] },
  { modulo: "KDS Pantalla de Cocina", desc: "Avanzar estados y ver recetas de tortas", roles: ["ADMIN", "PASTELERO"] },
  { modulo: "Control de Inventario", desc: "Ajustar existencias físicas y registrar pérdidas", roles: ["ADMIN", "PASTELERO"] },
  { modulo: "Punto de Venta POS & Despacho", desc: "Cobro de tickets en mostrador y entregas", roles: ["ADMIN", "REPARTIDOR"] },
  { modulo: "Usuarios & Roles RBAC", desc: "Designar roles, cambiar accesos y auditoría", roles: ["ADMIN"] },
];

export const MatrizPermisos: React.FC = () => {
  return (
    <div className="card admin-card p-4">
      <div className="mb-3">
        <h4 className="brand-font fs-5 text-secondary mb-1">Matriz de Privilegios por Perfil</h4>
        <span className="text-muted small">Reglas de acceso aplicadas a endpoints en Spring Boot y vistas PWA</span>
      </div>
      <div className="table-responsive">
        <table className="table table-bordered table-hover admin-table align-middle text-center small mb-0">
          <thead>
            <tr>
              <th className="text-start ps-3">Módulo Funcional</th>
              <th className="text-start">Descripción</th>
              <th>Admin</th>
              <th>Pastelero</th>
              <th>Repartidor</th>
              <th>Cliente</th>
            </tr>
          </thead>
          <tbody>
            {MATRIZ_PERMISOS.map((p) => (
              <tr key={p.modulo}>
                <td className="text-start ps-3 fw-bold text-secondary">{p.modulo}</td>
                <td className="text-start text-muted">{p.desc}</td>
                <td><Check className="text-success mx-auto" size={18} /></td>
                <td>{p.roles.includes("PASTELERO") ? <Check className="text-success mx-auto" size={18} /> : <Lock className="text-muted opacity-50 mx-auto" size={14} />}</td>
                <td>{p.roles.includes("REPARTIDOR") ? <Check className="text-success mx-auto" size={18} /> : <Lock className="text-muted opacity-50 mx-auto" size={14} />}</td>
                <td><Lock className="text-muted opacity-50 mx-auto" size={14} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
