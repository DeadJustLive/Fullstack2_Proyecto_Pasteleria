// @pca:start
// @id(frontend.layouts.clienteLayout)
// @kind(component)
// @limit(lines: 120)
// @contract(sin props (shell de las rutas de cliente): Navbar + main + Footer)
// @relates(frontend.pages.cliente.home)
// @relates(docs.reglas_ui)
// @desc(Shell del cliente: define el padding y el ancho del main (max-w-full + xl:max-w-page))
// @pca:end
import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export function ClienteLayout() {
  return (
    <div className="flex min-h-screen flex-col [container-type:inline-size]">
      <Navbar />
      {/* Padding del contenedor: movil 1.75rem/1rem/3rem, desktop 2.5rem/1.5rem/4rem.
          El hero de la Home compensa este `padding-top` con un margen negativo
          (ver components/domain/HeroHome.tsx).

          `max-w-full` + `xl:max-w-page`: el snapshot aplica `main { max-width: 1080px;
          margin: 0 auto }`. Como `main` es flex item de una columna, el `margin-inline:
          auto` anula el estirado y lo dimensiona por su contenido (fit-content); el
          marquee (width:max-content) lo inflaba a 1080px y el hero full-bleed se
          empujaba fuera del viewport en cualquier pantalla menor a 1080px.
          `max-w-full` fija el ancho al viewport y `xl:max-w-page` recupera el tope
          de 1080px desde 1280px, donde ya cabe. Ver FRONT-013. */}
      <main className="max-w-full flex-1 px-4 pb-12 pt-7 sm:px-6 sm:pb-16 sm:pt-10 xl:max-w-page">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
