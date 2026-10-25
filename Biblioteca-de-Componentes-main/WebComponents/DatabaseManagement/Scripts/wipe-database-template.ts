import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as readline from 'readline';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Faltan las variables de entorno en .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string): Promise<string> => new Promise(resolve => rl.question(query, resolve));

async function emptyFolder(bucket: string, folder: string) {
  const { data: files, error: listError } = await supabase.storage.from(bucket).list(folder);
  if (listError) {
    console.error(`Error listando la carpeta ${folder}:`, listError);
    return;
  }
  
  if (files && files.length > 0) {
    const filePaths = files
      .filter(f => f.name !== '.emptyFolderPlaceholder')
      .map(f => `${folder ? folder + '/' : ''}${f.name}`);
      
    if (filePaths.length > 0) {
      const { error: rmError } = await supabase.storage.from(bucket).remove(filePaths);
      if (rmError) {
        console.error(`Error eliminando archivos en ${folder}:`, rmError);
      } else {
        console.log(`✅ ${filePaths.length} archivos eliminados de ${folder || 'la raíz'}.`);
      }
    }
  } else {
    console.log(`✅ Carpeta ${folder || 'raíz'} ya estaba vacía.`);
  }
}

async function main() {
  console.log("==========================================================");
  console.log("⚠️  ADVERTENCIA: Este script ELIMINARÁ TODAS LAS PROPIEDADES");
  console.log("   y todos los archivos (fotos, videos) de Storage.");
  console.log("==========================================================\n");
  
  const email = await question("Email de administrador: ");
  const password = await question("Contraseña: ");

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  
  if (error || !data.user) {
    console.error("❌ Error de autenticación:", error?.message);
    rl.close();
    process.exit(1);
  }

  console.log("✅ Autenticado como", data.user.email);
  
  const confirm = await question("\nEscribe 'ELIMINAR' para confirmar el borrado total: ");
  if (confirm !== 'ELIMINAR') {
    console.log("Operación cancelada.");
    rl.close();
    process.exit(0);
  }

  console.log("\n🗑️  Iniciando borrado...");

  // 1. Borrar todas las propiedades (hace cascade a sync_logs)
  console.log("\n1. Eliminando registros de la base de datos...");
  const { data: properties, error: fetchError } = await supabase.from('properties').select('id');
  if (fetchError) {
    console.error("Error obteniendo propiedades:", fetchError);
  } else if (properties.length > 0) {
    const ids = properties.map(p => p.id);
    const { error: deleteError } = await supabase.from('properties').delete().in('id', ids);
    if (deleteError) {
      console.error("Error eliminando propiedades:", deleteError);
    } else {
      console.log(`✅ ${ids.length} propiedades eliminadas de la base de datos.`);
    }
  } else {
    console.log("✅ No hay propiedades para eliminar.");
  }

  // 2. Limpiar bucket 'properties' y sus subcarpetas
  console.log("\n2. Vaciando archivos de Storage (Bucket: properties)...");
  await emptyFolder('properties', 'publicaciones');
  await emptyFolder('properties', 'videos');
  await emptyFolder('properties', 'ig_temp');
  await emptyFolder('properties', ''); // Raíz por si acaso

  console.log("\n🎉 Proceso completado. La base de datos está limpia como el día 1.");
  rl.close();
}

main();
