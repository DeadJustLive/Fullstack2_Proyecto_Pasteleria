export type BlogCategoria = "recetas" | "tips" | "novedades" | "historia";

export interface BlogPost {
  id: number;
  slug: string;
  titulo: string;
  extracto: string;
  contenido: string[];
  imagen: string;
  categoria: BlogCategoria;
  autor: string;
  fecha: string;
  tiempoLectura: string;
  destacado?: boolean;
}
