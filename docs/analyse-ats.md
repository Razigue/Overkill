# Documentation : Analyse publique de CV (filtre ATS)

Cette fonctionnalité permet d'obtenir une estimation générale de la compatibilité d'un CV avec les logiciels ATS. Elle est publique, ne nécessite pas de compte et retourne un rapport lisible contenant un score sur 100, les points forts du CV et les améliorations prioritaires.

L'analyse porte uniquement sur le CV transmis. Elle ne compare pas le document à une offre d'emploi précise et ne garantit pas le résultat d'une candidature.

## Informations générales

* **Page frontend :** `/ressources/analyse-ats`
* **Webhook n8n :** valeur de `VITE_N8N_ATS_WEBHOOK_URL`
* **Méthode HTTP :** `POST`
* **Format de la requête :** `multipart/form-data`
* **Champ contenant le document :** `file`
* **Format accepté :** PDF contenant du texte exploitable
* **Taille maximale :** 10 Mo
* **Authentification :** aucune
* **Format de la réponse :** texte Markdown naturel
* **Délai maximal côté navigateur :** 125 secondes

---

## Architecture générale

Le traitement repose sur trois éléments :

1. **Le frontend React** reçoit le PDF, effectue les premières validations et affiche le résultat.
2. **Le workflow n8n** contrôle le document, extrait son texte et orchestre l'analyse.
3. **LM Studio** exécute localement le modèle Qwen par l'intermédiaire de son API compatible OpenAI.

Flux complet :

```text
Utilisateur
    |
    | PDF envoyé dans le champ "file"
    v
Frontend React
    |
    | POST multipart/form-data
    v
Webhook n8n
    |
    +--> Validation du fichier
    +--> Extraction du texte
    +--> Vérification qu'il s'agit bien d'un CV
    +--> Préparation des instructions d'analyse
    v
LM Studio / Qwen
    |
    | Rapport Markdown
    v
n8n --> Frontend --> Affichage web ou export PDF
```

Le backend Symfony n'intervient pas dans ce parcours. Le frontend communique directement avec le webhook n8n.

---

## Fonctionnement détaillé

### 1. Sélection du fichier

L'utilisateur sélectionne son CV ou le dépose dans la zone prévue à cet effet.

Le frontend vérifie immédiatement :

* que le fichier possède le type MIME `application/pdf` ou une extension `.pdf` ;
* que sa taille ne dépasse pas 10 Mo ;
* qu'un fichier est bien présent avant d'activer le bouton d'analyse.

Ces contrôles améliorent l'expérience utilisateur, mais ne remplacent pas les validations du workflow. Un appel direct au webhook peut contourner le frontend.

### 2. Envoi vers n8n

Le navigateur construit un objet `FormData` et ajoute le PDF sous la clé `file` :

```javascript
const formData = new FormData()
formData.append('file', file)

await fetch(import.meta.env.VITE_N8N_ATS_WEBHOOK_URL, {
  method: 'POST',
  body: formData,
})
```

Il ne faut pas définir manuellement le header `Content-Type`. Le navigateur ajoute automatiquement la bonne délimitation `multipart/form-data`.

### 3. Validation dans n8n

Le workflow doit répéter les contrôles importants côté serveur :

* présence du champ binaire `file` ;
* extension et type MIME PDF ;
* taille maximale autorisée ;
* présence de texte après extraction ;
* longueur minimale suffisante pour effectuer une analyse ;
* présence d'éléments caractéristiques d'un CV.

La simple présence d'un fichier PDF ne suffit pas. Le workflow doit refuser les factures, cours, contrats, présentations et autres documents sans rapport avec une candidature.

La reconnaissance d'un CV peut s'appuyer sur un ensemble de signaux, par exemple :

* coordonnées ou moyens de contact ;
* expériences professionnelles ;
* compétences ;
* formation ;
* intitulé de poste ou profil ;
* dates, entreprises, établissements ou langues.

Un seul mot-clé ne doit pas suffire. La validation doit rechercher plusieurs signaux cohérents afin de limiter les faux positifs.

### 4. Extraction du texte

n8n extrait le texte du PDF avant de contacter le modèle.

Un PDF scanné contenant uniquement des images ne produit généralement aucun texte exploitable. Comme aucun traitement OCR n'est actuellement prévu, ce type de fichier doit être refusé avec un message explicite invitant l'utilisateur à exporter un PDF contenant du texte sélectionnable.

### 5. Préparation de l'analyse

Le texte extrait est considéré comme une donnée non fiable. Les instructions envoyées au modèle doivent préciser que toute consigne trouvée à l'intérieur du CV doit être ignorée. Cette règle limite les tentatives de prompt injection placées dans le document.

Le modèle doit :

* analyser uniquement le contenu professionnel du CV ;
* ne pas inventer une information absente ;
* ne pas reproduire inutilement les données personnelles ;
* produire une analyse générale, sans offre d'emploi de référence ;
* expliquer les points attribués avec des recommandations concrètes ;
* répondre en français et en Markdown, sans bloc de code.

### 6. Appel à LM Studio

LM Studio expose une API compatible OpenAI. Le nœud de modèle n8n utilise cette API pour envoyer le prompt au modèle chargé sur le poste local.

Configuration utilisée pour ce projet :

* **Modèle :** `qwen/qwen3.5-9b`
* **API :** compatible OpenAI, route de chat completions
* **Use Responses API :** désactivé
* **Response Format :** `Text`
* **Température :** faible, par exemple `0.2`, afin de stabiliser les évaluations

Le format `Text` est volontaire. Le projet n'utilise plus de parseur JSON structuré : les réponses longues du modèle pouvaient être tronquées ou contenir un caractère invalide, ce qui rendait toute l'analyse inexploitable.

Le serveur n8n hébergé doit pouvoir joindre l'adresse réseau de LM Studio. Il faut donc vérifier le pare-feu, le routage ou le tunnel utilisé entre le serveur et le poste local.

### 7. Retour du rapport

n8n renvoie directement le rapport Markdown dans le corps HTTP. Le frontend récupère la réponse avec `response.text()`.

Une réponse réussie doit être suffisamment détaillée. Le frontend refuse actuellement tout rapport de moins de 120 caractères afin d'éviter l'affichage d'une réponse vide ou manifestement incomplète.

---

## Logique du score ATS

Le score final est calculé sur 100 à partir de sept dimensions :

| Dimension | Maximum |
| --- | ---: |
| Coordonnées professionnelles | 10 points |
| Structure et lisibilité ATS | 20 points |
| Titre et positionnement | 10 points |
| Expériences et impact | 25 points |
| Compétences | 15 points |
| Formation et langues | 10 points |
| Clarté rédactionnelle | 10 points |

La somme des notes de chaque dimension doit correspondre au score global affiché.

### Coordonnées professionnelles — 10 points

Vérifie que les moyens de contact et les liens professionnels sont faciles à identifier. L'analyse ne doit pas recopier ces informations dans le rapport.

### Structure et lisibilité ATS — 20 points

Évalue la présence de rubriques explicites, l'ordre logique du contenu, la lisibilité du texte extrait et les risques liés aux colonnes, tableaux, pictogrammes ou éléments purement visuels.

### Titre et positionnement — 10 points

Évalue la clarté du métier recherché, du titre professionnel et de l'accroche.

### Expériences et impact — 25 points

Évalue la chronologie, la précision des missions, l'usage de verbes d'action, les résultats obtenus et la présence éventuelle d'éléments chiffrés.

### Compétences — 15 points

Évalue la pertinence, la précision et l'organisation des compétences techniques et transversales.

### Formation et langues — 10 points

Évalue la clarté des diplômes, établissements, dates, certifications et niveaux de langue lorsqu'ils sont présents.

### Clarté rédactionnelle — 10 points

Évalue la concision, la cohérence, l'orthographe et la facilité de lecture du document.

Le modèle attribue une estimation. Il ne reproduit pas le fonctionnement exact d'un ATS propriétaire et ne peut pas garantir qu'un recruteur retiendra le CV.

---

## Structure attendue du rapport Markdown

Le rapport reste une réponse naturelle, mais une structure stable facilite sa lecture sur le site et son export en PDF.

Exemple :

```markdown
# 84/100 — Compatible avec les ATS standards

Résumé général du diagnostic.

## Détail du score

### Coordonnées professionnelles — 9/10

Constat rédigé naturellement, avec **les éléments importants en gras**.

### Structure et lisibilité ATS — 16/20

Constat et explication de la note.

## Ce qui fonctionne

- **Compétences bien identifiées :** explication concrète.
- **Parcours cohérent :** explication concrète.

## Améliorations prioritaires

1. **Clarifier le titre :** recommandation directement applicable.
2. **Quantifier les résultats :** exemple de reformulation.

## Risques de lecture ATS

- Risque identifié et solution proposée.

> Cette analyse est une estimation générale et ne garantit pas le résultat d'une candidature.
```

Le rendu web prend notamment en charge :

* les titres de niveaux 1 à 3 ;
* les paragraphes ;
* les listes à puces et numérotées ;
* le gras et l'italique ;
* les citations ;
* les séparateurs ;
* les tableaux Markdown.

Pour que le score soit correctement repris dans le PDF, le rapport doit contenir une valeur au format `NN/100`.

---

## Affichage web et export PDF

Le rapport Markdown est affiché avec `react-markdown` et `remark-gfm`. Le contenu n'est pas injecté comme du HTML brut.

Le bouton **Télécharger le PDF** charge le générateur uniquement au moment de l'export. Le PDF est créé dans le navigateur avec `jsPDF`, puis téléchargé sur l'appareil de l'utilisateur.

L'export :

* reprend le score détecté dans le Markdown ;
* conserve les niveaux de titres, paragraphes, listes, citations, gras et italique ;
* ajoute le nom du fichier analysé et la date de génération ;
* gère la pagination et numérote les pages ;
* utilise Google Sans pour les titres et une police PDF standard pour le corps ;
* produit un nom de fichier de la forme `diagnostic-ats-nom-du-cv-AAAA-MM-JJ.pdf`.

L'export PDF est local au navigateur : il ne déclenche pas un second envoi du CV ou du rapport vers n8n.

---

## Réponses et erreurs

Les messages exacts peuvent évoluer dans le workflow, mais le contrat attendu est le suivant :

| Situation | Réponse attendue |
| --- | --- |
| CV PDF texte valide | `200 OK` avec le rapport Markdown |
| Fichier absent ou format invalide | `400 Bad Request` avec un message texte clair |
| PDF vide, scanné ou texte inexploitable | `422 Unprocessable Content` |
| PDF valide mais document non reconnu comme CV | `422 Unprocessable Content` |
| LM Studio inaccessible ou modèle indisponible | erreur serveur avec un message générique, sans détail sensible |
| Analyse supérieure à 125 secondes | annulation côté navigateur et message de délai dépassé |
| Rapport retourné trop court | refus côté frontend et proposition de relancer l'analyse |

Le frontend affiche directement le texte d'une réponse HTTP en erreur. n8n doit donc retourner un message destiné à l'utilisateur, et non une stack trace ou des informations techniques internes.

---

## Confidentialité et durée de vie des données

Le parcours fonctionnel n'enregistre le CV ni dans la base PostgreSQL ni dans le compte utilisateur. Le fichier et le rapport restent temporairement dans l'état de la page jusqu'à son rechargement ou au lancement d'une nouvelle analyse.

Le workflow ne doit contenir aucun nœud d'écriture vers une base, un stockage objet, Google Drive ou un service d'archivage.

Attention : n8n peut sauvegarder automatiquement les données d'entrée et de sortie dans son historique d'exécutions. Pour respecter réellement la promesse « sans stockage », il faut configurer l'instance afin de :

* ne pas sauvegarder les données des exécutions réussies ;
* limiter ou désactiver la sauvegarde des exécutions manuelles ;
* réduire la conservation des exécutions en erreur ;
* activer une purge automatique courte ;
* vérifier que les données binaires temporaires sont effectivement supprimées.

Les journaux de LM Studio et du reverse proxy doivent également être contrôlés afin qu'ils ne conservent ni le texte du CV ni le corps complet des requêtes.

---

## Configuration du frontend

Ajouter l'URL du webhook dans le fichier `.env` à la racine du projet :

```dotenv
VITE_N8N_ATS_WEBHOOK_URL=https://n8n.example.com/webhook/overkill/analyse-cv-ats
```

La même variable est transmise au service frontend dans `docker-compose.yaml`.

Après une modification de variable Vite, il faut redémarrer le serveur frontend ou recréer son conteneur pour que la nouvelle valeur soit chargée. Il n'est pas nécessaire de redémarrer le conteneur n8n hébergé pour une simple modification du frontend.

Le webhook de production n8n doit être publié. Une URL `/webhook-test/` ne fonctionne que pendant l'écoute d'un test dans l'éditeur n8n ; l'application utilise l'URL permanente `/webhook/`.

---

## Exemple de test rapide avec cURL

```bash
curl -X POST "https://n8n.example.com/webhook/overkill/analyse-cv-ats" \
  -H "Accept: text/markdown" \
  -F "file=@/chemin/vers/cv.pdf"
```

Le résultat attendu est le rapport Markdown brut.

Pour vérifier le refus des documents non conformes, répéter le test avec :

* un fichier qui n'est pas un PDF ;
* un PDF de plus de 10 Mo ;
* un PDF scanné sans couche texte ;
* un PDF texte qui n'est pas un CV.

---

## Tests fonctionnels recommandés

1. Charger un CV PDF texte valide et vérifier l'affichage d'un rapport complet.
2. Vérifier que le score global correspond à la somme des sept dimensions.
3. Vérifier les espacements, le gras, les listes et les titres dans le rendu web.
4. Télécharger le PDF et contrôler les changements de page ainsi que les débordements de texte.
5. Tester un nom de fichier long et contenant des accents.
6. Tester un fichier non PDF et un fichier supérieur à 10 Mo.
7. Tester un PDF scanné et vérifier le message d'erreur.
8. Tester un document PDF qui n'est pas un CV et vérifier son refus avant l'appel coûteux au modèle.
9. Arrêter LM Studio et vérifier que l'erreur retournée ne révèle aucune information interne.
10. Vérifier les headers CORS depuis l'origine réelle du frontend.
11. Contrôler que le CV n'apparaît plus dans l'historique n8n après la durée de conservation prévue.

---

## Limites connues

* Les PDF scannés ne sont pas pris en charge sans OCR.
* La qualité du diagnostic dépend de la qualité du texte extrait.
* L'analyse est générale et ne mesure pas l'adéquation à une offre précise.
* Deux versions du modèle ou deux prompts différents peuvent produire des scores légèrement différents.
* Le modèle local doit rester chargé et joignable depuis le serveur n8n.
* Une mise en page peut sembler correcte visuellement tout en étant mal interprétée après extraction du texte.

---

## Maintenance

En cas de modification du format Markdown demandé au modèle, vérifier simultanément :

* le composant `Overkill_Client/src/pages/AnalyseAts.jsx` pour le rendu web ;
* le générateur `Overkill_Client/src/utils/exportAtsAnalysisPdf.js` pour le rendu PDF ;
* le prompt et la réponse finale du workflow n8n ;
* la cohérence du score sur 100 ;
* les messages d'erreur renvoyés à l'utilisateur.

Après toute modification du workflow n8n, enregistrer puis publier la nouvelle version avant de tester l'URL de production.
