-- ==============================================================================
-- PATRÓN UNIVERSAL DE PAGOS - ESQUEMA BASE DE DATOS
-- ==============================================================================
-- Tabla centralizada para llevar el registro de intentos de pago y su estado.
-- Incluye la restricción 'UNIQUE' en 'idempotency_key' para evitar pagos duplicados.

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Prevención de duplicados (Idempotencia)
  idempotency_key VARCHAR(255) UNIQUE NOT NULL,
  
  -- Estado universal: 'pending', 'completed', 'failed', 'refunded'
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  
  -- Proveedor utilizado (ej. 'flow', 'stripe')
  provider VARCHAR(50) NOT NULL,
  
  -- Datos del pago
  amount NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'CLP',
  user_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  
  -- Identificadores externos (de la pasarela)
  gateway_transaction_id VARCHAR(255), -- ej. flowOrder
  payment_token VARCHAR(255),          -- token de sesión de pago
  checkout_url TEXT,                   -- url de redirección devuelta por la pasarela
  
  -- Metadatos adicionales (flexible para adaptaciones futuras)
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para mejorar la velocidad de búsqueda de los Webhooks y consultas
CREATE INDEX IF NOT EXISTS idx_payments_idempotency_key ON public.payments(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_payments_gateway_transaction_id ON public.payments(gateway_transaction_id);

-- Trigger para actualizar el 'updated_at' automáticamente (requiere extensión moddatetime o función manual)
-- Omitido aquí para simplicidad, pero recomendado en el proyecto final.
