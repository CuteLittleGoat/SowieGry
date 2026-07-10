#!/usr/bin/env bash
set -euo pipefail

while IFS= read -r -d '' file; do
  echo "Checking ${file}"
  node --check "${file}"
done < <(find . -type f -name '*.js' -not -path './.git/*' -not -path './node_modules/*' -not -path './playwright-report/*' -print0)
