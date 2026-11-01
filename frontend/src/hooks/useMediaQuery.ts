// @pca:start
// @id(frontend.hooks.usemediaquery)
// @kind(component)
// @limit(lines: 200)
// @contract(useMediaQuery)
// @desc(Archivo component auto-registrado por FIDA/OPL bootstrap (useMediaQuery.ts))
// @pca:end
import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [coincide, setCoincide] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    const media = window.matchMedia(query);
    const manejarCambio = () => setCoincide(media.matches);

    manejarCambio();
    media.addEventListener("change", manejarCambio);
    return () => media.removeEventListener("change", manejarCambio);
  }, [query]);

  return coincide;
}
