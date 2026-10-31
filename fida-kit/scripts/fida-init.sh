#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════
# FIDA Init — Wrapper hacia fida_opl.py init
#
# Crea la estructura completa de un módulo FIDA con sus 5 subcarpetas:
#   - interfaces/I<Modulo>.ts
#   - dependencies/dependencies.ts
#   - implementation/<Modulo>.view.tsx
#   - components/README.md
#   - docs/{decisions.md, fida.module.json, .snapshot.json}
#
# Uso:
#   ./fida-kit/scripts/fida-init.sh <NombreModulo> [ruta/destino]
# ═══════════════════════════════════════════════════════════════════

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FIDA_OPL="${SCRIPT_DIR}/../tools/fida_opl.py"

if [ $# -lt 1 ]; then
  echo "Uso: ./fida-init.sh <NombreModulo> [ruta/destino]"
  exit 1
fi

MODULE_NAME="$1"
DEST_DIR="${2:-src/features}"

python3 "$FIDA_OPL" init "$MODULE_NAME" --dest "$DEST_DIR"
python3 "$FIDA_OPL" sync
