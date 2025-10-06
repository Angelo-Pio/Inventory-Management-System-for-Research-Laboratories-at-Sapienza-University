#!/usr/bin/env bash
# build_and_copy.sh
# Builds the Java subprojects (auth, back-end, notification) using their included mvnw
# and copies the produced jar(s) from each module's target into the top-level Docker/ folder.
# Usage: ./build_and_copy.sh
# This script expects to be run from the repository root or from the `source` folder. It
# will cd into each module, run its mvnw package, and then copy the jar(s).

set -euo pipefail
IFS=$'\n\t'

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
DOCKER_DIR="$ROOT_DIR/Docker"

MODULES=("auth" "back-end" "notification")

# helper to run build for a module
build_module() {
  local module="$1"
  echo "\n==> Building module: $module"
  pushd "$ROOT_DIR/$module" >/dev/null

  if [ ! -x "./mvnw" ]; then
    echo "Warning: mvnw not executable for $module, trying to set +x"
    chmod +x ./mvnw || true
  fi

  ./mvnw -DskipTests package || { echo "Build failed for $module"; popd >/dev/null; return 1; }
  popd >/dev/null
}

# helper to copy produced jars
copy_jars() {
  local module="$1"
  local module_target_dir="$ROOT_DIR/$module/target"

  if [ ! -d "$module_target_dir" ]; then
    echo "Warning: target dir not found for $module: $module_target_dir"
    return 1
  fi

  mkdir -p "$DOCKER_DIR"

  # Preferred artifact names mapping per module (use case statement for portability)
  local preferred_name=""
  case "$module" in
    auth)
      preferred_name="auth.jar"
      ;;
    "back-end")
      preferred_name="back.jar"
      ;;
    notification)
      preferred_name="notification.jar"
      ;;
    *)
      preferred_name=""
      ;;
  esac

  if [ -n "$preferred_name" ] && [ -f "$module_target_dir/$preferred_name" ]; then
    echo "Copying preferred artifact $preferred_name -> $DOCKER_DIR/"
    cp -f "$module_target_dir/$preferred_name" "$DOCKER_DIR/"
    return 0
  fi

  # Fallback: Find jar files that look like built artifacts (exclude *-sources.jar and *-javadoc.jar)
  mapfile -t jars < <(find "$module_target_dir" -maxdepth 1 -type f -name "*.jar" ! -name "*-sources.jar" ! -name "*-javadoc.jar" )

  if [ ${#jars[@]} -eq 0 ]; then
    echo "No jar artifacts found for module $module in $module_target_dir"
    return 1
  fi

  for jar in "${jars[@]}"; do
    echo "Copying $(basename "$jar") -> $DOCKER_DIR/"
    cp -f "$jar" "$DOCKER_DIR/"
  done
}

# Main
echo "Starting build-and-copy for modules: ${MODULES[*]}"

for mod in "${MODULES[@]}"; do
  if build_module "$mod"; then
    echo "Built $mod successfully"
  else
    echo "Error building $mod, continuing to next module"
  fi

  if copy_jars "$mod"; then
    echo "Copied jars for $mod"
  else
    echo "Warning: could not copy jars for $mod"
  fi
done

echo "\nDone. Copied artifacts are in: $DOCKER_DIR"

exit 0
