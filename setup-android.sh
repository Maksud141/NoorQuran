#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
npm install
[ -d android ] || npx cap add android
npx cap sync android
npx cap open android
