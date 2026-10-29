import { Route, Routes } from "react-router-dom";
import { AdminLayout } from "@/layouts/AdminLayout";
import { ClienteLayout } from "@/layouts/ClienteLayout";
import { Placeholder } from "@/pages/Placeholder";
import { Pos } from "@/pages/admin/Pos";
import { Blog } from "@/pages/cliente/Blog";
import { BlogDetalle } from "@/pages/cliente/BlogDetalle";
import { Carrito } from "@/pages/cliente/Carrito";
import { Catalogo } from "@/pages/cliente/Catalogo";
import { Checkout } from "@/pages/cliente/Checkout";
import { Confirmacion } from "@/pages/cliente/Confirmacion";
import { FlowGateway } from "@/pages/cliente/pago/FlowGateway";
import { Home } from "@/pages/cliente/Home";
import { Login } from "@/pages/cliente/Login";
import { Registro } from "@/pages/cliente/Registro";
import { PagoError } from "@/pages/cliente/pago/Error";
import { PagoExito } from "@/pages/cliente/pago/Exito";
import { PagoPendiente } from "@/pages/cliente/pago/Pendiente";
import { Perfil } from "@/pages/cliente/Perfil";
import { PerfilSeguimiento } from "@/pages/cliente/PerfilSeguimiento";
import { Personalizacion } from "@/pages/cliente/Personalizacion";
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
        <Route path="envio" element={<PerfilSeguimiento />} />
        <Route path="blog" element={<Blog />} />
        <Route path="blog/:slug" element={<BlogDetalle />} />
        <Route path="personalizacion" element={<Personalizacion />} />
        <Route path="confirmacion" element={<Confirmacion />} />
        <Route path="pago/flow-gateway" element={<FlowGateway />} />
        <Route path="pago/exito" element={<PagoExito />} />
        <Route path="pago/error" element={<PagoError />} />
        <Route path="pago/pendiente" element={<PagoPendiente />} />
        <Route path="login" element={<Login />} />
        <Route path="registro" element={<Registro />} />
        <Route path="perfil" element={<Perfil />} />
        <Route path="perfil/pedidos" element={<PerfilSeguimiento />} />
        <Route path="perfil/seguimiento" element={<PerfilSeguimiento />} />
        <Route path="perfil/seguimiento/:id" element={<PerfilSeguimiento />} />
      </Route>

      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<Placeholder title="Panel PWA de Administración" description="La aplicación de administración se ejecuta de forma independiente en su propia carpeta admin-pwa/ con Bootstrap 5 y CSS." owner="Anais" />} />
        <Route path="pos" element={<Pos />} />
      </Route>

      <Route path="*" element={<Placeholder title="404" description="Página no encontrada." />} />
    </Routes>
  );
}

export default App;
