<!-- @pca:start
@id(feature.homeview.components.readme)
@kind(doc)
@limit(lines: 200)
@relates(feature.homeview.view)
@desc(Inventario de subcomponentes exclusivos del módulo HomeView)
@pca:end -->
# Componentes Locales — HomeView

Esta carpeta aloja los subcomponentes que pertenecen **exclusivamente** a la vista `HomeView`.

## Reglas FIDA para `components/`
1. **Aislamiento**: Ningún otro módulo fuera de `HomeView` puede importar archivos de esta carpeta.
2. **Promoción**: Si un componente de aquí necesita reutilizarse en otra vista, debe moverse a `shared/` y reexportarse a través de `../dependencies/dependencies.ts`.
3. **Aduana**: Los subcomponentes locales tampoco pueden importar librerías externas directamente; deben consumirlas desde `../dependencies/dependencies.ts`.
