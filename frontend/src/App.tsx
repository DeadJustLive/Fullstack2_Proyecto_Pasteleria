import { Route, Routes } from "react-router-dom";
import { AdminLayout } from "@/layouts/AdminLayout";
import { ClienteLayout } from "@/layouts/ClienteLayout";
import { Placeholder } from "@/pages/Placeholder";
import { Pos } from "@/pages/admin/Pos";
import { Carrito } from "@/pages/cliente/Carrito";
import { Catalogo } from "@/pages/cliente/Catalogo";
import { Checkout } from "@/pages/cliente/Checkout";
import { Home } from "@/pages/cliente/Home";

function App() {
  return (
    <Routes>
      <Route element={<ClienteLayout />}>
        <Route index element={<Home />} />
        <Route path="catalogo" element={<Catalogo />} />
        <Route path="producto/:id" element={<Placeholder title="Detalle de Producto" owner="Anais" />} />
        <Route path="carrito" element={<Carrito />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="envio" element={<Placeholder title="Seguimiento de Envío" owner="Anais" />} />
        <Route path="confirmacion" element={<Placeholder title="Confirmación" owner="Anais" />} />
        <Route path="login" element={<Placeholder title="Iniciar Sesión" owner="Nicolas" />} />
        <Route path="registro" element={<Placeholder title="Registro" owner="Nicolas" />} />
        <Route path="perfil" element={<Placeholder title="Mi Perfil" owner="Anais" />} />
      </Route>

      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<Placeholder title="Dashboard" owner="Anais" />} />
        <Route path="pos" element={<Pos />} />
        <Route path="pedidos" element={<Placeholder title="Pedidos" owner="Nicolas" />} />
        <Route path="inventario" element={<Placeholder title="Inventario" owner="Nicolas" />} />
        <Route path="usuarios" element={<Placeholder title="Usuarios" owner="Nicolas" />} />
        <Route path="configuracion" element={<Placeholder title="Configuración" owner="Anais" />} />
      </Route>

      <Route path="*" element={<Placeholder title="404" description="Página no encontrada." />} />
    </Routes>
  );
}

export default App;
