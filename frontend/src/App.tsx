import { Route, Routes } from "react-router-dom";
import { AdminLayout } from "@/layouts/AdminLayout";
import { ClienteLayout } from "@/layouts/ClienteLayout";
import { Placeholder } from "@/pages/Placeholder";
import { Configuracion } from "@/pages/admin/Configuracion";
import { Dashboard } from "@/pages/admin/Dashboard";
import { Pos } from "@/pages/admin/Pos";
import { Carrito } from "@/pages/cliente/Carrito";
import { Catalogo } from "@/pages/cliente/Catalogo";
import { Checkout } from "@/pages/cliente/Checkout";
import { Confirmacion } from "@/pages/cliente/Confirmacion";
import { Envio } from "@/pages/cliente/Envio";
import { Home } from "@/pages/cliente/Home";
import { Perfil } from "@/pages/cliente/Perfil";
import { ProductoDetalle } from "@/pages/cliente/ProductoDetalle";

function App() {
  return (
    <Routes>
      <Route element={<ClienteLayout />}>
        <Route index element={<Home />} />
        <Route path="catalogo" element={<Catalogo />} />
        <Route path="producto/:id" element={<ProductoDetalle />} />
        <Route path="carrito" element={<Carrito />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="envio" element={<Envio />} />
        <Route path="envio/:id" element={<Envio />} />
        <Route path="confirmacion" element={<Confirmacion />} />
        <Route path="login" element={<Placeholder title="Iniciar Sesión" owner="Nicolas" />} />
        <Route path="registro" element={<Placeholder title="Registro" owner="Nicolas" />} />
        <Route path="perfil" element={<Perfil />} />
      </Route>

      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="pos" element={<Pos />} />
        <Route path="pedidos" element={<Placeholder title="Pedidos" owner="Nicolas" />} />
        <Route path="inventario" element={<Placeholder title="Inventario" owner="Nicolas" />} />
        <Route path="usuarios" element={<Placeholder title="Usuarios" owner="Nicolas" />} />
        <Route path="configuracion" element={<Configuracion />} />
      </Route>

      <Route path="*" element={<Placeholder title="404" description="Página no encontrada." />} />
    </Routes>
  );
}

export default App;
