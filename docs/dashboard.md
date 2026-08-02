# Documentation – Tableau de bord administrateur

## 1. État réel du tableau de bord

Le tableau de bord disponible à la route frontend `/admin` est un panneau d'action destiné à l'ingestion WeLoveDevs. Dans sa version actuelle, il ne contient ni indicateur chiffré, ni graphique, ni historique d'exécution.

Cette distinction est importante : la vue permet à l'administrateur de lancer une collecte et de connaître le résultat immédiat de la requête, mais elle ne permet pas encore de piloter la qualité ou la fraîcheur du catalogue à partir de métriques.

---

## 2. Utilisateur et besoin couverts

La vue s'adresse à un compte possédant `ROLE_ADMIN`. Son besoin opérationnel couvert est de déclencher manuellement la récupération des dernières offres WeLoveDevs sans appeler le webhook n8n directement.

Le besoin produit plus large décrit dans `docs/ETUDE_DE_MARCHE.md` — contrôler la qualité, modérer les offres ou suivre des métriques — n'est pas implémenté dans ce panneau à ce jour.

---

## 3. Accès au panneau

Le parcours visible est le suivant :

1. Le profil déduit la présence de `ROLE_ADMIN` à partir du profil local ou du JWT.
2. Il affiche le lien « Ouvrir le Panneau Admin » vers `/admin`.
3. La page `/admin` vérifie seulement qu'un objet `user` existe dans `localStorage`; cette vérification client facilite la navigation mais ne constitue pas une autorisation.
4. Lors de l'action sensible, Symfony vérifie le JWT et impose `ROLE_ADMIN` sur `AdminController`.

La décision de sécurité finale est donc prise par le backend.

---

## 4. Fonctionnalités et décisions soutenues

| Élément de la vue | Pourquoi il existe | Information fournie | Décision ou action soutenue |
| --- | --- | --- | --- |
| Titre et sous-titre | Identifier le périmètre « automatisations, webhooks et collecte » | L'administrateur sait qu'il agit sur l'ingestion, pas sur les comptes ou les candidatures | Se rendre sur cette vue uniquement pour lancer la collecte |
| Carte « Scraping WeLoveDevs » | Rassembler le seul workflow administrable actuellement | Source ciblée et effet attendu : récupérer puis insérer les dernières opportunités | Choisir de déclencher l'ingestion WeLoveDevs |
| Point vert animé | Donner un repère visuel à la carte d'automatisation | Il s'agit d'un élément visuel statique ; aucun endpoint de santé n'est interrogé | Aucune décision fiable sur la disponibilité de n8n ne doit être prise à partir de ce point |
| Bouton « Lancer le Scraping » | Déclencher `POST /api/admin/trigger-scraping` sans exposer le secret du webhook au navigateur | L'action est disponible et son chargement est en cours après le clic | Lancer une nouvelle collecte |
| État « Lancement... » et bouton désactivé | Éviter plusieurs clics pendant la requête en cours | Une requête a déjà été initiée par cette page | Attendre sa réponse avant de relancer depuis la même vue |
| Notification de succès | Restituer le message renvoyé par Symfony | L'appel API n'a pas remonté d'erreur au panneau | Quitter la vue ou attendre le traitement externe ; ce message ne prouve pas que les offres ont été insérées |
| Notification d'erreur | Montrer le message de l'API ou une erreur de connexion | Le déclenchement n'a pas pu être confirmé | Vérifier la configuration ou réessayer, sans supposer que l'ingestion est terminée |
| Déconnexion dans l'en-tête | Effacer le profil et le JWT conservés côté navigateur | La session locale prend fin | Quitter le contexte administrateur |

---

## 5. Fonctionnement technique

```text
Administrateur
   |
   | clic
   v
AdminPanel.jsx
   |
   | POST /api/admin/trigger-scraping
   | Authorization: Bearer <JWT>
   v
AdminController.php
   |
   | contrôle ROLE_ADMIN
   | POST N8N_WEBHOOK_URL
   | X-Webhook-Secret: N8N_WEBHOOK_SECRET
   | timeout: 5 secondes
   v
Webhook n8n
```

Le composant React conserve trois états utiles :

* `loading`, pour désactiver le bouton et afficher l'attente ;
* `status.type`, pour distinguer succès et erreur ;
* `status.message`, pour restituer le message à l'administrateur.

Le secret n8n reste côté Symfony et n'est jamais envoyé au frontend. Les variables attendues par le contrôleur sont documentées dans `Overkill_Api/.env.example`.

---

## 6. Interprétation correcte du résultat

Le contrôleur renvoie « Workflow de scraping déclenché avec succès ! » après avoir créé la requête HTTP vers n8n. Le dépôt ne contient toutefois :

* aucun identifiant d'exécution n8n retourné au client ;
* aucun contrôle périodique de statut ;
* aucun compteur d'offres reçues, rejetées, créées ou mises à jour ;
* aucun horodatage de dernière exécution ;
* aucun journal d'erreur affiché dans le panneau.

La notification doit donc être comprise comme un accusé de déclenchement, et non comme une preuve de réussite complète du workflow.

---

## 7. Widgets non implémentés

Les éléments suivants ne doivent pas être présentés comme existants :

* nombre total ou évolution des offres ;
* fraîcheur des données ;
* répartition par source, contrat, ville ou technologie ;
* taux de doublons ou d'offres rejetées ;
* état de santé temps réel de n8n ;
* historique et durée des ingestions ;
* validation, modération ou suppression en lot ;
* gestion des utilisateurs depuis le panneau.

Le backend expose bien des opérations unitaires sur les offres, mais `AdminPanel.jsx` ne fournit aucune interface de modération.

---

## 8. Limites constatées

* L'URL de l'API est codée en dur à `http://localhost:8000` dans le composant.
* La route React `/admin` n'est pas protégée par un garde de rôle côté client ; seul l'appel backend sensible est réellement protégé par `ROLE_ADMIN`.
* Le point vert animé peut être interprété comme un statut « en ligne », alors qu'il n'est connecté à aucun contrôle de santé.
* La réponse HTTP réelle du webhook n'est pas exploitée pour afficher un statut métier ou un identifiant d'exécution.
* Aucun mécanisme n'empêche deux administrateurs ou deux onglets de lancer le workflow simultanément.

---

## 9. Fichiers de référence

* `Overkill_Client/src/pages/AdminPanel.jsx`
* `Overkill_Client/src/pages/Profil.jsx`
* `Overkill_Client/src/components/Header.jsx`
* `Overkill_Api/src/Controller/AdminController.php`
* `Overkill_Api/config/packages/security.yaml`
* `Overkill_Api/.env.example`
* `docs/data.md`
* `docs/ETUDE_DE_MARCHE.md`
