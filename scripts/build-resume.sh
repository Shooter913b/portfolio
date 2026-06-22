#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if command -v tectonic >/dev/null 2>&1; then
  tectonic "Latex Resume.tex" --outdir public
elif command -v latexmk >/dev/null 2>&1; then
  latexmk -pdf -outdir=public "Latex Resume.tex"
else
  echo "Install Tectonic (brew install tectonic) or a LaTeX distribution to build the resume PDF." >&2
  exit 1
fi

mv -f "public/Latex Resume.pdf" public/resume.pdf
echo "Wrote public/resume.pdf"
