# Choix de sécurité : Authentification JWT (LexikJWTAuthenticationBundle)

## Contexte

Après l'inscription, l'utilisateur doit pouvoir se connecter et accéder aux routes protégées (profil, CV, skills) de façon sécurisée, sans état de session côté serveur, pour rester cohérent avec une API REST stateless consommée par un frontend React.

## Why

- Une API REST découplée d'un frontend SPA se prête naturellement à une authentification par token plutôt que par session PHP classique (cookie de session) : le token peut être stocké et envoyé par le client à chaque requête sans dépendance à un état serveur partagé.
- `LexikJWTAuthenticationBundle` a été choisi sur la base d'une expérience préalable positive : intégration simple avec le Security component de Symfony, génération/validation de token "out of the box", et bonne documentation.
- Cela répond directement aux exigences de sécurité du sujet : *"sécurité des routes/sessions/tokens"* et *"flux d'authentification sécurisé"*.

## How

- Génération d'une paire de clés (privée/publique) utilisée par Lexik pour signer et vérifier les tokens JWT.
- Au login, le backend Symfony vérifie les identifiants, puis retourne un token JWT signé au frontend.
- Le frontend React stocke le token et l'attache aux requêtes vers les routes protégées via le header `Authorization: Bearer <token>`.
- Les routes sensibles sont protégées par le firewall Symfony (`security.yaml`), qui délègue la vérification du token à Lexik avant d'autoriser l'accès au contrôleur.
- Connexion effective du formulaire de login React à l'API Symfony, avec gestion des boutons/états dynamiques associés (chargement, erreurs).

## Trade-off

- **Alternative rejetée : sessions PHP classiques (cookies de session serveur).** Écartées car elles introduisent un état serveur à synchroniser (moins adapté à une API consommée par un SPA découplé, et plus complexe à faire évoluer vers du scaling horizontal).
- **Alternative non retenue : implémentation JWT "maison" sans bundle.** Aurait donné plus de contrôle fin, mais présentait un risque de sécurité plus élevé (erreurs d'implémentation sur la signature/l'expiration) pour un gain limité, alors que Lexik est un standard éprouvé de l'écosystème Symfony.
- **Limite connue** : le stockage du token côté client (à préciser : localStorage vs cookie httpOnly) a un impact direct sur l'exposition au XSS ; ce point reste à documenter précisément selon l'implémentation retenue côté frontend.

## Preuves

- PR #23 `feat(auth): connect React login form to Symfony API and dynamic butt...`
- Configuration `security.yaml` et clés Lexik dans le dépôt backend (`Overkill_Api`)