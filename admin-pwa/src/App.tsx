import { Routes, Route } from "react-router-dom";
import { AdminLayout } from "./layouts/AdminLayout";
import { Dashboard } from "./pages/Dashboard";
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
