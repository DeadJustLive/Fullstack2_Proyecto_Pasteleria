#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════
# FIDA/OPL Pre-Commit Hook Unificado
#
# Ejecuta antes de cada commit:
#   1. fida_opl.py check --strict (valida @limit, FK @relates, IDs y Aduana FIDA)
#   2. fida_opl.py guard          (valida el WAL documental y diffs de código >= 60%)
#
# Instalación:
#   cp fida-kit/scripts/fida-pre-commit.sh .git/hooks/pre-commit
#   chmod +x .git/hooks/pre-commit
# ═══════════════════════════════════════════════════════════════════

set -uo pipefail

command -v python3 >/dev/null 2>&1 || exit 0

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$REPO_ROOT" || exit 0

FIDA_OPL=""
if [ -f "fida-kit/tools/fida_opl.py" ]; then
  FIDA_OPL="fida-kit/tools/fida_opl.py"
elif [ -f "tools/fida_opl.py" ]; then
  FIDA_OPL="tools/fida_opl.py"
else
  exit 0
fi

echo "🛡️  [FIDA/OPL] 1/2 Verificando integridad del grafo y aduanas FIDA..."
if ! python3 "$FIDA_OPL" check --strict; then
  echo ""
  echo "❌ [FIDA/OPL] check --strict falló. Corrige las relaciones, anotaciones o violaciones de aduana."
  exit 1
fi

echo ""
echo "🛡️  [FIDA/OPL] 2/2 Verificando Guardián WAL (diferencias de código vs snapshot)..."
if ! python3 "$FIDA_OPL" guard; then
  echo ""
  echo "❌ [FIDA/OPL] Guardián WAL bloqueó el commit (impacto >= 60%)."
  echo "   Sigue el prompt de remediación arriba: actualiza docs/decisions.md y ejecuta:"
  echo "   python3 $FIDA_OPL guard --update-snapshot"
  exit 1
fi

echo "✅ [FIDA/OPL] Pre-commit superado con éxito."
exit 0
