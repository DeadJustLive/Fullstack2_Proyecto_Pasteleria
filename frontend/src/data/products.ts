import type { BadgeTipo, Producto } from "@/types/product";

export const BADGE_LABEL: Record<BadgeTipo, string> = {
  premium: "★ Premium",
  temporada: "Temporada",
  vendido: "Más vendido",
  personalizable: "Personalizable",
};

export const CATEGORIAS: { value: string; label: string }[] = [
  { value: "torta", label: "Tortas" },
  { value: "tartaleta", label: "Tartaletas" },
  { value: "cheesecake", label: "Cheesecakes" },
  { value: "pastel", label: "Pasteles" },
  { value: "pancakes", label: "Pancakes" },
];

export const VARIACIONES: { value: string; label: string }[] = [
  { value: "personalizable", label: "Personalizable" },
  { value: "temporada", label: "Temporada" },
  { value: "vendido", label: "Más vendido" },
  { value: "sin gluten", label: "Sin Gluten" },
];

export const PRECIO_MAX = 100000;

export const productos: Producto[] = [
  {
    id: 1,
    nombre: "Torta de Chocolate Clásica",
    precio: 35000,
    imagen: "/imagen/chocolate.jpg",
    descripcion:
      "Bizcocho de cacao al 70% relleno de ganache y cubierto con crema de chocolate belga.",
    categorias: ["torta"],
    variaciones: ["personalizable"],
    badge: "premium",
    destacado: true,
  },
  {
    id: 2,
    nombre: "Tartaleta de Frutos Rojos",
    precio: 28000,
    imagen: "/imagen/tartaleta.jpg",
    descripcion:
      "Base crocante de masa sablée con crema pastelera y frutos rojos de temporada.",
    categorias: ["tartaleta"],
    variaciones: ["temporada"],
    badge: "temporada",
    destacado: true,
  },
  {
    id: 3,
    nombre: "Caja de Macarons (12 uds)",
    precio: 42000,
    imagen: "/imagen/macarons.jpg",
    descripcion:
      "Doce macarons franceses en sabores surtidos, ideales para regalar o compartir.",
    categorias: [],
    variaciones: [],
    destacado: true,
  },
  {
    id: 4,
    nombre: "Cheesecake de Frutos Rojos",
    precio: 30000,
    imagen: "/imagen/cheesecake.jpg",
    descripcion:
      "Cremoso cheesecake horneado sobre base de galleta, coronado con coulis de frutos rojos.",
    categorias: ["cheesecake"],
    variaciones: [],
    badge: "vendido",
    destacado: true,
  },
  {
    id: 5,
    nombre: "Pancakes Sin Gluten",
    precio: 22000,
    imagen: "/imagen/pancakes.webp",
    descripcion:
      "Torre de pancakes esponjosos elaborados con harina sin gluten y miel de maple.",
    categorias: ["pancakes"],
    variaciones: ["sin gluten"],
  },
  {
    id: 6,
    nombre: "Tres Leches Clásica",
    precio: 32000,
    imagen: "/imagen/tres_leches.jpg",
    descripcion:
      "Bizcocho bañado en tres leches, decorado con merengue y un toque de canela.",
    categorias: ["pastel"],
    variaciones: [],
    badge: "vendido",
  },
  {
    id: 7,
    nombre: "Pastel de Zanahoria",
    precio: 26000,
    imagen: "/imagen/zanahoria.jpg",
    descripcion:
      "Pastel húmedo de zanahoria y nueces con frosting cremoso de queso crema.",
    categorias: ["pastel"],
    variaciones: [],
  },
  {
    id: 8,
    nombre: "Torta de Vainilla y Frutos",
    precio: 27000,
    imagen: "/imagen/torta.jpg",
    descripcion:
      "Torta de vainilla con capas de crema chantilly y frutas frescas de la estación.",
    categorias: ["torta"],
    variaciones: ["personalizable"],
  },
  // Los tres siguientes nacen para que el carrusel de la Home tenga recorrido
  // que mostrar. Reutilizan fotos de productos ya listados (aun no hay
  // fotografia propia para ellos); se reemplazan por fotos reales cuando
  // exista el catalogo definitivo.
  {
    id: 9,
    nombre: "Torta de Vainilla con Crema",
    precio: 29500,
    imagen: "/imagen/torta.jpg",
    descripcion:
      "Bizcocho de vainilla artesano con crema pastelera y un toque de ron de vainilla.",
    categorias: ["torta"],
    variaciones: ["temporada"],
    badge: "temporada",
    destacado: true,
  },
  {
    id: 10,
    nombre: "Postre Tres Leches con Canela",
    precio: 31500,
    imagen: "/imagen/tres_leches.jpg",
    descripcion:
      "Bizcocho bañado en tres leches, decorado con merengue, canela y nuez moscada.",
    categorias: ["pastel"],
    variaciones: [],
    badge: "vendido",
    destacado: true,
  },
  {
    id: 11,
    nombre: "Pancakes con Frutos Rojos",
    precio: 24500,
    imagen: "/imagen/pancakes.webp",
    descripcion:
      "Torre de pancakes esponjosos con frutos rojos de temporada y miel de maple.",
    categorias: ["pancakes"],
    variaciones: ["personalizable"],
    destacado: true,
  },
];
