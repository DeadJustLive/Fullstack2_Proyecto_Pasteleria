#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# @pca:start
# @id(fida.tools.guard)
# @kind(service)
# @limit(lines: 520)
# @contract(guard: bootstrap_project, sync_manifests, verify_fida_boundaries, evaluate_wal_guard)
# @relates(fida.tools.core)
# @relates(fida.tools.opl)
# @desc(Motor FIDA de autodescubrimiento, bootstrap de plantillas, sincronización modular, aduanas y guardián WAL)
# @pca:end

"""fida_opl_guard.py — Subsistemas FIDA de Bootstrap, Sync Modular, Aduanas y Guardián WAL.

Separado de `fida_opl_core.py` para cumplir estrictamente con `@limit` y mantener
alta cohesión:
- `bootstrap_project`: inyecta plantillas `@pca:start` en archivos nuevos respetando `.fidaignore`.
- `sync_manifests`: une manifiestos modulares (`docs/fida.module.json`) + autodiscovery en `fida.config.json`.
- `verify_fida_boundaries`: valida aduana (`dependencies/`), interfaces puras y dependencias huérfanas (`no-unused-dependencies`).
- `evaluate_wal_guard`: compara snapshots, genera diff de código, calcula score WAL (60%) y exige actualización de `decisions.md`.
"""

import difflib
import hashlib
import json
import re
from datetime import datetime
from pathlib import Path

import fida_opl_core as core

REEXPORT_SPEC_RE = re.compile(
    r"""export\s+(?:type\s+)?\{([^}]+)\}\s+from\s+["']([^"']+)["']""",
    re.MULTILINE,
)


def discover_fida_modules(base_dir, ignore_patterns):
    """Encuentra todas las carpetas de módulos FIDA que contienen `docs/fida.module.json`."""
    modules = []
    for mod_json in Path(base_dir).rglob("fida.module.json"):
        rel = core.rel_posix(mod_json, base_dir)
        if core.match_any(rel, ignore_patterns) and "fida.module.json" not in rel:
            continue
        if "templates/" in rel:
            continue
        mod_root = mod_json.parent.parent if mod_json.parent.name == "docs" else mod_json.parent
        modules.append(mod_root.resolve())
    return sorted(set(modules))


def bootstrap_project(config, languages, apply=False):
    """Escanea los archivos no ignorados e inyecta la plantilla base a los que no tengan `@pca:start`."""
    base = config["_base_dir"]
    limits_map = dict(core.DEFAULT_LIMITS)
    limits_map.update(config.get("defaults", {}).get("limits", {}))

    scanned = core.scan_project_files(config, languages)
    existing_by_path = {entry["path"]: entry for entry in config.get("files", [])}
    id_by_path = {}

    for path in scanned:
        rel = core.rel_posix(path, base)
        text = path.read_text(encoding="utf-8", errors="replace")
        block = core.extract_block_text(text)
        meta = core.parse_annotations(block) if block else {}
        node_id = meta.get("id") or existing_by_path.get(rel, {}).get("id") or core.synth_id(path, base)
        id_by_path[str(path.resolve())] = node_id

    bootstrapped, already_annotated = [], []

    for path in scanned:
        rel = core.rel_posix(path, base)
        text = path.read_text(encoding="utf-8", errors="replace")
        block = core.extract_block_text(text)
        if block:
            already_annotated.append(rel)
            continue

        kind = core.infer_kind_from_path(rel)
        node_id = id_by_path[str(path.resolve())]
        limit = limits_map.get(kind, 250)
        contract = core.extract_code_contract(text, path.suffix.lower())
        relates = []
        for imp in core.extract_imports(text):
            if imp.startswith("."):
                resolved_base = (path.parent / imp).resolve()
                for cand_ext in ("", ".ts", ".tsx", ".js", ".jsx", ".py", "/index.ts", "/dependencies.ts"):
                    cand = Path(str(resolved_base) + cand_ext)
                    if str(cand) in id_by_path:
                        target_id = id_by_path[str(cand)]
                        if target_id != node_id and target_id not in relates:
                            relates.append(target_id)
                        break

        entry = {
            "path": rel,
            "id": node_id,
            "kind": kind,
            "limit": limit,
            "contract": contract,
            "desc": f"Archivo {kind} auto-registrado por FIDA/OPL bootstrap ({Path(rel).name})",
            "relates": relates,
        }
        if apply:
            core.annotate_file(path, entry, languages, dry_run=False)
        bootstrapped.append(entry)

    return {"bootstrapped": bootstrapped, "already_annotated": already_annotated, "applied": apply}


def sync_manifests(config, languages):
    """Une Opción A (Autodiscovery desde cabeceras e imports) + Opción B (Manifiestos modulares `fida.module.json`)."""
    base = config["_base_dir"]
    ignore_patterns = config.get("_ignore_patterns", [])
    limits_map = dict(core.DEFAULT_LIMITS)
    limits_map.update(config.get("defaults", {}).get("limits", {}))

    all_scanned = core.scan_project_files(config, languages)
    path_to_id = {}
    file_entries = {}

    for path in all_scanned:
        rel = core.rel_posix(path, base)
        text = path.read_text(encoding="utf-8", errors="replace")
        block = core.extract_block_text(text)
        meta = core.parse_annotations(block) if block else {}
        node_id = meta.get("id") or core.synth_id(path, base)
        path_to_id[str(path.resolve())] = node_id

    for path in all_scanned:
        rel = core.rel_posix(path, base)
        text = path.read_text(encoding="utf-8", errors="replace")
        block = core.extract_block_text(text)
        meta = core.parse_annotations(block) if block else {}
        kind = meta.get("kind") or core.infer_kind_from_path(rel)
        node_id = path_to_id[str(path.resolve())]
        limit = core.normalize_limit(meta.get("limit")) or limits_map.get(kind, 250)
        contract = meta.get("contract") or core.extract_code_contract(text, path.suffix.lower())
        relates = list(meta.get("relates") or [])

        for imp in core.extract_imports(text):
            if imp.startswith("."):
                resolved_base = (path.parent / imp).resolve()
                for cand_ext in ("", ".ts", ".tsx", ".js", ".jsx", ".py"):
                    cand = Path(str(resolved_base) + cand_ext)
                    if str(cand) in path_to_id:
                        target_id = path_to_id[str(cand)]
                        if target_id != node_id and target_id not in relates:
                            relates.append(target_id)
                        break

        entry = {"path": rel, "id": node_id, "kind": kind, "limit": limit}
        if contract:
            entry["contract"] = contract
        entry["desc"] = meta.get("desc") or f"Elemento {kind} ({Path(rel).name})"
        entry["relates"] = relates
        file_entries[rel] = entry

    module_roots = discover_fida_modules(base, ignore_patterns)
    module_json_rels = []
    module_owned_paths = set()

    for mod_root in module_roots:
        mod_rel_prefix = core.rel_posix(mod_root, base)
        mod_files = []
        for rel, entry in sorted(file_entries.items()):
            if rel.startswith(mod_rel_prefix + "/"):
                module_owned_paths.add(rel)
                local_entry = dict(entry)
                local_entry["path"] = rel[len(mod_rel_prefix) + 1 :]
                mod_files.append(local_entry)

        mod_json_path = mod_root / "docs" / "fida.module.json"
        mod_name = mod_root.name
        mod_id = f"feature.{mod_name.lower()}"
        existing_mod = {}
        if mod_json_path.exists():
            try:
                existing_mod = json.loads(mod_json_path.read_text(encoding="utf-8"))
            except Exception:
                existing_mod = {}

        mod_payload = {
            "module": existing_mod.get("module", mod_name),
            "module_id": existing_mod.get("module_id", mod_id),
            "created_at": existing_mod.get("created_at", datetime.now().strftime("%Y-%m-%d")),
            "wal_threshold": existing_mod.get("wal_threshold", 60),
            "files": mod_files,
        }
        mod_json_path.parent.mkdir(parents=True, exist_ok=True)
        mod_json_path.write_text(json.dumps(mod_payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        module_json_rels.append(core.rel_posix(mod_json_path, base))

    non_module_files = [
        entry for rel, entry in sorted(file_entries.items()) if rel not in module_owned_paths
    ]
    config_path = config["_config_path"]
    raw_config = json.loads(config_path.read_text(encoding="utf-8"))
    raw_config["modules"] = sorted(module_json_rels)
    raw_config["files"] = non_module_files
    config_path.write_text(json.dumps(raw_config, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    return {
        "synced_modules": module_json_rels,
        "total_files": len(file_entries),
        "root_files": len(non_module_files),
    }


def verify_fida_boundaries(config):
    """Verifica aduana `dependencies/`, pureza de `interfaces/` y dependencias huérfanas (`no-unused-dependencies`)."""
    base = config["_base_dir"]
    ignore_patterns = config.get("_ignore_patterns", [])
    violations = []

    for mod_root in discover_fida_modules(base, ignore_patterns):
        mod_name = mod_root.name
        consumer_texts = []

        for sub in ("implementation", "components"):
            sub_dir = mod_root / sub
            if not sub_dir.exists():
                continue
            for file_path in sub_dir.rglob("*"):
                if not file_path.is_file() or file_path.suffix.lower() not in (".ts", ".tsx", ".js", ".jsx", ".py", ".kt", ".rs"):
                    continue
                text = file_path.read_text(encoding="utf-8", errors="replace")
                consumer_texts.append(core.strip_block_from_text(text))
                if file_path.suffix.lower() not in (".ts", ".tsx", ".js", ".jsx"):
                    continue
                for imp in core.extract_imports(text):
                    if imp in ("react", "react-dom", "react/jsx-runtime"):
                        continue
                    if imp.startswith("./"):
                        continue
                    if imp.startswith("../dependencies") or imp.startswith("../interfaces") or imp.startswith("../components"):
                        continue
                    violations.append({
                        "module": mod_name,
                        "path": core.rel_posix(file_path, base),
                        "rule": "fida/view-imports-through-gateway",
                        "detail": f"Importación prohibida '{imp}' fuera de la aduana '../dependencies/dependencies'",
                    })

        # 2. Check interfaces/ purity
        iface_dir = mod_root / "interfaces"
        if iface_dir.exists():
            for file_path in iface_dir.rglob("*"):
                if not file_path.is_file() or file_path.suffix.lower() not in (".ts", ".tsx"):
                    continue
                body = core.strip_block_from_text(file_path.read_text(encoding="utf-8", errors="replace"))
                if re.search(r"\b(?:class|function)\s+[A-Za-z_]\w*\s*[\({]", body):
                    violations.append({
                        "module": mod_name,
                        "path": core.rel_posix(file_path, base),
                        "rule": "fida/interface-no-implementation",
                        "detail": "El archivo de interfaz contiene lógica de implementación (class/function)",
                    })

        # 3. Check unused external exports in dependencies/ (Dead dependency detection)
        deps_dir = mod_root / "dependencies"
        combined_consumers = "\n".join(consumer_texts)
        if deps_dir.exists() and combined_consumers:
            for dep_file in deps_dir.rglob("*"):
                if not dep_file.is_file() or dep_file.suffix.lower() not in (".ts", ".tsx", ".js", ".jsx"):
                    continue
                dep_body = core.strip_code_comments(core.strip_block_from_text(dep_file.read_text(encoding="utf-8", errors="replace")))
                for match in REEXPORT_SPEC_RE.finditer(dep_body):
                    symbols_raw, source_mod = match.group(1), match.group(2)
                    if source_mod.startswith("../interfaces"):
                        continue
                    for item in symbols_raw.split(","):
                        cleaned = item.strip()
                        if not cleaned:
                            continue
                        alias = cleaned.split(" as ")[-1].replace("type ", "").strip()
                        if alias and not re.search(rf"\b{re.escape(alias)}\b", combined_consumers):
                            violations.append({
                                "module": mod_name,
                                "path": core.rel_posix(dep_file, base),
                                "rule": "fida/no-unused-dependencies",
                                "detail": f"Dependencia huérfana '{alias}' (de '{source_mod}') exportada en la aduana pero no usada en el módulo",
                            })

    return violations


def _file_snapshot_state(path, base_dir):
    text = path.read_text(encoding="utf-8", errors="replace")
    block = core.extract_block_text(text)
    meta = core.parse_annotations(block) if block else {}
    code_body = core.strip_block_from_text(text)
    clean_str = re.sub(r"\s+", "", code_body)
    return {
        "path": core.rel_posix(path, base_dir),
        "id": meta.get("id") or core.synth_id(path, base_dir),
        "kind": meta.get("kind") or core.infer_kind_from_path(core.rel_posix(path, base_dir)),
        "contract": meta.get("contract") or core.extract_code_contract(text, path.suffix.lower()) or "",
        "relates": meta.get("relates", []),
        "hash": hashlib.sha256(code_body.encode("utf-8")).hexdigest()[:16],
        "clean_chars": len(clean_str),
        "exported_symbols": core.EXPORT_SYMBOL_RE.findall(code_body),
        "imports": core.extract_imports(text),
        "functions": core.extract_functions(text),
        "code_lines": [ln.rstrip() for ln in code_body.splitlines()],
    }


def _decisions_hash(mod_root):
    dec_path = Path(mod_root) / "docs" / "decisions.md"
    if not dec_path.exists():
        return ""
    body = core.strip_block_from_text(dec_path.read_text(encoding="utf-8", errors="replace"))
    return hashlib.sha256(re.sub(r"\s+", " ", body).strip().encode("utf-8")).hexdigest()[:16]


def build_module_snapshot(mod_root, base_dir, languages):
    mod_root = Path(mod_root).resolve()
    files_state = {}
    for sub in ("interfaces", "dependencies", "implementation", "components"):
        sub_dir = mod_root / sub
        if not sub_dir.exists():
            continue
        for fpath in sorted(sub_dir.rglob("*")):
            if not fpath.is_file() or fpath.suffix.lower() not in languages:
                continue
            rel_mod = core.rel_posix(fpath, mod_root)
            files_state[rel_mod] = _file_snapshot_state(fpath, base_dir)
    return {
        "_comment": "FIDA/OPL WAL Snapshot — Generado por fida_opl.py guard. NO editar a mano.",
        "module": mod_root.name,
        "timestamp": datetime.now().isoformat(timespec="seconds"),
        "decisions_hash": _decisions_hash(mod_root),
        "files": files_state,
    }


def evaluate_wal_guard(config, languages, target_module=None, update_snapshot=False, force=False):
    base = config["_base_dir"]
    ignore_patterns = config.get("_ignore_patterns", [])
    threshold = config.get("defaults", {}).get("wal_threshold", 60)
    graph = core.build_graph(config, languages)

    modules = [Path(target_module).resolve()] if target_module else discover_fida_modules(base, ignore_patterns)
    reports = []

    for mod_root in modules:
        snap_path = mod_root / "docs" / ".snapshot.json"
        current = build_module_snapshot(mod_root, base, languages)

        if not snap_path.exists():
            snap_path.parent.mkdir(parents=True, exist_ok=True)
            snap_path.write_text(json.dumps(current, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
            reports.append({
                "module": mod_root.name,
                "score": 0,
                "level": "LOW",
                "status": "INITIALIZED",
                "details": [],
                "diffs": [],
                "affected_nodes": [],
                "remediation_prompt": None,
            })
            continue

        previous = json.loads(snap_path.read_text(encoding="utf-8"))
        prev_files = previous.get("files", {})
        curr_files = current.get("files", {})
        score, details, diffs, changed_ids = 0, [], [], set()

        for rel_key in sorted(set(prev_files.keys()) | set(curr_files.keys())):
            old_f, new_f = prev_files.get(rel_key), curr_files.get(rel_key)
            if old_f and not new_f:
                score += 50
                details.append({"file": rel_key, "score": 50, "reason": "Archivo eliminado del módulo"})
                changed_ids.add(old_f["id"])
                continue
            if new_f and not old_f:
                add_score = 50 if new_f["kind"] in ("interface", "dependencies") else 20
                score += add_score
                details.append({"file": rel_key, "score": add_score, "reason": f"Archivo nuevo ({new_f['kind']})"})
                changed_ids.add(new_f["id"])
                continue
            if old_f["hash"] == new_f["hash"] and old_f["contract"] == new_f["contract"]:
                continue

            changed_ids.add(new_f["id"])
            diff_lines = list(
                difflib.unified_diff(
                    old_f.get("code_lines", []),
                    new_f.get("code_lines", []),
                    fromfile=f"snapshot/{rel_key}",
                    tofile=f"actual/{rel_key}",
                    lineterm="",
                    n=2,
                )
            )
            if diff_lines:
                diffs.append("\n".join(diff_lines[:40]))

            kind = new_f["kind"]
            if kind == "interface":
                score += 60
                details.append({
                    "file": rel_key,
                    "score": 60,
                    "reason": f"Cambio en Contrato/Interface ({old_f.get('contract')} -> {new_f.get('contract')})",
                })
            elif kind == "dependencies":
                added_imp = set(new_f.get("imports", [])) - set(old_f.get("imports", []))
                rem_imp = set(old_f.get("imports", [])) - set(new_f.get("imports", []))
                pts = 40 * max(len(added_imp) + len(rem_imp), 1)
                score += pts
                details.append({
                    "file": rel_key,
                    "score": pts,
                    "reason": f"Cambio en Aduana de Dependencias (+{len(added_imp)} / -{len(rem_imp)} imports)",
                })
            else:
                added_fn = set(new_f.get("functions", [])) - set(old_f.get("functions", []))
                rem_fn = set(old_f.get("functions", [])) - set(new_f.get("functions", []))
                fn_count = len(added_fn) + len(rem_fn)
                if fn_count:
                    pts = fn_count * 15
                    score += pts
                    details.append({
                        "file": rel_key,
                        "score": pts,
                        "reason": f"Funciones internas modificadas (+{len(added_fn)} / -{len(rem_fn)})",
                    })
                char_diff = abs(new_f.get("clean_chars", 0) - old_f.get("clean_chars", 0))
                if char_diff == 0 and old_f["hash"] != new_f["hash"]:
                    char_diff = sum(len(ln) for ln in diff_lines if ln.startswith("+") or ln.startswith("-"))
                pts = 2 if char_diff < 50 else 10
                score += pts
                details.append({
                    "file": rel_key,
                    "score": pts,
                    "reason": f"Diferencia de código limpio ({char_diff} chars sin espacios)",
                })

        # Handle --update-snapshot with cryptographic check on docs/decisions.md
        if update_snapshot:
            old_dec_hash = previous.get("decisions_hash", "")
            new_dec_hash = current.get("decisions_hash", "")
            if score >= threshold and not force and old_dec_hash and old_dec_hash == new_dec_hash:
                dec_rel = core.rel_posix(mod_root / "docs" / "decisions.md", base)
                reports.append({
                    "module": mod_root.name,
                    "score": score,
                    "level": "HIGH",
                    "status": "BLOCKED",
                    "details": details,
                    "diffs": diffs,
                    "affected_nodes": [],
                    "remediation_prompt": (
                        f"[WAL REJECTED — Documentación sin actualizar en {mod_root.name}]\n"
                        f"Intentaste ejecutar `guard --update-snapshot` con un cambio estructural (Score: {score}% >= {threshold}%),\n"
                        f"pero `{dec_rel}` NO fue modificado respecto al snapshot anterior.\n"
                        f"👉 Registra primero la decisión arquitectónica en `{dec_rel}` y vuelve a ejecutar `--update-snapshot`."
                    ),
                })
                continue

            snap_path.write_text(json.dumps(current, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
            reports.append({
                "module": mod_root.name,
                "score": 0,
                "level": "LOW",
                "status": "SNAPSHOT_UPDATED",
                "details": [],
                "diffs": [],
                "affected_nodes": [],
                "remediation_prompt": None,
            })
            continue

        affected = set()
        for cid in changed_ids:
            for dep in core.compute_impact(graph, cid, transitive=True):
                affected.add(dep)

        level = "HIGH" if score >= threshold else ("MEDIUM" if score >= 30 else "LOW")
        remediation_prompt = None
        if level == "HIGH":
            remediation_prompt = (
                f"[WAL REMEDIATION REQUIRED — Módulo {mod_root.name} (Score: {score}% >= {threshold}%)]\n"
                f"1. Archivos modificados: {', '.join(d['file'] for d in details)}\n"
                f"2. Nodos afectados transitivamente (@relates): {', '.join(sorted(affected)) or 'ninguno externo'}\n"
                f"3. Acción requerida para el Agente IA:\n"
                f"   - Revisa el diff de código abajo.\n"
                f"   - Actualiza `{core.rel_posix(mod_root / 'docs' / 'decisions.md', base)}` registrando la decisión y el impacto.\n"
                f"   - Sincroniza cabeceras con `python3 fida-kit/tools/fida_opl.py sync`.\n"
                f"   - Confirma la transacción WAL ejecutando: `python3 fida-kit/tools/fida_opl.py guard --update-snapshot`."
            )

        reports.append({
            "module": mod_root.name,
            "score": score,
            "level": level,
            "status": "BLOCKED" if level == "HIGH" else ("WARNING" if level == "MEDIUM" else "OK"),
            "details": details,
            "diffs": diffs,
            "affected_nodes": sorted(affected),
            "remediation_prompt": remediation_prompt,
        })

    return reports
