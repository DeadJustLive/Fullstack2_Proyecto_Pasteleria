#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# @pca:start
# @id(fida.tools.strip)
# @kind(service)
# @limit(lines: 240)
# @contract(strip_project(target_root, apply, purge_artifacts))
# @relates(fida.tools.opl)
# @desc(Motor de limpieza de cabeceras @pca y purga de artefactos FIDA/OPL/PCA para rama de produccion o entrega)
# @pca:end

"""fida_opl_strip.py — Limpieza total de anotaciones @pca y artefactos FIDA/OPL/PCA.

Diseñado para ejecutarse sobre una rama dedicada de entrega o producción
(`python fida-kit/tools/fida_opl.py strip --apply --purge-artifacts`),
manteniendo intacta la gobernanza en la rama `dev`.
"""

import re
import shutil
from pathlib import Path

SKIP_DIRS = {".git", "node_modules", "dist", "target", "__pycache__", ".idea", ".vscode"}
TEXT_EXTS = {
    ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
    ".java", ".py", ".rb", ".sh", ".bat",
    ".css", ".scss", ".less", ".html", ".htm",
    ".md", ".markdown", ".yml", ".yaml", ".toml", ".sql", ".xml",
}

ARTIFACT_DIRS = ["fida-kit", "tools", "prompts", "setup", "docs/tickets"]
ARTIFACT_ROOT_FILES = [
    "AGENTS.md",
    "fida.config.json",
    ".fidaignore",
    "grafo.json",
    "grafo.mmd",
    "grafo.dot",
    "docs/sistema_anotaciones.md",
    "docs/cicatrices_guerra.md",
    "docs/estado_proyecto.md",
    "docs/plantilla_ticket.md",
    "docs/diccionario_funciones_variables.md",
]


def _strip_pca_from_text(text: str, purge_fida_jsdoc: bool = False) -> tuple[str, bool]:
    eol = "\r\n" if "\r\n" in text else "\n"
    lines = text.splitlines()
    start = end = None
    for idx, line in enumerate(lines):
        if "@pca:start" in line and start is None:
            start = idx
        if "@pca:end" in line and start is not None:
            end = idx
            break

    changed = False
    if start is not None and end is not None:
        # Si la linea inmediatamente posterior al bloque esta en blanco y el bloque estaba al inicio,
        # la removemos tambien para no dejar lineas vacias al principio del archivo.
        after_end = end + 1
        if start == 0 and after_end < len(lines) and lines[after_end].strip() == "":
            after_end += 1
        lines = lines[:start] + lines[after_end:]
        changed = True

    new_text = eol.join(lines)
    if text.endswith(("\n", "\r\n")) and new_text and not new_text.endswith(eol):
        new_text += eol

    if purge_fida_jsdoc:
        cleaned = new_text
        cleaned = re.sub(r"FIDA\s*-\s*Dependencies Layer \(D\)", "Module Dependencies Gateway", cleaned)
        cleaned = re.sub(r"FIDA\s*-\s*Interface Layer \(I\)", "Module Public Contract", cleaned)
        cleaned = re.sub(r".*Nivel de Impacto FIDA.*\r?\n", "", cleaned)
        cleaned = re.sub(r"FIDA Features — Módulos Críticos de Negocio FIDA", "Domain Features — Módulos Críticos de Negocio", cleaned)
        if cleaned != new_text:
            new_text = cleaned
            changed = True

    return new_text, changed


def strip_project(target_root: Path, apply: bool = False, purge_artifacts: bool = False) -> dict:
    target_root = target_root.resolve()
    stripped_files = []
    purged_paths = []
    renamed_files = []

    for path in sorted(target_root.rglob("*")):
        if not path.is_file():
            continue
        rel_parts = path.relative_to(target_root).parts
        if any(p in SKIP_DIRS for p in rel_parts):
            continue
        # Si no se purgan artefactos, no tocar fida-kit ni tools
        if not purge_artifacts and rel_parts and rel_parts[0] in ("fida-kit", "tools"):
            continue
        if purge_artifacts and rel_parts and rel_parts[0] in ("fida-kit", "tools", "prompts", "setup"):
            continue
        if path.suffix.lower() not in TEXT_EXTS:
            continue

        try:
            raw = path.read_text(encoding="utf-8")
        except Exception:
            continue

        new_text, changed = _strip_pca_from_text(raw, purge_fida_jsdoc=purge_artifacts)
        if changed:
            rel_str = path.relative_to(target_root).as_posix()
            stripped_files.append(rel_str)
            if apply:
                path.write_text(new_text, encoding="utf-8")

    if purge_artifacts:
        # 1. Renombrar test con nombre FIDA si existe
        old_test = target_root / "frontend/src/test/features/fida-features.test.tsx"
        new_test = target_root / "frontend/src/test/features/domain-features.test.tsx"
        if old_test.exists():
            renamed_files.append(("frontend/src/test/features/fida-features.test.tsx", "frontend/src/test/features/domain-features.test.tsx"))
            if apply:
                old_test.rename(new_test)

        # 2. Eliminar archivos sueltos de metadatos FIDA/OPL (.snapshot.json, fida.module.json, decisions.md de módulos)
        for path in sorted(target_root.rglob("*")):
            if not path.exists():
                continue
            rel_parts = path.relative_to(target_root).parts
            if any(p in SKIP_DIRS for p in rel_parts):
                continue
            if path.is_file() and (
                path.name in (".snapshot.json", "fida.module.json")
                or (path.name == "decisions.md" and "docs" in rel_parts)
                or (path.name == "README.md" and "features" in rel_parts and "components" in rel_parts)
            ):
                rel_str = path.relative_to(target_root).as_posix()
                purged_paths.append(rel_str)
                if apply:
                    path.unlink(missing_ok=True)
                    if path.parent.exists() and not any(path.parent.iterdir()):
                        path.parent.rmdir()

        # 3. Eliminar archivos raíz de gobernanza
        for rel_file in ARTIFACT_ROOT_FILES:
            p = target_root / rel_file
            if p.exists() and p.is_file():
                purged_paths.append(rel_file)
                if apply:
                    p.unlink(missing_ok=True)

        # 4. Eliminar directorios completos de gobernanza (fida-kit, tools, prompts, setup, docs/tickets)
        for rel_dir in ARTIFACT_DIRS:
            d = target_root / rel_dir
            if d.exists() and d.is_dir():
                purged_paths.append(rel_dir + "/")
                if apply:
                    shutil.rmtree(d, ignore_errors=True)

    return {
        "apply": apply,
        "purge_artifacts": purge_artifacts,
        "stripped_count": len(stripped_files),
        "stripped_files": stripped_files,
        "purged_count": len(purged_paths),
        "purged_paths": purged_paths,
        "renamed_files": renamed_files,
    }
