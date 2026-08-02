# Choix data & architecture : Panel admin et déclenchement du workflow n8n

## Contexte

Le sujet exige une interface d'administration permettant les actions de modération/gestion, ainsi qu'un système de collecte de données offrant un déclenchement manuel à la demande. Sur ce projet, la collecte/normalisation des offres WeLoveDevs est déléguée à un workflow n8n externe ; la responsabilité de cette fonctionnalité côté backend/frontend a été de rendre ce workflow déclenchable depuis le panel admin.

## Why

- Le sujet exige explicitement une interface d'administration pour les actions de gestion, et un déclenchement manuel de la collecte de données — le panel admin est le point d'entrée naturel pour cette action côté produit.
- Le traitement du scraping/normalisation des offres WeLoveDevs est effectué par un workflow n8n dédié (hors périmètre de cette tâche). Exposer ce déclenchement via un **webhook** permet de découpler complètement le backend Symfony de la logique d'ingestion : le backend n'a pas besoin de connaître les détails du scraping, il se contente d'appeler une URL.
- Ce découplage limite la responsabilité du contrôleur admin à : vérifier les droits (`ROLE_ADMIN`), déclencher l'appel webhook, retourner un statut à l'interface.

## How

- Le panel admin (frontend) affiche un bouton de déclenchement du workflow, visible uniquement pour les utilisateurs `ROLE_ADMIN` (contrôle d'accès appliqué côté serveur sur la route backend correspondante, pas seulement masqué côté UI).
- Côté backend Symfony, une route admin protégée appelle le webhook n8n exposé, qui déclenche le workflow de scraping des offres WeLoveDevs et leur traitement/normalisation.
- Le workflow n8n lui-même (scraping, extraction des champs pertinents de chaque offre) n'a pas été développé dans le cadre de cette tâche ; seule l'intégration du webhook (création + appel depuis le panel admin) relève de ce périmètre.
- Un profil admin dédié a été mis en place en complément (gestion du profil admin depuis le panel).

## Trade-off

- **Alternative rejetée : logique de scraping intégrée directement au backend Symfony (job/command interne).** Aurait évité une dépendance externe (n8n) et un appel réseau supplémentaire, mais aurait complexifié le backend avec une logique d'ingestion et de scheduling qui n'est pas son rôle principal, et aurait été plus long à développer avec les délais du projet.
- **Coût du webhook** : introduit une dépendance à la disponibilité du service n8n (point de défaillance externe) ; en cas d'indisponibilité de n8n, le déclenchement échoue côté admin sans qu'il soit possible de relancer la collecte autrement — un point à surveiller/gérer avec un feedback d'erreur clair côté panel admin.
- **Sécurité** : le webhook doit être appelé uniquement depuis une route backend authentifiée `ROLE_ADMIN` (jamais exposé directement au frontend en clair) pour éviter qu'un utilisateur non autorisé ne déclenche la collecte à volonté.

## Preuves

- PR #59 `feat(admin): integrate admin panel, trigger n8n and admin profil`
- PR #62 `Feature/admin panel`