// @pca:start
// @id(frontend.scripts.optimizeImages)
// @kind(service)
// @limit(lines: 160)
// @contract(cli: npm run optimize:images)
// @relates(docs.reglas_ui)
// @desc(Convierte PNG a WebP y re-codifica JPG de public/imagen sin degradar)
// @pca:end
/**
 * Optimizador de imagenes de `public/imagen`.
 *
 * Reglas:
 * - Los PNG se convierten a WebP (mismo nombre, extension `.webp`).
 * - Los JPG se re-codifican en sitio con mozjpeg.
 * - Nunca se degrada una imagen: si la version optimizada pesa mas que el
 *   original, el original se conserva. Por eso el script es idempotente.
 *
 * Uso: npm run optimize:images
 */
import { readdir, readFile, rename, stat, unlink, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR_IMAGEN = path.join(RAIZ, "public", "imagen");

const ANCHO_MAXIMO = 1400;
const CALIDAD = 80;

/** @type {Record<string, { formato: string; destino: string; opciones: object }>} */
const TRATAMIENTO = {
  ".png": {
    formato: "webp",
    destino: ".webp",
    opciones: { quality: CALIDAD },
  },
  ".jpg": {
    formato: "jpeg",
    destino: ".jpg",
    opciones: { quality: CALIDAD, mozjpeg: true },
  },
  ".jpeg": {
    formato: "jpeg",
    destino: ".jpg",
    opciones: { quality: CALIDAD, mozjpeg: true },
  },
};

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

async function optimizar(archivo) {
  const extension = path.extname(archivo).toLowerCase();
  const tratamiento = TRATAMIENTO[extension];
  if (!tratamiento) return null;

  const origen = path.join(DIR_IMAGEN, archivo);
  const destino = path.join(
    DIR_IMAGEN,
    `${path.basename(archivo, extension)}${tratamiento.destino}`,
  );

  if (destino !== origen && existsSync(destino)) {
    console.log(`  · ${archivo} -> ${path.basename(destino)}: ya existe, se conserva`);
    return null;
  }

  const original = await stat(origen);
  // Se lee el archivo a memoria antes de procesarlo: `sharp` mantiene el
  // descriptor abierto y no se puede escribir sobre el mismo path.
  const bufferEntrada = await readFile(origen);
  const buffer = await sharp(bufferEntrada)
    .resize({ width: ANCHO_MAXIMO, withoutEnlargement: true })
    [tratamiento.formato](tratamiento.opciones)
    .toBuffer();

  if (buffer.length >= original.size) {
    console.log(
      `  · ${archivo}: la version optimizada no es mas pequena (${kb(original.size)}), se conserva el original`,
    );
    return null;
  }

  if (destino === origen) {
    // Escritura en sitio via archivo temporal (evita corrupcion si el proceso
    // se interrumpe y evita el bloqueo de OneDrive sobre el archivo abierto).
    const temporal = `${origen}.tmp`;
    await writeFile(temporal, buffer);
    await rename(temporal, origen);
  } else {
    await writeFile(destino, buffer);
    await unlink(origen);
  }

  console.log(
    `  · ${archivo} -> ${path.basename(destino)}: ${kb(original.size)} -> ${kb(buffer.length)}`,
  );
  return { antes: original.size, despues: buffer.length };
}

async function main() {
  if (!existsSync(DIR_IMAGEN)) {
    console.error(`No existe el directorio ${DIR_IMAGEN}`);
    process.exit(1);
  }

  const archivos = (await readdir(DIR_IMAGEN)).filter((archivo) =>
    Object.hasOwn(TRATAMIENTO, path.extname(archivo).toLowerCase()),
  );

  console.log(`Optimizando ${archivos.length} imagenes de public/imagen...`);

  let antes = 0;
  let despues = 0;
  for (const archivo of archivos) {
    const resultado = await optimizar(archivo);
    if (resultado) {
      antes += resultado.antes;
      despues += resultado.despues;
    }
  }

  if (antes > 0) {
    console.log(
      `Total: ${kb(antes)} -> ${kb(despues)} (${Math.round((1 - despues / antes) * 100)}% menos)`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
