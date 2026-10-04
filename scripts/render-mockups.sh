#!/usr/bin/env bash
# Renders mockups/sites.html into public/mockups/*.webp with headless Chrome.
# Usage: ./scripts/render-mockups.sh   (macOS, needs Google Chrome + python3 with Pillow)
set -euo pipefail
cd "$(dirname "$0")/.."

CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
OUT=public/mockups
TMP=$(mktemp -d)
mkdir -p "$OUT"

DESKTOP=(solace ledgerly nord lume mira fieldwork kinetic bloom halcyon)
MOBILE=(solace ledgerly lume bloom)

shoot() { # id width height suffix
  local png="$TMP/$1$4.png"
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --user-data-dir="$TMP/profile" \
    --window-size="$2,$3" --virtual-time-budget=4000 --screenshot="$png" \
    "file://$PWD/mockups/sites.html?s=$1" >/dev/null 2>&1 &
  local pid=$!
  for _ in $(seq 1 30); do [ -s "$png" ] && break; sleep 1; done
  sleep 1; kill "$pid" 2>/dev/null || true
}

for id in "${DESKTOP[@]}"; do shoot "$id" 1440 900 ""; done
# Headless Chrome on macOS won't open windows narrower than ~500px, so mobile
# shots load the site inside a 390px iframe (mockups/phone.html) and get cropped.
for id in "${MOBILE[@]}"; do
  png="$TMP/$id-m.png"
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --user-data-dir="$TMP/profile" \
    --window-size=600,844 --force-device-scale-factor=2 --virtual-time-budget=4000 --screenshot="$png" \
    "file://$PWD/mockups/phone.html?s=$id" >/dev/null 2>&1 &
  pid=$!
  for _ in $(seq 1 30); do [ -s "$png" ] && break; sleep 1; done
  sleep 1; kill "$pid" 2>/dev/null || true
done

python3 - "$TMP" "$OUT" <<'EOF'
import sys, os
from PIL import Image
tmp, out = sys.argv[1], sys.argv[2]
for f in os.listdir(tmp):
    if not f.endswith('.png'): continue
    im = Image.open(os.path.join(tmp, f)).convert('RGB')
    if f.endswith('-m.png'):
        im = im.crop((0, 0, 780, 1688))
    else:
        im = im.resize((1200, 750), Image.LANCZOS)
    im.save(os.path.join(out, f.replace('.png', '.webp')), quality=82)
    print('wrote', f.replace('.png', '.webp'))
EOF
rm -rf "$TMP"
