#!/usr/bin/env bash
# Builds the playable index.html (a full HTML document) from src/game.html.
# src/game.html is a page fragment (no <html>/<head>/<body>) so it can also be
# published as a claude.ai Artifact; this script wraps it for GitHub Pages / local play.
set -euo pipefail
cd "$(dirname "$0")"
SRC=src/game.html
OUT=index.html
{
  printf '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
  printf '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
  sed -n '1,/^<\/style>/p' "$SRC" | sed 's|^html,body{height:100%}|html,body{height:100%;margin:0}|'
  printf '</head>\n<body>\n'
  sed -n '/^<\/style>/,$p' "$SRC" | sed '1d'
  printf '</body>\n</html>\n'
} > "$OUT"
echo "Built $OUT from $SRC"
