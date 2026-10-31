#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# @pca:start
# @id(fida.tools.core)
# @kind(service)
# @limit(lines: 650)
# @contract(core: load_config, parse_annotations, annotate_file, build_graph, compute_impact, find_drift)
# @relates(fida.tools.opl)
# @relates(fida.tools.guard)
# @relates(fida.tools.selftest)
# @desc(Motor base de FIDA/OPL: parser de paréntesis balanceados, .fidaignore, inyección de bloques, grafo e impacto)
# @pca:end

"""fida_opl_core.py — Núcleo base del kit FIDA + OPL (0 dependencias externas).

Contiene el parser de paréntesis balanceados, el soporte para `.fidaignore`,
la inyección idempotente de bloques `@pca:start`, la construcción del grafo y
el cálculo de impacto. Las funciones avanzadas de FIDA (bootstrap, sync modular,
aduanas y guardián WAL) viven en `fida_opl_guard.py` y se reexportan aquí.
"""

import fnmatch
import json
import os
import re
from datetime import datetime
from pathlib import Path

MARKER_START = "@pca:start"
MARKER_END = "@pca:end"

DEFAULT_LANGUAGES = {
    ".py": {"line_prefix": "#"},
    ".sh": {"line_prefix": "#"},
    ".rb": {"line_prefix": "#"},
    ".yml": {"line_prefix": "#"},
    ".yaml": {"line_prefix": "#"},
    ".toml": {"line_prefix": "#"},
    ".js": {"line_prefix": "//"},
    ".jsx": {"line_prefix": "//"},
    ".ts": {"line_prefix": "//"},
    ".tsx": {"line_prefix": "//"},
    ".java": {"line_prefix": "//"},
    ".c": {"line_prefix": "//"},
    ".cpp": {"line_prefix": "//"},
    ".h": {"line_prefix": "//"},
    ".cs": {"line_prefix": "//"},
    ".go": {"line_prefix": "//"},
    ".rs": {"line_prefix": "//"},
    ".kt": {"line_prefix": "//"},
    ".kts": {"line_prefix": "//"},
    ".swift": {"line_prefix": "//"},
    ".css": {"block_open": "/*", "block_close": "*/"},
    ".scss": {"block_open": "/*", "block_close": "*/"},
    ".less": {"block_open": "/*", "block_close": "*/"},
    ".html": {"block_open": "<!--", "block_close": "-->"},
    ".htm": {"block_open": "<!--", "block_close": "-->"},
    ".xml": {"block_open": "<!--", "block_close": "-->"},
    ".svg": {"block_open": "<!--", "block_close": "-->"},
    ".md": {"block_open": "<!--", "block_close": "-->"},
    ".markdown": {"block_open": "<!--", "block_close": "-->"},
    ".sql": {"line_prefix": "--"},
}

DEFAULT_LIMITS = {
    "interface": 150,
    "dependencies": 120,
    "view": 300,
    "controller": 250,
    "component": 200,
    "service": 350,
    "model": 200,
    "util": 200,
    "doc": 600,
    "test": 400,
    "config": 300,
}

FIDA_SUBFOLDERS = ("interfaces", "dependencies", "implementation", "components", "docs")

IMPORT_FROM_RE = re.compile(
    r"""(?:import|export)\s+(?:type\s+)?(?:[^"']*?\s+from\s+)?["']([^"']+)["']""",
    re.MULTILINE,
)
EXPORT_SYMBOL_RE = re.compile(
    r"""export\s+(?:default\s+)?(?:async\s+)?(?:interface|type|class|function|const|let|enum)\s+([A-Za-z_]\w*)"""
)
PY_DEF_RE = re.compile(r"""^(?:def|class)\s+([A-Za-z_]\w*)""", re.MULTILINE)
FUNC_DECL_RE = re.compile(
    r"""(?:function\s+([A-Za-z_]\w*)|(?:const|let)\s+([A-Za-z_]\w*)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z_]\w*)\s*=>|def\s+([A-Za-z_]\w*))"""
)


def rel_posix(path, base):
    try:
        return Path(path).resolve().relative_to(Path(base).resolve()).as_posix()
    except ValueError:
        return Path(os.path.relpath(path, base)).as_posix()


def normalize_limit(value):
    if value is None:
        return None
    if isinstance(value, int):
        return value
    match = re.search(r"(\d+)", str(value))
    return int(match.group(1)) if match else None


def load_ignore_patterns(base_dir, ignore_file=".fidaignore", extra_exclude=None):
    patterns = list(extra_exclude or [])
    candidates = [Path(base_dir) / ignore_file, Path(base_dir) / "fida-kit" / ignore_file]
    for candidate in candidates:
        if candidate.exists():
            for raw in candidate.read_text(encoding="utf-8", errors="replace").splitlines():
                line = raw.strip()
                if not line or line.startswith("#"):
                    continue
                if line not in patterns:
                    patterns.append(line)
            break
    return patterns


def match_any(rel, patterns):
    rel = rel.replace(os.sep, "/").strip("/")
    name = rel.rsplit("/", 1)[-1]
    parts = rel.split("/")
    for pattern in patterns:
        pat = pattern.strip()
        if not pat:
            continue
        if pat.endswith("/"):
            dir_name = pat.rstrip("/")
            if dir_name in parts or rel.startswith(dir_name + "/"):
                return True
        clean = pat[3:] if pat.startswith("**/") else pat
        if clean.endswith("/**"):
            prefix = clean[:-3].rstrip("/")
            if rel == prefix or rel.startswith(prefix + "/") or prefix in parts:
                return True
        if fnmatch.fnmatch(rel, clean) or fnmatch.fnmatch(name, clean) or fnmatch.fnmatch(rel, pat):
            return True
    return False


def load_config(config_path):
    config_file = Path(config_path).resolve()
    with open(config_file, "r", encoding="utf-8") as handle:
        config = json.load(handle)
    config_dir = config_file.parent
    base_dir = (config_dir / config.get("base_dir", ".")).resolve()
    config["_config_path"] = config_file
    config["_config_dir"] = config_dir
    config["_base_dir"] = base_dir
    config["_ignore_patterns"] = load_ignore_patterns(
        base_dir,
        config.get("ignore_file", ".fidaignore"),
        config.get("exclude", []),
    )
    merged_files = {entry["path"]: dict(entry) for entry in config.get("files", [])}
    for mod_rel in config.get("modules", []):
        mod_path = (base_dir / mod_rel).resolve()
        if not mod_path.exists():
            continue
        try:
            mod_data = json.loads(mod_path.read_text(encoding="utf-8"))
            mod_root = mod_path.parent.parent if mod_path.parent.name == "docs" else mod_path.parent
            for item in mod_data.get("files", []):
                full_item_path = (mod_root / item["path"]).resolve()
                rel_item_path = rel_posix(full_item_path, base_dir)
                normalized = dict(item)
                normalized["path"] = rel_item_path
                normalized["limit"] = normalize_limit(normalized.get("limit"))
                merged_files[rel_item_path] = normalized
        except Exception:
            continue
    for entry in merged_files.values():
        entry["limit"] = normalize_limit(entry.get("limit"))
    config["files"] = [merged_files[k] for k in sorted(merged_files)]
    return config


def build_languages(config):
    languages = dict(DEFAULT_LANGUAGES)
    for ext, spec in (config.get("languages") or {}).items():
        key = ext if ext.startswith(".") else "." + ext
        languages[key.lower()] = spec
    return languages


# ─────────────────────────────────────────────────────────────────────────────
# Balanced Parentheses Annotation Parser (Fixes KB-005 nested parens bug)
# ─────────────────────────────────────────────────────────────────────────────

def iter_balanced_tags(text):
    """Extrae etiquetas `@tag(valor con (paréntesis) balanceados)` sin truncar."""
    idx = 0
    length = len(text)
    tag_start_re = re.compile(r"@([a-zA-Z][\w-]*)\(")
    while idx < length:
        match = tag_start_re.search(text, idx)
        if not match:
            break
        tag_name = match.group(1)
        pos = match.end()
        depth = 1
        content_chars = []
        while pos < length and depth > 0:
            ch = text[pos]
            if ch == "(":
                depth += 1
                content_chars.append(ch)
            elif ch == ")":
                depth -= 1
                if depth > 0:
                    content_chars.append(ch)
            else:
                content_chars.append(ch)
            pos += 1
        if depth == 0:
            raw_val = "".join(content_chars)
            cleaned_lines = []
            for ln in raw_val.splitlines():
                cleaned_lines.append(re.sub(r"^\s*(?://+|#+|\*+|--+)\s?", "", ln).strip())
            yield tag_name, " ".join(part for part in cleaned_lines if part).strip()
        idx = pos


def parse_annotations(text):
    meta = {
        "id": None,
        "kind": None,
        "limit": None,
        "contract": None,
        "desc": None,
        "relates": [],
    }
    tags = list(iter_balanced_tags(text))
    for tag, value in tags:
        if tag.lower() == "file":
            for key, val in re.findall(r"(\w+)\s*=\s*([^,]+)", value):
                _assign(meta, key, val.strip())
    for tag, value in tags:
        if tag.lower() != "file":
            _assign(meta, tag.lower(), value)
    return meta


def _assign(meta, key, value):
    key = key.lower()
    if key == "id":
        meta["id"] = value
    elif key == "kind":
        meta["kind"] = value
    elif key == "limit":
        meta["limit"] = normalize_limit(value)
    elif key == "contract":
        meta["contract"] = value
    elif key == "desc":
        meta["desc"] = value
    elif key in ("relates", "relate", "fk"):
        items = [item.strip() for item in value.split(",") if item.strip()]
        meta["relates"] = meta["relates"] + [i for i in items if i not in meta["relates"]]


# ─────────────────────────────────────────────────────────────────────────────
# Block Rendering & File Injection
# ─────────────────────────────────────────────────────────────────────────────

def render_block(entry, languages):
    ext = Path(entry["path"]).suffix.lower()
    lang = languages.get(ext)
    if not lang:
        raise ValueError(f"Lenguaje no soportado para {entry['path']}")

    limit_val = normalize_limit(entry.get("limit"))
    lines = [
        MARKER_START,
        f"@id({entry['id']})",
        f"@kind({entry.get('kind', 'unknown')})",
    ]
    if limit_val:
        lines.append(f"@limit(lines: {limit_val})")
    if entry.get("contract"):
        lines.append(f"@contract({entry['contract']})")
    for related in entry.get("relates", []):
        lines.append(f"@relates({related})")
    if entry.get("desc"):
        lines.append(f"@desc({entry['desc']})")
    lines.append(MARKER_END)

    if "line_prefix" in lang:
        prefix = lang["line_prefix"]
        return [f"{prefix} {line}" for line in lines]

    inner = " * " if lang["block_open"] == "/*" else ""
    rendered = [f"{lang['block_open']} {MARKER_START}"]
    rendered += [f"{inner}{line}" for line in lines[1:-1]]
    rendered.append(f"{inner}{MARKER_END} {lang['block_close']}")
    return rendered


def find_block_span(lines):
    start = end = None
    for index, line in enumerate(lines):
        if MARKER_START in line and start is None:
            start = index
        if MARKER_END in line and start is not None:
            end = index
            break
    return (start, end) if start is not None and end is not None else None


def insertion_index(lines, ext):
    index = 0
    if ext in (".py", ".sh", ".rb"):
        while index < len(lines) and (
            lines[index].startswith("#!") or "coding" in lines[index][:40]
        ):
            index += 1
    elif ext in (".md", ".markdown"):
        if lines and lines[0].strip() == "---":
            index = 1
            while index < len(lines) and lines[index].strip() != "---":
                index += 1
            index += 1
    elif ext in (".html", ".htm", ".xml", ".svg"):
        if lines and "<!DOCTYPE" in lines[0].upper():
            index = 1
    return index


def detect_eol(text):
    return "\r\n" if "\r\n" in text else "\n"


def annotate_file(path, entry, languages, dry_run=False, backup=False):
    path = Path(path)
    ext = path.suffix.lower()
    if ext not in languages:
        return f"OMITIDO (lenguaje no soportado): {entry['path']}"

    with open(path, "r", encoding="utf-8", newline="") as handle:
        original = handle.read()
    eol = detect_eol(original)
    original_lines = original.splitlines()

    body = list(original_lines)
    span = find_block_span(body)
    if span:
        del body[span[0] : span[1] + 1]
        insert_at = span[0]
        while insert_at > 0 and body[insert_at - 1].strip() == "":
            del body[insert_at - 1]
            insert_at -= 1
    else:
        insert_at = insertion_index(body, ext)

    block = render_block(entry, languages)
    new_lines = body[:insert_at] + block + body[insert_at:]
    new_text = eol.join(new_lines) + eol

    if dry_run:
        return f"DRY-RUN: {entry['path']} ({len(block)} líneas de anotación)"

    if backup:
        with open(path.with_suffix(path.suffix + ".bak"), "w", encoding="utf-8", newline="") as handle:
            handle.write(original)
    if new_text != original:
        with open(path, "w", encoding="utf-8", newline="") as handle:
            handle.write(new_text)
    return f"ANOTADO: {entry['path']}"


def extract_block_text(text):
    lines = text.splitlines()
    span = find_block_span(lines)
    if not span:
        return ""
    return "\n".join(lines[span[0] : span[1] + 1])


def strip_block_from_text(text):
    lines = text.splitlines()
    span = find_block_span(lines)
    if not span:
        return text
    kept = lines[: span[0]] + lines[span[1] + 1 :]
    return "\n".join(kept)


def block_line_count(block_text):
    return len(block_text.splitlines()) if block_text else 0


def synth_id(path, base):
    rel = rel_posix(path, base)
    if rel.endswith(Path(rel).suffix):
        rel = rel[: -len(Path(rel).suffix)]
    parts = [p for p in rel.split("/") if p and p not in ("src", "implementation")]
    cleaned = [re.sub(r"[^a-zA-Z0-9_]", "_", p).lower() for p in parts]
    return ".".join(cleaned) if cleaned else "root.node"


def infer_kind_from_path(rel_path):
    parts = [p.lower() for p in rel_path.replace("\\", "/").split("/")]
    name = parts[-1]
    if "interfaces" in parts or re.match(r"^i[a-z0-9_]+\.(ts|tsx|js)$", name):
        return "interface"
    if "dependencies" in parts or name.startswith("dependencies.") or name.startswith("dependencias."):
        return "dependencies"
    if "implementation" in parts or ".view." in name or name.endswith("view.ts") or name.endswith("view.tsx"):
        return "view"
    if "controller" in name or "viewmodel" in name:
        return "controller"
    if "components" in parts:
        return "component"
    if name.endswith(".md") or "docs" in parts:
        return "doc"
    if "test" in name or "spec" in name or "selftest" in name:
        return "test"
    if "core" in parts or "services" in parts:
        return "service"
    return "component"


def extract_code_contract(text, ext):
    body = strip_block_from_text(text)
    if ext in (".ts", ".tsx", ".js", ".jsx"):
        symbols = EXPORT_SYMBOL_RE.findall(body)
        if symbols:
            return ", ".join(dict.fromkeys(symbols[:8]))
    elif ext == ".py":
        defs = [d for d in PY_DEF_RE.findall(body) if not d.startswith("_")]
        if defs:
            return ", ".join(dict.fromkeys(defs[:8]))
    return None


def strip_code_comments(text):
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
    lines = []
    for ln in text.splitlines():
        s = ln.lstrip()
        if s.startswith("//") or s.startswith("#"):
            continue
        lines.append(ln)
    return "\n".join(lines)


def extract_imports(text):
    body = strip_code_comments(strip_block_from_text(text))
    return list(dict.fromkeys(IMPORT_FROM_RE.findall(body)))


def extract_functions(text):
    body = strip_block_from_text(text)
    found = []
    for m in FUNC_DECL_RE.finditer(body):
        fn = m.group(1) or m.group(2) or m.group(3)
        if fn and fn not in found:
            found.append(fn)
    return found


def scan_project_files(config, languages):
    base = config["_base_dir"]
    include = config.get("include") or ["**/*"]
    ignore_patterns = config.get("_ignore_patterns", [])
    found = {}
    for root in config.get("roots") or ["."]:
        root_path = (base / root).resolve()
        if not root_path.exists():
            continue
        for path in root_path.rglob("*"):
            if not path.is_file():
                continue
            rel = rel_posix(path, base)
            if match_any(rel, ignore_patterns):
                continue
            if path.suffix.lower() not in languages:
                continue
            if include and not match_any(rel, include):
                continue
            found[str(path)] = path
    return [found[k] for k in sorted(found)]


def collect_files(config, languages):
    base = config["_base_dir"]
    ignore_patterns = config.get("_ignore_patterns", [])
    manifest = config.get("files") or []
    if manifest:
        found = {}
        for entry in manifest:
            rel = entry["path"]
            if match_any(rel, ignore_patterns):
                continue
            path = (base / rel).resolve()
            if path.exists():
                found[str(path)] = path
        return [found[key] for key in sorted(found)]
    return scan_project_files(config, languages)


def find_drift(config, languages):
    base = config["_base_dir"]
    drifted = []
    for entry in config.get("files", []):
        path = (base / entry["path"]).resolve()
        if not path.exists():
            drifted.append({"path": entry["path"], "reason": "missing_file"})
            continue
        if Path(path).suffix.lower() not in languages:
            continue
        lines = path.read_text(encoding="utf-8", errors="replace").splitlines()
        span = find_block_span(lines)
        if span is None:
            drifted.append({"path": entry["path"], "reason": "missing_block"})
            continue
        actual = "\n".join(line.rstrip() for line in lines[span[0] : span[1] + 1])
        expected = "\n".join(line.rstrip() for line in render_block(entry, languages))
        if actual != expected:
            drifted.append({"path": entry["path"], "reason": "stale_block"})
    return drifted


def build_graph(config, languages):
    import fida_opl_guard as guard

    base = config["_base_dir"]
    nodes, edges = [], []
    issues = {
        "dangling": [],
        "over_limit": [],
        "missing_annotations": [],
        "duplicate_ids": [],
        "boundary_violations": guard.verify_fida_boundaries(config),
    }
    seen_ids = {}

    for path in collect_files(config, languages):
        text = path.read_text(encoding="utf-8", errors="replace")
        block = extract_block_text(text)
        meta = parse_annotations(block) if block else {"relates": []}
        line_count = len(text.splitlines())
        code_lines = max(line_count - block_line_count(block), 0)

        node_id = meta.get("id")
        if not node_id:
            node_id = synth_id(path, base)
            issues["missing_annotations"].append(rel_posix(path, base))

        if node_id in seen_ids:
            issues["duplicate_ids"].append(
                {"id": node_id, "paths": [seen_ids[node_id], rel_posix(path, base)]}
            )
        seen_ids[node_id] = rel_posix(path, base)

        limit = meta.get("limit")
        over = bool(limit and code_lines > limit)
        if over:
            issues["over_limit"].append(
                {"id": node_id, "path": rel_posix(path, base), "lines": code_lines, "limit": limit}
            )

        node = {
            "id": node_id,
            "path": rel_posix(path, base),
            "kind": meta.get("kind"),
            "limit": limit,
            "lines": code_lines,
            "total_lines": line_count,
            "over_limit": over,
            "contract": meta.get("contract"),
            "desc": meta.get("desc"),
            "relations": meta.get("relates", []),
        }
        nodes.append(node)
        for related in meta.get("relates", []):
            edges.append({"from": node_id, "to": related, "type": "relates"})

    valid_ids = {node["id"] for node in nodes}
    issues["dangling"] = [edge for edge in edges if edge["to"] not in valid_ids]

    return {
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "nodes": sorted(nodes, key=lambda n: n["id"]),
        "edges": edges,
        "issues": issues,
    }


def to_mermaid(graph):
    lines = ["graph LR"]
    for node in graph["nodes"]:
        label = re.sub(r"[^a-zA-Z0-9_]", "_", node["id"])
        kind = node.get("kind") or "?"
        lines.append(f'    {label}["{node["id"]} ({kind})"]')
    for edge in graph["edges"]:
        a = re.sub(r"[^a-zA-Z0-9_]", "_", edge["from"])
        b = re.sub(r"[^a-zA-Z0-9_]", "_", edge["to"])
        lines.append(f"    {a} --> {b}")
    return "\n".join(lines) + "\n"


def compute_impact(graph, target, transitive=False):
    direct = sorted({edge["from"] for edge in graph["edges"] if edge["to"] == target})
    if not transitive:
        return direct
    result, queue = set(direct), list(direct)
    while queue:
        current = queue.pop(0)
        for edge in graph["edges"]:
            if edge["to"] == current and edge["from"] not in result:
                result.add(edge["from"])
                queue.append(edge["from"])
    return sorted(result)


# Re-export FIDA Guard functions for backwards-compatible core API
from fida_opl_guard import (  # noqa: E402, F401
    bootstrap_project,
    build_module_snapshot,
    discover_fida_modules,
    evaluate_wal_guard,
    sync_manifests,
    verify_fida_boundaries,
)
