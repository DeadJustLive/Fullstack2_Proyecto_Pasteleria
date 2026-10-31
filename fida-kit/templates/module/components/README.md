<!-- @pca:start
@id(feature.[MODULE_ID].components.readme)
@kind(doc)
@limit(lines: 200)
@relates(feature.[MODULE_ID].view)
@desc(Inventario de subcomponentes exclusivos del módulo [MODULE_NAME])
@pca:end -->
# Componentes Locales — [MODULE_NAME]

Esta carpeta aloja los subcomponentes que pertenecen **exclusivamente** a la vista `[MODULE_NAME]`.

## Reglas FIDA para `components/`
1. **Aislamiento**: Ningún otro módulo fuera de `[MODULE_NAME]` puede importar archivos de esta carpeta.
2. **Promoción**: Si un componente de aquí necesita reutilizarse en otra vista, debe moverse a `shared/` y reexportarse a través de `../dependencies/dependencies.ts`.
3. **Aduana**: Los subcomponentes locales tampoco pueden importar librerías externas directamente; deben consumirlas desde `../dependencies/dependencies.ts`.
