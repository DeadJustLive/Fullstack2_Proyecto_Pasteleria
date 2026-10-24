// Grafico de linea con area, hecho en SVG (sin dependencias externas).
import { useId, useState } from "react";
import { formatPrecio } from "@/lib/utils";

interface GraficoVentasProps {
  etiquetas: string[];
  valores: number[];
}

const ANCHO = 600;
const ALTO = 260;
const MARGEN = { arriba: 16, derecha: 16, abajo: 32, izquierda: 52 };
const TICKS = 4;

// Redondea el maximo hacia arriba a un valor "bonito" para el eje Y.
function maximoRedondo(valor: number) {
  const base = 10 ** Math.floor(Math.log10(Math.max(valor, 1)));
  return Math.ceil(valor / base) * base;
}

function formatoEje(valor: number) {
  if (valor === 0) return "$0";
  if (valor >= 1_000_000) return `$${(valor / 1_000_000).toLocaleString("es-CL")}M`;
  return `$${Math.round(valor / 1000)}k`;
}

export function GraficoVentas({ etiquetas, valores }: GraficoVentasProps) {
  const idGradiente = useId();
  const [activo, setActivo] = useState<number | null>(null);

  const maximo = maximoRedondo(Math.max(...valores));
  const anchoUtil = ANCHO - MARGEN.izquierda - MARGEN.derecha;
  const altoUtil = ALTO - MARGEN.arriba - MARGEN.abajo;
  const paso = valores.length > 1 ? anchoUtil / (valores.length - 1) : 0;

  const x = (i: number) => MARGEN.izquierda + i * paso;
  const y = (v: number) => MARGEN.arriba + altoUtil - (v / maximo) * altoUtil;

  const puntos = valores.map((v, i) => `${x(i)},${y(v)}`);
  const linea = `M ${puntos.join(" L ")}`;
  const area = `${linea} L ${x(valores.length - 1)},${y(0)} L ${x(0)},${y(0)} Z`;
  const total = valores.reduce((acc, v) => acc + v, 0);

  return (
    <svg
      viewBox={`0 0 ${ANCHO} ${ALTO}`}
      role="img"
      aria-label={`Tendencia de ventas: ${formatPrecio(total)} en total`}
      className="h-auto w-full"
    >
      <defs>
        <linearGradient id={idGradiente} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8b4513" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#8b4513" stopOpacity="0" />
        </linearGradient>
      </defs>

      {Array.from({ length: TICKS + 1 }, (_, i) => {
        const valor = (maximo / TICKS) * i;
        return (
          <g key={i}>
            <line
              x1={MARGEN.izquierda}
              x2={ANCHO - MARGEN.derecha}
              y1={y(valor)}
              y2={y(valor)}
              stroke="#8b4513"
              strokeOpacity="0.08"
            />
            <text
              x={MARGEN.izquierda - 8}
              y={y(valor) + 4}
              textAnchor="end"
              fontSize="11"
              fill="#a38f85"
            >
              {formatoEje(valor)}
            </text>
          </g>
        );
      })}

      <path d={area} fill={`url(#${idGradiente})`} />
      <path
        d={linea}
        fill="none"
        stroke="#8b4513"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {valores.map((v, i) => (
        <g key={etiquetas[i]}>
          <text x={x(i)} y={ALTO - 10} textAnchor="middle" fontSize="11" fill="#a38f85">
            {etiquetas[i]}
          </text>
          <circle
            cx={x(i)}
            cy={y(v)}
            r={activo === i ? 7 : 5}
            fill="#8b4513"
            stroke="#fff"
            strokeWidth="2"
          />
          {/* Zona de interaccion: cubre toda la columna del punto */}
          <rect
            x={x(i) - Math.max(paso, 40) / 2}
            y={MARGEN.arriba}
            width={Math.max(paso, 40)}
            height={altoUtil}
            fill="transparent"
            tabIndex={0}
            role="img"
            aria-label={`${etiquetas[i]}: ${formatPrecio(v)}`}
            onMouseEnter={() => setActivo(i)}
            onMouseLeave={() => setActivo(null)}
            onFocus={() => setActivo(i)}
            onBlur={() => setActivo(null)}
            className="outline-none"
          />
        </g>
      ))}

      {activo !== null && (
        <g pointerEvents="none">
          <rect
            x={Math.min(Math.max(x(activo) - 50, 4), ANCHO - 104)}
            y={Math.max(y(valores[activo]) - 40, 2)}
            width="100"
            height="26"
            rx="6"
            fill="#fff"
            stroke="#8b4513"
            strokeOpacity="0.2"
          />
          <text
            x={Math.min(Math.max(x(activo), 54), ANCHO - 54)}
            y={Math.max(y(valores[activo]) - 23, 19)}
            textAnchor="middle"
            fontSize="12"
            fontWeight="700"
            fill="#8b4513"
          >
            {formatPrecio(valores[activo])}
          </text>
        </g>
      )}
    </svg>
  );
}
