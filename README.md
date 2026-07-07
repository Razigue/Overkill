## Job Aggregator / OVERKILL

Agrégateur d'offres d'emploi, de stage et d'alternance.

## Stack

- Frontend : React, Vite, TailwindCSS
- Backend : Symfony
- Base de données : PostgreSQL

## Installation avec Docker

Créer le fichier d'environnement local :

```bash
cp .env.example .env
```

Construire et démarrer les conteneurs :

```bash
docker compose up --build -d
```

Installer les dépendances Symfony :

```bash
docker compose exec backend composer install
```

Installer les dépendances frontend :

```bash
docker compose exec frontend npm install
```

Lancer les migrations Symfony :

```bash
docker compose exec backend php bin/console doctrine:migrations:migrate
```

## Lancement local

Si les conteneurs sont déjà construits :

```bash
docker compose up -d
```

Accès :

- Frontend : http://localhost:5173
- Backend : http://localhost:8000

Voir les logs :

```bash
docker compose logs -f
```

Arrêter le projet :

```bash
docker compose down
```
