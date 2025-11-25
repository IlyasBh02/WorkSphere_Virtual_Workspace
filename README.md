Project Manager d'Assignation de Personnel
Ce projet est une application front-end construite en JavaScript vanille qui simule la gestion et l'assignation des employés à différentes zones (pièces) d'un bureau, en appliquant des règles de capacité et de rôle spécifiques.

🚀 Fonctionnalités Principales
        Gestion des Employés : Ajout de nouveaux employés avec nom, rôle, contact, photo et expériences professionnelles.
        Assignation Logique : Assignation des employés à des zones spécifiques selon deux règles :
        Capacité Max : Chaque zone a une taille maximale (roomSizes).
        Règles de Rôle : Certaines zones exigent des rôles spécifiques (roomPermissions). (Ex: un "Technicien IT" pour la "Salle des Serveurs").
        Validation de Formulaire Avancée : Vérifications côté client pour le format des emails, des numéros de téléphone (10 chiffres), la présence des champs requis et la cohérence des dates d'expérience.
        Affichage Dynamique : Mise à jour en temps réel de la liste des employés non assignés et de l'occupation de chaque zone.
        Profils Détaillés : Affichage d'un profil complet de l'employé (informations et expériences) via une modale.


💻 Technologies Utilisées
        HTML & CSS : Pour la structure et le style de l'interface (non inclus dans le script, mais nécessaires au fonctionnement).
        JavaScript: Logique complète de l'application (gestion d'état, DOM manipulation, événements, validation).
        fetch API : Utilisée pour charger les données initiales des employés à partir d'un fichier workers.json.


🔧Structure du Dossier : Assurez-vous d'avoir la structure minimale suivante :
        /
        ├── index.html       (Contient la structure et les modales)
        ├── style.css        (Contient les styles)
        ├── script.js        (Le fichier de logique que vous avez fourni)
        └── workers.json     (Le fichier JSON contenant les données initiales)
        Lancer l'application : Ouvrez simplement le fichier index.html dans votre navigateur (ou utilisez une extension de serveur local comme Live Server dans VS Code pour éviter les problèmes de CORS avec fetch).


⚙️ Configuration du Script
        Les règles de l'application sont définies au début du fichier script.js :
        1. Données Initiales
        workers : Tableau global stockant l'état de tous les employés.
        2. Règles des Zones
        roomSizes : Définit la capacité maximale de chaque zone.
        JavaScript
        const roomSizes = {
            conference: 10,
            reception: 3,
            // ...
        };
        roomPermissions : Définit les rôles nécessaires pour être assigné à une zone (Manager a toujours accès).
        JavaScript
        const roomPermissions = {
            reception: ["Réceptionniste", "Manager", "Nettoyage"],
            // ...
        };


📝 Structure du Code (Points Clés)
        Initialisation :
        fetchWorkersData() : Charge les données et lance startApp().
        startApp() : Appelle setupEvents() et les fonctions de rendu initial (showUnassigned(), showRoom()).
        Validation :
        isValidEmail(), isValidPhone(), checkDates() : Fonctions utilisant des expressions régulières (RegExp) pour valider les formats.
        checkField(), checkExperiences(), checkAllFields() : Gèrent l'affichage/masquage des messages d'erreur et contrôlent l'envoi du formulaire.
        Rendu et Événements :
        makeWorkerCard() : Génère l'HTML d'une carte d'employé.
        showUnassigned() : Affiche la liste des employés sans zone.
        showRoom(room) : Met à jour le contenu et le compteur d'une zone spécifique.
        setupEvents() : Attache tous les écouteurs d'événements principaux (boutons, formulaires, modales).
        Logique Métier :
        canWorkInRoom(role, room) : Implémente la logique de permission des rôles.
        putWorkerInRoom() / removeWorkerFromRoom() : Gèrent le changement d'état de l'employé et appellent les fonctions de rendu.