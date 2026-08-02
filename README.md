## Job Aggregator / OVERKILL

Agrégateur d'offres d'emploi, de stage et d'alternance.

## Stack

- Frontend : React, Vite, TailwindCSS
- Backend : Symfony
- Base de données : PostgreSQL

## Installation avec Docker

Le projet utilise un seul fichier `docker-compose.yaml`, prévu pour le
développement local. Il démarre le frontend, le backend et une base PostgreSQL
locale. Le fichier `.env` est optionnel : copiez `.env.example` uniquement si
vous souhaitez personnaliser les ports, les identifiants PostgreSQL ou les
services externes.

Construire et démarrer les conteneurs :

```bash
docker compose up --build -d
```

Cette commande démarre PostgreSQL, synchronise les dépendances PHP et JavaScript
dans leurs volumes Docker, génère les clés JWT locales si nécessaire et applique
automatiquement les migrations Doctrine en attente. Aucune fixture n'est
chargée et aucune offre n'est supprimée au démarrage.

Les données PostgreSQL sont conservées dans le volume `database_data` entre les
redémarrages.

## Utilisation

Si les conteneurs sont déjà construits :

```bash
docker compose up -d
```

Accès :

- Frontend : http://localhost:5173
- Backend : http://localhost:8000
- PostgreSQL : localhost:5432 par défaut

Voir les logs :

```bash
docker compose logs -f
```

Arrêter le projet sans supprimer les données :

```bash
docker compose down
```

Pour supprimer également la base PostgreSQL locale, utilisez explicitement :

```bash
docker compose down --volumes
```
