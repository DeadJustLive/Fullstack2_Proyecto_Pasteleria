// @pca:start
// @id(frontend.pages.cliente.categorias)
// @kind(page)
// @limit(lines: 100)
// @contract(CategoriasView())
// @relates(frontend.pages.cliente.catalogo)
// @relates(docs.reglas_ui)
// @desc(Redireccion unificada hacia la Fase 1 del Catalogo con tipos de compatibilidad)
// @pca:end
import { Navigate } from "react-router-dom";

export interface CategoriaItem {
  slug: string;
  nombre: string;
  descripcion: string;
  imagen: string;
  tags?: string[];
  activo?: boolean;
}

export const FALLBACK_CATEGORIAS: CategoriaItem[] = [
  {
    slug: "torta",
    nombre: "Tortas",
    descripcion: "Bizcochos húmedos y aromáticos, capas de ganache belga y dulce de leche.",
    imagen: "/imagen/chocolate.jpg",
    tags: ["Torta Ópera", "Chocolate Belga"],
  },
  {
    slug: "tartaleta",
    nombre: "Tartaletas",
    descripcion: "Base crocante de masa sablée con crema pastelera y frutas frescas.",
    imagen: "/imagen/tartaleta.jpg",
    tags: ["Limón Merengue", "Frutos Rojos"],
  },
  {
    slug: "cheesecake",
    nombre: "Cheesecakes",
    descripcion: "Textura densa y suave al estilo New York con coulis de frutos silvestres.",
    imagen: "/imagen/cheesecake.jpg",
    tags: ["New York Style", "Frutos Rojos"],
  },
  {
    slug: "pastel",
    nombre: "Pasteles y Bollería",
    descripcion: "Pasteles de zanahoria, tres leches y bocados individuales diarios.",
    imagen: "/imagen/tres_leches.jpg",
    tags: ["Tres Leches", "Zanahoria"],
  },
  {
    slug: "pancakes",
    nombre: "Sin Gluten",
    descripcion: "Preparaciones 100% certificadas sin trigo, con harinas de almendras y arroz.",
    imagen: "/imagen/pancakes.webp",
    tags: ["Pancakes", "100% Gluten Free"],
  },
];

export function Categorias() {
  return <Navigate to="/catalogo" replace />;
}
