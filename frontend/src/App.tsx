import { Navigate, Route, Routes } from "react-router-dom";
import { RutaAdmin } from "@/components/domain/auth/RutaAdmin";
import { AdminLayout } from "@/layouts/AdminLayout";
import { ClienteLayout } from "@/layouts/ClienteLayout";
import { Placeholder } from "@/pages/Placeholder";
import { Configuracion } from "@/pages/admin/Configuracion";
import { Dashboard } from "@/pages/admin/Dashboard";
import { Inventario } from "@/pages/admin/Inventario";
import { Pedidos } from "@/pages/admin/Pedidos";
import { Pos } from "@/pages/admin/Pos";
import { Usuarios } from "@/pages/admin/Usuarios";
import { Carrito } from "@/pages/cliente/Carrito";
import { Catalogo } from "@/pages/cliente/Catalogo";
import { Checkout } from "@/pages/cliente/Checkout";
import { Confirmacion } from "@/pages/cliente/Confirmacion";
import { Envio } from "@/pages/cliente/Envio";
import { Home } from "@/pages/cliente/Home";
import { Login } from "@/pages/cliente/Login";
import { Perfil } from "@/pages/cliente/Perfil";
import { ProductoDetalle } from "@/pages/cliente/ProductoDetalle";
import { Registro } from "@/pages/cliente/Registro";

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
        <Route path="login" element={<Login />} />
        <Route path="registro" element={<Registro />} />
        <Route path="perfil" element={<Perfil />} />
      </Route>

      <Route path="admin" element={<RutaAdmin />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Navigate to="/admin" replace />} />
          <Route path="pos" element={<Pos />} />
          <Route path="pedidos" element={<Pedidos />} />
          <Route path="inventario" element={<Inventario />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="configuracion" element={<Configuracion />} />
        </Route>
      </Route>

      <Route path="*" element={<Placeholder title="404" description="Página no encontrada." />} />
    </Routes>
  );
}

export default App;
