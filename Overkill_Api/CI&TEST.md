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