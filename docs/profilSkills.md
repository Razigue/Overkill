# Choix produit : Gestion des compétences (Skills)

## Contexte

Dans la section "Mon profil", l'utilisateur peut renseigner ses compétences (skills) pour compléter son profil de candidat, en complément du/des CV.

## Why

- Problème utilisateur adressé : permettre à l'utilisateur de mettre en avant ses compétences sans être limité par un référentiel figé qui ne couvrirait pas forcément son domaine ou ses technologies spécifiques.
- Une saisie libre (texte libre) plutôt qu'un référentiel fermé maximise la flexibilité pour l'utilisateur et réduit le travail de maintenance d'une liste de compétences prédéfinie côté équipe.
- Cette fonctionnalité contribue à l'exigence de tableau de bord affichant des données réellement utilisées par l'utilisateur.

## How

- Implémentation backend et frontend dédiée (PR #38) permettant à l'utilisateur d'ajouter/gérer librement ses compétences depuis son profil.
- Les compétences sont stockées en base, associées à l'entité `User`.
- Saisie libre : l'utilisateur peut écrire ce qu'il souhaite (pas de sélection contrainte dans un référentiel fixe).

## Trade-off

- **Alternative rejetée : référentiel de compétences fixe avec autocomplétion.** Aurait permis une meilleure structuration des données (utile pour un matching ou un scoring automatisé plus fin avec les offres), mais aurait nécessité de construire et maintenir une taxonomie de compétences, ce qui dépassait le temps disponible pour cette fonctionnalité.
- **Coût du choix "texte libre"** : les données sont moins exploitables telles quelles pour des fonctionnalités data/IA avancées (ex. matching précis offre/candidat, déduplication de compétences similaires comme "JS" vs "JavaScript") sans un traitement de normalisation supplémentaire en aval.

## Preuves

- PR #38 `feat(skills): implement user skills feature (backend and frontend)`