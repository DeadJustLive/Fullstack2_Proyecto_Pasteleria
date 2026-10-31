<!-- @pca:start
@id(fida.agents.guide)
@kind(doc)
@limit(lines: 250)
@relates(fida.tools.opl)
@desc(Directrices obligatorias para Agentes de IA que operan en proyectos con arquitectura FIDA + OPL)
@pca:end -->
# Directrices Obligatorias para Agentes de IA (Arquitectura FIDA + OPL)

Este proyecto está gobernado por **FIDA + OPL** (`fida_opl.py`). Como Agente de IA, **ESTÁS OBLIGADO** a respetar las fronteras modulares, las aduanas de importación y el protocolo transaccional de documentación (WAL).

---

## 1. Regla PCA (Razonamiento Previo Obligatorio)
Antes de modificar cualquier archivo, incluye siempre en tu análisis:
- **P (Por qué)**: Justificación técnica o de negocio del cambio.
- **C (Cómo)**: En qué capa FIDA (`interfaces/`, `dependencies/`, `implementation/`, `components/`, `docs/`) se aplicará.
- **A (A qué afecta)**: Ejecuta `python3 fida-kit/tools/fida_opl.py impact <id> --transitive` para conocer los nodos dependientes antes de editar.

---

## 2. Anatomía Innegociable de un Módulo FIDA
Nunca crees vistas o features sueltas. Todo módulo nuevo se crea ejecutando:

```bash
python3 fida-kit/tools/fida_opl.py init <NombreModulo> --lang <ts|js|py|kt|rs>
```

Cada módulo tiene **5 subcarpetas con responsabilidades estrictas**:
1. `interfaces/`: Solo contratos, tipos, interfaces o protocolos. **PROHIBIDO** poner lógica ejecutable aquí (`fida/interface-no-implementation`).
2. `dependencies/`: **La Aduana**. Único archivo autorizado para importar librerías externas, `core/` o `shared/`. **PROHIBIDO** dejar dependencias exportadas que no se usen en el módulo (`fida/no-unused-dependencies`).
3. `implementation/`: La vista o implementación del módulo. **PROHIBIDO** importar nada externo directamente; todo debe importarse desde `../dependencies/dependencies` (`fida/view-imports-through-gateway`).
4. `components/`: Subcomponentes privados y exclusivos de este módulo. Siguen la misma regla de aduana que `implementation/`.
5. `docs/`: Contiene `decisions.md` (ADR), `fida.module.json` (manifiesto modular) y `.snapshot.json` (foto WAL).

---

## 3. Cero Trabajo Manual en Anotaciones (`bootstrap` y `sync`)
- No escribas ni edites JSON gigantes a mano.
- Si agregas archivos nuevos fuera de `init`, ejecuta:
  ```bash
  python3 fida-kit/tools/fida_opl.py bootstrap --apply
  python3 fida-kit/tools/fida_opl.py sync
  ```
- Si un archivo no debe llevar anotaciones (assets, configs, locks), agrégalo a `.fidaignore`.

---

## 4. Protocolo Transaccional WAL (`guard`)
Antes de finalizar tu turno o hacer commit, **SIEMPRE** ejecuta:

```bash
python3 fida-kit/tools/fida_opl.py sync
python3 fida-kit/tools/fida_opl.py check --strict
python3 fida-kit/tools/fida_opl.py guard
```

### ¿Qué hacer si `guard` bloquea con Impacto HIGH (Score ≥ 60%)?
1. **NO intentes ejecutar `guard --update-snapshot` sin documentar primero**: el guardián verifica criptográficamente el hash de `docs/decisions.md` y **rechazará** actualizar el snapshot si no has documentado el cambio.
2. Lee el diff de código y los nodos afectados que imprime `guard`.
3. Registra la nueva decisión arquitectónica y su impacto en `docs/decisions.md` del módulo afectado.
4. Ahora sí, confirma la transacción WAL ejecutando:
   ```bash
   python3 fida-kit/tools/fida_opl.py guard --update-snapshot
   ```
