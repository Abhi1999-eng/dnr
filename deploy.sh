#!/usr/bin/env bash
set -e

cd /home/ubuntu/dnr
git fetch origin
git reset --hard origin/main
npm ci --legacy-peer-deps
npm run build
pm2 restart dnr-modern || pm2 start ecosystem.config.cjs
pm2 save
