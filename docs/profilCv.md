# Choix produit & data : Gestion des CV (profil utilisateur)

## Contexte

Dans la section "Mon profil", l'utilisateur doit pouvoir gérer ses CV. Cette fonctionnalité fait partie du tableau de bord utilisateur exigé par le sujet.

## Why

- Problème utilisateur adressé : un candidat sur une plateforme de recherche d'emploi doit pouvoir retrouver et gérer son ou ses CV à tout moment, sans dépendre d'un service de stockage externe séparé.
- Stocker le CV en base de données garantit que le fichier est toujours disponible en même temps que le compte utilisateur (pas de lien cassé vers un stockage externe, pas de synchronisation à gérer entre deux systèmes).
- Restreindre les formats acceptés (`.pdf`, `.doc`, `.docx`) limite la surface d'attaque (upload de fichiers exécutables ou de scripts) et correspond aux formats standards attendus par les recruteurs.

## How

- Upload du CV depuis la section "Mes CV" du profil utilisateur.
- Attribut `accept=".pdf,.doc,.docx"` côté frontend pour filtrer les types de fichiers proposés à l'utilisateur avant l'envoi.
- Stockage du fichier en base de données PostgreSQL, associé à l'entité `User`, garantissant que l'accès au CV est systématiquement lié à l'authentification de l'utilisateur.

## Trade-off

- **Alternative rejetée : stockage sur système de fichiers ou service cloud (S3, etc.).** Écarté par manque de temps / simplicité de mise en œuvre dans le cadre du projet ; le stockage en base évite d'avoir à gérer un service de stockage tiers, un bucket, et les permissions associées.
- **Limite assumée** : le stockage en base de fichiers binaires n'est pas la pratique la plus scalable en production (alourdit la base, complique les sauvegardes) — un choix qu'il faudrait revoir si le nombre d'utilisateurs/CV augmentait significativement.
- **Sécurité** : la restriction `accept` côté frontend n'est qu'un filtre UX ; une validation du type MIME réel du fichier côté serveur reste nécessaire pour éviter l'upload de fichiers malveillants déguisés (point à vérifier/renforcer si non déjà fait).

## Preuves

- PR #36 `feat(profile): add CV management, JWT authentication with lexik bundl...`