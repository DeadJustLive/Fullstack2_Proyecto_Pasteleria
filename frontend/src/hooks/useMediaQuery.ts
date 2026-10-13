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
