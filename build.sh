tmpSvg=$(mktemp --suffix=.svg)
inkscape src/favicon/favicon.svg \
  --export-text-to-path \
  --export-plain-svg \
  --export-filename="${tmpSvg}"
resvg -w 48 -h 48 "${tmpSvg}" src/favicon/favicon.png
rm -f "${tmpSvg}"

mkdir -p docs
cp -r src/* docs
drop-inline-css -r src -o docs
deno bundle src/index.js -o docs/index.js
minify -r docs -o .
