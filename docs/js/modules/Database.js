import * as TaskJS from './Task.js';
import * as DisplayJS from './Display.js';
import * as DateJS from './Date.js';

// =  Variables pour la gestion de la base de données  = //
const dbNameTasks = 'toDoListDB';
const dbVersionTasks = 1;

var db;
var taskObjSt;
var exportPrep = [];

// =  Variables pour la gestion de la base de données - FIN  = //

var dbOperations = ["create","import","export","insert", "update", "print","cancel","close","delete_objSt"];

var readwriteOperations = ["create","import","insert", "update","cancel","close", "delete_objSt"];
var readonlyOperations = ["export","print"];


const openProgressValues = TaskJS.getOpenProgressValues();
const closedProgressValues = TaskJS.getClosedProgressValues();

const currentDisplay = document.getElementById("currentDisplayText");

export function tryAgainDB(operation, taskElement, dbVersion, range, sort) {
	var currentDBVersion = window.localStorage.getItem(dbNameTasks);
	console.log("tryAgainDB() - prev : "+currentDBVersion);
		
	var newDBVersion = ++currentDBVersion;
	console.log("tryAgainDB() - new : "+newDBVersion);
  		
	useDB(operation, taskElement, newDBVersion, range, sort);
}

export function getVersion(dbName) {
	var request = window.indexedDB.open(dbName); 

	request.onerror = function(event) {
  		console.log("getVersion() - Request Error : "+event.target.errorCode);
	};

	request.onsuccess = function(event) {
	  var db = request.result;
	  var dbVersionTasks = db.version;
	  DisplayJS.storeLocal(dbName,dbVersionTasks);
	};
}

export function latestdbVersionTasks(dbName) {
		getVersion(dbName);		
		return window.localStorage.getItem(dbName);
}

export function storeLatestIdTask (currentObjectStore) {
	//console.log(currentObjectStore);

	var allKeysRequest =  currentObjectStore.getAllKeys();
	allKeysRequest.onsuccess = function(event) {
		var allItems = event.target.result;
		DisplayJS.storeLocal("latestUsedIdTask",allItems[allItems.length-1]);
	}
}


 /* ======================= */
export function useDB(operation, taskElement = [],dbVersion = dbVersionTasks, range = "all", sort ="by_id", dbNameTasks = "toDoListDB", option = null) {

	// Ouverture / création
	var request = window.indexedDB.open(dbNameTasks, dbVersion); 
	getVersion(dbNameTasks); // Laissé ici < asynchronicité


	// Gérer l'échec de la création
	request.onerror = function(event) {
		
		console.log("useDB() - Request Error : "+event.target.errorCode);  		
		tryAgainDB(operation, dbVersion, taskElement, range, sort);
	};

	// Structure de la base de données
	request.onblocked = function(event) {
		//alert("Bloqué !");
		console.log("useDB() - Blocked request :+"+event.target.errorCode); 
	}

	// Structure de la base de données
	request.onupgradeneeded = function(event) {
		console.log("useDB() - request.onupgradeneeded");

		var db = event.target.result;

		var objectStoreLists = db.objectStoreNames;
		//console.log(objectStoreLists);
		console.log(objectStoreLists.contains("taskObjSt"));
		
		if (objectStoreLists.contains("taskObjSt")){
				console.log("L'objectstore 'taskObjSt' existe déjà");
		}
		else {
			console.log("Création de l'objectstore 'taskObjSt'");
		
			var dbObjectStore = db.createObjectStore("taskObjSt", {keyPath: 'tkId', autoIncrement: true});
		
			dbObjectStore.createIndex('tkDateCreated', 'tkDateCreated', {unique : false});
		dbObjectStore.createIndex('tkDomain', 'tkDomain', {unique : false});
		dbObjectStore.createIndex('tkStatus', 'tkStatus', {unique : false});
		dbObjectStore.createIndex('tkDeadline', 'tkDeadline', {unique : false});
		dbObjectStore.createIndex('tkProgress', 'tkProgress', {unique : false});
		dbObjectStore.createIndex('tkText', 'tkText', {unique : true});
		dbObjectStore.createIndex('tkComment', 'tkComment', {unique : false});
		dbObjectStore.createIndex('tkDateUpdate', 'tkDateUpdate', {unique : false});
		dbObjectStore.createIndex('tkDateClosing', 'tkDateClosing', {unique : false});
	}

			console.log("objectStore 'taskObjSt' initialisé");
		
	}

	request.onsuccess = function(event){
		var db = request.result;

		db.onerror = function(event) {
	  // Gestionnaire d'erreur générique pour toutes les erreurs de requêtes de cette base
		console.log("Database error: " + event.target.errorCode);
		};

		const readValue = readwriteOperations.includes(operation) ? "readwrite" : "readonly";

		
		const taskObjSt = db.transaction("taskObjSt", readValue).objectStore("taskObjSt");

		switch(operation){
			case "create":
				DisplayJS.activateElement(document.getElementById("addToDoListItem"));
				DisplayJS.showInfoModal("Création d'une liste","La liste a été crée.");
				break;

			case "import" :
				addListToDBTasks(taskObjSt, taskElement);
				DisplayJS.activateTaskMnt();
		 		break;

		 	case "export" :
		 		exportFromDBTasks(taskObjSt);
		 		DisplayJS.activateTaskMnt();
		 		break;

		 	case "insert" :
		 		insertNewItemIntoDB(taskObjSt, taskElement);
		 		DisplayJS.activateTaskMnt();
		 		break;

		 	case "update" :
		 		updateItemIntoDB(taskObjSt, taskElement);
		 		DisplayJS.activateTaskMnt();
		 		break;

		 	case "print" :
		 		printFromDBTasks(taskObjSt, range, sort);
		 		DisplayJS.activateTaskMnt();
		 		break;

		 	case "close" :
		 		console.log(option);
		 		closeTaskDB(taskObjSt, taskElement, option);
		 		DisplayJS.hideModal();
		 		DisplayJS.activateTaskMnt();
		 		break;
		 	
		 	case "delete_objSt":
		 		cleantaskObjSt(taskObjSt);
		 		DisplayJS.deactivateTaskMnt();
		 		break;

		 	default : 
		 		break;
		 }
		 db.close();
	}
}

export function addListToDBTasks(objectStore, taskArray) {
	console.log("addListToDBTasks() - start");
	let cpt = 0;
	for(let i in taskArray) {
		addItemToDBTasks(taskArray[i],objectStore);
		cpt++;
	}

	console.log("addListToDBTasks() - "+cpt+" enregistrements ajoutés - end");	
}

// Ajout d'une tâche à la DB depuis une liste - Appel dans fn addListToDBTasks()
export function addItemToDBTasks(task,objectStore) {
	//console.log("addItemToDBTasks() - start");
    var obj = { 
    	tkId: task.tkId,
		tkDateCreated: task.tkDateCreated,
		tkText: task.tkText,
		tkDomain: task.tkDomain,
		tkStatus: task.tkStatus,
		tkDeadline: task.tkDeadline,
		tkProgress: task.tkProgress,
		tkComment: task.tkComment,
		tkDateUpdate: task.tkDateUpdate, 
		tkDateClosing: task.tkDateClosing
	};

    if (typeof blob != 'undefined')
      obj.blob = blob;
    
    try {
    	var store = objectStore;
    	var req;
      	req = store.add(obj);
    } 
    catch (e) {
      	if (e.name == 'DataCloneError')
        console.log("This engine doesn't know how to clone a Blob, "+"use Firefox");
      	throw e;
    }

    req.onsuccess = function (evt) {
      //console.log("Insertion in DB successful - "+evt.target.result);
    };

    req.onerror = function() {
      console.error("addItemToDBTasks", this.error);
    };
    //console.log("addItemToDBTasks() - end");
}

export function exportFromDBTasks(objectStore) {
	console.log("exportFromDBTasks() - start");
	
	objectStore.openCursor(null,'prev').onsuccess = function(event) {
		var cursor = event.target.result;
		if (cursor) {
			var cursorCSV = Object.values(cursor.value);
			if (cursorCSV[7].includes("\n")) {
				cursorCSV[7] = cursorCSV[7].replace("\n","//");
			}
			try {
				exportPrep.push(cursorCSV);
			} 
			catch (e) {
				console.log("exportFromDBTasks() - Erreur pour "+i+"-"+e.name);
				return;
			}
			cursor.continue();
		}
		else {
			console.log('Plus de tâches à exporter');
			TaskJS.toCSVFile("tasks",exportPrep);
		}
	}

	console.log("exportFromDBTasks() - end");
}

export function insertNewItemIntoDB(objectStore, task) {
	console.log("insertNewItemIntoDB() - start");
	//try {
		addItemToDBTasks(task,objectStore);

		DisplayJS.refreshTaskTable();
		storeLatestIdTask(objectStore);

		DisplayJS.hideElement(document.getElementById("formAddTaskDiv"));
	//}
	// catch (e) {
	// 	console.log ("insertNewItemIntoDB() + Error : "+e.message);
	// 	alert("La tentative d'ajout pour la tâche "+task.tkId+" a échoué.");
	// }
	console.log("insertNewItemIntoDB() - end");
}

export function updateItemIntoDB(objectStore, task) {
	console.log("updateItemIntoDB() - start");
	
	var updateRequest = objectStore.get(task.tkId);
	updateRequest.onerror = function(event) {
		console.log ("updateItemIntoDB() - updateRequest - Erreur :"+e.message);
	}

	updateRequest.onsuccess = function(event) {
		console.log("updateRequest Success");
		var itemToUpdate = updateRequest.result;
		// try {
			
			/* Retrouver la clé pour la propriété à mettre à jour*/	
			var updateKeys = Object.keys(task);
			var updateEntries = Object.entries(task);

			var beforeKeys = Object.keys(itemToUpdate);
			var beforeEntries = Object.entries(itemToUpdate);

			beforeKeys.forEach (key =>{
				
				if (!Object.is(itemToUpdate[key],task[key])){
					itemToUpdate[key] = task[key];
				}
			});

			/* Mettre à jour la propriété*/
			var updateDBRequest = objectStore.put(itemToUpdate);
			updateDBRequest.onerror = function(event) {
				console.log("updateRequest - Echec de la mise à jour de la base de données pour la tâche "+task.tkId+" - "+e.message);
			}

			updateDBRequest.onsuccess = function(event) {
				
				DisplayJS.showInfoModal("Mise à jour d'une tâche","Tâche "+task.tkId+" mise à jour");
				document.getElementById('formUpdateTaskDiv').style.display="none";
				DisplayJS.refreshTaskTable();
			}

		//}
		// catch (e) {
		// 	console.log (e.message);
		// 	alert("La tentative de mise à jour pour la tâche "+task.tkId+" a échoué.");
		// }
	}
	console.log("updateItemIntoDB() - end");
}

export function printFromDBTasks(objectStore, range, sort) {
	var request = (sort.localeCompare("by_deadline") == 0) ? objectStore.index('tkDeadline').openCursor(null,'prev') : objectStore.openCursor(null,'prev');

	request.onsuccess = function(event) {
		var cursor = event.target.result;
		if (cursor) {
			switch(range) {
				case "open":
					if (openProgressValues.includes(cursor.value.tkProgress)) {
						DisplayJS.printItemTasks(cursor.value);
					}
					break;
				case "closed":
					if (closedProgressValues.includes(cursor.value.tkProgress)) {
						
						DisplayJS.printItemTasks(cursor.value);		
					}
					break;
				default :
					
					DisplayJS.printItemTasks(cursor.value);
				}
			cursor.continue();
		}
		else {
			console.log('Plus de tâches à afficher');
			storeLatestIdTask(objectStore);
		}			
	}

	currentDisplay.innerHTML = (range === "open") ? "tâches en cours" : (range === "closed") ? "tâches fermées" : "toutes les tâches";	

	console.log("printFromDBTasks() - end");
}

export function closeTaskDB(objectStore, task, option) {
	console.log("closeTask() - start");
	
	var closeRequest = objectStore.get(task.tkId);
	closeRequest.onerror = function(event) {
		console.log ("closeTaskDB() - closeRequest - Erreur :"+e.message);
	}

	closeRequest.onsuccess = function(event) {
		console.log("closeRequest Success");
		var itemToClose = closeRequest.result;
		console.log(itemToClose);
		// try {
			
			/* Modifier la progression et la date de clotûre de la tâche */	
			itemToClose.tkProgress = option;
			let timestamp = DateJS.timestampForUpdate();
			itemToClose.tkDateUpdate = timestamp;
			itemToClose.tkDateClosing = timestamp;


			/* Mettre à jour la base de données */
			var closeDBRequest = objectStore.put(itemToClose);
			closeDBRequest.onerror = function(event) {
				console.log("closeRequest - Echec de la mise à jour de la base de données pour la tâche "+task.tkId+" - "+e.message);
			}

			closeDBRequest.onsuccess = function(event) {
				
				DisplayJS.showInfoModal("Clôture d'une tâche","Tâche "+task.tkId+" "+option.toLowerCase()+"e");
				document.getElementById('formUpdateTaskDiv').style.display="none";
				DisplayJS.refreshTaskTable();
			}

		//}
		// catch (e) {
		// 	console.log (e.message);
		// 	alert("La tentative d'annulation pour la tâche "+task.tkId+" a échoué.");
		// }
	}
	console.log("closeTaskDB() - end");
}

export function cleantaskObjSt(objectStore) {
	var taskObjectClearRequest = objectStore.clear();

	taskObjectClearRequest.onsuccess = function(event){	
		console.log("Modification de la base de données terminée - Enregistrements effacés");
		document.location.reload();
	}
}