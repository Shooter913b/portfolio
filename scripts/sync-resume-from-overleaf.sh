#!/usr/bin/env bash
# Pull the latest resume LaTeX from Overleaf (Git integration) and rebuild public/resume.pdf.
#
# Requires Overleaf Premium (or equivalent) with Git integration enabled:
#   Overleaf project → Menu → Integrations → Git
#
# Setup:
#   1. Create a Git authentication token: Overleaf Account Settings → Git integration
#   2. Copy the Git URL from your project (Integrations → Git)
#   3. Add to .env (gitignored):
#        OVERLEAF_GIT_URL=https://git:YOUR_TOKEN@git.overleaf.com/PROJECT_ID
#        OVERLEAF_MAIN_TEX=main.tex
#
# Usage:
#   npm run sync:resume:overleaf

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

: "${OVERLEAF_GIT_URL:?Set OVERLEAF_GIT_URL in .env — see scripts/sync-resume-from-overleaf.sh}"
OVERLEAF_MAIN_TEX="${OVERLEAF_MAIN_TEX:-main.tex}"
CLONE_DIR="$ROOT/resume-latex"

if [[ ! -d "$CLONE_DIR/.git" ]]; then
  echo "Cloning Overleaf project into resume-latex/ …"
  git clone "$OVERLEAF_GIT_URL" "$CLONE_DIR"
else
  echo "Pulling latest from Overleaf …"
  git -C "$CLONE_DIR" pull --ff-only origin main 2>/dev/null || \
    git -C "$CLONE_DIR" pull --ff-only origin master
fi

MAIN_TEX="$CLONE_DIR/$OVERLEAF_MAIN_TEX"
if [[ ! -f "$MAIN_TEX" ]]; then
  echo "Main TeX file not found: $MAIN_TEX" >&2
  echo "Set OVERLEAF_MAIN_TEX in .env to your project's root .tex filename." >&2
  ls "$CLONE_DIR"/*.tex 2>/dev/null || true
  exit 1
fi

if command -v tectonic >/dev/null 2>&1; then
  tectonic "$MAIN_TEX" --outdir public --chdir "$CLONE_DIR"
elif command -v latexmk >/dev/null 2>&1; then
  latexmk -pdf -outdir="$ROOT/public" -cd "$CLONE_DIR" "$OVERLEAF_MAIN_TEX"
else
  echo "Install Tectonic (brew install tectonic) or LaTeX to compile the PDF." >&2
  exit 1
fi

# Tectonic/latexmk may name the PDF after the .tex file
BUILT_PDF="$ROOT/public/$(basename "${OVERLEAF_MAIN_TEX%.tex}.pdf")"
if [[ -f "$BUILT_PDF" && "$BUILT_PDF" != "$ROOT/public/resume.pdf" ]]; then
  mv -f "$BUILT_PDF" "$ROOT/public/resume.pdf"
fi

if [[ ! -f "$ROOT/public/resume.pdf" ]]; then
  echo "Expected output at public/resume.pdf was not created." >&2
  exit 1
fi

echo "Synced from Overleaf and wrote public/resume.pdf"
