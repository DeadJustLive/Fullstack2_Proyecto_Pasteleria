<!-- @pca:start
@id(admin.feature.criticalstock.components.readme)
@kind(doc)
@limit(lines: 150)
@relates(admin.feature.criticalstock.view)
@desc(Guía de subcomponentes privados del módulo AdminCriticalStock)
@pca:end -->
# Componentes Locales — AdminCriticalStock

Esta carpeta aloja los subcomponentes que pertenecen **exclusivamente** a la vista `AdminCriticalStock`.

## Reglas FIDA para `components/`
1. **Aislamiento**: Ningún otro módulo fuera de `AdminCriticalStock` puede importar archivos de esta carpeta.
2. **Promoción**: Si un componente de aquí necesita reutilizarse en otra vista, debe moverse a `components/` global y reexportarse a través de `../dependencies/dependencies.ts`.
3. **Aduana**: Los subcomponentes locales tampoco pueden importar librerías externas directamente; deben consumirlas desde `../dependencies/dependencies.ts`.
