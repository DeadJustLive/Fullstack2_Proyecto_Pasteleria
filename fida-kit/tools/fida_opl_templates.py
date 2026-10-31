#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# @pca:start
# @id(fida.tools.templates)
# @kind(service)
# @limit(lines: 350)
# @contract(templates: scaffold_module_by_lang, install_project_kit, SUPPORTED_LANGS)
# @relates(fida.tools.core)
# @relates(fida.tools.opl)
# @desc(Generador multi-lenguaje de módulos FIDA (ts, js, py, kt, rs) e instalador de 1 comando install-project)
# @pca:end

"""fida_opl_templates.py — Scaffolding multi-lenguaje (`ts`, `js`, `py`, `kt`, `rs`) e instalador de proyecto.

Permite crear módulos FIDA con las 5 subcarpetas (`interfaces/`, `dependencies/`,
`implementation/`, `components/`, `docs/`) adaptadas al lenguaje del proyecto, y
configurar cualquier repositorio anfitrión con `install-project`.
"""

import json
import re
import shutil
import stat
from pathlib import Path

import fida_opl_core as core

SUPPORTED_LANGS = ("ts", "js", "py", "kt", "rs")


def _to_snake(name):
    s1 = re.sub(r"(.)([A-Z][a-z]+)", r"\1_\2", name)
    return re.sub(r"([a-z0-9])([A-Z])", r"\1_\2", s1).lower()


def _lang_files(mod_name, mod_id, snake, lang):
    if lang == "js":
        return {
            f"interfaces/I{mod_name}.js": (
                f"// @pca:start\n// @id(feature.{mod_id}.interface)\n// @kind(interface)\n"
                f"// @limit(lines: 150)\n// @contract(validate{mod_name}Props)\n"
                f"// @desc(Contrato público JSDoc y validación para el módulo {mod_name})\n// @pca:end\n\n"
                f"/**\n * @typedef {{Object}} I{mod_name}Contract\n * @property {{string}} [title]\n * @property {{() => void}} [onAction]\n */\n\n"
                f"export const {mod_name}ContractShape = Object.freeze({{ title: 'string', onAction: 'function' }});\n"
            ),
            "dependencies/dependencies.js": (
                f"// @pca:start\n// @id(feature.{mod_id}.dependencies)\n// @kind(dependencies)\n"
                f"// @limit(lines: 120)\n// @contract(gateway: {mod_name}ContractShape)\n"
                f"// @relates(feature.{mod_id}.interface)\n"
                f"// @desc(Aduana de importaciones externas del módulo {mod_name})\n// @pca:end\n\n"
                f"export {{ {mod_name}ContractShape }} from '../interfaces/I{mod_name}.js';\n"
            ),
            f"implementation/{mod_name}.view.js": (
                f"// @pca:start\n// @id(feature.{mod_id}.view)\n// @kind(view)\n"
                f"// @limit(lines: 300)\n// @contract({mod_name}View(props))\n"
                f"// @relates(feature.{mod_id}.interface)\n// @relates(feature.{mod_id}.dependencies)\n"
                f"// @desc(Implementación visual principal del módulo {mod_name})\n// @pca:end\n\n"
                f"import {{ {mod_name}ContractShape }} from '../dependencies/dependencies.js';\n\n"
                f"export function {mod_name}View(props = {{}}) {{\n"
                f"  const {{ title = '{mod_name}', onAction }} = props;\n"
                f"  return {{ title, schema: {mod_name}ContractShape, trigger: () => onAction && onAction() }};\n"
                f"}}\n"
            ),
        }

    if lang == "py":
        return {
            f"interfaces/i_{snake}.py": (
                f"# @pca:start\n# @id(feature.{mod_id}.interface)\n# @kind(interface)\n"
                f"# @limit(lines: 150)\n# @contract(I{mod_name}Contract)\n"
                f"# @desc(Contrato Protocol para el módulo {mod_name})\n# @pca:end\n\n"
                f"from typing import Callable, Optional, Protocol\n\n\n"
                f"class I{mod_name}Contract(Protocol):\n"
                f"    title: str\n"
                f"    on_action: Optional[Callable[[], None]]\n"
            ),
            "dependencies/dependencies.py": (
                f"# @pca:start\n# @id(feature.{mod_id}.dependencies)\n# @kind(dependencies)\n"
                f"# @limit(lines: 120)\n# @contract(gateway: I{mod_name}Contract)\n"
                f"# @relates(feature.{mod_id}.interface)\n"
                f"# @desc(Aduana de importaciones externas del módulo {mod_name})\n# @pca:end\n\n"
                f"from ..interfaces.i_{snake} import I{mod_name}Contract\n\n"
                f"__all__ = ['I{mod_name}Contract']\n"
            ),
            f"implementation/{snake}_view.py": (
                f"# @pca:start\n# @id(feature.{mod_id}.view)\n# @kind(view)\n"
                f"# @limit(lines: 300)\n# @contract(render_{snake}_view(contract: I{mod_name}Contract))\n"
                f"# @relates(feature.{mod_id}.interface)\n# @relates(feature.{mod_id}.dependencies)\n"
                f"# @desc(Implementación principal del módulo {mod_name})\n# @pca:end\n\n"
                f"from ..dependencies.dependencies import I{mod_name}Contract\n\n\n"
                f"def render_{snake}_view(contract: I{mod_name}Contract) -> dict:\n"
                f"    return {{'title': getattr(contract, 'title', '{mod_name}')}}\n"
            ),
        }

    if lang == "kt":
        return {
            f"interfaces/I{mod_name}.kt": (
                f"// @pca:start\n// @id(feature.{mod_id}.interface)\n// @kind(interface)\n"
                f"// @limit(lines: 150)\n// @contract(I{mod_name}Contract)\n"
                f"// @desc(Contrato público Kotlin para el módulo {mod_name})\n// @pca:end\n\n"
                f"package features.{mod_id}.interfaces\n\n"
                f"interface I{mod_name}Contract {{\n"
                f"    val title: String\n"
                f"    fun onAction()\n"
                f"}}\n"
            ),
            "dependencies/Dependencies.kt": (
                f"// @pca:start\n// @id(feature.{mod_id}.dependencies)\n// @kind(dependencies)\n"
                f"// @limit(lines: 120)\n// @contract(gateway: {mod_name}Dependencies)\n"
                f"// @relates(feature.{mod_id}.interface)\n"
                f"// @desc(Aduana de dependencias externas del módulo {mod_name})\n// @pca:end\n\n"
                f"package features.{mod_id}.dependencies\n\n"
                f"import features.{mod_id}.interfaces.I{mod_name}Contract\n\n"
                f"typealias {mod_name}ContractGateway = I{mod_name}Contract\n"
            ),
            f"implementation/{mod_name}View.kt": (
                f"// @pca:start\n// @id(feature.{mod_id}.view)\n// @kind(view)\n"
                f"// @limit(lines: 300)\n// @contract({mod_name}View(contract: {mod_name}ContractGateway))\n"
                f"// @relates(feature.{mod_id}.interface)\n// @relates(feature.{mod_id}.dependencies)\n"
                f"// @desc(Implementación visual del módulo {mod_name})\n// @pca:end\n\n"
                f"package features.{mod_id}.implementation\n\n"
                f"import features.{mod_id}.dependencies.{mod_name}ContractGateway\n\n"
                f"class {mod_name}View(private val contract: {mod_name}ContractGateway) {{\n"
                f"    fun render(): String = contract.title\n"
                f"}}\n"
            ),
        }

    if lang == "rs":
        return {
            f"interfaces/i_{snake}.rs": (
                f"// @pca:start\n// @id(feature.{mod_id}.interface)\n// @kind(interface)\n"
                f"// @limit(lines: 150)\n// @contract(I{mod_name}Contract)\n"
                f"// @desc(Trait de contrato público para el módulo {mod_name})\n// @pca:end\n\n"
                f"pub trait I{mod_name}Contract {{\n"
                f"    fn title(&self) -> &str;\n"
                f"    fn on_action(&self);\n"
                f"}}\n"
            ),
            "dependencies/dependencies.rs": (
                f"// @pca:start\n// @id(feature.{mod_id}.dependencies)\n// @kind(dependencies)\n"
                f"// @limit(lines: 120)\n// @contract(gateway: I{mod_name}Contract)\n"
                f"// @relates(feature.{mod_id}.interface)\n"
                f"// @desc(Aduana de dependencias del módulo {mod_name})\n// @pca:end\n\n"
                f"pub use crate::features::{snake}::interfaces::i_{snake}::I{mod_name}Contract;\n"
            ),
            f"implementation/{snake}_view.rs": (
                f"// @pca:start\n// @id(feature.{mod_id}.view)\n// @kind(view)\n"
                f"// @limit(lines: 300)\n// @contract(render_{snake})\n"
                f"// @relates(feature.{mod_id}.interface)\n// @relates(feature.{mod_id}.dependencies)\n"
                f"// @desc(Implementación del módulo {mod_name})\n// @pca:end\n\n"
                f"use super::super::dependencies::dependencies::I{mod_name}Contract;\n\n"
                f"pub fn render_{snake}<T: I{mod_name}Contract>(contract: &T) -> String {{\n"
                f"    contract.title().to_string()\n"
                f"}}\n"
            ),
        }

    return None


def scaffold_module_by_lang(mod_name, mod_dir, base_dir, kit_root, date_str, lang="ts"):
    mod_id = mod_name.lower()
    snake = _to_snake(mod_name)
    tpl_root = Path(kit_root) / "templates" / "module"

    for sub in core.FIDA_SUBFOLDERS:
        (mod_dir / sub).mkdir(parents=True, exist_ok=True)

    created = []
    if lang == "ts":
        code_map = {
            tpl_root / "interfaces" / "IModuleName.ts": mod_dir / "interfaces" / f"I{mod_name}.ts",
            tpl_root / "dependencies" / "dependencies.ts": mod_dir / "dependencies" / "dependencies.ts",
            tpl_root / "implementation" / "ModuleName.view.tsx": mod_dir / "implementation" / f"{mod_name}.view.tsx",
        }
        for src_tpl, dst_path in code_map.items():
            content = (
                src_tpl.read_text(encoding="utf-8")
                .replace("[MODULE_NAME]", mod_name)
                .replace("[MODULE_ID]", mod_id)
                .replace("[DATE]", date_str)
            )
            dst_path.write_text(content, encoding="utf-8")
            created.append(core.rel_posix(dst_path, base_dir))
    else:
        custom_files = _lang_files(mod_name, mod_id, snake, lang)
        for rel_file, content in custom_files.items():
            dst_path = mod_dir / rel_file
            dst_path.parent.mkdir(parents=True, exist_ok=True)
            dst_path.write_text(content, encoding="utf-8")
            created.append(core.rel_posix(dst_path, base_dir))

    # Common docs & components files
    for rel_tpl in ("components/README.md", "docs/decisions.md", "docs/fida.module.json"):
        src_tpl = tpl_root / rel_tpl
        dst_path = mod_dir / rel_tpl
        content = (
            src_tpl.read_text(encoding="utf-8")
            .replace("[MODULE_NAME]", mod_name)
            .replace("[MODULE_ID]", mod_id)
            .replace("[DATE]", date_str)
        )
        dst_path.write_text(content, encoding="utf-8")
        created.append(core.rel_posix(dst_path, base_dir))

    return created


def install_project_kit(target_root, kit_root):
    """Instala `.fidaignore`, `fida.config.json`, `AGENTS.md` y el hook `pre-commit` en el proyecto anfitrión."""
    target_root = Path(target_root).resolve()
    kit_root = Path(kit_root).resolve()
    installed = []

    for fname in (".fidaignore", "AGENTS.md"):
        src = kit_root / fname
        dst = target_root / fname
        if src.exists() and not dst.exists():
            shutil.copy2(src, dst)
            installed.append(str(dst.relative_to(target_root)))
        elif fname == ".fidaignore" and not dst.exists():
            dst.write_text(
                "# .fidaignore — Exclusiones para FIDA + OPL\n"
                ".git/\n"
                "node_modules/\n"
                "dist/\n"
                "build/\n"
                "target/\n"
                ".env\n"
                ".env.*\n"
                "**/.env\n"
                "**/*.bak\n"
                "**/.snapshot*.json\n"
                "**/grafo.*\n",
                encoding="utf-8",
            )
            installed.append(".fidaignore")

    cfg_dst = target_root / "fida.config.json"
    if not cfg_dst.exists():
        default_cfg = {
            "_annotation": {
                "id": "fida.config",
                "kind": "config",
                "desc": "Índice central sincronizado de FIDA/OPL",
                "relates": ["fida.tools.opl"],
            },
            "base_dir": ".",
            "ignore_file": ".fidaignore",
            "features_dir": "src/features",
            "roots": ["src", "docs"],
            "include": ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx", "**/*.py", "**/*.rs", "**/*.kt", "**/*.css", "**/*.html", "**/*.md"],
            "exclude": ["**/grafo.*", "**/*.bak", "**/.snapshot*.json"],
            "defaults": {
                "limits": dict(core.DEFAULT_LIMITS),
                "wal_threshold": 60,
            },
            "modules": [],
            "files": [],
            "options": {"output_dir": "."},
            "languages": {},
        }
        cfg_dst.write_text(json.dumps(default_cfg, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        installed.append("fida.config.json")

    git_hooks_dir = target_root / ".git" / "hooks"
    hook_src = kit_root / "scripts" / "fida-pre-commit.sh"
    if git_hooks_dir.exists() and hook_src.exists():
        hook_dst = git_hooks_dir / "pre-commit"
        shutil.copy2(hook_src, hook_dst)
        hook_dst.chmod(hook_dst.stat().st_mode | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)
        installed.append(".git/hooks/pre-commit")

    return installed
