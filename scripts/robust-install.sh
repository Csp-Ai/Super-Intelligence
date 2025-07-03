#!/bin/bash
# Installs npm dependencies with engine fallback and cleans proxy config
set -e

# Unset HTTP proxy environment variables to avoid npm warnings
unset http_proxy HTTPS_PROXY HTTP_PROXY https_proxy npm_config_http_proxy npm_config_https_proxy

run_npm_install() {
  local dir="$1"
  if [ -n "$dir" ]; then
    (cd "$dir" && npm install)
  else
    npm install
  fi
}

install_with_fallback() {
  local dir="$1"
  if run_npm_install "$dir"; then
    return 0
  else
    echo "npm install failed, retrying with --engine-strict=false" >&2
    if [ -n "$dir" ]; then
      (cd "$dir" && npm install --engine-strict=false)
    else
      npm install --engine-strict=false
    fi
  fi
}

# install root dependencies
if [ -f package.json ]; then
  install_with_fallback
fi

# install functions dependencies if present
if [ -f functions/package.json ]; then
  install_with_fallback functions
fi

# install frontend dependencies if present
if [ -f frontend/package.json ]; then
  install_with_fallback frontend
fi
