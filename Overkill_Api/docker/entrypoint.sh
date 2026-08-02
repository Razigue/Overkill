#!/bin/sh
set -eu

# Le volume vendor masque les dépendances présentes dans l'image. Cette commande
# rend aussi un pull contenant un composer.lock mis à jour immédiatement utilisable.
composer install --no-interaction --prefer-dist

mkdir -p config/jwt
php bin/console lexik:jwt:generate-keypair --skip-if-exists --no-interaction

# Le service database est déjà healthy grâce à depends_on. Cette commande est
# idempotente : seules les nouvelles migrations sont appliquées.
php bin/console doctrine:migrations:migrate \
    --no-interaction \
    --allow-no-migration

exec "$@"
