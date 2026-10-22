import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export function ClienteLayout() {
  return (
    <div className="flex min-h-screen flex-col [container-type:inline-size]">
      <Navbar />
      {/* Padding del contenedor: movil 1.75rem/1rem/3rem, desktop 2.5rem/1.5rem/4rem.
          El hero de la Home compensa este `padding-top` con un margen negativo
          (ver components/domain/HeroHome.tsx). */}
      <main className="flex-1 px-4 pb-12 pt-7 sm:px-6 sm:pb-16 sm:pt-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}