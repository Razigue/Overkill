# Documentation : Inscription Utilisateur (`/api/register`)

Cette fonctionnalité permet à un nouvel utilisateur de créer un compte sur la plateforme depuis le Frontend React.

## Informations Générales

* **URL :** `/api/register`
* **Méthode HTTP :** `POST`
* **Headers requis :**
    * `Content-Type: application/json`
    * `Accept: application/json`

---

## Données Attendues (Request Body)

L'API attend un objet JSON contenant obligatoirement les 4 champs suivants. Les rôles (`ROLE_USER`) sont attribués automatiquement par le serveur.

```json
{
  "email": "prenom.nom@domain.com",
  "password": "Password123",
  "firstName": "Prenom",
  "lastName": "Nom"
}
```

## Contraintes de validation (gérées par le DTO Backend) :

* email : Obligatoire, doit être un format d'adresse email valide et unique en base de données.
* password : Obligatoire, doit contenir au moins 8 caractères.
* firstName : Obligatoire, max 80 caractères.
* lastName : Obligatoire, max 80 caractères.

## Réponses de l'API (Responses)
1. Succès : Compte Créé

* Code HTTP : 201 Created
* Description : L'utilisateur a été enregistré avec succès dans PostgreSQL, le mot de passe a été haché via Argon2id/BCrypt.
* Corps de la réponse :

```json
{
  "message": "Utilisateur inscrit avec succès !",
  "user": {
    "id": 1,
    "email": "prenom.nom@domain.com",
    "firstname": "Prenom",
    "lastname": "Nom"
  }
}
```

2. Erreur : Email déjà existant

* Code HTTP : 409 Conflict
* Description : L'adresse email est déjà associée à un compte existant.
* Corps de la réponse :

```json
{
  "error": "Un compte existe déjà avec cette adresse mail."
}
```

3. Erreur : Données invalides ou manquantes

* Code HTTP : 422 Unprocessable Content
* Description : Un ou plusieurs champs ne respectent pas les contraintes du DTO (ex: mot de passe trop court, champ manquant).
* Corps de la réponse (généré automatiquement par Symfony) :

```json
{
  "title": "An error occurred",
  "status": 422,
  "detail": "password: Le mot de passe doit comporter au moins 8 caractères."
}
```

## Exemple de test rapide (cURL)

Pour tester la route directement depuis un terminal :
```Bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"prenom.nom@domain.com","password":"password123","firstName":"Prenom","lastName":"Nom"}'
```