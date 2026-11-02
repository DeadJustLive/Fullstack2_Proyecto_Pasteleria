<!-- @pca:start
@id(feature.adminimageoptimizer.components.readme)
@kind(doc)
@limit(lines: 200)
@relates(feature.adminimageoptimizer.view)
@desc(Inventario de subcomponentes exclusivos del modulo AdminImageOptimizer)
@pca:end -->
# Componentes Locales — AdminImageOptimizer

Esta carpeta aloja los subcomponentes que pertenecen **exclusivamente** al módulo `AdminImageOptimizer`.

## Subcomponentes incluidos
- `OptimizationMetricsBadge.tsx`: Insignia y métricas de peso original vs optimizado WebP, ahorro porcentual y dimensiones en píxeles.
- `ImagePreviewCard.tsx`: Tarjeta de vista previa en miniatura, formato de datos (Data URL vs URL externa), controles de ajuste y botón de restablecer.

## Reglas FIDA para `components/`
1. **Aislamiento**: Ningún otro módulo fuera de `AdminImageOptimizer` puede importar archivos de esta carpeta.
2. **Promoción**: Si un componente de aquí necesita reutilizarse en otra vista, debe moverse a `shared/` y reexportarse a través de `../dependencies/dependencies.ts`.
3. **Aduana**: Los subcomponentes locales tampoco pueden importar librerías externas directamente; deben consumirlas desde `../dependencies/dependencies.ts`.
