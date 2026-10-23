# 👤 Instancia — Perfil

Ejecuta [`prompt-base.md`](./prompt-base.md) con estos campos:

- **`{ORIGEN}`**: `MockUpPasteleria/pages/cliente/perfil.html` + `MockUpPasteleria/pages/cliente/css/perfil.css`.
- **`{SALIDA}`**: `frontend/src/pages/cliente/Perfil.tsx`.

Notas específicas:
- Es la ruta `perfil` (hoy `Placeholder` en `App.tsx:24`).
- Reutiliza el `MenuPerfil` existente (`components/layout/MenuPerfil.tsx`) y la sesión de `AuthProvider`.
- Formularios con `Input`/`PasswordInput` y `Button`; usa `Card` para los paneles.
