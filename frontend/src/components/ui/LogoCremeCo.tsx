// @pca:start
// @id(frontend.ui.logoCremeCo)
// @kind(component)
// @limit(lines: 120)
// @contract(props: className)
// @relates(docs.reglas_ui)
// @desc(Logotipo SVG inline de Crème & Co (decorativo, id unico con useId))
// @pca:end
import { useId } from "react";
import { cn } from "@/lib/utils";

export interface LogoCremeCoProps {
  className?: string;
}

/**
 * Logotipo de Crème & Co (SVG en linea).
 *
 * - Es decorativo: se exporta con `aria-hidden` porque el nombre de la marca
 *   ya aparece como texto en el Navbar. Un lector de pantalla no debe leer
 *   dos veces la misma marca.
 * - El `id` del degradado se genera con `useId()` para que dos instancias en
 *   la misma pagina no colisionen (SVG inline comparte el documento).
 */
export function LogoCremeCo({ className }: LogoCremeCoProps) {
  // `useId()` devuelve ids con ":" (p. ej. ":r1:"), que no son validos dentro de
  // un fragmento `url(#...)`. Se filtran para dejar solo caracteres alfanumericos.
  const gradientId = `creme-logo-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 300"
      width="100%"
      role="img"
      aria-hidden="true"
      focusable="false"
      style={{ filter: "drop-shadow(0px 8px 16px rgba(0,0,0,0.5))" }}
      className={cn("h-auto w-full", className)}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD9DF" />
          <stop offset="100%" stopColor="#FFC0CB" />
        </linearGradient>
      </defs>
      <circle
        cx="200"
        cy="150"
        r="140"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="2"
        opacity="0.8"
      />
      <circle
        cx="200"
        cy="150"
        r="125"
        fill="none"
        stroke="#FFF5E1"
        strokeWidth="1"
        strokeDasharray="4 4"
        opacity="0.5"
      />
      <text
        x="50%"
        y="45%"
        fontFamily="'Be Vietnam Pro', sans-serif"
        fontWeight="700"
        fontSize="52"
        fill={`url(#${gradientId})`}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        Crème &amp; Co
      </text>
      <text
        x="50%"
        y="60%"
        fontFamily="'Source Sans 3', sans-serif"
        fontWeight="600"
        fontSize="14"
        fill="#FFF5E1"
        textAnchor="middle"
        letterSpacing="6"
      >
        ARTISANAL BAKERY
      </text>
      <path
        d="M 200 210 L 205 220 L 215 225 L 205 230 L 200 240 L 195 230 L 185 225 L 195 220 Z"
        fill={`url(#${gradientId})`}
        opacity="0.9"
      />
      <path
        d="M 200 60 L 205 70 L 215 75 L 205 80 L 200 90 L 195 80 L 185 75 L 195 70 Z"
        fill={`url(#${gradientId})`}
        opacity="0.9"
      />
    </svg>
  );
}
