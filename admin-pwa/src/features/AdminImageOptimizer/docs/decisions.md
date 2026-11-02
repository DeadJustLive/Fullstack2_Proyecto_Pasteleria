<!-- @pca:start
@id(feature.adminimageoptimizer.decisions)
@kind(doc)
@limit(lines: 600)
@relates(feature.adminimageoptimizer.interface)
@relates(feature.adminimageoptimizer.dependencies)
@relates(feature.adminimageoptimizer.view)
@desc(Registro de decisiones arquitectonicas y de diseno del modulo AdminImageOptimizer)
@pca:end -->
# Registro de Decisiones (ADR) — AdminImageOptimizer

## Información del Módulo
- **Módulo**: `AdminImageOptimizer` (`feature.adminimageoptimizer`)
- **Fecha de creación**: 2026-11-01
- **Última actualización**: 2026-11-01
- **Estado**: 🟢 Activo

---

## Decisiones de Diseño

### DEC-001: Creación del módulo bajo arquitectura FIDA
- **Fecha**: 2026-11-01
- **Contexto**: Se requiere aislar la funcionalidad de compresión y optimización de imágenes en el cliente administrador con fronteras explícitas y sin acoplamiento a pantallas específicas.
- **Decisión**: Estructurar el módulo en 5 subcarpetas (`interfaces/`, `dependencies/`, `implementation/`, `components/`, `docs/`) gobernadas por `fida_opl.py`.
- **Consecuencias**: Todo cambio estructural (score >= 60%) exigirá actualizar este documento antes de confirmar el commit (WAL documental).

### DEC-002: Optimización cliente Canvas WebP con modo dual (Upload/URL)
- **Fecha**: 2026-11-01
- **Contexto**: Las fotos de alta resolución tomadas con cámaras modernas pesan entre 2 MB y 10 MB. Subir estas imágenes sin compresión a la base de datos o almacenamiento agota el ancho de banda y la memoria en microservicios backend.
- **Decisión**: Redimensionar en el navegador mediante HTML5 `Canvas` a un ancho máximo de 800px preservando aspect ratio, exportando directamente a `image/webp` con calidad default de 0.78. Esto reduce el peso típico a 15 KB - 45 KB (~80% a 95% de ahorro). Además se provee un modo dual que permite seguir pegando URLs externas o rutas estáticas.
- **Consecuencias**: El payload enviado al backend (`service-catalog`) es liviano, persistible de manera segura como `MEDIUMTEXT` (Data URL WebP o URL estándar) y renderizable de inmediato sin requerir microservicios pesados de transcodificación de imágenes.

---

## Dependencias Externas Justificadas

| Símbolo / Componente | Origen | Razón de uso |
|----------------------|--------|--------------|
| `Upload, ImageIcon, Check, RefreshCw, AlertCircle, LinkIcon, FileCheck, Sliders` | `lucide-react` | Iconografía estándar de la interfaz de usuario en Admin PWA |
| `useState, useRef, useCallback, useEffect` | `react` | Control reactivo del ciclo de vida, canvas y drag & drop |

---

## Historial de Cambios Estructurales (WAL)

| Fecha | Tipo de Cambio | Score WAL | Descripción |
|-------|---------------|-----------|-------------|
| 2026-11-01 | Inicialización | 0% | Creación base del módulo `AdminImageOptimizer` |
| 2026-11-01 | Implementación | 85% | Implementación completa de compresión Canvas WebP, interfaz de métricas y modo dual |
