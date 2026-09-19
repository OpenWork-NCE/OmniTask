#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_DIR=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
ENV_FILE="$PROJECT_DIR/.env"
SECRETS_DIR="$PROJECT_DIR/.secrets"
PRIVATE_KEY="$SECRETS_DIR/jwt-private.pem"
PUBLIC_KEY="$SECRETS_DIR/jwt-public.pem"

if ! command -v openssl >/dev/null 2>&1; then
  echo "openssl is required to generate local secrets" >&2
  exit 1
fi

umask 077
mkdir -p "$SECRETS_DIR"
chmod 700 "$SECRETS_DIR"

if [ -e "$PRIVATE_KEY" ] || [ -e "$PUBLIC_KEY" ]; then
  if [ ! -f "$PRIVATE_KEY" ] || [ ! -f "$PUBLIC_KEY" ]; then
    echo "Refusing to replace a partial JWT key pair in $SECRETS_DIR" >&2
    exit 1
  fi
else
  private_tmp="$SECRETS_DIR/.jwt-private.pem.tmp.$$"
  public_tmp="$SECRETS_DIR/.jwt-public.pem.tmp.$$"
  trap 'rm -f "$private_tmp" "$public_tmp"' EXIT HUP INT TERM

  openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 \
    -out "$private_tmp" >/dev/null 2>&1
  openssl pkey -in "$private_tmp" -pubout -out "$public_tmp" >/dev/null 2>&1
  mv "$private_tmp" "$PRIVATE_KEY"
  mv "$public_tmp" "$PUBLIC_KEY"
  trap - EXIT HUP INT TERM
fi

# The containing directory remains private on the host. The key files must be
# readable by the non-root application user after Docker bind-mounts them.
chmod 644 "$PRIVATE_KEY" "$PUBLIC_KEY"

touch "$ENV_FILE"
chmod 600 "$ENV_FILE"

append_secret_if_missing() {
  variable_name=$1
  if ! grep -q "^${variable_name}=" "$ENV_FILE"; then
    secret_value=$(openssl rand -hex 32)
    printf '%s=%s\n' "$variable_name" "$secret_value" >>"$ENV_FILE"
  fi
}

append_secret_if_missing DB_PASSWORD
append_secret_if_missing MYSQL_ROOT_PASSWORD

echo "Local environment is ready. Existing secrets were preserved."
