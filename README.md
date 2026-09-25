# OVERKILL — Job Aggregator

> La plateforme qui centralise les opportunités tech, facilite leur comparaison et aide chaque candidat à mieux piloter sa recherche d’emploi.

OVERKILL est une plateforme web d’agrégation d’offres d’emploi, de stage et d’alternance. Elle collecte des annonces externes, les normalise dans un catalogue homogène et propose des outils pour rechercher, comparer et suivre ses opportunités.

Le produit a été développé dans le cadre du projet **Epitech W-YEP-200 — Job Aggregator**, en partenariat avec **WeLoveDevs**. Il réunit une interface responsive, une API REST sécurisée, un pipeline d’ingestion de données et une analyse de CV assistée par un modèle d’IA exécuté localement.

## Sommaire

- [Présentation](#présentation)
- [Proposition de valeur](#proposition-de-valeur)
- [Fonctionnalités](#fonctionnalités)
- [Fonctionnement](#fonctionnement)
- [Architecture technique](#architecture-technique)
- [Installation](#installation)
- [Services optionnels](#services-optionnels)
- [Utilisation](#utilisation)
- [Qualité et sécurité](#qualité-et-sécurité)
- [Documentation](#documentation)
- [Périmètre actuel](#périmètre-actuel)

## Présentation

Les candidats tech naviguent souvent entre plusieurs jobboards, rencontrent des annonces redondantes ou incomplètes et disposent de peu d’outils pour évaluer rapidement leur candidature. OVERKILL répond à cette fragmentation avec un point d’entrée unique.

La plateforme s’adresse principalement :

- aux développeurs, étudiants et profils tech recherchant un CDI, CDD, stage, alternance ou une mission freelance ;
- aux candidats qui souhaitent structurer leur recherche et conserver leurs candidatures au même endroit ;
- aux administrateurs chargés d’alimenter et de maintenir le catalogue d’offres.

## Proposition de valeur

### Centraliser

Les offres WeLoveDevs sont récupérées par un workflow d’ingestion, filtrées, normalisées et enregistrées dans une structure commune. L’utilisateur consulte ainsi un catalogue cohérent sans multiplier les plateformes.

### Décider plus vite

La recherche multicritère permet de cibler une opportunité par mots-clés, localisation, entreprise, contrat, type d’offre, organisation du travail, salaire minimum ou catégorie. La fiche détaillée rassemble entreprise, lieu, contrat, dates, rémunération, compétences et lien vers la source.

### Mieux candidater

L’espace personnel centralise le profil du candidat, ses compétences, ses CV et le suivi de ses candidatures. Un analyseur ATS public évalue également la lisibilité générale d’un CV et fournit un score sur 100 accompagné de recommandations concrètes.

## Fonctionnalités

### Pour tous les visiteurs

- consultation des offres récentes avec pagination ;
- recherche et filtres multicritères ;
- fiche détaillée de chaque opportunité ;
- accès direct à l’annonce d’origine ;
- guides de recherche d’emploi et de préparation de CV ;
- analyse ATS d’un CV PDF et export du rapport ;
- formulaire de contact ;
- interface responsive avec gestion du clavier, du focus et des lecteurs d’écran.

### Pour les utilisateurs authentifiés

- inscription et connexion sécurisées par JWT ;
- consultation et modification du profil ;
- changement de mot de passe et révocation des sessions ;
- gestion d’une liste libre de compétences ;
- dépôt, consultation et suppression de CV ;
- enregistrement et retrait des candidatures ;
- export des données personnelles et demande de suppression du compte.

### Pour les administrateurs

- accès protégé par le rôle `ROLE_ADMIN` ;
- déclenchement manuel du workflow d’ingestion WeLoveDevs ;
- transmission du secret du webhook uniquement depuis l’API Symfony.

## Fonctionnement

### Recherche d’une offre

1. Le visiteur ouvre le catalogue sur `/feed`.
2. Le frontend transmet les critères à `GET /api/offers`.
3. Symfony valide les paramètres et interroge PostgreSQL avec Doctrine.
4. L’API retourne dix résultats par page, triés du plus récent au plus ancien.
5. Le visiteur consulte le détail puis rejoint la source pour finaliser sa candidature.

Les offres affichées sont limitées aux publications des 30 derniers jours afin de privilégier la fraîcheur du catalogue.

### Espace candidat

Après inscription, l’utilisateur reçoit un jeton JWT lors de sa connexion. Ce jeton accompagne chaque requête protégée. Le profil permet de gérer les compétences et les CV, tandis que les candidatures sont persistées dans PostgreSQL et rattachées au compte connecté.

### Ingestion des données

```mermaid
flowchart TB
    Admin([Administrateur]) -->|Declenche| Panel[Panneau OVERKILL]
    Panel -->|JWT| API[API Symfony]
    API -->|Webhook securise| N8N[n8n]
    N8N -->|Collecte| WLD[API WeLoveDevs]
    WLD -->|Offres brutes| N8N
    N8N -->|Filtrage et normalisation| API
    API -->|Doctrine ORM| DB[(PostgreSQL / Neon)]
```

Le workflow respecte la limite WeLoveDevs de **1 requête par seconde**. Il contrôle les données, crée les entreprises et catégories manquantes, puis répartit les informations normalisées entre les entités correspondantes. L’unicité d’une offre est renforcée côté API par le couple source/URL externe.

Le bouton d’administration confirme le déclenchement du workflow, mais ne suit pas encore son exécution jusqu’à la fin.

### Analyse ATS par IA

L’analyse ATS est accessible sans compte depuis `/ressources/analyse-ats`.

1. Le navigateur valide un PDF de 10 Mo maximum.
2. Le fichier est transmis en `multipart/form-data` à un webhook n8n dédié.
3. n8n extrait le texte et orchestre l’analyse.
4. **LM Studio** exécute localement le modèle **Qwen 3.5 9B**.
5. Le rapport Markdown est affiché puis peut être exporté en PDF.

L’analyse porte sur sept dimensions : coordonnées professionnelles, structure, positionnement, expériences, compétences, formation/langues et qualité rédactionnelle. Il s’agit d’une estimation générale : elle ne compare pas le CV à une offre précise et ne garantit pas le résultat d’une candidature.

## Architecture technique

```mermaid
flowchart TB
    Browser([Navigateur]) -->|Interface web| Frontend[Frontend: React 19 / Vite 8 / Tailwind CSS 4]
    Frontend -->|API JSON / JWT| Backend[Backend: Symfony 8.1 / PHP 8.4]
    Backend -->|Doctrine ORM| Database[(PostgreSQL / Neon)]

    Frontend -->|CV PDF| ATS[Webhook ATS n8n]
    ATS -->|Analyse locale| AI[LM Studio / Qwen 3.5 9B]
    ATS -->|Rapport Markdown| Frontend

    Backend -->|Webhook securise| Ingestion[n8n - ingestion]
    Ingestion -->|Collecte| WLD[API WeLoveDevs]
    Ingestion -->|Offres normalisees| Backend
```

| Couche | Technologies | Rôle |
| --- | --- | --- |
| Frontend | React 19, React Router, Vite 8, Tailwind CSS 4 | Navigation, recherche, profil et interface responsive |
| Backend | Symfony 8.1, PHP 8.4 | API REST, validation, règles métier et orchestration |
| Données | PostgreSQL, Neon, Doctrine ORM | Persistance, relations, migrations et recherche |
| Sécurité | LexikJWTAuthenticationBundle, rôles Symfony, CORS | Authentification stateless et contrôle d’accès |
| Automatisation | n8n | Ingestion WeLoveDevs et orchestration ATS |
| IA | LM Studio, Qwen 3.5 9B | Analyse locale des CV |
| Exécution | Docker, Docker Compose | Environnement de développement reproductible |
| Qualité | PHPUnit, ESLint, GitHub Actions | Tests, lint et intégration continue |

### Structure du dépôt

```text
.
├── Overkill_Client/          # Application React
├── Overkill_Api/             # API Symfony et migrations Doctrine
├── docs/                     # Documentation produit et technique
├── .github/workflows/ci.yml  # Pipeline d’intégration continue
├── docker-compose.yaml       # Orchestration locale
└── README.md
```

## Installation

### Prérequis

- Git ;
- Docker Engine et Docker Compose v2 ;
- une base PostgreSQL accessible, par exemple un projet [Neon](https://neon.tech/) ;
- environ 2 Go d’espace disponible pour les images et dépendances.

n8n et LM Studio ne sont requis que pour l’ingestion et l’analyse ATS. Le catalogue et l’API peuvent démarrer sans ces deux intégrations, à condition que PostgreSQL soit configuré.

### 1. Récupérer le projet

```bash
git clone git@github.com:Razigue/Overkill.git
cd Overkill
```

Si le dépôt est déjà présent, placez-vous simplement à sa racine.

### 2. Créer la configuration locale

```bash
cp .env.example .env
```

Ouvrez `.env` et remplacez au minimum `POSTGRES_REMOTE_URL` par l’URL de connexion de votre base :

```dotenv
POSTGRES_REMOTE_URL=postgresql://user:password@host/database?sslmode=require&channel_binding=require&charset=utf8
```

Utilisez un `APP_SECRET` propre à votre environnement et ne commitez jamais le fichier `.env` ni les identifiants PostgreSQL.

| Variable | Obligatoire | Valeur par défaut / usage |
| --- | :---: | --- |
| `POSTGRES_REMOTE_URL` | Oui | Connexion PostgreSQL utilisée par Symfony |
| `APP_SECRET` | Recommandé | Secret interne Symfony |
| `FRONTEND_PORT` | Non | `5173` |
| `BACKEND_PORT` | Non | `8000` |
| `VITE_API_URL` | Non | `/backend`, proxy Vite vers Symfony |
| `CORS_ALLOW_ORIGIN` | Non | `http://localhost:5173` |
| `MAILER_DSN` | Non | `null://null` si aucun SMTP n’est configuré |
| `CONTACT_RECIPIENT` | Non | Destinataire du formulaire de contact |
| `CONTACT_SENDER` | Non | Expéditeur du formulaire de contact |
| `VITE_N8N_ATS_WEBHOOK_URL` | Non | Webhook de l’analyseur ATS |

### 3. Construire et démarrer

```bash
docker compose up --build -d
```

Au premier démarrage, les conteneurs :

- installent les dépendances Composer et npm dans des volumes Docker ;
- génèrent la paire de clés JWT locale si elle n’existe pas ;
- appliquent automatiquement les migrations Doctrine en attente ;
- lancent Vite sur le port 5173 et l’API Symfony sur le port 8000.

Le démarrage ne charge aucune fixture et ne supprime aucune offre existante.

### 4. Vérifier les services

```bash
docker compose ps
docker compose logs -f
```

| Service | Adresse |
| --- | --- |
| Application web | <http://localhost:5173> |
| API Symfony | <http://localhost:8000> |
| Documentation Swagger | `docs/overkill_swagger_doc/index.html` |

Test rapide de l’API :

```bash
curl http://localhost:8000/api/offers
```

### 5. Arrêter le projet

```bash
docker compose down
```

Cette commande arrête le frontend et le backend. Elle ne supprime pas les données de la base Neon. Les volumes de dépendances sont conservés tant que l’option `--volumes` n’est pas utilisée.

## Services optionnels

### Ingestion WeLoveDevs avec n8n

Le workflow n8n n’est pas inclus dans ce dépôt. Une instance n8n disposant d’un workflow compatible doit être déployée séparément avec une clé API WeLoveDevs.

Créez `Overkill_Api/.env.local` :

```dotenv
N8N_WEBHOOK_URL=https://votre-instance-n8n.example/webhook/ingestion
N8N_WEBHOOK_SECRET=remplacez_par_un_secret_long_et_aleatoire
```

Puis redémarrez le backend :

```bash
docker compose restart backend
```

Le compte utilisé doit posséder `ROLE_ADMIN`. Aucun endpoint public ne permet d’accorder ce rôle : il doit être provisionné de manière contrôlée dans la base.

### Analyse ATS avec n8n et LM Studio

Renseignez dans le `.env` racine :

```dotenv
VITE_N8N_ATS_WEBHOOK_URL=https://votre-instance-n8n.example/webhook/overkill/analyse-cv-ats
```

Le workflow doit accepter un champ `file`, extraire le texte du PDF, valider le document puis appeler l’API compatible OpenAI exposée par LM Studio avec le modèle `qwen/qwen3.5-9b`. L’instance n8n doit pouvoir joindre LM Studio.

Après toute modification d’une variable `VITE_*`, redémarrez le frontend :

```bash
docker compose up -d --force-recreate frontend
```

### Formulaire de contact

Pour envoyer réellement les messages, remplacez le DSN nul par celui d’un fournisseur SMTP :

```dotenv
MAILER_DSN=smtp://username:password@sandbox.smtp.mailtrap.io:2525
CONTACT_RECIPIENT=contact@example.com
CONTACT_SENDER=no-reply@example.com
```

## Utilisation

### Parcours candidat recommandé

1. Accéder à l’accueil puis créer un compte.
2. Compléter le profil, les compétences et déposer un CV.
3. Rechercher une offre dans le feed.
4. Ouvrir son détail et enregistrer la candidature.
5. Consulter le suivi depuis le profil.
6. Analyser le CV depuis Ressources avant de postuler sur le site source.

### Appels API essentiels

| Méthode | Route | Accès | Usage |
| --- | --- | --- | --- |
| `POST` | `/api/register` | Public | Création d’un compte |
| `POST` | `/api/login` | Public | Obtention d’un JWT |
| `GET` | `/api/offers` | Public | Recherche paginée |
| `GET` | `/api/offers/{id}` | Public | Détail d’une offre |
| `GET/PATCH` | `/api/me`, `/api/me/profile` | Utilisateur | Gestion du profil |
| `GET/POST/DELETE` | `/api/applications` | Utilisateur | Suivi des candidatures |
| `GET/POST/DELETE` | `/api/user/skills` | Utilisateur | Gestion des compétences |
| `GET` | `/api/cvs` | Utilisateur | Liste des CV |
| `POST` | `/api/cvs/upload` | Utilisateur | Dépôt d’un CV |
| `DELETE` | `/api/cvs/{id}` | Utilisateur | Suppression d’un CV |
| `POST` | `/api/admin/trigger-scraping` | Administrateur | Lancement de l’ingestion |

La spécification complète est disponible aux formats YAML, JSON et HTML dans [`docs/overkill_swagger_doc`](docs/overkill_swagger_doc/README.md).

## Qualité et sécurité

### Vérifications locales

```bash
docker compose exec frontend npm run lint
docker compose exec frontend npm run build
docker compose exec backend php bin/phpunit
```

La CI GitHub Actions s’exécute sur un runner `self-hosted` et couvre l’authentification, les offres, les CV, les compétences et les favoris. Elle vérifie aussi le frontend et recherche les secrets accidentellement commités.

Contrôles présents :

- mots de passe hachés avec le mécanisme Symfony en mode `auto` ;
- JWT signé par paire de clés privée/publique ;
- routes privées protégées côté serveur ;
- rôles `ROLE_USER` et `ROLE_ADMIN` ;
- validation des DTO et codes HTTP adaptés ;
- requêtes Doctrine paramétrées contre l’injection SQL ;
- secrets externalisés dans les variables d’environnement ;
- dédoublonnage des offres à l’import ;
- assainissement du Markdown affiché par le frontend.

Le dépôt fournit une configuration de développement HTTP. Un déploiement public doit ajouter HTTPS, en-têtes de sécurité, politique CSP, sauvegardes et gestion centralisée des secrets.

## Documentation

| Sujet | Document |
| --- | --- |
| Architecture | [`docs/architecture.md`](docs/architecture.md) |
| Données et ingestion | [`docs/data.md`](docs/data.md) |
| Étude de marché | [`docs/ETUDE_DE_MARCHE.md`](docs/ETUDE_DE_MARCHE.md) |
| Analyse ATS | [`docs/analyse-ats.md`](docs/analyse-ats.md) |
| Authentification | [`docs/authentification.md`](docs/authentification.md) |
| Sécurité | [`docs/security.md`](docs/security.md) |
| Administration | [`docs/panelAdmin.md`](docs/panelAdmin.md) |
| Tests et CI | [`docs/CI&TEST.md`](docs/CI&TEST.md) |
| API Swagger | [`docs/overkill_swagger_doc`](docs/overkill_swagger_doc/README.md) |
| Organisation | [`Trello`](https://trello.com/b/voJQVp1I/job-aggregator) |
| Design | [`Figma`](https://www.figma.com/design/6i8HWHSegTRgZcC2k4BO6o/Untitled?node-id=0-1&t=vtNWEmTnoiLU5Jpl-1) |
| Schema DB | [`LucidChart`](https://lucid.app/lucidchart/6b8243be-0c54-48cd-a43a-87ffd64d14db/edit?viewport_loc=-2330%2C918%2C3262%2C1578%2C0_0&invitationId=inv_c52c920a-e888-4cd7-b2bb-1c9b59fb49c1) |

## Périmètre actuel

OVERKILL est un **MVP fonctionnel de développement local**. Les points suivants doivent être pris en compte avant une mise en production :

- la composition Docker lance deux conteneurs, frontend et backend ; PostgreSQL est fourni comme service distant par Neon ;
- le workflow n8n d’ingestion n’est pas versionné dans ce dépôt ;
- France Travail a été étudié, mais seule l’intégration WeLoveDevs est finalisée ;
- les favoris du feed sont encore conservés dans le `localStorage`, même si l’API dispose d’endpoints dédiés ;
- le panneau administrateur ne présente ni historique, ni métriques, ni statut de fin ;
- Vite et le serveur PHP intégré sont adaptés au développement, pas à une exposition directe en production ;
- la gestion des offres par l’API et la protection des CV doivent être durcies avant une ouverture publique.

Ces limites n’empêchent pas les parcours principaux — exploration, authentification, profil, candidatures et analyse ATS configurée — mais constituent la feuille de route prioritaire d’une version industrialisée.

---

**OVERKILL** — moins de dispersion, plus de visibilité, de meilleures candidatures.

---

**Authors**
- 🦦 [@Corentin-Epitech](https://www.github.com/Corentin-Epitech)
- 🦊 [@KisukeSaama](https://www.github.com/KisukeSaama)
- 🎸​ [@Razigue](https://github.com/Razigue)
- 🍗​ [@Tablooooo](https://github.com/Tablooooo)
- 🏎️ [@AntoineAll](https://github.com/AntoineAll)
