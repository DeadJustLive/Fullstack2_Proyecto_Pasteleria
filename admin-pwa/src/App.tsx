// @pca:start
// @id(admin_pwa.app)
// @kind(component)
// @limit(lines: 200)
// @contract(App)
// @relates(admin_pwa.layouts.adminlayout)
// @relates(admin.pages.dashboard)
// @relates(admin.pages.reportes)
// @relates(admin.pages.perfil)
// @relates(admin.pages.productos)
// @relates(admin.pages.categorias)
// @relates(admin.pages.inventario)
// @relates(admin.pages.usuarios)
// @relates(admin.pages.promociones)
// @relates(admin.pages.pos)
// @relates(admin.pages.ordenes)
// @relates(admin_pwa.pages.componentesshowcase)
// @relates(admin.pages.loginAdmin)
// @desc(Archivo component auto-registrado por FIDA/OPL bootstrap (App.tsx))
// @pca:end
import { Routes, Route } from "react-router-dom";
import { AdminLayout } from "./layouts/AdminLayout";
import { Dashboard } from "./pages/Dashboard";
import { Reportes } from "./pages/Reportes";
import { PerfilAdmin } from "./pages/PerfilAdmin";
import { Productos } from "./pages/Productos";
import { Categorias } from "./pages/Categorias";
import { Inventario } from "./pages/Inventario";
import { Usuarios } from "./pages/Usuarios";
import { Promociones } from "./pages/Promociones";
import { Pos } from "./pages/Pos";
import { Ordenes } from "./pages/Ordenes";
import { ComponentesShowcase } from "./pages/ComponentesShowcase";
import { LoginAdmin } from "./pages/LoginAdmin";

export function App() {
  return (
    <Routes>
      <Route path="login" element={<LoginAdmin />} />
      <Route element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="reportes" element={<Reportes />} />
        <Route path="perfil" element={<PerfilAdmin />} />
        <Route path="productos" element={<Productos />} />
        <Route path="categorias" element={<Categorias />} />
        <Route path="inventario" element={<Inventario />} />
        <Route path="ordenes" element={<Ordenes />} />
        <Route path="usuarios" element={<Usuarios />} />
        <Route path="promociones" element={<Promociones />} />
        <Route path="pos" element={<Pos />} />
        <Route path="componentes" element={<ComponentesShowcase />} />
      </Route>
    </Routes>
  );
}

export default App;
