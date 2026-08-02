## Job Aggregator / OVERKILL

Agrégateur d'offres d'emploi, de stage et d'alternance.

## Stack

- Frontend : React, Vite, TailwindCSS
- Backend : Symfony
- Base de données : PostgreSQL sur Neon

## Installation avec Docker

Le projet utilise un seul fichier `docker-compose.yaml` pour démarrer le
frontend et le backend en développement. La base PostgreSQL n'est pas exécutée
dans Docker : le backend utilise directement la base Neon définie par
`POSTGRES_REMOTE_URL`.

Copiez `.env.example` vers `.env` si nécessaire et renseignez votre URL Neon :

```dotenv
POSTGRES_REMOTE_URL=postgresql://user:password@host/database?sslmode=require&channel_binding=require&charset=utf8
```

Ne committez jamais l'URL réelle, car elle contient les identifiants de la base.

## Démarrage

Construire et démarrer les conteneurs :

```bash
docker compose up --build -d
```

Cette commande synchronise les dépendances PHP et JavaScript dans leurs volumes
Docker, génère les clés JWT locales si nécessaire et applique les migrations
Doctrine en attente sur Neon. Aucune fixture n'est chargée et aucune offre n'est
supprimée au démarrage.

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

Arrêter les conteneurs :

```bash
docker compose down
```

Cette commande arrête uniquement le frontend et le backend. Elle ne supprime
aucune donnée de la base Neon.
