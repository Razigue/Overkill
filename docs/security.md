# Documentation – Sécurité

## 1. Périmètre

Cette documentation recense uniquement les menaces et contrôles observables dans le dépôt. Elle ne prétend pas constituer un audit d'infrastructure de production : aucun reverse proxy, certificat TLS, pare-feu, hébergement n8n ou configuration PostgreSQL distante n'est versionné ici.

---

## 2. Modèle de confiance

```text
Zone non fiable                         Zone serveur

Navigateur / saisies / fichiers
              |
              | HTTP + JSON, multipart ou JWT Bearer
              v
        API Symfony
          |       |
          |       +--> n8n avec un secret de webhook
          |
          +--> PostgreSQL via Doctrine
```

Le navigateur n'est pas considéré comme une frontière de sécurité : l'affichage conditionnel des boutons et la lecture des rôles dans le JWT servent à l'interface. Les autorisations sensibles sont appliquées par Symfony.

---

## 3. Menaces considérées et contrôles implémentés

| Menace | Contrôle réellement implémenté | Fichiers principaux |
| --- | --- | --- |
| Usurpation d'identité | Connexion JSON par e-mail et mot de passe, puis JWT signé avec une clé privée et vérifié avec une clé publique | `security.yaml`, `lexik_jwt_authentication.yaml` |
| Vol de mot de passe en base | Hachage par le `UserPasswordHasherInterface`; l'algorithme est sélectionné par la valeur Symfony `auto` | `SecurityController.php`, `security.yaml` |
| Création de doublons de compte | Recherche préalable de l'e-mail et contrainte d'unicité en base | `SecurityController.php`, `User.php` |
| Accès anonyme aux données privées | Firewall JWT stateless sur `/api`; seules les routes explicitement publiques échappent à l'authentification | `security.yaml` |
| Élévation vers les actions d'administration | `#[IsGranted('ROLE_ADMIN')]` sur l'ensemble de `AdminController`, doublé par la règle d'accès `/api/admin` | `AdminController.php`, `security.yaml` |
| Accès aux ressources d'un autre utilisateur | Les CV, compétences et listes de favoris partent de l'utilisateur fourni par le JWT; la suppression d'un favori compare explicitement son propriétaire | `CvController.php`, `UserSkillController.php`, `UserFavoriteController.php` |
| Injection SQL dans la recherche | Construction des requêtes avec Doctrine QueryBuilder et paramètres liés, sans concaténation directe des saisies dans le SQL | `OffersRepository.php` |
| Données invalides ou excessivement longues | DTO Symfony pour l'inscription et la création d'offres; contraintes explicites pour le formulaire de contact | `RegistrationInput.php`, `OfferInput.php`, `ContactController.php` |
| Téléversement avec un nom dangereux | Liste d'extensions autorisées, slug du nom et ajout d'un identifiant unique avant stockage | `CvController.php` |
| Appel direct non autorisé du workflow d'ingestion | Route réservée aux administrateurs et secret `X-Webhook-Secret` ajouté côté serveur | `AdminController.php` |
| Appel cross-origin non souhaité en développement | CORS limité par expression régulière aux origines localhost pour `/api` | `nelmio_cors.yaml` |
| Secret commité par erreur | Fichiers `.env` locaux et clés JWT privées ignorés par Git; job Gitleaks présent dans la CI | `.gitignore`, `Overkill_Api/.gitignore`, `.github/workflows/ci.yml` |
| Régression des contrôles d'accès | Tests fonctionnels sur connexion, profil protégé, CV non authentifiés, favoris et compétences | `Overkill_Api/tests/Controller/` |

---

## 4. Authentification et autorisations

### Authentification JWT

`POST /api/login` est traité par un firewall `json_login`. En cas de succès, LexikJWTAuthenticationBundle émet un token. Toutes les autres routes `/api` passent ensuite par un firewall JWT sans état serveur.

Les appels protégés envoient :

```http
Authorization: Bearer <token>
```

Les routes publiques configurées sont :

* `POST /api/login` ;
* `POST /api/register` ;
* `POST /api/contact` ;
* `GET /api/offers` ;
* `GET /api/offers/{id}`.

Toutes les autres routes `/api` exigent `IS_AUTHENTICATED_FULLY`, avec des rôles plus précis lorsque les contrôleurs les déclarent.

### Rôles

L'inscription attribue `ROLE_USER` côté serveur. L'entité `User` garantit également que `getRoles()` renvoie au moins ce rôle. Le rôle administrateur n'est pas attribuable depuis le formulaire public.

Le client décode le JWT pour adapter l'affichage. Cette donnée ne suffit pas à autoriser une action : même si un utilisateur modifie son `localStorage`, il ne peut pas produire un JWT administrateur signé. `AdminController` refusera donc l'appel.

### Propriété des données

Les listes de CV et de compétences sont construites depuis l'utilisateur authentifié, sans identifiant utilisateur fourni par le navigateur. Les favoris suivent le même principe. Lors de la suppression d'un favori par identifiant, le contrôleur refuse l'opération si le favori appartient à un autre utilisateur.

---

## 5. Mots de passe et données d'inscription

Le serveur valide :

* la présence et le format de l'e-mail ;
* une longueur minimale de huit caractères pour le mot de passe ;
* la présence des prénom et nom, limités à 80 caractères.

Le mot de passe est transmis au `UserPasswordHasherInterface` avant persistance. La configuration utilise `auto`; le dépôt ne garantit donc pas explicitement Argon2id ou BCrypt et la documentation ne doit pas annoncer un algorithme fixe.

L'unicité de l'e-mail est contrôlée à deux niveaux : réponse `409 Conflict` dans le contrôleur et contrainte unique Doctrine sur la table `users`.

---

## 6. Validation des entrées

### API JSON

`MapRequestPayload` associe les données d'inscription et de création d'offre à des DTO validés par Symfony. Le formulaire de contact reconstruit uniquement les quatre champs attendus, supprime les espaces périphériques et limite les longueurs avant de créer un e-mail en texte brut.

La recherche d'offres utilise des paramètres Doctrine pour les textes saisis et convertit la pagination en entier avec l'API Symfony.

### Téléversement de CV dans le profil

La route `/api/cvs/upload` exige un JWT. Elle accepte les extensions `pdf`, `doc` et `docx`, transforme le nom avec le Slugger Symfony et ajoute `uniqid()` pour éviter l'écrasement direct d'un fichier existant.

Ces contrôles sont partiels : le code vérifie l'extension déclarée par le client, mais ne fixe ni taille maximale, ni liste de types MIME détectés. `guessExtension()` intervient pour le nom final, sans constituer à lui seul une validation complète du contenu.

### Analyse ATS publique

La page ATS accepte un PDF de 10 Mo maximum côté navigateur. Comme détaillé dans `docs/analyse-ats.md`, ces contrôles client peuvent être contournés. Le workflow n8n n'étant pas versionné, ses validations serveur ne peuvent pas être confirmées depuis ce dépôt.

---

## 7. CORS, CSRF et transport

NelmioCorsBundle autorise les origines correspondant à localhost et les méthodes nécessaires à l'API. Cette configuration correspond au développement local ; aucune liste d'origines de production n'est présente dans le fichier actif.

Une configuration CSRF Symfony existe pour les identifiants `submit`, `authenticate` et `logout`. L'API React est cependant stateless et transmet son JWT dans le header `Authorization`, pas dans un cookie d'authentification. Les contrôleurs JSON ne mettent pas en œuvre de jeton CSRF spécifique.

Le dépôt utilise des URL `http://localhost` en développement. Il ne contient pas la terminaison TLS de production. La confidentialité du mot de passe, du JWT et des CV en transit dépend donc d'un déploiement HTTPS externe au périmètre versionné.

---

## 8. Secrets et configuration

Les valeurs sensibles attendues sont injectées par variables d'environnement : `APP_SECRET`, URL PostgreSQL, clés et passphrase JWT, DSN du mailer, URL et secret du webhook n8n.

Les fichiers locaux `.env` et les clés `config/jwt/*.pem` sont ignorés par Git. Les fichiers `.env.example` contiennent des valeurs factices et documentent les variables à fournir.

La CI exécute Gitleaks avec l'option de masquage. Toutefois, la commande se termine par `|| true` : une détection est visible dans les logs mais ne bloque pas le pipeline. Il s'agit donc d'un contrôle d'alerte, pas d'une barrière obligatoire.

---

## 9. Vérifications automatisées existantes

La CI lance séparément les suites PHPUnit suivantes :

* `SecurityControllerTest` : connexion valide et invalide, inscription, doublon, `/api/me` authentifié ou non ;
* `CvControllerTest` : refus sans authentification, dépôt valide, absence de fichier et extension invalide ;
* `OffersControllerTest` : lecture, filtres, création, consultation et suppression ;
* `UserSkillControllerTest` : lecture, ajout, validation et retrait ;
* `UserFavoriteControllerTest` : lecture, ajout, doublon et suppression.

Ces tests prouvent l'existence de scénarios de vérification dans le dépôt. Ils ne couvrent pas notamment l'accès administrateur, le CORS, le secret n8n, la taille et le MIME des CV, ni le refus de suppression d'un favori appartenant à un autre compte.

---

## 10. Risques et limites constatés

Cette section sépare volontairement les protections présentes des protections absentes.

### Priorité élevée

* Le JWT et le profil sont stockés dans `localStorage`. Une faille XSS exécutée sur l'origine du frontend pourrait lire et exfiltrer le token.
* Les CV sont enregistrés sous `public/uploads/cvs` et retournés sous forme d'URL publique. Deux PDF réels sont en outre suivis par Git dans ce dossier. La possession ou la découverte d'une URL permet de télécharger le document sans contrôle d'autorisation Symfony.
* Le dépôt ne fixe aucune taille maximale et ne vérifie pas strictement le type MIME réel des CV déposés via le profil.
* `POST /api/offers` et `DELETE /api/offers/{id}` n'imposent pas `ROLE_ADMIN`. Ils tombent seulement sous la règle générale `IS_AUTHENTICATED_FULLY` : tout compte authentifié peut donc actuellement créer ou supprimer une offre par appel direct à l'API.

### Priorité moyenne

* Aucune limitation de débit n'est configurée sur la connexion, l'inscription, le contact ou le dépôt de fichiers, même si `symfony/rate-limiter` est installé.
* Le mot de passe exige seulement huit caractères ; aucune règle de complexité, vérification de mot de passe compromis ou second facteur n'est implémenté.
* La page `/admin` vérifie la présence d'un utilisateur local, pas son rôle. Le backend protège correctement l'action actuelle, mais la vue elle-même peut être ouverte par un utilisateur authentifié qui saisit directement l'URL.
* Le contrôleur administrateur renvoie le texte brut de certaines exceptions n8n dans la réponse, ce qui peut révéler des détails techniques à un administrateur connecté.
* `N8N_WEBHOOK_URL` est obligatoire dans le contrôleur, mais `N8N_WEBHOOK_SECRET` peut être absent et produire un header vide. Le dépôt Symfony ne peut donc pas garantir seul que le webhook refuse les appels sans secret valide.
* Le statut HTTP ou un identifiant d'exécution du webhook n8n n'est pas contrôlé ni conservé pour audit.
* `POST /api/check/database` est accessible à tout utilisateur authentifié et renvoie le message d'exception Doctrine en cas d'échec, ce qui peut exposer des détails de connexion ou d'infrastructure.

### Défense opérationnelle incomplète

* Gitleaks ne bloque pas la CI en cas de secret détecté.
* Aucun test automatisé spécifique à `AdminController` ou `ContactController` n'est présent.
* Aucun en-tête de sécurité HTTP, politique CSP ou configuration de reverse proxy n'est visible dans le dépôt.
* Aucun journal d'audit métier des connexions, changements d'administration ou lancements d'ingestion n'est implémenté.

---

## 11. Fichiers de référence

* `Overkill_Api/config/packages/security.yaml`
* `Overkill_Api/config/packages/lexik_jwt_authentication.yaml`
* `Overkill_Api/config/packages/nelmio_cors.yaml`
* `Overkill_Api/config/packages/csrf.yaml`
* `Overkill_Api/src/Controller/`
* `Overkill_Api/src/Dto/`
* `Overkill_Api/src/Entity/User.php`
* `Overkill_Api/src/Repository/OffersRepository.php`
* `Overkill_Api/tests/Controller/`
* `Overkill_Client/src/components/AuthOverlay.jsx`
* `Overkill_Client/src/pages/Profil.jsx`
* `.github/workflows/ci.yml`
* `.gitignore`
* `Overkill_Api/.gitignore`
