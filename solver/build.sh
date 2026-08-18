#!/usr/bin/env bash
# Build a TexasSolver console_solver that dumps per-hand EVs.
#
# Why this is not just "clone and make": the `console` branch has no EV code at
# all (neither the dump nor the computation — 291 lines were stripped from
# PCfrSolver). Only `master` computes and stores EVs, but it never serializes
# them, because dump_evs() is reachable solely from the Qt GUI's node inspector.
# So we build master's sources with the console branch's CMakeLists, plus a
# one-line patch. See NOTES.md for the full findings.
#
# Requires: cmake, ninja (or make), g++ with C++17, and qtbase5-dev.
#   Debian/Ubuntu: sudo apt-get install -y qtbase5-dev cmake ninja-build g++
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORK="${1:-$ROOT/.build}"
REPO="$WORK/TexasSolver"
SRC="$WORK/texassolver-master"

mkdir -p "$WORK"

if [ ! -d "$REPO" ]; then
  echo "==> cloning TexasSolver (console branch, for its CMakeLists + vendored deps)"
  git clone --depth 1 -b console https://github.com/bupticybee/TexasSolver.git "$REPO"
  git -C "$REPO" remote set-branches origin '*'
  git -C "$REPO" fetch --depth 1 origin master
fi

echo "==> staging master sources"
rm -rf "$SRC"; mkdir -p "$SRC"
git -C "$REPO" archive origin/master | tar x -C "$SRC"
cp "$REPO/CMakeLists.txt" "$SRC/"
cp -r "$REPO/ext" "$SRC/"

echo "==> applying EV dump patch"
git -C "$SRC" apply --unsafe-paths --directory="$SRC" "$ROOT/patches/0001-dump-evs.patch" 2>/dev/null \
  || patch -p1 -d "$SRC" < "$ROOT/patches/0001-dump-evs.patch"

echo "==> adapting build for a console-only, Qt-linked target"
# master has no test/test.cpp
sed -i '/add_executable(test test\/test.cpp)/d; /target_link_libraries(test gtest TexasSolver)/d' "$SRC/CMakeLists.txt"
# master's sources include as "include/Card.h", so the project root must be on the path.
# Core alone is not enough: include/tools/qdebugstream.h pulls in QScrollBar (Widgets).
if ! grep -q Qt5Core "$SRC/CMakeLists.txt"; then
  sed -i 's|^include_directories(include)|include_directories(include)\ninclude_directories(.)\nfind_package(Qt5 COMPONENTS Core Widgets REQUIRED)\ninclude_directories(${Qt5Core_INCLUDE_DIRS} ${Qt5Widgets_INCLUDE_DIRS})|' "$SRC/CMakeLists.txt"
  sed -i 's|target_link_libraries(TexasSolver fmt)|target_link_libraries(TexasSolver fmt Qt5::Core Qt5::Widgets)|' "$SRC/CMakeLists.txt"
  sed -i 's|target_link_libraries(console_solver TexasSolver)|target_link_libraries(console_solver TexasSolver Qt5::Core Qt5::Widgets)|' "$SRC/CMakeLists.txt"
fi
# master renamed main -> main_backup so the GUI's main.cpp could own main.
sed -i 's/^int main_backup(int argc,const char \*\*argv) {/int main(int argc,const char **argv) {/' "$SRC/src/console.cpp"

echo "==> building"
GEN=$(command -v ninja >/dev/null && echo "-G Ninja" || echo "")
cmake -S "$SRC" -B "$SRC/build" -DCMAKE_BUILD_TYPE=Release $GEN
cmake --build "$SRC/build" --target console_solver -j "$(nproc)"

install -D "$SRC/build/console_solver" "$ROOT/bin/console_solver"
echo "==> done: $ROOT/bin/console_solver"
echo
echo "IMPORTANT: run with set_thread_num 1. The multithreaded solver has a data"
echo "race that segfaults non-deterministically. Parallelise across solves by"
echo "running several single-threaded processes instead — see NOTES.md."
