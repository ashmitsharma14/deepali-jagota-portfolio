#!/bin/bash
# Builds _deploy/ — exactly the files the live site needs, and nothing else.
#
#   ./make-deploy.sh      then drag the _deploy folder onto Netlify
#
# Why this exists: Netlify's manual deploy publishes every file you give it. A
# plain drag of the project folder would put DEPLOY.md, README.md, the original
# un-cut-out photos and the processing scripts on the public internet at
# deepalijagota.com. This copies only what the page actually loads.
#
# Uses rsync --delete rather than deleting the folder, so a file removed from
# the project also disappears from _deploy, without any recursive rm.
# --delete-excluded matters too: without it, rsync *protects* excluded files that
# already exist in the destination, so anything excluded later would linger.

set -euo pipefail
cd "$(dirname "$0")"

mkdir -p _deploy

rsync -a --delete --delete-excluded \
  --exclude '_deploy' \
  --exclude '_source-photos' \
  --exclude '.claude' \
  --exclude '.DS_Store' \
  --exclude 'README.md' \
  --exclude 'README.txt' \
  --exclude 'DEPLOY.md' \
  --exclude 'serve.js' \
  --exclude 'make-deploy.sh' \
  ./ _deploy/

echo "_deploy/ ready — $(du -sh _deploy | cut -f1) across $(find _deploy -type f | wc -l | tr -d ' ') files:"
echo
(cd _deploy && find . -type f | sort | sed 's|^\./|  |')
echo
echo "Next: drag the _deploy folder onto Netlify."
