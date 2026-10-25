-- Plantilla: Trigger de Auditoría Universal para operaciones CRUD
-- Reemplaza <TABLE_NAME> y <ENTITY_NAME> con la tabla que deseas auditar.
-- Ej: <TABLE_NAME> = 'productos', <ENTITY_NAME> = 'producto'

-- 1. Función del Trigger: audit_<TABLE_NAME>_change
CREATE OR REPLACE FUNCTION public.audit_<TABLE_NAME>_change()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.audit_logs (actor_id, action, status, target_type, target_id, metadata)
  VALUES (
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'),
    CASE
      WHEN TG_OP = 'INSERT' THEN '<ENTITY_NAME>.created'
      WHEN TG_OP = 'UPDATE' THEN '<ENTITY_NAME>.updated'
      WHEN TG_OP = 'DELETE' THEN '<ENTITY_NAME>.deleted'
      ELSE '<ENTITY_NAME>.' || TG_OP
    END,
    CASE
      WHEN TG_OP = 'DELETE' THEN COALESCE(OLD.status, 'unknown')
      ELSE COALESCE(NEW.status, 'unknown')
    END,
    '<ENTITY_NAME>',
    COALESCE(NEW.id, OLD.id),
    CASE
      WHEN TG_OP = 'DELETE' THEN
        jsonb_build_object(
          'deleted_at', NOW()
        )
      WHEN TG_OP = 'UPDATE' THEN
        jsonb_build_object(
          'changed_fields', (
            SELECT jsonb_object_agg(key, value)
            FROM jsonb_each(
              to_jsonb(NEW.*) - to_jsonb(OLD.*)::text[]
            )
            WHERE key NOT IN ('updated_at', 'created_at')
          )
        )
      ELSE
        jsonb_build_object(
          'source', 'system'
        )
    END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 2. Atar el trigger a la tabla
DROP TRIGGER IF EXISTS trg_audit_<TABLE_NAME>_change ON public.<TABLE_NAME>;
CREATE TRIGGER trg_audit_<TABLE_NAME>_change
  AFTER INSERT OR UPDATE OR DELETE ON public.<TABLE_NAME>
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_<TABLE_NAME>_change();

COMMENT ON FUNCTION public.audit_<TABLE_NAME>_change IS 'Audits all CRUD operations on <TABLE_NAME> table into audit_logs';
COMMENT ON TRIGGER trg_audit_<TABLE_NAME>_change ON public.<TABLE_NAME> IS 'Fires on INSERT/UPDATE/DELETE to log changes';
