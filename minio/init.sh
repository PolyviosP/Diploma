#!/bin/bash
# Στήσιμο του MinIO ως κώδικας — ίδια αρχή με το realm του Keycloak: καμία
# χειροκίνητη ρύθμιση από console, το `docker compose up` αρκεί.
#
# Το ουσιαστικό εδώ δεν είναι η δημιουργία του bucket αλλά το ποιος το γράφει:
# η εφαρμογή **δεν** παίρνει τα root κλειδιά του MinIO. Παίρνει δικό της χρήστη
# με policy που φτάνει μόνο μέχρι αυτό το bucket — αν διαρρεύσει το κλειδί από
# ένα .env, ο κάτοχός του δεν μπορεί ούτε άλλο bucket να δει ούτε χρήστες να
# φτιάξει.
#
# Το script είναι idempotent: τρέχει σε κάθε `up` και δεν πειράζει ό,τι υπάρχει.

set -eu

BUCKET="${S3_BUCKET:-diploma}"

echo "[minio-init] σύνδεση στο ${MINIO_ENDPOINT}"
mc alias set local "$MINIO_ENDPOINT" "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD" >/dev/null

echo "[minio-init] bucket: ${BUCKET}"
mc mb --ignore-existing "local/${BUCKET}" >/dev/null
# Ρητή δήλωση, όχι εμπιστοσύνη στο default: τίποτα δεν διαβάζεται ανώνυμα.
# Η πρόσβαση περνά αποκλειστικά από presigned URL (PROJECT_SPEC §9).
mc anonymous set none "local/${BUCKET}" >/dev/null

echo "[minio-init] χρήστης εφαρμογής: ${S3_ACCESS_KEY}"
mc admin user add local "$S3_ACCESS_KEY" "$S3_SECRET_KEY" >/dev/null 2>&1 ||
  echo "[minio-init] ο χρήστης υπάρχει ήδη"

# Το όνομα του bucket μπαίνει στο policy τη στιγμή της εφαρμογής, ώστε το αρχείο
# να μένει παραμετρικό και να μη διαφωνεί με το S3_BUCKET. Η αντικατάσταση
# γίνεται με expansion του bash και όχι με sed: η εικόνα του mc είναι minimal
# και δεν κουβαλάει coreutils πέρα από τα στοιχειώδη.
POLICY="$(cat /init/app-policy.json)"
printf '%s' "${POLICY//%BUCKET%/$BUCKET}" >/tmp/app-policy.json
mc admin policy create local diploma-app /tmp/app-policy.json >/dev/null 2>&1 ||
  mc admin policy update local diploma-app /tmp/app-policy.json >/dev/null 2>&1 ||
  echo "[minio-init] το policy υπάρχει ήδη"

mc admin policy attach local diploma-app --user "$S3_ACCESS_KEY" >/dev/null 2>&1 ||
  echo "[minio-init] το policy είναι ήδη συνδεδεμένο"

echo "[minio-init] έτοιμο"
