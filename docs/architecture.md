# Documentation – Architecture technique

## 1. Périmètre et sources de vérité

Cette documentation décrit l'architecture réellement visible dans le dépôt. Elle s'appuie notamment sur `docker-compose.yaml`, les manifestes de dépendances, les routes et contrôleurs Symfony, les pages React et `docs/data.md`.

Le workflow n8n d'ingestion WeLoveDevs n'est pas versionné dans ce dépôt. Son fonctionnement interne ne peut donc pas être vérifié ici au-delà du contrat observable : Symfony déclenche un webhook n8n, et l'API expose les routes utilisées pour lire et créer des offres.

---

## 2. Vue d'ensemble

```text
Navigateur
   |
   | pages et appels HTTP JSON
   v
Frontend React 19 / Vite 8 / Tailwind CSS 4
   |
   | /api/*
   v
Backend Symfony 8.1 / PHP 8.4
   |                         |
   | Doctrine ORM            | POST + X-Webhook-Secret
   v                         v
PostgreSQL                 n8n
                             |
                             | ingestion documentée
                             v
                         WeLoveDevs
```

Un second flux, distinct de l'ingestion des offres, relie directement la page d'analyse ATS au webhook n8n configuré par `VITE_N8N_ATS_WEBHOOK_URL`. Symfony n'intervient pas dans ce parcours ; il est détaillé dans `docs/analyse-ats.md`.

---

## 3. Stack sélectionnée

| Couche | Technologie vérifiée | Responsabilité dans le projet |
| --- | --- | --- |
| Interface | React 19 | Pages, composants, état local et interactions utilisateur |
| Construction frontend | Vite 8 | Serveur de développement et production du bundle |
| Présentation | Tailwind CSS 4 | Mise en forme des vues et comportement responsive |
| Routage client | React Router | Navigation entre les pages publiques, le profil et `/admin` |
| API | Symfony 8.1 sur PHP 8.4 | Routes HTTP, authentification, autorisations, validation et orchestration métier |
| Accès aux données | Doctrine ORM 3.6 | Mapping des entités, requêtes et migrations |
| Base de données | PostgreSQL | Persistance des utilisateurs, offres, entreprises, sources, catégories, favoris, compétences et CV |
| Authentification | LexikJWTAuthenticationBundle | Émission et vérification des jetons JWT |
| Orchestration externe | n8n | Déclenchement de l'ingestion WeLoveDevs et parcours d'analyse ATS |
| Exécution locale | Docker Compose | Conteneurs frontend et backend, volumes de dépendances et réseau commun `overkill` |

Ces versions proviennent de `Overkill_Client/package.json`, `Overkill_Api/composer.json` et des Dockerfiles ; elles ne sont pas des versions supposées.

---

## 4. Frontières des services

### Frontend React

Le frontend possède l'affichage et les interactions : recherche et consultation d'offres, authentification, profil, dépôt de CV, compétences, pages de ressources et panneau administrateur. Il appelle l'API en JSON, sauf l'envoi de fichiers qui utilise `multipart/form-data`.

Le frontend n'est pas une frontière de sécurité. Il masque ou affiche certains accès à partir du contenu du JWT, mais Symfony revérifie le jeton et les rôles sur chaque route protégée.

### Backend Symfony

Symfony est la frontière serveur principale. Les contrôleurs sont séparés par domaine :

* `SecurityController` : inscription, connexion gérée par le firewall, profil courant et vérification de la base ;
* `OffersController` : lecture filtrée, création, consultation et suppression d'offres ;
* `UserFavoriteController` : favoris de l'utilisateur courant ;
* `UserSkillController` : compétences associées à l'utilisateur courant ;
* `CvController` : liste et dépôt des CV de l'utilisateur courant ;
* `ContactController` : validation et envoi du formulaire de contact ;
* `AdminController` : déclenchement du webhook d'ingestion.

L'API ne sert pas le frontend React : les deux applications sont lancées par des conteneurs distincts sur les ports 5173 et 8000.

### PostgreSQL et Doctrine

Doctrine isole les contrôleurs de SQL direct. Les entités portent les relations et contraintes structurelles ; les repositories portent les requêtes, notamment la recherche paginée des offres.

Dans le `docker-compose.yaml` racine, le service PostgreSQL local est commenté et le backend exige `POSTGRES_REMOTE_URL`. L'architecture actuellement activée vise donc une base PostgreSQL distante. Le volume `database_data` et le service commenté montrent qu'une exécution locale avait été prévue, mais elle n'est pas active dans cette composition.

### n8n et services externes

Le panneau administrateur appelle `POST /api/admin/trigger-scraping`. Symfony récupère `N8N_WEBHOOK_URL`, ajoute `X-Webhook-Secret`, puis émet un `POST` vers n8n avec un timeout de cinq secondes.

D'après `docs/data.md`, n8n orchestre la récupération WeLoveDevs, le filtrage et la normalisation avant insertion. Le code du workflow n'étant pas présent, la documentation d'architecture ne lui attribue pas d'étapes supplémentaires.

---

## 5. Flux principaux

### Consultation des offres

1. Le navigateur appelle `GET /api/offers` avec une page et, lorsque le client les transmet, des filtres.
2. `OffersController` construit les critères.
3. `OffersRepository` exécute une requête Doctrine paginée, limite la sélection aux offres publiées dans les trente derniers jours et trie par date décroissante.
4. Symfony sérialise les résultats avec le groupe `offers:read`.

À ce jour, `Overkill_Client/src/services/offers.js` ne transmet que la pagination : la transmission des filtres est encore commentée.

### Authentification

1. Le frontend envoie l'e-mail et le mot de passe à `POST /api/login`.
2. Le firewall Symfony vérifie les identifiants et LexikJWTAuthenticationBundle retourne un JWT.
3. Le frontend stocke le jeton, appelle `GET /api/me`, puis conserve le profil dans `localStorage`.
4. Les appels protégés envoient `Authorization: Bearer <token>`.

### Déclenchement de l'ingestion

1. Un administrateur ouvre `/admin` et active « Lancer le Scraping ».
2. React appelle la route Symfony avec son JWT.
3. Symfony exige `ROLE_ADMIN` puis appelle le webhook n8n avec le secret serveur.
4. Le panneau affiche le message HTTP retourné par Symfony.

Ce retour confirme le déclenchement côté API, pas la fin de l'ingestion : aucun suivi d'exécution n'est implémenté dans le dépôt.

---

## 6. Choix observables et alternatives non retenues

Le dépôt ne contient pas d'ADR ou de benchmark formalisant tous les arbitrages. Le tableau suivant distingue donc les décisions prouvées par le code des justifications techniques que permet l'implémentation, sans attribuer à l'équipe des motifs non écrits.

| Choix retenu | Alternative visible ou documentée | Ce que le dépôt permet d'affirmer |
| --- | --- | --- |
| SPA React séparée | Rendu Symfony/Twig | Des fichiers Twig issus du socle Symfony existent, mais toutes les pages produit et le routage fonctionnel sont dans `Overkill_Client`. La séparation permet au client de consommer une API JSON indépendante. |
| Doctrine ORM + PostgreSQL | SQL direct ou base embarquée | Les entités, repositories et migrations Doctrine sont utilisés partout ; l'image PHP installe `pdo_pgsql` et Compose fournit une URL PostgreSQL au backend. |
| JWT stateless | Session serveur pour l'API | Le firewall `/api` est `stateless: true` et vérifie les JWT. Une configuration de session Symfony existe, mais les appels React protégés utilisent le header Bearer. |
| n8n pour l'ingestion | Pipeline entièrement codé dans Symfony | `AdminController` délègue à un webhook et `docs/data.md` justifie l'orchestration visuelle par la lisibilité et la maintenance. Aucun service d'ingestion WeLoveDevs équivalent n'existe dans Symfony. |
| WeLoveDevs comme source active | France Travail comme seconde source | `docs/data.md` indique que le workflow France Travail est resté inachevé en raison des écarts de structure et de normalisation ; aucune intégration France Travail exploitable n'est présente dans le code applicatif. |
| PostgreSQL distant dans la composition racine | Conteneur PostgreSQL local | Le service local est commenté tandis que `POSTGRES_REMOTE_URL` est obligatoire pour le backend. |

---

## 7. Limites d'architecture constatées

* Les URL de plusieurs appels frontend sont écrites en dur sur `http://localhost:8000`, alors que seul le service de contact utilise systématiquement `VITE_API_URL`.
* Le workflow n8n d'ingestion n'est pas versionné avec l'application : son comportement et ses changements ne peuvent pas être audités depuis ce dépôt.
* Le panneau administrateur ne dispose d'aucun endpoint de statut ou d'historique d'ingestion.
* Les conteneurs lancent les serveurs de développement (`vite` et `php -S`) ; aucune configuration de déploiement de production n'est fournie ici.
* Le service PostgreSQL local présent dans Compose est désactivé, alors que certaines variables de `.env.example` racine décrivent encore un scénario local. La configuration active et l'exemple ne sont donc pas complètement alignés.

---

## 8. Fichiers de référence

* `docker-compose.yaml`
* `Overkill_Api/composer.json`
* `Overkill_Api/config/packages/security.yaml`
* `Overkill_Api/src/Controller/`
* `Overkill_Api/src/Entity/`
* `Overkill_Api/src/Repository/OffersRepository.php`
* `Overkill_Client/package.json`
* `Overkill_Client/src/App.jsx`
* `Overkill_Client/src/services/offers.js`
* `docs/data.md`
* `docs/analyse-ats.md`
