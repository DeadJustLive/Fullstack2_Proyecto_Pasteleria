// @use(kind, contract, limit, scope, deps)
// @kind(util)
// @limit(lines: 100)
// @contract(in: imageUrl -> out: Blob | null)
// @scope(feature:properties)
// @deps(@external: [])
import { supabase } from './supabase';

/**
 * Verifica si una imagen cumple con el aspect ratio de Instagram (0.8 a 1.91).
 * Si no cumple, genera un nuevo Blob con márgenes negros centrando la imagen.
 */
export async function adaptImageForInstagram(imageUrl: string, bgStyle: 'black' | 'white' | 'blur' = 'black'): Promise<{ blob: Blob | null, wasAdapted: boolean }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Necesario para evitar tainted canvas con URLs de Supabase
    img.onload = () => {
      const width = img.width;
      const height = img.height;
      const ratio = width / height;

      // Forzamos TODAS las imágenes a ser 1:1 (Cuadrado Perfecto).
      // Esto engaña a Instagram: como todas las imágenes generadas tendrán el mismo
      // aspect ratio (1:1), Instagram nunca recortará la imagen interna, solo tomará
      // la imagen con sus bordes intactos.
      const TARGET_RATIO = 1; // 1:1 (Cuadrado)

      // Si la foto ya es cuadrada (con tolerancia de decimales), no necesita bordes.
      if (Math.abs(ratio - TARGET_RATIO) < 0.01) {
        resolve({ blob: null, wasAdapted: false });
        return;
      }

      let newWidth = width;
      let newHeight = height;

      if (ratio > TARGET_RATIO) {
        // La foto es más ancha que alta (horizontal).
        // Aumentamos el canvas a lo alto para hacerla cuadrada (pone bordes arriba y abajo).
        newHeight = width / TARGET_RATIO;
      } else {
        // La foto es más alta que ancha (vertical).
        // Aumentamos el canvas a lo ancho para hacerla cuadrada (pone bordes a los lados).
        newWidth = height * TARGET_RATIO;
      }

      const canvas = document.createElement('canvas');
      canvas.width = newWidth;
      canvas.height = newHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({ blob: null, wasAdapted: false });
        return;
      }

      if (bgStyle === 'white') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, newWidth, newHeight);
      } else if (bgStyle === 'blur') {
        ctx.filter = 'blur(20px)';
        const scale = Math.max(newWidth / width, newHeight / height);
        const coverWidth = width * scale;
        const coverHeight = height * scale;
        const coverX = (newWidth - coverWidth) / 2;
        const coverY = (newHeight - coverHeight) / 2;
        
        ctx.drawImage(img, coverX, coverY, coverWidth, coverHeight);
        
        ctx.filter = 'none';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, newWidth, newHeight);
      } else {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, newWidth, newHeight);
      }

      // Centrar imagen original
      const x = (newWidth - width) / 2;
      const y = (newHeight - height) / 2;
      ctx.drawImage(img, x, y, width, height);

      canvas.toBlob((blob) => {
        resolve({ blob, wasAdapted: true });
      }, 'image/jpeg', 0.95);
    };
    img.onerror = () => {
      console.warn('No se pudo cargar la imagen para adaptarla a IG:', imageUrl);
      // Fallback elegante si falla CORS, devolver sin adaptar
      resolve({ blob: null, wasAdapted: false });
    };
    img.src = imageUrl;
  });
}

/**
 * Sube un blob temporal a Supabase para obtener una URL válida para la API de IG
 */
export async function uploadTempIgImage(propertyId: string, blob: Blob, index: number): Promise<string> {
  const fileName = `ig_temp/${propertyId}_${Date.now()}_${index}.jpg`;
  const { error } = await supabase.storage
    .from('properties')
    .upload(fileName, blob, {
      contentType: 'image/jpeg',
      upsert: true
    });
  
  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('properties')
    .getPublicUrl(fileName);
    
  return publicUrl;
}

/**
 * Limpia las imágenes temporales generadas para IG
 */
export async function cleanupTempIgImages(urls: string[]) {
  const tempPaths = urls
    .filter(url => url.includes('/ig_temp/'))
    .map(url => {
      try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/properties/');
        if (pathParts.length > 1) {
          return pathParts[1];
        }
        return '';
      } catch {
        return '';
      }
    })
    .filter(p => p !== '');

  if (tempPaths.length > 0) {
    await supabase.storage.from('properties').remove(tempPaths);
  }
}
