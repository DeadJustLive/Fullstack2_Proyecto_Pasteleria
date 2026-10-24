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
    ingredientes: ["Cacao 70%", "Chocolate belga", "Harina de trigo", "Huevos", "Mantequilla", "Crema de leche"],
    nota: "Tamaño mediano • 8 porciones. Personalizable con mensaje.",
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
    ingredientes: ["Harina de trigo", "Mantequilla", "Crema pastelera", "Frambuesas", "Frutillas", "Arándanos"],
    nota: "Tartaleta individual • Fruta de temporada, disponibilidad limitada.",
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
    ingredientes: ["Harina de almendras", "Claras de huevo", "Azúcar flor", "Ganache surtida"],
    nota: "Caja de 12 unidades • Sabores surtidos. Contiene frutos secos.",
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
    ingredientes: ["Queso crema", "Galletas", "Mantequilla", "Huevos", "Frutos rojos"],
    nota: "Tamaño mediano • 10 porciones. Mantener refrigerado.",
  },
  {
    id: 5,
    nombre: "Pancakes Sin Gluten",
    precio: 22000,
    imagen: "/imagen/pancakes.png",
    descripcion:
      "Torre de pancakes esponjosos elaborados con harina sin gluten y miel de maple.",
    categorias: ["pancakes"],
    variaciones: ["sin gluten"],
    ingredientes: ["Harina sin gluten", "Huevos", "Leche", "Miel de maple"],
    nota: "Porción para 2 personas • Preparado con harina sin gluten.",
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
    ingredientes: ["Huevos", "Harina de trigo", "Leche condensada", "Leche evaporada", "Crema de leche", "Canela"],
    nota: "Tamaño mediano • 10 porciones. Mantener refrigerada.",
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
    ingredientes: ["Zanahoria", "Nueces", "Harina de trigo", "Huevos", "Queso crema", "Canela"],
    nota: "Tamaño mediano • 8 porciones. Contiene frutos secos.",
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
    ingredientes: ["Harina de trigo", "Vainilla", "Crema chantilly", "Huevos", "Frutas frescas"],
    nota: "Tamaño mediano • 8 porciones. Personalizable con mensaje.",
  },
];
