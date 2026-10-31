#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# @pca:start
# @id(fida.tools.selftest)
# @kind(test)
# @limit(lines: 450)
# @contract(run_selftest(): (passed, failures))
# @relates(fida.tools.core)
# @relates(fida.tools.guard)
# @relates(fida.tools.templates)
# @relates(fida.tools.opl)
# @desc(Suite de pruebas doradas de FIDA/OPL: parser balanceado, .fidaignore, bootstrap, sync, aduanas, dead deps, multi-lang y WAL atómico)
# @pca:end

"""fida_opl_selftest.py — Pruebas doradas del kit FIDA + OPL (11 suites)."""

import contextlib
import io
import json
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import fida_opl as cli  # noqa: E402
import fida_opl_core as core  # noqa: E402

KT_SAMPLE = "package demo\n\nclass Sample\n"


def _entry(path, node_id, **extra):
    entry = {"path": path, "id": node_id, "kind": "component"}
    entry.update(extra)
    return entry


def _write(base, rel, text):
    target = Path(base) / rel
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(text, encoding="utf-8")
    return target


def _write_raw(path, text):
    with open(path, "w", encoding="utf-8", newline="") as handle:
        handle.write(text)


def _read_raw(path):
    with open(path, "r", encoding="utf-8", newline="") as handle:
        return handle.read()


def _workspace():
    return tempfile.TemporaryDirectory(prefix="fida_opl_selftest_")


def _run_cli(argv):
    buffer = io.StringIO()
    with contextlib.redirect_stdout(buffer), contextlib.redirect_stderr(buffer):
        code = cli.main(argv)
    return code, buffer.getvalue()


def _write_manifest(base, entries, **extra):
    manifest = Path(base) / "fida.config.json"
    payload = {"base_dir": ".", "roots": ["."], "files": entries}
    payload.update(extra)
    manifest.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    return manifest


def test_parse_accumulates_repeated_relates():
    block = "<!--\n@id(a.b)\n@kind(doc)\n@relates(x.y)\n@relates(x.z)\n@relates(x.w)\n@desc(D)\n-->"
    meta = core.parse_annotations(block)
    assert meta["relates"] == ["x.y", "x.z", "x.w"], f"KB-004 fallo: {meta['relates']}"


def test_parse_balanced_parentheses_in_contract():
    block = (
        "// @pca:start\n"
        "// @id(feature.home.view)\n"
        "// @kind(view)\n"
        "// @limit(lines: 180)\n"
        "// @contract(HomeView(props: HomeContract, onAction: (id: string) => void): JSX.Element)\n"
        "// @desc(Vista principal (con subcomponentes) de inicio)\n"
        "// @pca:end"
    )
    meta = core.parse_annotations(block)
    assert meta["contract"] == "HomeView(props: HomeContract, onAction: (id: string) => void): JSX.Element"
    assert meta["desc"] == "Vista principal (con subcomponentes) de inicio"


def test_parse_comma_and_compact_forms():
    text = "@relates(a.b, c.d)\n@file(id=q.r, kind=model, limit=40, relates=s.t, desc=Hola)"
    meta = core.parse_annotations(text)
    assert meta["id"] == "q.r"
    assert meta["limit"] == 40
    assert meta["relates"] == ["s.t", "a.b", "c.d"]


def test_annotate_is_idempotent_and_normalizes_limit():
    with _workspace() as tmp:
        entry = _entry("a.kt", "demo.a", limit="lines: 120", desc="Demo A")
        path = _write(tmp, "a.kt", KT_SAMPLE)
        core.annotate_file(path, entry, core.build_languages({}))
        first = _read_raw(path)
        core.annotate_file(path, entry, core.build_languages({}))
        second = _read_raw(path)
        assert first == second
        assert "lines: lines:" not in second
        assert "@limit(lines: 120)" in second


def test_annotate_preserves_crlf_and_shebang():
    with _workspace() as tmp:
        entry = _entry("s.py", "demo.s", desc="Script")
        path = Path(tmp) / "s.py"
        _write_raw(path, "#!/usr/bin/env python3\r\nprint(1)\r\n")
        core.annotate_file(path, entry, core.build_languages({}))
        text = _read_raw(path)
        assert text.startswith("#!/usr/bin/env python3\r\n")
        assert "\n" not in text.replace("\r\n", "")


def test_fidaignore_and_bootstrap_auto_injection():
    with _workspace() as tmp:
        _write(tmp, ".fidaignore", "ignored_dir/\n*.secret.ts\n")
        _write(tmp, "ignored_dir/skip.ts", "export const x = 1;\n")
        _write(tmp, "src/hidden.secret.ts", "export const s = 2;\n")
        _write(tmp, "src/features/Home/interfaces/IHome.ts", "export interface IHomeProps {\n  title: string;\n}\n")
        _write(
            tmp,
            "src/features/Home/implementation/Home.view.tsx",
            "import type { IHomeProps } from '../interfaces/IHome';\nexport function HomeView(p: IHomeProps) { return p.title; }\n",
        )
        manifest = _write_manifest(tmp, [], roots=["src", "ignored_dir"])
        code, _ = _run_cli(["--config", str(manifest), "bootstrap", "--apply"])
        assert code == cli.EXIT_OK
        assert "@pca:start" not in _read_raw(Path(tmp) / "ignored_dir/skip.ts")
        assert "@pca:start" not in _read_raw(Path(tmp) / "src/hidden.secret.ts")

        iface_meta = core.parse_annotations(_read_raw(Path(tmp) / "src/features/Home/interfaces/IHome.ts"))
        view_meta = core.parse_annotations(_read_raw(Path(tmp) / "src/features/Home/implementation/Home.view.tsx"))
        assert iface_meta["kind"] == "interface"
        assert "IHomeProps" in (iface_meta["contract"] or "")
        assert view_meta["kind"] == "view"
        assert iface_meta["id"] in view_meta["relates"]


def test_sync_modular_and_fida_boundaries():
    with _workspace() as tmp:
        _write(
            tmp,
            "src/features/Catalog/interfaces/ICatalog.ts",
            "// @pca:start\n// @id(feature.catalog.interface)\n// @kind(interface)\n// @pca:end\nexport interface ICatalog {}\n",
        )
        _write(
            tmp,
            "src/features/Catalog/dependencies/dependencies.ts",
            "// @pca:start\n// @id(feature.catalog.dependencies)\n// @kind(dependencies)\n// @pca:end\nexport type { ICatalog } from '../interfaces/ICatalog';\n",
        )
        _write(
            tmp,
            "src/features/Catalog/implementation/Catalog.view.tsx",
            "// @pca:start\n// @id(feature.catalog.view)\n// @kind(view)\n// @pca:end\nimport type { ICatalog } from '../dependencies/dependencies';\nexport const CatalogView = (p: ICatalog) => p;\n",
        )
        _write(
            tmp,
            "src/features/Catalog/docs/fida.module.json",
            json.dumps({"module": "Catalog", "module_id": "feature.catalog", "files": []}),
        )
        manifest = _write_manifest(tmp, [], roots=["src"])
        assert _run_cli(["--config", str(manifest), "sync"])[0] == cli.EXIT_OK
        assert _run_cli(["--config", str(manifest), "check", "--strict"])[0] == cli.EXIT_OK

        # Bypass dependencies.ts -> must fail
        _write(
            tmp,
            "src/features/Catalog/implementation/Catalog.view.tsx",
            "// @pca:start\n// @id(feature.catalog.view)\n// @kind(view)\n// @pca:end\nimport { Button } from '@/shared/ui/Button';\nexport const CatalogView = () => Button;\n",
        )
        code, out = _run_cli(["--config", str(manifest), "check", "--strict"])
        assert code == cli.EXIT_ERROR
        assert "fida/view-imports-through-gateway" in out


def test_unused_dependency_in_gateway_is_detected():
    with _workspace() as tmp:
        _write(
            tmp,
            "src/features/Cart/interfaces/ICart.ts",
            "// @pca:start\n// @id(feature.cart.interface)\n// @kind(interface)\n// @pca:end\nexport interface ICart {}\n",
        )
        _write(
            tmp,
            "src/features/Cart/dependencies/dependencies.ts",
            "// @pca:start\n// @id(feature.cart.dependencies)\n// @kind(dependencies)\n// @pca:end\n"
            "export type { ICart } from '../interfaces/ICart';\n"
            "export { UsedBtn, OrphanModal } from '@/shared/ui';\n",
        )
        _write(
            tmp,
            "src/features/Cart/implementation/Cart.view.tsx",
            "// @pca:start\n// @id(feature.cart.view)\n// @kind(view)\n// @pca:end\n"
            "import { UsedBtn } from '../dependencies/dependencies';\n"
            "export const CartView = () => UsedBtn;\n",
        )
        _write(
            tmp,
            "src/features/Cart/docs/fida.module.json",
            json.dumps({"module": "Cart", "module_id": "feature.cart", "files": []}),
        )
        manifest = _write_manifest(tmp, [], roots=["src"])
        _run_cli(["--config", str(manifest), "sync"])
        code, out = _run_cli(["--config", str(manifest), "check", "--strict"])
        assert code == cli.EXIT_ERROR, "debe detectar OrphanModal no usado"
        assert "fida/no-unused-dependencies" in out and "OrphanModal" in out, f"salida inesperada: {out}"


def test_wal_guard_requires_decisions_md_update_before_snapshot():
    with _workspace() as tmp:
        _write(
            tmp,
            "src/features/Player/interfaces/IPlayer.ts",
            "// @pca:start\n// @id(feature.player.interface)\n// @kind(interface)\n// @contract(IPlayerProps)\n// @pca:end\nexport interface IPlayerProps {\n  url: string;\n}\n",
        )
        _write(
            tmp,
            "src/features/Player/dependencies/dependencies.ts",
            "// @pca:start\n// @id(feature.player.dependencies)\n// @kind(dependencies)\n// @relates(feature.player.interface)\n// @pca:end\nexport type { IPlayerProps } from '../interfaces/IPlayer';\n",
        )
        _write(
            tmp,
            "src/features/Player/implementation/Player.view.tsx",
            "// @pca:start\n// @id(feature.player.view)\n// @kind(view)\n// @relates(feature.player.dependencies)\n// @pca:end\nimport type { IPlayerProps } from '../dependencies/dependencies';\nexport function PlayerView(props: IPlayerProps) {\n  return props.url;\n}\n",
        )
        _write(
            tmp,
            "src/features/Player/docs/decisions.md",
            "<!-- @pca:start\n@id(feature.player.decisions)\n@kind(doc)\n@pca:end -->\n# Decisiones Player\n- DEC-001 Inicial\n",
        )
        _write(
            tmp,
            "src/features/Player/docs/fida.module.json",
            json.dumps({"module": "Player", "module_id": "feature.player", "files": []}),
        )
        manifest = _write_manifest(tmp, [], roots=["src"])
        _run_cli(["--config", str(manifest), "sync"])

        # 1. Initialize baseline snapshot
        assert _run_cli(["--config", str(manifest), "guard"])[0] == cli.EXIT_OK

        # 2. Structural change in IPlayer.ts (>= 60%)
        _write(
            tmp,
            "src/features/Player/interfaces/IPlayer.ts",
            "// @pca:start\n// @id(feature.player.interface)\n// @kind(interface)\n// @contract(IPlayerProps, IPlayerEvents)\n// @pca:end\nexport interface IPlayerProps {\n  url: string;\n  autoplay: boolean;\n}\nexport interface IPlayerEvents {\n  onEnded: () => void;\n}\n",
        )
        code, out = _run_cli(["--config", str(manifest), "guard"])
        assert code == cli.EXIT_ERROR
        assert "WAL REMEDIATION REQUIRED" in out

        # 3. Try to cheat by running --update-snapshot WITHOUT editing decisions.md -> MUST FAIL!
        code, out = _run_cli(["--config", str(manifest), "guard", "--update-snapshot"])
        assert code == cli.EXIT_ERROR, "debe rechazar --update-snapshot si decisions.md no fue actualizado"
        assert "WAL REJECTED" in out, f"debe explicar el rechazo WAL: {out}"

        # 4. Now update decisions.md and run --update-snapshot -> MUST SUCCEED!
        _write(
            tmp,
            "src/features/Player/docs/decisions.md",
            "<!-- @pca:start\n@id(feature.player.decisions)\n@kind(doc)\n@pca:end -->\n# Decisiones Player\n- DEC-001 Inicial\n- DEC-002 Agregado autoplay y IPlayerEvents\n",
        )
        code, _ = _run_cli(["--config", str(manifest), "guard", "--update-snapshot"])
        assert code == cli.EXIT_OK, "tras actualizar decisions.md, --update-snapshot debe aprobarse"
        assert _run_cli(["--config", str(manifest), "guard"])[0] == cli.EXIT_OK


def test_multilang_init_and_install_project():
    with _workspace() as tmp:
        # Install project kit in empty workspace
        code, _ = _run_cli(["install-project", "--target", tmp])
        assert code == cli.EXIT_OK
        assert (Path(tmp) / ".fidaignore").exists()
        assert (Path(tmp) / "AGENTS.md").exists()
        manifest = Path(tmp) / "fida.config.json"
        assert manifest.exists()

        # Init a JS module and a Python module
        assert _run_cli(["--config", str(manifest), "init", "VideoBar", "--lang", "js", "--dest", "src/features"])[0] == cli.EXIT_OK
        assert (Path(tmp) / "src/features/VideoBar/interfaces/IVideoBar.js").exists()
        assert (Path(tmp) / "src/features/VideoBar/implementation/VideoBar.view.js").exists()

        assert _run_cli(["--config", str(manifest), "init", "DataSync", "--lang", "py", "--dest", "src/features"])[0] == cli.EXIT_OK
        assert (Path(tmp) / "src/features/DataSync/interfaces/i_data_sync.py").exists()
        assert (Path(tmp) / "src/features/DataSync/implementation/data_sync_view.py").exists()


ALL_TESTS = [
    test_parse_accumulates_repeated_relates,
    test_parse_balanced_parentheses_in_contract,
    test_parse_comma_and_compact_forms,
    test_annotate_is_idempotent_and_normalizes_limit,
    test_annotate_preserves_crlf_and_shebang,
    test_fidaignore_and_bootstrap_auto_injection,
    test_sync_modular_and_fida_boundaries,
    test_unused_dependency_in_gateway_is_detected,
    test_wal_guard_requires_decisions_md_update_before_snapshot,
    test_multilang_init_and_install_project,
]


def run_selftest():
    passed, failures = [], []
    for case in ALL_TESTS:
        try:
            case()
        except AssertionError as error:
            failures.append((case.__name__, str(error)))
        except Exception as error:  # noqa: BLE001
            failures.append((case.__name__, f"{type(error).__name__}: {error}"))
        else:
            passed.append(case.__name__)
    return len(passed), failures


if __name__ == "__main__":
    count, failed = run_selftest()
    for name, detail in failed:
        print(f"FAIL {name}: {detail}")
    print(f"selftest: {count} PASS, {len(failed)} FAIL")
    sys.exit(1 if failed else 0)
