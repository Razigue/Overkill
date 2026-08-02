# Documentation du Pipeline CI/CD (`ci.yml`) et des Tests de Controller de l'API

Ce document décrit le fonctionnement, la structure et le flux d'exécution du pipeline d'intégration continue (CI) configuré dans `.github/workflows/ci.yml`.

---

## 📌 Vue d'ensemble

Le pipeline assure deux fonctions principales :
1. **Sécurité :** Analyse des fuites potentielles de secrets dans le code à l'aide de **Gitleaks**.
2. **Tests d'intégration & unitaires :** Exécution automatisée des suites de tests PHPUnit pour l'API Symfony (`Overkill_Api`).

---

## 📌 Déclencheurs (Triggers)

Le workflow s'exécute automatiquement lors des événements suivants :

* **`push`** : Sur n'importe quelle branche (`**`).
* **`pull_request`** : Lors de l'ouverture ou mise à jour d'une PR vers la branche `main`.
* **`workflow_dispatch`** : Déclenchement manuel via l'interface GitHub Actions.

---

## 🖥️ Environnement d'exécution

* **Runner :** `self-hosted` (Exécution sur un serveur auto-hébergé).
* **PHP Version :** `8.4`
* **Extensions PHP requises :** `mbstring`, `xml`, `ctype`, `iconv`, `intl`, `pdo_sqlite`, `pdo_mysql`.
* **Base de données de test :** SQLite isolée (`sqlite:///%kernel.project_dir%/var/data.db`).

---

## 🛠️ Description des Jobs

### 1. `secrets-scan`
* **Rôle :** Vérifier qu'aucun identifiant, clé API ou secret n'a été poussé dans le dépôt.
* **Outil :** Gitleaks v8.18.2 (installé localement sans accès `root`/`sudo`).
* **Comportement :** L'option `|| true` permet de ne pas bloquer les jobs suivants en cas d'avertissement, tout en affichant les détails dans les logs.

---

### 2. `test-backend-SecurityController`
* **Rôle :** Tester les fonctionnalités d'authentification et de sécurité.
* **Dépendance :** S'exécute après la réussite de `secrets-scan`.
* **Étapes clés :**
  1. Configuration de l'environnement PHP 8.4.
  2. Installation des dépendances Composer sans scripts automatiques (`--no-scripts`).
  3. Génération dynamique des clés SSL RSA pour LexikJWTAuthenticationBundle.
  4. Préparation du fichier `.env` de test.
  5. Mise à jour du schéma de base de données SQLite et chargement des fixtures.
  6. Exécution de `SecurityControllerTest.php`.

---

### 3. Jobs de tests parallèles / dépendants

Les jobs suivants dépendent de la fin du job `test-backend-SecurityController` :
* **`test-backend-CvController`** : Exécute `CvControllerTest.php`.
* **`test-backend-OffersController`** : Exécute `OffersControllerTest.php`.
* **`test-backend-UserSkillController`** : Exécute `UserSkillControllerTest.php`.
* **`test-backend-UserFavoriteController`** : Exécute `UserFavoriteControllerTest.php`.

> **Remarque sur l'option `if: ${{ !cancelled() }}` :**
> Cette condition garantit que chaque job de test s'exécute même si le job précédent a échoué, permettant d'avoir un rapport complet sur l'ensemble de la suite de tests PHPUnit.

---

## 🔑 Variables d'environnement de test

Chaque job de test backend injecte les variables d'environnement suivantes :

| Variable | Valeur par défaut / Description |
| :--- | :--- |
| `APP_ENV` | `test` |
| `APP_SECRET` | Clé secrète de test isolée |
| `DATABASE_URL` | Base de données SQLite locale (`var/data.db`) |
| `MESSENGER_TRANSPORT_DSN` | `in-memory://` (Pas de file de messages externe) |
| `MAILER_DSN` | `null://null` (Pas d'envoi de mails réels) |
| `JWT_SECRET_KEY` | Clé privée RSA générée pendant le job |
| `JWT_PUBLIC_KEY` | Clé publique RSA générée pendant le job |
| `JWT_PASSPHRASE` | Passphrase de test pour le token JWT |

---

# Documentation de  : `SecurityControllerTest.php`

Cette partie détaille les cas de tests fonctionnels et d'intégration implémentés dans la classe `SecurityControllerTest`.

---

## 📌 Vue d'ensemble

* **Classe de test :** `App\Tests\Controller\SecurityControllerTest`
* **Type :** Test d'intégration web (`WebTestCase`)
* **Objectif :** Valider les fonctionnalités du contrôleur de sécurité (`SecurityController`), incluant l'authentification (login), l'inscription (register), l'accès au profil utilisateur (`/api/me`) et la vérification de l'état de la base de données (`/api/check/database`).

---

## 📌 Endpoints Couverts

| Endpoint | Méthode | Authentification | Description |
| :--- | :--- | :--- | :--- |
| `/api/login` | `POST` | Non | Authentification de l'utilisateur et génération de Token JWT |
| `/api/register` | `POST` | Non | Inscription d'un nouvel utilisateur |
| `/api/me` | `GET` | **Requis (JWT)** | Récupération des informations du profil connecté |
| `/api/check/database` | `POST` | **Requis (JWT)** | Endpoint de diagnostic de connexion à la base de données |

---

## 📌 Détails des Cas de Tests

### 1. Authentification (Login)

#### 🔑 `testLoginSuccess()`
* **Objectif :** Vérifier qu'un utilisateur enregistré avec des identifiants valides peut se connecter avec succès.
* **Préconditions :** Création et insertion en base d'un utilisateur `user@epitech.eu` avec un mot de passe haché.
* **Scénario :** Envoi d'une requête `POST /api/login` contenant les identifiants valides au format JSON.
* **Assertions :**
  * Statut HTTP `200 OK` (`assertResponseIsSuccessful`).
  * La réponse contient une clé `token` (Token JWT) ou les données de l'utilisateur.
  * Si l'objet `user` est renvoyé, validation de l'adresse email.

#### ❌ `testLoginInvalidCredentials()`
* **Objectif :** S'assurer qu'une tentative de connexion avec des identifiants erronés est rejetée.
* **Scénario :** Envoi d'une requête `POST /api/login` avec un email/mot de passe inconnu (`wrong@epitech.eu`).
* **Assertions :**
  * Statut HTTP `401 Unauthorized`.

---

### 2. Inscription (Register)

#### 📝 `testRegisterSuccess()`
* **Objectif :** Valider la création d'un nouveau compte utilisateur.
* **Scénario :** Envoi d'une requête `POST /api/register` avec les données d'un nouvel utilisateur (`newstudent@epitech.eu`).
* **Assertions :**
  * Statut HTTP `201 Created`.
  * La réponse JSON contient la clé `user` et l'email correspond bien à la demande.

#### ⚠️ `testRegisterDuplicateEmail()`
* **Objectif :** Vérifier que le système empêche la création de comptes multiples avec la même adresse email.
* **Préconditions :** Création préalable en base d'un utilisateur `existing@epitech.eu`.
* **Scénario :** Envoi d'une requête `POST /api/register` tentant d'utiliser l'email `existing@epitech.eu`.
* **Assertions :**
  * Statut HTTP `409 Conflict`.

---

### 3. Profil Utilisateur (`/api/me`)

#### 🚫 `testMeUnauthorized()`
* **Objectif :** Vérifier qu'un utilisateur anonyme (sans jeton JWT) ne peut pas accéder aux informations de profil.
* **Scénario :** Envoi d'une requête `GET /api/me` sans en-tête `Authorization`.
* **Assertions :**
  * Statut HTTP `401 Unauthorized`.

#### 👤 `testMeAuthenticated()`
* **Objectif :** Vérifier qu'un utilisateur authentifié reçoit bien les données de son profil.
* **Scénario :**
  1. Création d'un utilisateur `authenticated@epitech.eu`.
  2. Authentification via `POST /api/login` pour récupérer un jeton JWT.
  3. Requête `GET /api/me` en fournissant le jeton dans l'en-tête `Authorization: Bearer <TOKEN>`.
* **Assertions :**
  * Statut HTTP `200 OK`.
  * L'adresse email renvoyée correspond à celle de l'utilisateur connecté (`authenticated@epitech.eu`).

---

### 4. Healthcheck Database

#### 🏥 `testCheckDatabase()`
* **Objectif :** Valider le fonctionnement de l'endpoint de vérification de l'état de la base de données réservé aux utilisateurs authentifiés.
* **Scénario :**
  1. Authentification d'un utilisateur de test `dbcheck@epitech.eu` pour obtenir un token JWT.
  2. Envoi d'une requête `POST /api/check/database` avec le jeton Bearer.
* **Assertions :**
  * Statut HTTP `200 OK`.
  * La réponse JSON contient au moins la clé `status`.

---

## ⚙️ Exécution des Tests

Pour exécuter uniquement ce jeu de tests localement :

```bash
php vendor/bin/phpunit tests/Controller/SecurityControllerTest.php
```

---

# Documentation de : `CvControllerTest.php`

Cette partie détaille les cas de tests fonctionnels et d'intégration implémentés dans la classe `CvControllerTest`.

---

## 📌 Vue d'ensemble

* **Classe de test :** `App\Tests\Controller\CvControllerTest`
* **Type :** Test d'intégration web (`WebTestCase`)
* **Objectif :** Valider les fonctionnalités de gestion des CV (téléversement, validation de format/fichier et récupération de la liste des CVs enregistrés par un utilisateur connecté).

---

## 📌 Endpoints Couverts

| Endpoint | Méthode | Authentification | Description |
| :--- | :--- | :--- | :--- |
| `/api/cvs` | `GET` | **Requis (JWT)** | Récupère la liste de tous les CV appartenant à l'utilisateur connecté |
| `/api/cvs/upload` | `POST` | **Requis (JWT)** | Permet le téléversement d'un nouveau fichier de CV (PDF, DOC, DOCX) |

---

## 📌 Méthodes d'Aide (Helpers)

La classe intègre deux helpers privés pour simplifier la configuration des tests :

1. **`createAuthenticatedUser(string $email)`**
   * **Rôle :** Instancie et persiste un utilisateur en base de données, effectue une requête de connexion (`/api/login`) et retourne un tuple `[$user, $token]` contenant l'entité et son jeton d'accès JWT.
2. **`createDummyFile(string $originalName, string $content)`**
   * **Rôle :** Génère un fichier temporaire sur le système avec un contenu simulé (ex: entête `%PDF-1.4`) et retourne une instance de `Symfony\Component\HttpFoundation\File\UploadedFile` configurée en mode test.

---

## 📌 Détails des Cas de Tests

### 1. Sécurité / Accès Non Autorisé

#### 🔒 `testListCvsUnauthorized()`
* **Objectif :** Vérifier que l'accès à la liste des CVs sans jeton d'authentification est bloqué.
* **Scénario :** Envoi d'une requête `GET /api/cvs` sans en-tête `Authorization`.
* **Assertions :**
  * Statut HTTP `401 Unauthorized`.

#### 🔒 `testUploadCvUnauthorized()`
* **Objectif :** Vérifier que le téléversement d'un CV sans authentification est bloqué.
* **Scénario :** Envoi d'une requête `POST /api/cvs/upload` sans en-tête `Authorization`.
* **Assertions :**
  * Statut HTTP `401 Unauthorized`.

---

### 2. Consultation de la Liste des CVs (`GET /api/cvs`)

#### 📄 `testListCvsSuccess()`
* **Objectif :** Valider la récupération de la liste des CVs associés à l'utilisateur authentifié.
* **Préconditions :** 
  * Création d'un utilisateur de test (`list_owner@epitech.eu`).
  * Insertion en base d'un enregistrement `Cv` rattaché à cet utilisateur.
* **Scénario :** Envoi d'une requête `GET /api/cvs` avec l'en-tête `Authorization: Bearer <TOKEN>`.
* **Assertions :**
  * Statut HTTP `200 OK`.
  * La réponse est un tableau JSON contenant exactement 1 élément.
  * Validation des champs `originalName`, `filePath` (formaté sous `/uploads/cvs/...`) et présence de la clé `uploadedAt`.

---

### 3. Téléversement de CV (`POST /api/cvs/upload`)

#### 📤 `testUploadCvSuccess()`
* **Objectif :** S'assurer qu'un utilisateur authentifié peut téléverser un fichier valide avec succès.
* **Scénario :**
  1. Authentification d'un utilisateur `uploader@epitech.eu`.
  2. Simulation de l'envoi d'un fichier PDF valide (`mon_cv_test.pdf`) via la clé multipart `file`.
* **Assertions :**
  * Statut HTTP `201 Created`.
  * Message de confirmation : `"CV envoyé avec succès !"`.
  * Le nom du fichier enregistré utilise le slugger Symfony (transformation des tirets du bas `_` en tirets `-` : `mon-cv-test-...`).

#### ⚠️ `testUploadCvNoFile()`
* **Objectif :** Vérifier la gestion d'erreur lorsqu'aucun fichier n'est joint à la requête.
* **Scénario :** Envoi d'une requête `POST /api/cvs/upload` avec des données de fichiers vides.
* **Assertions :**
  * Statut HTTP `400 Bad Request`.
  * Message d'erreur JSON : `"Aucun fichier fourni"`.

#### ❌ `testUploadCvInvalidExtension()`
* **Objectif :** Valider le rejet des fichiers ayant un format non autorisé.
* **Scénario :** Tentative de téléversement d'un fichier exécutable (`script.exe`).
* **Assertions :**
  * Statut HTTP `400 Bad Request`.
  * Message d'erreur JSON : `"Format non autorisé (PDF, DOC, DOCX uniquement)"`.

---

## ⚙️ Exécution des Tests

Pour exécuter uniquement cette suite de tests localement :

```bash
php vendor/bin/phpunit tests/Controller/CvControllerTest.php
```

---

# Documentation de : `OffersControllerTest.php`

Cette partie détaille les cas de tests fonctionnels et d'intégration implémentés dans la classe `OffersControllerTest`.

---

## 📌 Vue d'ensemble

* **Classe de test :** `App\Tests\Controller\OffersControllerTest`
* **Type :** Test d'intégration web (`WebTestCase`)
* **Objectif :** Valider l'intégralité du cycle de vie des offres d'emploi (`Offers`) : recherche/filtrage, création d'offre avec associations complexes (Entreprises, Sources, Catégories), consultation détaillée et suppression.

---

## 📌 Endpoints Couverts

| Endpoint | Méthode | Authentification | Description |
| :--- | :--- | :--- | :--- |
| `/api/offers` | `GET` | **Requis (JWT)** | Liste les offres d'emploi (supporte le filtrage par mots-clés, ville, etc.) |
| `/api/offers` | `POST` | **Requis (JWT)** | Crée une nouvelle offre d'emploi avec ses dépendances rattachées |
| `/api/offers/{id}` | `GET` | **Requis (JWT)** | Récupère les détails d'une offre spécifique par son identifiant |
| `/api/offers/{id}` | `DELETE` | **Requis (JWT)** | Supprime définitivement une offre d'emploi de la base de données |

---

## 📌 Méthodes d'Aide & Configuration (`setUp`)

1. **`setUp()`**
   * Génère dynamiquement un utilisateur de test unique (`ROLE_USER`) et l'enregistre en BDD.
   * Génère un jeton JWT valide et configure automatiquement l'en-tête global `Authorization: Bearer <TOKEN>` pour toutes les requêtes du client HTTP HTTPMock.
2. **`createDependencies()`**
   * **Rôle :** Instancie et persiste les entités dépendantes indispensables à la création d'une offre :
     * `Companies` (Nom unique)
     * `Sources` (Nom, URL de base et code unique)
     * `Categories` (Nom de catégorie unique)
   * **Retour :** Un tuple d'entités `[$company, $source, $category]`.

---

## 📌 Détails des Cas de Tests

### 1. Recherche & Liste des Offres (`GET /api/offers`)

#### 🔍 `testGetOffersEmptyOrList()`
* **Objectif :** Vérifier que la récupération de la liste des offres répond correctement au format JSON.
* **Scénario :** Envoi d'une requête `GET /api/offers`.
* **Assertions :**
  * Statut HTTP `200 OK`.
  * En-tête `Content-Type` égal à `application/json`.

#### 🔎 `testGetOffersWithFilters()`
* **Objectif :** S'assurer que les filtres de recherche (query params) sont acceptés sans erreur système.
* **Scénario :** Envoi d'une requête `GET /api/offers?q=Developer&city=Paris`.
* **Assertions :**
  * Statut HTTP `200 OK`.

---

### 2. Création d'une Offre (`POST /api/offers`)

#### ➕ `testPostOfferSuccess()`
* **Objectif :** Valider la création d'une offre d'emploi complète avec toutes ses métadonnées (mots-clés, salaires, géolocalisation, etc.).
* **Scénario :**
  1. Génération des dépendances via `createDependencies()`.
  2. Envoi d'un payload JSON complet comprenant `company_id`, `source_id`, `category_id`, compétences transmises sous `extractedSkills`, etc.
* **Assertions :**
  * Statut HTTP `201 Created`.
  * Le titre renvoyé dans la réponse correspond bien à `"Développeur PHP / Symfony"`.

#### ⚠️ `testPostOfferCompanyNotFound()`
* **Objectif :** Vérifier le rejet de la création d'une offre si l'entreprise spécifiée n'existe pas en BDD.
* **Scénario :** Envoi d'un payload avec un ID d'entreprise inexistant (`company_id: 999999`).
* **Assertions :**
  * Statut HTTP `404 Not Found`.

---

### 3. Consultation Détail (`GET /api/offers/{id}`)

#### ❌ `testGetOfferByIdNotFound()`
* **Objectif :** Vérifier le traitement d'une demande pour une offre inexistante.
* **Scénario :** Envoi d'une requête `GET /api/offers/999999`.
* **Assertions :**
  * Statut HTTP `404 Not Found`.
  * Message d'erreur JSON : `"Aucune offre trouvee"`.

#### 📖 `testGetOfferByIdSuccess()`
* **Objectif :** Récupérer les informations détaillées d'une offre existante en base de données.
* **Préconditions :** Création manuelle et persistence d'une entité `Offers` avec ses dépendances.
* **Scénario :** Envoi d'une requête `GET /api/offers/{id}`.
* **Assertions :**
  * Statut HTTP `200 OK`.
  * Le titre correspond au titre persisté (`"Offre de test ID"`).

---

### 4. Suppression (`DELETE /api/offers/{id}`)

#### ❌ `testDeleteOfferNotFound()`
* **Objectif :** S'assurer qu'une tentative de suppression sur un ID inexistant renvoie une erreur appropriée.
* **Scénario :** Envoi d'une requête `DELETE /api/offers/999999`.
* **Assertions :**
  * Statut HTTP `404 Not Found`.
  * Message d'erreur JSON : `"Aucune offre trouvee"`.

#### 🗑️ `testDeleteOfferSuccess()`
* **Objectif :** Valider la suppression effective d'une offre d'emploi.
* **Scénario :**
  1. Instanciation et sauvegarde d'une offre d'emploi de test.
  2. Envoi d'une requête `DELETE /api/offers/{id}`.
  3. Envoi consécutif d'une requête `GET /api/offers/{id}` sur le même ID pour confirmer la suppression.
* **Assertions :**
  * Statut de la suppression : `204 No Content`.
  * Statut de la vérification suivante : `404 Not Found`.

---

## ⚙️ Exécution des Tests

Pour exécuter uniquement cette suite de tests localement :

```bash
php vendor/bin/phpunit tests/Controller/OffersControllerTest.php
```

---

# Documentation de : `UserFavoriteControllerTest.php`

Ce document détaille les cas de tests fonctionnels et d'intégration implémentés dans la classe `UserFavoriteControllerTest`.

---

## 📌 Vue d'ensemble

* **Classe de test :** `App\Tests\Controller\UserFavoriteControllerTest`
* **Type :** Test d'intégration web (`WebTestCase`)
* **Objectif :** Valider les fonctionnalités de gestion des offres d'emploi favorites pour un utilisateur (ajout aux favoris, consultation de la liste, détection des doublons et suppression).

---

## 📌 Endpoints Couverts

| Endpoint | Méthode | Authentification | Description |
| :--- | :--- | :--- | :--- |
| `/api/userfav` | `GET` | **Requis (JWT)** | Récupère la liste des offres d'emploi mises en favoris par l'utilisateur connecté |
| `/api/userfav` | `POST` | **Requis (JWT)** | Ajoute une offre d'emploi aux favoris de l'utilisateur connecté |
| `/api/userfav/{id}` | `DELETE` | **Requis (JWT)** | Retire un favori spécifique par son identifiant unique |

---

## 📌 Méthodes d'Aide & Configuration (`setUp`)

1. **`setUp()`**
   * Réinitialise l'environnement de test à chaque exécution.
   * Effectue un **nettoyage complet de la base de données** (suppression de toutes les entrées dans `UserFavorites`, `Offers`, `Sources`, `Companies` et `User`) pour éviter les conflits d'isolation.
2. **`createTestUser(string $email)`**
   * Crée, hache le mot de passe et persiste un utilisateur de test (`ROLE_USER`).
3. **`createTestCompany()` / `createTestSource()` / `createTestOffer()`**
   * Génèrent et enregistrent les entités dépendantes nécessaires (`Companies`, `Sources`, `Offers`) avec la gestion de la compatibilité selon la signature des setters (`setExtractedSkills` / `setExtracted_skills`).
4. **`generateAuthHeader(User $user)`**
   * Génère un jeton JWT d'authentification valide pour l'utilisateur passé en paramètre et retourne les en-têtes HTTP de requêtes (`HTTP_AUTHORIZATION` et `CONTENT_TYPE: application/json`).

---

## 📌 Détails des Cas de Tests

### 1. Consultation des Favoris (`GET /api/userfav`)

#### 📋 `testGetUserFavoritesList()`
* **Objectif :** Vérifier qu'un utilisateur authentifié peut récupérer sa liste d'offres favorites.
* **Préconditions :** 
  * Création d'un utilisateur, d'une offre de test et insertion préalable d'une entrée dans `UserFavorites`.
* **Scénario :** Envoi d'une requête `GET /api/userfav` avec le jeton JWT.
* **Assertions :**
  * Statut HTTP `200 OK`.
  * En-tête `Content-Type` égal à `application/json`.
  * La réponse JSON renvoie un tableau non vide.

---

### 2. Ajout d'un Favori (`POST /api/userfav`)

#### ➕ `testPostUserFavoriteSuccess()`
* **Objectif :** Valider qu'un utilisateur peut ajouter une offre valide à ses favoris.
* **Scénario :**
  1. Instanciation d'un utilisateur et d'une offre d'emploi.
  2. Envoi d'une requête `POST /api/userfav` contenant le payload `{"offer_id": <OFFER_ID>}`.
* **Assertions :**
  * Statut HTTP `201 Created`.

#### ⚠️ `testPostUserFavoriteAlreadyExists()`
* **Objectif :** Vérifier que l'API empêche le ciblage multiple d'une même offre en favori (gestion du doublon).
* **Préconditions :** L'offre est déjà associée à l'utilisateur dans `UserFavorites`.
* **Scénario :** Tentative de ré-envoi d'une requête `POST /api/userfav` sur la même offre (`offer_id`).
* **Assertions :**
  * Statut HTTP `409 Conflict`.

---

### 3. Suppression d'un Favori (`DELETE /api/userfav/{id}`)

#### 🗑️ `testDeleteUserFavoriteSuccess()`
* **Objectif :** Valider le retrait effectif d'un favori existant.
* **Préconditions :** L'entrée `UserFavorites` est préalablement créée et enregistrée en base de données.
* **Scénario :** Envoi d'une requête `DELETE /api/userfav/{favorite_id}`.
* **Assertions :**
  * Statut HTTP `204 No Content`.

---

## ⚙️ Exécution des Tests

Pour exécuter uniquement cette suite de tests localement :

```bash
php vendor/bin/phpunit tests/Controller/UserFavoriteControllerTest.php
```

---

# Documentation de : `UserSkillControllerTest.php`

Ce document détaille les cas de tests fonctionnels et d'intégration implémentés dans la classe `UserSkillControllerTest`.

---

## 📌 Vue d'ensemble

* **Classe de test :** `App\Tests\Controller\UserSkillControllerTest`
* **Type :** Test d'intégration web (`WebTestCase`)
* **Objectif :** Valider les fonctionnalités de gestion des compétences utilisateur (`Skill`) : consultation de ses compétences, ajout d'une compétence (avec création ou réutilisation d'une entité existante), validation des champs requis et suppression du profil.

---

## 📌 Endpoints Couverts

| Endpoint | Méthode | Authentification | Description |
| :--- | :--- | :--- | :--- |
| `/api/user/skills` | `GET` | **Requis (JWT)** | Récupère la liste des compétences associées à l'utilisateur connecté |
| `/api/user/skills` | `POST` | **Requis (JWT)** | Ajoute une compétence au profil utilisateur (crée l'entité ou réutilise une entité `Skill` existante) |
| `/api/user/skills/{id}` | `DELETE` | **Requis (JWT)** | Dissocie/Supprime une compétence du profil de l'utilisateur connecté |

---

## 📌 Configuration Initiale (`setUp`)

* **Génération de l'Utilisateur :** Crée dynamiquement un utilisateur unique (`ROLE_USER`) et le persiste en base de données.
* **Authentification JWT :** Génère un jeton JWT valide et configure automatiquement l'en-tête global `Authorization: Bearer <TOKEN>` ainsi que la session du client HTTP (`loginUser`).

---

## 📌 Détails des Cas de Tests

### 1. Consultation des Compétences (`GET /api/user/skills`)

#### 📋 `testListSkills()`
* **Objectif :** Vérifier que l'utilisateur authentifié peut consulter la liste de ses compétences au format JSON.
* **Scénario :** Envoi d'une requête `GET /api/user/skills`.
* **Assertions :**
  * Statut HTTP `200 OK`.
  * En-tête `Content-Type` égal à `application/json`.
  * La réponse JSON est bien un tableau (qui peut être vide si aucune compétence n'a encore été rattachée).

---

### 2. Ajout de Compétences (`POST /api/user/skills`)

#### ➕ `testAddSkillSuccess()`
* **Objectif :** Valider l'ajout d'une nouvelle compétence unique au profil de l'utilisateur.
* **Scénario :** Envoi d'un payload JSON contenant le nom d'une nouvelle compétence (`{"name": "Symfony 7 - <UNIQ>"}`).
* **Assertions :**
  * Statut HTTP `201 Created`.
  * Message de confirmation : `"Compétence ajoutée avec succès"`.
  * La clé `skill` retournée contient le nom transmis.

#### ⚠️ `testAddSkillEmptyNameValidation()`
* **Objectif :** S'assurer qu'un nom de compétence vide ou composé uniquement d'espaces est rejeté par la validation.
* **Scénario :** Envoi d'un payload JSON avec un nom invalide (`{"name": "   "}`).
* **Assertions :**
  * Statut HTTP `400 Bad Request`.
  * Message d'erreur JSON : `"Le nom de la compétence est requis."`.

#### 🔄 `testAddExistingSkillReusesEntity()`
* **Objectif :** Vérifier le mécanisme d'optimisation / dédoublonnage : si une compétence existe déjà globalement en BDD, le système doit réutiliser l'entité `Skill` existante plutôt que d'en créer un doublon.
* **Préconditions :** Création et enregistrement préalable d'une entité `Skill` en base de données.
* **Scénario :** Envoi d'une requête `POST /api/user/skills` en ciblant le même nom de compétence.
* **Assertions :**
  * Statut HTTP `201 Created`.
  * L'identifiant `id` de la compétence retournée dans la réponse est strictement identique à l'ID de la compétence déjà existante.

---

### 3. Suppression de Compétences (`DELETE /api/user/skills/{id}`)

#### 🗑️ `testRemoveSkillSuccess()`
* **Objectif :** Valider la dissociation/suppression d'une compétence associée à l'utilisateur.
* **Préconditions :** Création d'une compétence et rattachement à l'utilisateur de test via `$user->addSkill($skill)`.
* **Scénario :** Envoi d'une requête `DELETE /api/user/skills/{skill_id}`.
* **Assertions :**
  * Statut HTTP `200 OK`.
  * Message de confirmation : `"Compétence supprimée avec succès"`.

#### ❌ `testRemoveSkillNotFound()`
* **Objectif :** Vérifier la gestion d'erreur en cas de tentative de suppression d'une compétence inexistante.
* **Scénario :** Envoi d'une requête `DELETE /api/user/skills/999999`.
* **Assertions :**
  * Statut HTTP `404 Not Found`.

---

## ⚙️ Exécution des Tests

Pour exécuter uniquement cette suite de tests localement :

```bash
php vendor/bin/phpunit tests/Controller/UserSkillControllerTest.php
```

---