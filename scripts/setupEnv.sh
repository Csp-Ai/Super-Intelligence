#!/usr/bin/env bash
set -e

command_exists() {
  command -v "$1" >/dev/null 2>&1
}

install_pkg() {
  local pkg="$1"
  if command_exists apt-get; then
    sudo apt-get update -y >/dev/null 2>&1 || true
    sudo apt-get install -y "$pkg" >/dev/null 2>&1 || true
  elif command_exists brew; then
    brew install "$pkg"
  else
    echo "Please install $pkg manually" >&2
  fi
}

if ! command_exists node; then
  install_pkg nodejs
fi

if ! command_exists npm; then
  install_pkg npm
fi

if ! command_exists java; then
  install_pkg openjdk-11-jre-headless
fi

if ! command_exists firebase; then
  npm install -g firebase-tools >/dev/null 2>&1 || true
fi

DIR="$(cd "$(dirname "$0")/.." && pwd)"
"$DIR/scripts/robust-install.sh"

echo "Environment ready"

