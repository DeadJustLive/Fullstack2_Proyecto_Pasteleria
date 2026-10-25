-- Plantilla (Template): Agregar pg_cron job para limpieza automática de tablas
-- Reemplaza <JOB_NAME>, <TABLA>, <CONDICIONES> y <CRON_EXPRESSION> con tus valores.

-- Activar extensión pg_cron (viene pre-instalada en Supabase pero hay que habilitarla)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Eliminar job si existe previamente (idempotencia)
SELECT cron.unschedule('<JOB_NAME>') 
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = '<JOB_NAME>');

-- Crear el job recurrente
-- Ejemplo: Se ejecuta cada minuto (* * * * *)
SELECT cron.schedule(
  '<JOB_NAME>',
  '<CRON_EXPRESSION>',
  $$
    DELETE FROM public.<TABLA> 
    WHERE <CONDICIONES>;
    -- Ejemplo: status IN ('pending', 'processing') AND created_at < NOW() - INTERVAL '1 minute'
  $$
);
