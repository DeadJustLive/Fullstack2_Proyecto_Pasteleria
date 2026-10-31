#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# @pca:start
# @id(fida.tools.opl)
# @kind(service)
# @limit(lines: 450)
# @contract(cli: init|install-project|bootstrap|sync|annotate|check|graph|impact|guard|selftest)
# @relates(fida.tools.core)
# @relates(fida.tools.guard)
# @relates(fida.tools.templates)
# @relates(fida.tools.selftest)
# @desc(CLI unificada FIDA + OPL para scaffolding multi-lenguaje, instalador de proyecto, grafo, aduanas y guardián WAL)
# @pca:end

"""fida_opl.py — CLI unificada del kit FIDA + OPL (Python 3.9+, 0 dependencias externas).

Comandos:
  - init <ModuleName> [--lang ts|js|py|kt|rs] [--dest <dir>]
                                       Crea un módulo FIDA con sus 5 subcarpetas en el lenguaje elegido
  - install-project [--target <dir>]   Instala .fidaignore, fida.config.json, AGENTS.md y hook en el proyecto
  - bootstrap [--apply]                Inyecta la plantilla @pca:start en archivos sin anotar (respeta .fidaignore)
  - sync                               Sincroniza manifiestos modulares (fida.module.json) + fida.config.json
  - annotate [--dry-run|--check-drift] Inyecta o verifica cabeceras @pca:start desde el manifiesto
  - check [--strict]                   Valida @limit, FK (@relates), IDs, Aduanas FIDA y dependencias huérfanas
  - graph [--out <nombre>]             Genera grafo.json + grafo.mmd (Mermaid)
  - impact <id> [--transitive]         Calcula los nodos afectados por cambiar un archivo/módulo
  - guard [--module <dir>] [--update-snapshot] [--force]
                                       Ejecuta el Guardián WAL (verifica actualización de decisions.md)
  - selftest                           Ejecuta la suite de pruebas doradas
"""

import argparse
import json
import re
import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import fida_opl_core as core  # noqa: E402
import fida_opl_templates as templates  # noqa: E402

EXIT_OK = 0
EXIT_ERROR = 1


def resolve_default_config():
    here = Path(__file__).resolve().parent
    candidates = [
        Path.cwd() / "fida.config.json",
        here.parent / "fida.config.json",
        Path.cwd() / "tools" / "pca.config.json",
    ]
    for cand in candidates:
        if cand.exists():
            return str(cand)
    return str(here.parent / "fida.config.json")


def load_environment(args):
    if getattr(args, "config", None) is None:
        args.config = resolve_default_config()
    if not Path(args.config).exists():
        print(f"Error: no se encontró el manifiesto '{args.config}'.", file=sys.stderr)
        return None, None
    config = core.load_config(args.config)
    return config, core.build_languages(config)


def emit(human_lines, args, payload):
    if getattr(args, "json", False):
        print(json.dumps(payload, indent=2, ensure_ascii=False))
    else:
        for line in human_lines:
            print(line)


# ─────────────────────────────────────────────────────────────────────────────
# Commands
# ─────────────────────────────────────────────────────────────────────────────

def cmd_init(config, languages, args):
    mod_name = args.name
    if not re.match(r"^[A-Z][a-zA-Z0-9]*$", mod_name):
        print(
            f"Error: el nombre del módulo '{mod_name}' debe estar en PascalCase (ej. HomeView, UserProfile).",
            file=sys.stderr,
        )
        return EXIT_ERROR

    base = config["_base_dir"]
    dest_root = (base / (args.dest or config.get("features_dir", "src/features"))).resolve()
    mod_dir = dest_root / mod_name
    date_str = datetime.now().strftime("%Y-%m-%d")
    kit_root = Path(__file__).resolve().parent.parent

    created = templates.scaffold_module_by_lang(
        mod_name=mod_name,
        mod_dir=mod_dir,
        base_dir=base,
        kit_root=kit_root,
        date_str=date_str,
        lang=args.lang,
    )

    snap = core.build_module_snapshot(mod_dir, base, languages)
    snap_path = mod_dir / "docs" / ".snapshot.json"
    snap_path.write_text(json.dumps(snap, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    created.append(core.rel_posix(snap_path, base))

    payload = {
        "module": mod_name,
        "lang": args.lang,
        "path": core.rel_posix(mod_dir, base),
        "created": created,
    }
    emit(
        [
            f"✅ Módulo FIDA '{mod_name}' ({args.lang}) creado en {core.rel_posix(mod_dir, base)} con 5 subcarpetas:",
            *[f"  - {c}" for c in created],
        ],
        args,
        payload,
    )
    return EXIT_OK


def cmd_install_project(config, languages, args):
    kit_root = Path(__file__).resolve().parent.parent
    target_root = Path(args.target).resolve() if args.target else Path.cwd().resolve()
    installed = templates.install_project_kit(target_root, kit_root)
    payload = {"target": str(target_root), "installed": installed}
    lines = [
        f"✅ Kit FIDA + OPL instalado en: {target_root}",
        *([f"  + {item}" for item in installed] or ["  (Los archivos base ya existían)"]),
    ]
    emit(lines, args, payload)
    return EXIT_OK


def cmd_bootstrap(config, languages, args):
    result = core.bootstrap_project(config, languages, apply=args.apply)
    if args.apply and result["bootstrapped"]:
        core.sync_manifests(config, languages)
    mode = "APLICADO" if args.apply else "DRY-RUN (usa --apply para inyectar)"
    lines = [
        f"== bootstrap ({mode}) ==",
        f"Archivos ya anotados: {len(result['already_annotated'])}",
        f"Archivos sin anotación detectados: {len(result['bootstrapped'])}",
    ]
    for item in result["bootstrapped"]:
        lines.append(f"  + {item['path']} -> @id({item['id']}) @kind({item['kind']})")
    emit(lines, args, result)
    return EXIT_OK


def cmd_sync(config, languages, args):
    result = core.sync_manifests(config, languages)
    lines = [
        "== sync (Modular + Autodiscovery) ==",
        f"Módulos FIDA sincronizados: {len(result['synced_modules'])}",
        *[f"  - {m}" for m in result["synced_modules"]],
        f"Total de archivos indexados: {result['total_files']}",
    ]
    emit(lines, args, result)
    return EXIT_OK


def cmd_annotate(config, languages, args):
    if args.check_drift:
        drifted = core.find_drift(config, languages)
        if args.json:
            print(json.dumps({"drift": drifted}, indent=2, ensure_ascii=False))
        elif drifted:
            print(f"DERIVA detectada ({len(drifted)} archivos; ejecuta 'annotate' o 'sync' para sincronizar):")
            for item in drifted:
                print(f"  - {item['path']} [{item['reason']}]")
        else:
            print("Sin deriva: los bloques coinciden con el manifiesto.")
        return EXIT_ERROR if drifted else EXIT_OK

    results, skipped = [], []
    for entry in config.get("files", []):
        path = (config["_base_dir"] / entry["path"]).resolve()
        if not path.exists():
            skipped.append(entry["path"])
            continue
        results.append(core.annotate_file(path, entry, languages, args.dry_run, args.backup))
    payload = {"results": results, "dry_run": args.dry_run}
    if skipped:
        payload["skipped"] = skipped
    emit(results, args, payload)
    return EXIT_OK


def cmd_graph(config, languages, args):
    graph = core.build_graph(config, languages)
    out_dir = (config["_base_dir"] / config.get("options", {}).get("output_dir", ".")).resolve()
    out_name = args.out or "grafo"
    json_path = out_dir / f"{out_name}.json"
    mmd_path = out_dir / f"{out_name}.mmd"
    json_path.write_text(json.dumps(graph, indent=2, ensure_ascii=False), encoding="utf-8")
    mmd_path.write_text(core.to_mermaid(graph), encoding="utf-8")
    emit(
        [
            f"Grafo generado: {json_path.name} ({len(graph['nodes'])} nodos, {len(graph['edges'])} relaciones)",
            f"Mermaid: {mmd_path.name}",
        ],
        args,
        graph,
    )
    return EXIT_OK


def cmd_impact(config, languages, args):
    graph = core.build_graph(config, languages)
    known_ids = {node["id"] for node in graph["nodes"]}
    if args.id not in known_ids:
        print(f"ID no encontrado en el grafo: '{args.id}'. Revisa el typo o ejecuta 'check'.", file=sys.stderr)
        return EXIT_ERROR
    dependents = core.compute_impact(graph, args.id, args.transitive)
    if args.json:
        print(json.dumps({"id": args.id, "dependents": dependents}, indent=2, ensure_ascii=False))
    elif dependents:
        scope = "directa o indirectamente" if args.transitive else ""
        print(f"Archivos afectados por '{args.id}' ({len(dependents)}) {scope}:".strip())
        for item in dependents:
            print(f"  - {item}")
    else:
        print(f"Ningún archivo declara depender de '{args.id}' (nadie lo usa como @relates).")
    return EXIT_OK


def cmd_check(config, languages, args):
    graph = core.build_graph(config, languages)
    issues = graph["issues"]
    integrity = (
        issues["dangling"]
        + issues["duplicate_ids"]
        + issues["missing_annotations"]
        + issues["boundary_violations"]
    )
    report = {
        "over_limit": issues["over_limit"],
        "dangling": issues["dangling"],
        "missing_annotations": issues["missing_annotations"],
        "duplicate_ids": issues["duplicate_ids"],
        "boundary_violations": issues["boundary_violations"],
    }
    if args.json:
        print(json.dumps(report, indent=2, ensure_ascii=False))
    else:
        print("== check (FIDA + OPL) ==")
        print(f"Nodos: {len(graph['nodes'])}  Relaciones: {len(graph['edges'])}")
        print(f"Sobre límite (advertencia): {len(issues['over_limit'])}")
        for item in issues["over_limit"]:
            print(f"  - {item['path']}: {item['lines']} líneas de código (límite {item['limit']})")
        print(f"Relaciones rotas (FK huérfanas): {len(issues['dangling'])}")
        for edge in issues["dangling"]:
            print(f"  - {edge['from']} --> {edge['to']}")
        print(f"Archivos sin anotación: {len(issues['missing_annotations'])}")
        for path in issues["missing_annotations"]:
            print(f"  - {path}")
        print(f"IDs duplicados: {len(issues['duplicate_ids'])}")
        for item in issues["duplicate_ids"]:
            print(f"  - {item['id']}: {', '.join(item['paths'])}")
        print(f"Violaciones de Aduana FIDA: {len(issues['boundary_violations'])}")
        for v in issues["boundary_violations"]:
            print(f"  - [{v['rule']}] {v['path']}: {v['detail']}")
    if args.strict and integrity:
        print(
            "--strict: falla por problemas de integridad o violación de aduana FIDA.",
            file=sys.stderr,
        )
        return EXIT_ERROR
    return EXIT_OK


def cmd_guard(config, languages, args):
    reports = core.evaluate_wal_guard(
        config,
        languages,
        target_module=args.module,
        update_snapshot=args.update_snapshot,
        force=args.force,
    )
    blocked = [r for r in reports if r["status"] == "BLOCKED"]

    if args.json:
        print(json.dumps({"reports": reports, "blocked": len(blocked)}, indent=2, ensure_ascii=False))
        return EXIT_ERROR if blocked else EXIT_OK

    print("== FIDA/OPL WAL Guard ==")
    for rep in reports:
        icon = "🔴" if rep["level"] == "HIGH" else ("🟡" if rep["level"] == "MEDIUM" else "🟢")
        print(f"{icon} Módulo: {rep['module']} | Score: {rep['score']}% ({rep['level']}) | Estado: {rep['status']}")
        for d in rep["details"]:
            print(f"    • {d['file']}: +{d['score']}% — {d['reason']}")
        if rep["diffs"]:
            print("    ── Diferencias de código detectadas contra el snapshot ──")
            for diff_block in rep["diffs"]:
                for ln in diff_block.splitlines():
                    print(f"      {ln}")
        if rep["remediation_prompt"]:
            print("\n" + rep["remediation_prompt"] + "\n")

    return EXIT_ERROR if blocked else EXIT_OK


def cmd_selftest(config, languages, args):
    import fida_opl_selftest

    passed, failures = fida_opl_selftest.run_selftest()
    payload = {"passed": passed, "failed": [name for name, _ in failures]}
    if getattr(args, "json", False):
        print(json.dumps(payload, indent=2, ensure_ascii=False))
    else:
        for name, detail in failures:
            print(f"FAIL {name}: {detail}")
        print(f"selftest: {passed} PASS, {len(failures)} FAIL")
    return EXIT_ERROR if failures else EXIT_OK


def build_parser():
    parser = argparse.ArgumentParser(
        prog="fida_opl",
        description="Herramienta unificada FIDA + OPL: scaffolding, autodescubrimiento, grafo, aduanas y WAL.",
    )
    parser.add_argument("--config", default=None, help="Ruta a fida.config.json")
    parser.add_argument("--json", action="store_true", help="Salida en formato JSON")
    sub = parser.add_subparsers(dest="command", required=True)

    p_init = sub.add_parser("init", help="Crea un nuevo módulo FIDA con sus 5 subcarpetas")
    p_init.add_argument("name", help="Nombre del módulo en PascalCase (ej. HomeView)")
    p_init.add_argument("--lang", choices=templates.SUPPORTED_LANGS, default="ts", help="Lenguaje de la plantilla")
    p_init.add_argument("--dest", default=None, help="Carpeta destino (por defecto: src/features)")
    p_init.set_defaults(func=cmd_init)

    p_inst = sub.add_parser("install-project", help="Instala .fidaignore, fida.config.json, AGENTS.md y hook Git")
    p_inst.add_argument("--target", default=None, help="Directorio raíz del proyecto destino")
    p_inst.set_defaults(func=cmd_install_project)

    p_boot = sub.add_parser("bootstrap", help="Inyecta la plantilla base @pca:start a archivos sin anotar")
    p_boot.add_argument("--apply", action="store_true", help="Escribe los bloques en disco y sincroniza")
    p_boot.set_defaults(func=cmd_bootstrap)

    p_sync = sub.add_parser("sync", help="Sincroniza manifiestos modulares (fida.module.json) e índice central")
    p_sync.set_defaults(func=cmd_sync)

    p_ann = sub.add_parser("annotate", help="Inyecta/actualiza anotaciones desde el manifiesto")
    p_ann.add_argument("--dry-run", action="store_true", help="Previsualiza sin escribir")
    p_ann.add_argument("--backup", action="store_true", help="Genera .bak antes de escribir")
    p_ann.add_argument("--check-drift", action="store_true", help="Reporta deriva sin escribir")
    p_ann.set_defaults(func=cmd_annotate)

    p_graph = sub.add_parser("graph", help="Genera grafo.json + grafo.mmd")
    p_graph.add_argument("--out", default="grafo", help="Nombre base de salida")
    p_graph.set_defaults(func=cmd_graph)

    p_imp = sub.add_parser("impact", help="Analiza el impacto directo o transitivo de un nodo")
    p_imp.add_argument("id", help="ID del nodo a analizar")
    p_imp.add_argument("--transitive", action="store_true", help="Incluye dependencias indirectas")
    p_imp.set_defaults(func=cmd_impact)

    p_check = sub.add_parser("check", help="Valida límites, relaciones y aduanas FIDA")
    p_check.add_argument("--strict", action="store_true", help="Sale con 1 ante errores de integridad o aduana")
    p_check.set_defaults(func=cmd_check)

    p_guard = sub.add_parser("guard", help="Ejecuta el Guardián WAL (diff de código + umbral 60%%)")
    p_guard.add_argument("--module", default=None, help="Ruta a un módulo FIDA específico")
    p_guard.add_argument("--update-snapshot", action="store_true", help="Confirma el WAL actualizando .snapshot.json")
    p_guard.add_argument("--force", action="store_true", help="Fuerza la actualización del snapshot sin validar decisions.md")
    p_guard.set_defaults(func=cmd_guard)

    p_self = sub.add_parser("selftest", help="Ejecuta las pruebas doradas de FIDA/OPL")
    p_self.set_defaults(func=cmd_selftest)

    return parser


def main(argv=None):
    args = build_parser().parse_args(argv)
    if args.command in ("selftest", "install-project"):
        return args.func(None, None, args)
    config, languages = load_environment(args)
    if config is None:
        return EXIT_ERROR
    return args.func(config, languages, args) or EXIT_OK


if __name__ == "__main__":
    sys.exit(main())
