# Liste de tâches  
Cliquer [ici pour voir la démo](https://lysspiral.github.io/todolist_csv/).

**Description** :   
Liste de tâches avec gestion des tâches dans IndexedDB et import depuis / export vers CSV  
Plusieurs contraintes ont été repérées pour ce projet : utilisation sur plusieurs postes avec des paramétrages de sécurité différents (dont certains avec OS en 32 bits), travail centré sur le javascript natif...  
C'est pouquoi j'ai choisi de partir sur une liste avec conservation des données dans IndexedDB (plutôt que le Local Storage) et utilisation de fichiers externes.  
L'import depuis/export vers les fichiers de format CSV permettent l'exploitation des données dans des logiciels autres que le navigateur. 

**Avancement** : projet en cours  
Dernière étape réalisée : réorganisation du code javascript en modules  

**Fonctionnalités déjà réalisées** : 
Fonctionnalités élémentaires
* Création de tâches à partir d'un formulaire avec génération automatique de l'identifiant et de la date (et contrôle des champs obligatoires)
* Clotûre de tâches

Fonctionnalités permises par la conservation des données dans une base de données  
* Modification des caractéristiques de la tâche avec génération automatique des dates et heures de modification
* Affichage filtré (selon la progression) ou ordonné (par date d'échéance)
* Import depuis / export vers un fichier CSV - ***Le fichier à utiliser pour l'import est tasks-blank.csv, présent dans le dossier todolist_csv/docs/files/*** 

Autres fonctionnalites
* Activation conditionnelle des boutons selon la présence de tâches  

**Principales sources** :   
La trilogie habituelle   
* La documentation de [MDN - Mozilla Developer Network](https://developer.mozilla.org/fr/docs/Learn)
* La section [*References* de W3Schools](https://www.w3schools.com/html/default.asp)
* Le site [Stack Overflow](https://stackoverflow.com/questions/)

Pour les fonctionnalités élémentaires sans conservations des données  
* tutoriel *To-do liste* proposé par Enzo USTARIZ dans le cours [20 projets en Javascript](https://www.ecole-du-web.net/p/20-projets-en-javascript)
* tutoriel [*How TO - Create a To Do List* de W3Schools](https://www.w3schools.com/howto/howto_js_todolist.asp)

Pour IndexedDB  
* La documentation de [MDN sur l'API IndexedDB](https://developer.mozilla.org/fr/docs/Web/API/IndexedDB_API)
  
Pour la gestion d'un fichier CSV  
* Le tutoriel *JavaScript create and download CSV file* sur le site [javaTpoint](https://www.javatpoint.com/javascript-create-and-download-csv-file)
* L'article [du wiki fileformats.archiveteam.org sur CSV](http://fileformats.archiveteam.org/wiki/CSV)

