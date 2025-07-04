#!/bin/bash
set -e

# Try npm ci and fallback to legacy peer deps when not running in CI
safe_npm_ci() {
  local prefix_arg=""
  if [ -n "$1" ]; then
    prefix_arg="--prefix $1"
  fi
  npm ci $prefix_arg >/dev/null 2>&1
  local status=$?
  if [ $status -ne 0 ]; then
    if [ -z "$CI" ] || [ -n "$DEV_NPM_LEGACY" ]; then
      log "npm ci failed, retrying with --legacy-peer-deps"
      npm ci $prefix_arg --legacy-peer-deps >/dev/null 2>&1
    else
      return $status
    fi
  fi
}

log() {
  echo "[setup] $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

APT_PACKAGES=(git python3 python3-pip nodejs npm)
UPDATE_DONE=0

install_pkg() {
  local pkg="$1"
  if dpkg -s "$pkg" >/dev/null 2>&1; then
    log "$pkg already installed"
  else
    if [ "$UPDATE_DONE" -eq 0 ]; then
      log "Running apt-get update"
      if apt-get update -y >/dev/null 2>&1; then
        log "apt-get update completed"
      else
        log "apt-get update failed (offline?). Proceeding with cache"
      fi
      UPDATE_DONE=1
    fi
    log "Installing $pkg"
    if apt-get install -y "$pkg" >/dev/null 2>&1; then
      log "$pkg installed"
    else
      log "Failed to install $pkg"
    fi
  fi
}

for pkg in "${APT_PACKAGES[@]}"; do
  install_pkg "$pkg"
done

# Python dependencies
if command -v pip3 >/dev/null 2>&1; then
  if [ -f requirements.txt ]; then
    if ping -c1 pypi.org >/dev/null 2>&1; then
      log "Installing Python requirements"
      pip3 install -r requirements.txt >/dev/null 2>&1 || log "pip install failed"
    elif [ -d vendor ]; then
      log "Offline: installing Python deps from vendor/"
      pip3 install --no-index --find-links vendor -r requirements.txt >/dev/null 2>&1 || log "pip vendor install failed"
    else
      log "No network and no vendor directory; skipping Python deps"
    fi
  else
    log "No requirements.txt found"
  fi
else
  log "pip3 not available"
fi

# Node dependencies
if command -v npm >/dev/null 2>&1; then
  if [ -f package.json ]; then
    log "Installing root npm packages"
    safe_npm_ci || log "npm ci failed"
  fi
  if [ -f functions/package.json ]; then
    log "Installing functions npm packages"
    safe_npm_ci functions || log "functions npm ci failed"
  fi
  if [ -f frontend/package.json ]; then
    log "Installing frontend npm packages"
    safe_npm_ci frontend || log "frontend npm ci failed"
  fi
else
  log "npm not available"
fi

log "Setup complete"
