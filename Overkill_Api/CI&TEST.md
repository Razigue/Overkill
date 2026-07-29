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