// @pca:start
// @id(frontend.ui.backToTop)
// @kind(component)
// @limit(lines: 80)
// @contract(sin props)
// @relates(frontend.ui.button)
// @relates(frontend.layouts.clienteLayout)
// @relates(docs.reglas_ui)
// @desc(Boton flotante que vuelve al inicio de la pagina (aparece al desplazar))
// @pca:end
import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/** Pixels de scroll a partir de los cuales aparece el boton. */
const UMBRAL_APARICION = 400;

/**
 * Boton flotante que devuelve al inicio de la pagina.
 *
 * - Aparece cuando ya se ha bajado una distancia apreciable y se oculta solo:
 *   mientras esta oculto no es focusable (`tabIndex={-1}`) ni queda en el arbol
 *   de accesibilidad (`aria-hidden`), asi que no molesta al navegar con teclado.
 * - El scroll respeta `prefers-reduced-motion`: con la preferencia activada
 *   salta de golpe en vez de deslizarse.
 * - Se monta en `layouts/ClienteLayout.tsx`, asi que aparece en todas las
 *   paginas del sitio del cliente.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const alDesplazar = () => setVisible(window.scrollY > UMBRAL_APARICION);

    alDesplazar();
    window.addEventListener("scroll", alDesplazar, { passive: true });

    return () => window.removeEventListener("scroll", alDesplazar);
  }, []);

  const subirAlInicio = () => {
    const suave = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: suave ? "smooth" : "auto" });
  };

  return (
    <Button
      type="button"
      variant="primary"
      size="icon"
      onClick={subirAlInicio}
      aria-label="Volver al inicio de la página"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={cn(
        "fixed bottom-4 right-4 z-50 shadow-[0_8px_20px_rgba(0,0,0,0.25)] sm:bottom-6 sm:right-6",
        "transition-[opacity,transform] duration-300 motion-reduce:transition-none",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
      )}
    >
      <ArrowUp size={22} aria-hidden="true" />
    </Button>
  );
}
