-- =====================================================
-- MIGRATION: fix_rls_recursion.sql
-- PURPOSE: Fix "infinite recursion" error in user_profiles
-- TARGET: user_profiles
-- EXECUTION: Run via Supabase SQL Editor
-- =====================================================

-- 1. Crear una función auxiliar que salta el RLS (Security Definer)
-- Esto permite que PostgreSQL sepa si alguien es admin sin activar
-- las propias reglas de seguridad de nuevo (rompiendo el bucle infinito).
CREATE OR REPLACE FUNCTION current_user_is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Eliminar las políticas defectuosas que causan la recursión
DROP POLICY IF EXISTS "profiles_select_own" ON user_profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON user_profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON user_profiles;

-- 3. Crear las nuevas políticas usando la función segura
CREATE POLICY "profiles_select" 
  ON user_profiles FOR SELECT 
  USING (auth.uid() = id OR current_user_is_admin());

CREATE POLICY "profiles_update" 
  ON user_profiles FOR UPDATE 
  USING (auth.uid() = id OR current_user_is_admin());

CREATE POLICY "profiles_insert" 
  ON user_profiles FOR INSERT 
  WITH CHECK (auth.uid() = id OR current_user_is_admin());

CREATE POLICY "profiles_delete" 
  ON user_profiles FOR DELETE 
  USING (current_user_is_admin());
