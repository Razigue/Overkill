# Documentation – Stratégie d'intégration et flux d'ingestion des données

## 1. Stratégie d'intégration

Afin de simplifier la gestion des flux de données et de faciliter leur maintenance, le choix s'est porté sur **n8n** comme outil d'orchestration. Cette solution permet de construire les workflows de manière visuelle, ce qui rend leur compréhension, leur évolution et leur prise en main plus accessibles que des implémentations entièrement codées.

Grâce à cette approche, les différentes étapes du traitement des données sont clairement identifiables, ce qui facilite également le débogage et les évolutions futures.

---

## 2. Flux d'ingestion des données

Le processus d'ingestion est déclenché manuellement depuis le panneau d'administration. Lorsqu'un administrateur clique sur le bouton dédié, l'ensemble de la logique de récupération et de traitement des données est exécuté.

Le workflow suit les étapes suivantes :

1. Une requête est envoyée à l'API **We Love Dev** afin de récupérer une liste d'offres d'emploi.
2. Les offres reçues passent ensuite par une phase de filtrage permettant d'écarter celles qui ne répondent pas aux critères de qualité des informations définis par le système.
3. Pour chaque offre validée, le workflow vérifie si l'entreprise associée est déjà présente dans la base de données. Si ce n'est pas le cas, une nouvelle entreprise est automatiquement créée.
4. Le même principe est appliqué aux technologies mentionnées dans l'offre : les technologies inexistantes sont ajoutées au référentiel avant d'être associées à l'offre.
5. Enfin, les données sont restructurées et réparties dans les différentes entités de la base de données afin de garantir un enregistrement cohérent, normalisé et facilement exploitable.

Ce processus garantit l'intégrité des données tout en limitant les doublons et en assurant la cohérence des relations entre les différentes entités.

---

## 3. Limitation du débit

Le système applique une limite de **1 requête par seconde**.

Cette limitation répond à deux objectifs :

- Respecter les contraintes imposées par l'API **We Love Dev**.
- Éviter de surcharger le système d'ingestion ainsi que les services externes sollicités.

Cette approche permet de garantir un fonctionnement stable tout en réduisant les risques liés à une consommation excessive des ressources.

---

## 4. Source additionnelle

Une seconde source de données, **France Travail**, a été étudiée afin d'enrichir le catalogue d'offres.

Un premier workflow d'ingestion a été développé, mais son intégration n'a pas été menée à son terme. Les données fournies par **France Travail** présentent une structure et un niveau de détail significativement différents de ceux de **We Love Dev**, ce qui aurait nécessité une adaptation importante de la logique de traitement et de normalisation.

Au regard du coût de développement supplémentaire et de la priorité accordée à la stabilité de la plateforme, il a été été décidé de conserver uniquement l'intégration complète de **We Love Dev** dans cette première version du système.