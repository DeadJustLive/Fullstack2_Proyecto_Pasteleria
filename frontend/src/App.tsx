// @pca:start
// @id(frontend.app)
// @kind(component)
// @limit(lines: 200)
// @desc(Archivo component auto-registrado por FIDA/OPL bootstrap (App.tsx))
// @pca:end
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { ClienteLayout } from "@/layouts/ClienteLayout";
import { Placeholder } from "@/pages/Placeholder";
import { Blog } from "@/pages/Blog";
import { BlogDetalle } from "@/pages/BlogDetalle";
import { Carrito } from "@/pages/Carrito";
import { Catalogo } from "@/pages/Catalogo";
import { Checkout } from "@/pages/Checkout";
import { Confirmacion } from "@/pages/Confirmacion";
import { Contacto } from "@/pages/Contacto";
import { FlowGateway } from "@/pages/pago/FlowGateway";
import { Home } from "@/pages/Home";
import { Login } from "@/pages/Login";
import { Nosotros } from "@/pages/Nosotros";
import { Ofertas } from "@/pages/Ofertas";
import { PagoError } from "@/pages/pago/Error";
import { PagoExito } from "@/pages/pago/Exito";
import { PagoPendiente } from "@/pages/pago/Pendiente";
import { Perfil } from "@/pages/Perfil";
import { PerfilSeguimiento } from "@/pages/PerfilSeguimiento";
import { Personalizacion } from "@/pages/Personalizacion";
import { ProductoDetalle } from "@/pages/ProductoDetalle";
import { Registro } from "@/pages/Registro";

function CategoriaSlugRedirect() {
  const { slug } = useParams<{ slug: string }>();
  return <Navigate to={slug ? `/catalogo?categoria=${encodeURIComponent(slug)}` : "/catalogo"} replace />;
}

function App() {
  return (
    <Routes>
      <Route element={<ClienteLayout />}>
        <Route index element={<Home />} />
        <Route path="catalogo" element={<Catalogo />} />
        <Route path="categorias" element={<Navigate to="/catalogo" replace />} />
        <Route path="categorias/:slug" element={<CategoriaSlugRedirect />} />
        <Route path="ofertas" element={<Ofertas />} />
        <Route path="producto/:id" element={<ProductoDetalle />} />
        <Route path="carrito" element={<Carrito />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="envio" element={<PerfilSeguimiento />} />
        <Route path="blog" element={<Blog />} />
        <Route path="blog/:slug" element={<BlogDetalle />} />
        <Route path="nosotros" element={<Nosotros />} />
        <Route path="contacto" element={<Contacto />} />
        <Route path="personalizacion" element={<Personalizacion />} />
        <Route path="confirmacion" element={<Confirmacion />} />
        <Route path="pago/flow-gateway" element={<FlowGateway />} />
        <Route path="pago/exito" element={<PagoExito />} />
        <Route path="pago/error" element={<PagoError />} />
        <Route path="pago/pendiente" element={<PagoPendiente />} />
        <Route path="login" element={<Login />} />
        <Route path="registro" element={<Registro />} />
        <Route path="perfil" element={<Perfil />} />
        <Route path="perfil/pedidos" element={<Navigate to="/perfil#pedidos" replace />} />
        <Route path="perfil/seguimiento" element={<PerfilSeguimiento />} />
        <Route path="perfil/seguimiento/:id" element={<PerfilSeguimiento />} />
      </Route>

      <Route
        path="admin"
        element={
          <div className="mx-auto max-w-page p-6">
            <Placeholder
              title="Panel PWA de Administración Desacoplado"
              description="La aplicación de administración se ejecuta de forma independiente en http://localhost:5174 (carpeta admin-pwa/) con Bootstrap 5, POS táctil y boletas oficiales SII."
              owner="Anais"
            />
          </div>
        }
      />

      <Route path="*" element={<Placeholder title="404" description="Página no encontrada." />} />
    </Routes>
  );
}

export default App;
