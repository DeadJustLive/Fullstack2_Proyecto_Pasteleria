# Universal Payment Gateway Module for Supabase Edge Functions

Este módulo es una solución "Plug & Play" para integrar pasarelas de pago (como Flow, Stripe, etc.) en cualquier proyecto de Supabase. Su diseño está basado en **Abstracción, Idempotencia y Resiliencia**.

## 🚀 Cómo instalarlo en un nuevo proyecto

1. **Copia las carpetas**:
   Copia el directorio `supabase/functions/_shared/payment-gateway` a tu nuevo proyecto dentro de la misma ruta.
   Copia las Edge Functions `create-payment`, `payment-webhook` y `refund-payment`.

2. **Base de datos (SQL)**:
   Ejecuta el script SQL incluido en `supabase/migrations/00000000000000_payment_schema.sql` en tu nueva base de datos para crear la tabla de control de pagos.

3. **Variables de Entorno**:
   Configura las siguientes variables en los *Secrets* de tu Supabase Edge Functions:
   ```bash
   supabase secrets set FLOW_API_KEY=tu_api_key
   supabase secrets set FLOW_SECRET_KEY=tu_secret_key
   supabase secrets set FLOW_API_URL=https://sandbox.flow.cl/api # Cambiar a prod cuando sea necesario
   ```

## 🛠 Arquitectura

### 1. El Módulo Core (`_shared/payment-gateway`)
Es el corazón. No sabe nada sobre tu base de datos ni tu lógica de negocio. Solo expone una interfaz universal (`IPaymentGateway`) y utiliza el patrón **Factory** (`PaymentGatewayFactory`) para decidir qué proveedor de pago usar. 
**Regla de oro**: NUNCA modifiques este módulo para que se conecte a Supabase o lance queries. 

### 2. Idempotencia y Edge Functions
- **`create-payment`**: Función que recibe peticiones del Front-end. **Siempre** verifica en la tabla `payments` si la clave de idempotencia (`idempotency_key`) ya existe antes de cobrar, evitando pagos dobles por fallos de internet o doble-click del usuario.
- **`payment-webhook`**: Recibe las notificaciones de los proveedores en background, verifica las firmas criptográficas (HMAC) y actualiza la base de datos en menos de 15 segundos.

## ➕ Agregar nuevas pasarelas a futuro (Stripe, PayPal)
1. Crea un nuevo archivo en `providers/stripe.provider.ts`.
2. Haz que esa clase implemente la interfaz `IPaymentGateway` que está en `types.ts`.
3. Agrégalo al `switch` en el archivo `factory.ts`.
¡Y listo! Todo tu sistema (frontend, base de datos) funcionará mágicamente con la nueva pasarela sin modificar nada más.

## 🧹 Mantenimiento y Cron Jobs (Pagos Huérfanos)
Para mantener un uso correcto de los recursos de la base de datos y no acumular registros inútiles ("carritos abandonados"), es altamente recomendable implementar un Cron Job en Supabase (usando `pg_cron` o una Edge Function programada) una vez pases a producción.

**Razón**: Cuando un usuario hace click en "Pagar" pero cierra la pestaña de Flow sin introducir su tarjeta, el registro en tu tabla `payments` quedará en estado `pending` para siempre. 
**Recomendación**: Configurar un Cron Job que corra una vez al día (ej: a las 3:00 AM) y elimine o marque como `abandoned` todos los registros cuyo `status = 'pending'` y tengan más de 24 horas de antigüedad. Esto mantendrá tu base de datos limpia y eficiente.

---

## 🖥️ Integración con el Frontend (`urlReturn`)

Cuando un usuario termina de pagar en la página de Flow, es devuelto a tu sitio web mediante la `urlReturn` que le envíes en el body al crear el pago (o la que configures en la variable de entorno `PAYMENT_RETURN_URL`).

> [!WARNING]
> **Consideración CRÍTICA:** Flow **no** redirige al usuario con un simple `GET`. Lo hace mediante una petición HTTP **POST**, enviando un campo `token` oculto en el formulario.

**¿Qué significa esto para tu Frontend?**
1. Si tu sitio es un simple archivo HTML estático o un servidor muy estricto que no acepta peticiones POST en sus rutas visuales, **te lanzará un error "405 Method Not Allowed"**.
2. **Si usas Next.js (App Router):** Tu página (`page.tsx`) en `/pago-exitoso` no puede recibir peticiones POST directamente por defecto. Tienes dos opciones:
   - Manejar el retorno en un Route Handler (`route.ts` de API) que intercepte el POST, lea el `token` del formData, y haga un `redirect()` hacia la página visual de éxito.
   - O configurar tu servidor/framework para que permita el método POST en esa ruta específica.
3. El `token` que Flow envía a tu `urlReturn` **solo sirve para validación visual** (ej: mostrar "Pago completado"). Nunca debes usar este token del cliente para actualizar el estado del pago en tu base de datos (¡Para eso existe tu `payment-webhook` seguro que se comunica de servidor a servidor!).

---

## ✅ Estado del Proyecto

**Estado Actual: FINALIZADO Y LISTO PARA PRODUCCIÓN**

El módulo ha sido desarrollado, refactorizado y completado en su totalidad. Cumple con todos los estándares empresariales necesarios para integrarse en cualquier proyecto:

- [x] **Abstracción Completa**: Interfaz universal (`IPaymentGateway`) creada y documentada.
- [x] **Proveedor Flow Implementado**: `FlowProvider` modularizado y usando Web Crypto API.
- [x] **Webhooks Seguros**: Lógica de verificación de firmas y extracción de tokens en el body configurada.
- [x] **Protección de Idempotencia**: Script SQL de base de datos (`idempotency_key`) y validaciones en la Edge Function `create-payment` listas para evitar cobros dobles.
- [x] **Gestión de Reembolsos**: Funcionalidad para reversar órdenes añadida tanto en el core (`refundPayment`) como en su respectiva Edge Function (`refund-payment`).
- [x] **Control de Errores Custom**: Clases de error específicas (`PaymentGatewayError`, `SignatureValidationError`) implementadas para facilitar el debugeo.

El código actual en esta carpeta es el *Gold Standard* (Estándar de Oro) que servirá como base para todos los desarrollos futuros de e-commerce o sistemas de pago que construyas.
