#!/usr/bin/env bash
set -euo pipefail
source_svg="packages/ui/src/components/BrandMark/brand-icon.svg"
cp "$source_svg" apps/web/app/icon.svg
magick -background none "$source_svg" -resize 180x180 -strip -depth 8 apps/web/app/apple-icon.png
