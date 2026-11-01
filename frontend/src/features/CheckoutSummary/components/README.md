<!-- @pca:start
@id(feature.checkoutsummary.components.readme)
@kind(doc)
@limit(lines: 150)
@relates(feature.checkoutsummary.view)
@desc(Guía de subcomponentes privados del módulo CheckoutSummary)
@pca:end -->
# Componentes Locales — CheckoutSummary

Esta carpeta aloja los subcomponentes que pertenecen **exclusivamente** a la vista `CheckoutSummary`.

## Reglas FIDA para `components/`
1. **Aislamiento**: Ningún otro módulo fuera de `CheckoutSummary` puede importar archivos de esta carpeta.
2. **Promoción**: Si un componente de aquí necesita reutilizarse en otra vista, debe moverse a `shared/` y reexportarse a través de `../dependencies/dependencies.ts`.
3. **Aduana**: Los subcomponentes locales tampoco pueden importar librerías externas directamente; deben consumirlas desde `../dependencies/dependencies.ts`.
