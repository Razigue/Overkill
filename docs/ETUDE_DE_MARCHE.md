# Découverte Marché et Produit — Job Aggregator

Ce document synthétise l'étude de marché, l'analyse de la concurrence, la recherche utilisateurs ainsi que la proposition de valeur de notre plateforme d'agrégation d'offres d'emploi tech.

---

## 🔗 Maquettes & Design System (Figma)

Conformément aux exigences du projet, l'ensemble des wireframes et des maquettes interactives pour les vues clés sont accessibles ci-dessous :

👉 **[Accéder aux maquettes Figma du projet](https://www.figma.com/design/6i8HWHSegTRgZcC2k4BO6o/Untitled?node-id=0-1&t=FoilQAZpCsVUnmKR-1)**

---

##  1. Analyse du Marché et de la Concurrence

### 📌Tendances du marché de l'emploi Tech
* **Fragmentation des sources :** Les candidats doivent consulter une multitude de plateformes (LinkedIn, Indeed, Welcome to the Jungle, WeLoveDevs, jobboards spécialisés) pour trouver des offres pertinentes.
* **Besoin de transparence :** Forte demande d'informations claires dès l'annonce (fourchettes salariales, modalités de télétravail, compétences exactes exigées).
* **Surcharges d'informations & Doublons :** Multiplication des mêmes annonces publiées par des cabinets de recrutement sur différents portails.

### ⚔️ Analyse des Acteurs et Concurrence

| Concurrent / Acteur | Points Forts | Points Faibles | Notre Différenciateur |
| :--- | :--- | :--- | :--- |
| **Welcome to the Jungle** | Marque forte, contenus media, belles fiches entreprises | Recherche d'offres parfois limitée, pas d'agrégation multi-sources | **Agrégation globale** & analyse algorithmique des compétences / salaires |
| **Indeed / Google Jobs** | Volume d'offres massif | Beaucoup de bruit, d'annonces obsolètes/doublons, peu ciblé Tech | **Ciblage 100% Tech/Dev**, dédoublonnage & enrichissement par IA |
| **WeLoveDevs** *(Partenaire)* | Modèle transparent, très orienté développeurs, super API | Centré sur leur propre réseau d'entreprises | **Interopérabilité** : WeLoveDevs comme source maître + agrégation externe |

---

## 📌 2. Identification des Besoins Utilisateurs (Personas)

### 🧑‍💻 Persona 1 : Thomas (Développeur Fullstack PHP/Symfony — Junior / Intermédiaire)
* **Objectif :** Trouver une opportunité (CDI ou alternance) avec une stack moderne et une grille salariale transparente.
* **Points de douleur (Pain Points) :** 
  * Perte de temps à postuler sur des doublons.
  * Offres floues sur le salaire ou le niveau de télétravail (Remote).
* **Besoins clés :**
  * Un tableau de bord synthétique avec recommandation/matching selon ses compétences.
  * Filtres précis (Localisation, Contrat, Télétravail, Salaire).

### 🧑‍💻 Persona 2 : Sarah (Recruteuse / Administrateur de la plateforme)
* **Objectif :** Garantir la qualité des offres ingérées et modérer le contenu de la plateforme.
* **Points de douleur (Pain Points) :** 
  * Présence de données incomplètes ou mal formatées issues du scraping/APIs.
* **Besoins clés :**
  * Interface d'administration fluide pour valider, modérer ou supprimer des offres en lot.

---

## 📌 3. Proposition de Valeur

### 🎯 Positionnement
> *"La plateforme d'agrégation Tech qui centralise, nettoie et enrichit les offres d'emploi pour offrir aux développeurs une vision claire du marché et une aide décisionnelle basée sur les données et l'IA."*

### ⚡ Les 3 Piliers de notre Solution

1. **Centralisation & Transparence (Data) :** 
   * Ingestion et normalisation automatique des offres (notamment via l'API WeLoveDevs).
   * Visualisation claire des métriques de marché (distributions des salaires, tendances des stacks).

2. **Aide à la décision & IA Intelligente :** 
   * Scoring ATS du CV client par IA pour optimiser son CV.

3. **Expérience Utilisateur Épurée & Accessible :**
   * Interface responsive, rapide et conforme aux normes d'accessibilité **WCAG 2.1 AA** sur les parcours clés.