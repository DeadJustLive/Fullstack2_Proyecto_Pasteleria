-- ╔══════════════════════════════════════════════════════════════════╗
-- ║  Migración: Políticas RLS para Acceso Público (ANON KEY)      ║
-- ║  Archivo: 20260509000000_public_read_policies.sql              ║
-- ║                                                                ║
-- ║  Ejecutar en el SQL Editor de Supabase Dashboard.              ║
-- ║  Habilita lectura pública selectiva + inserción de leads/msgs. ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- ═══════════════════════════════════════════════════════════════════
-- 1. PROPERTIES — Lectura pública solo de propiedades publicadas
-- ═══════════════════════════════════════════════════════════════════

-- Asegurar RLS activado
ALTER TABLE IF EXISTS properties ENABLE ROW LEVEL SECURITY;

-- Política: cualquier usuario (incluido anon) puede leer propiedades con status 'published'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'public_read_published_properties' AND tablename = 'properties'
  ) THEN
    EXECUTE 'CREATE POLICY public_read_published_properties ON properties FOR SELECT TO anon USING (status = ''published'')';
  END IF;
END $$;


-- ═══════════════════════════════════════════════════════════════════
-- 2. TESTIMONIALS — Lectura pública solo de testimonios publicados
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE IF EXISTS testimonials ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'public_read_published_testimonials' AND tablename = 'testimonials'
  ) THEN
    EXECUTE 'CREATE POLICY public_read_published_testimonials ON testimonials FOR SELECT TO anon USING (is_published = true)';
  END IF;
END $$;


-- ═══════════════════════════════════════════════════════════════════
-- 3. LEADS — Solo inserción pública (crear lead desde formulario web)
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE IF EXISTS leads ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'public_insert_leads' AND tablename = 'leads'
  ) THEN
    EXECUTE 'CREATE POLICY public_insert_leads ON leads FOR INSERT TO anon WITH CHECK (true)';
  END IF;
END $$;


-- ═══════════════════════════════════════════════════════════════════
-- 4. MESSAGES — Solo inserción pública (guardar mensaje del formulario)
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE IF EXISTS messages ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'public_insert_messages' AND tablename = 'messages'
  ) THEN
    EXECUTE 'CREATE POLICY public_insert_messages ON messages FOR INSERT TO anon WITH CHECK (true)';
  END IF;
END $$;


-- ═══════════════════════════════════════════════════════════════════
-- 5. PROPERTIES — Agregar columna featured (para destacar propiedades)
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE IF EXISTS properties ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;


-- ═══════════════════════════════════════════════════════════════════
-- 6. PROPERTY_STATS — Acceso vía RPC (SECURITY DEFINER)
--    La función increment_property_views ya es SECURITY DEFINER,
--    por lo que no necesita política RLS adicional.
--    Incluimos la función aquí como referencia / idempotencia.
-- ═══════════════════════════════════════════════════════════════════

-- Asegurar que existe el unique constraint necesario para ON CONFLICT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'property_stats_property_id_month_key'
    AND conrelid = 'property_stats'::regclass
  ) THEN
    ALTER TABLE property_stats ADD CONSTRAINT property_stats_property_id_month_key UNIQUE (property_id, period_month);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION increment_property_views(p_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO property_stats (property_id, period_month, views)
  VALUES (p_id, date_trunc('month', now())::date, 1)
  ON CONFLICT (property_id, period_month)
  DO UPDATE SET views = property_stats.views + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ═══════════════════════════════════════════════════════════════════
-- 6. STORAGE — Hardening de storage.objects
--    ⚠️ Supabase advierte: "Clients can list all files in this bucket"
--    Un bucket público ya sirve archivos por URL directa.
--    NO necesita una política SELECT en storage.objects.
--    Eliminar políticas SELECT amplias para evitar enumeración.
-- ═══════════════════════════════════════════════════════════════════

-- Eliminar políticas SELECT amplias sobre storage.objects para el rol anon.
-- Ajusta 'TU_NOMBRE_POLICY' al nombre real de tu política (verificar en Dashboard → Storage → Policies).
-- Ejemplo:
--   DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
--
-- Si no conoces el nombre exacto, consulta primero:
--   SELECT policyname, roles, cmd, qual
--   FROM pg_policies
--   WHERE schemaname = 'storage' AND tablename = 'objects' AND cmd = 'SELECT';
--
-- Luego ejecuta:
--   DROP POLICY IF EXISTS "<nombre_encontrado>" ON storage.objects;
--
-- Nota: Las imágenes de propiedades se sirven con URLs públicas directas
-- (ej: https://xxx.supabase.co/storage/v1/object/public/property-images/...).
-- No se necesita SELECT para que funcionen. Solo INSERT/UPDATE/DELETE
-- deben estar controlados por autenticación.


-- ═══════════════════════════════════════════════════════════════════
-- ✅ Verificación rápida
-- ═══════════════════════════════════════════════════════════════════
-- Ejecutar después de la migración para confirmar:
--
--   SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
--   FROM pg_policies
--   WHERE tablename IN ('properties', 'testimonials', 'leads', 'messages');
--
-- Debe mostrar las 4 políticas creadas.
--
-- Para verificar que storage.objects NO tiene SELECT público:
--
--   SELECT policyname, roles, cmd
--   FROM pg_policies
--   WHERE schemaname = 'storage' AND tablename = 'objects' AND cmd = 'SELECT';
--
-- Debería estar vacío o sin roles 'anon'.
