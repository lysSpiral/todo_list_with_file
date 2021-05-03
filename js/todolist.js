console.log('Connexion à js établie');

// =======  Variables globales  ======= //
//const = document.getElementById("");

//const taskList = document.getElementById('taskList');

const tableToDoList = document.getElementById("tableToDoList");
const tasksTable = document.getElementById("tasksTable");

const openTasksSortBtn = document.getElementById("openTasksSortBtn");
const closedTasksSortBtn = document.getElementById("closedTasksSortBtn");
const allTasksSortBtn = document.getElementById("allTasksSortBtn");

const dbNameTasks = 'toDoListDB';
const dbVersionTasks = 1;

var db;
var objectStoreTasks;
var externalList = "";
var exportPrep = [];

// =  Variables pour gestion date  = //
var current_date = new Date();
//console.log(current_date);

var current_day_short_EN;
var current_day_short_FR;
var current_time;
var current_month_2digit;
var current_day_2digit;
var current_hour_2digit;
var current_minute_2digit;
var current_timestamp;
// =  Variables pour gestion date - FIN  = //


// =  Variables pour gestion domaines / statuts / progressions  = //
const domainField = document.getElementById("input-tk-domain");
const statusField = document.getElementById("input-tk-status");
const progressField = document.getElementById("input-tk-progress");

const domainFieldChange = document.getElementById("input-chg-tk-domain");
const statusFieldChange = document.getElementById("input-chg-tk-status");
const progressFieldChange = document.getElementById("input-chg-tk-progress");


var domainValues = {
"blankDomain": "À classer", "AcJ": "Acquisitions Jeunesse", "AnimJ": "Animation Jeunesse", "CatDoc": "Catalogage Documentaires", "CatJ": "Catalogage Jeunesse", "MDI": "Fonds MDI"
};

var statusValues = {
"blankStatus": "À préciser", "background":"Arrière-plan","important":"Important","normal":"Normal","urgent":"Urgent"
};

var progressValues = {
"unstarted":"À commencer", "cancelled":"Annulé", "started":"Commencé", "ongoing":"En cours", "finishing":"Presque fini", "done":"Terminé"	
};

var openProgressValues = ["À commencer", "Commencé", "En cours", "Presque fini"];
var closedProgressValues = ["Annulé", "Terminé"];

var urgentStatusValues = ["Important", "Urgent"];

var domainArray = Object.entries(domainValues);
var statusArray = Object.entries(statusValues);
var progressArray = Object.entries(progressValues);

//var foundKey = "";

// =  Variables pour gestion domaines / statuts / progressions  - FIN = //
// =======  Variables globales - FIN ======= //

// =======  Classe Task  ======= //
class Task {
	constructor(arrayTaskValues) {
		this.tk_id = arrayTaskValues[0];
		this.tk_date_created = arrayTaskValues[1];
		this.tk_text = arrayTaskValues[2];
		this.tk_domain = arrayTaskValues[3];
		this.tk_status = arrayTaskValues[4];
		this.tk_deadline = arrayTaskValues[5];
		this.tk_progress = arrayTaskValues[6];
		this.tk_comment = arrayTaskValues[7];

		this.tk_date_update = current_day_short_EN+" "+current_time;
		//this.tk_date_update = new Date(Date.now());
		//this.tk_date_update = arrayTaskValues[8];;
		//this.tk_date_closing;
	}

	toString() {
		return "id : "+this.tk_id+" / date_created : "+this.tk_date_created+" / text : "+this.tk_text+" / domain : "+this.tk_domain+" / status : "+this.tk_status+" / deadline : "+this.tk_deadline+" / progress : "+this.tk_progress;
	} 

	toListOfStrings() {
		return this.tk_id+","+this.tk_date_created+","+this.tk_text+","+this.tk_domain+","+this.tk_status+","+this.tk_deadline+","+this.tk_progress;
	}

	setText(text) {
		this.tk_text = text;
	}

	setDomain(text) {
		this.tk_domain = text;
	}

	setStatus(text) {
		this.tk_status = text;
	}

	setDeadline(date) {
		this.tk_deadline = date;
	}

	setProgress(text) {
		this.tk_progress = text;
	}

	setLinked(linked_tasks) {
	}

	updateTask(item){
      var before = new Map(Object.entries(this));
      var update = new Map(Object.entries(item));
      
      before.forEach(function(value, key, map) {
          if(before.get(key) != update.get(key))
            {
              before.set(key, update.get(key));
            }
      })

      return new Task(Array.from(before.values()));
	}
}

class UpdatableTask extends Task {
	constructor(arrayUpdTaskValues) {
		this.tk_text = arrayTaskValues[2];
		this.tk_domain = arrayTaskValues[3];
		this.tk_status = arrayTaskValues[4];
		this.tk_deadline = arrayTaskValues[5];
		this.tk_progress = arrayTaskValues[6];
	}

}
// =======  Classe Task - FIN  ======= //

// =======  Fonctions pour gestion domaines / statuts / progressions  ======= //
function getKey(searchedValue, arrayKV) {
	var testSearch = false;
	var i = 0;
	//var foundKey = "";

	while (i < arrayKV.length && !testSearch) {
  		let candidate = arrayKV[i];
  		//console.log(candidate);
  
		if (candidate.includes(searchedValue)) {
		    foundKey = candidate[0];
		    testSearch = true;
		    //console.log("la clé est "+foundKey);
		    return foundKey;
		}
		else {
		    //console.log(candidate+ ": rejeté");
		    i++;
		}
	}
}

function htmlDomainFields(htmlElement) {
	var domainCount = domainArray.length;

	//var domainKey = getKey("blank", domainValues);
	var domainFieldHTML = "<option id=\"blankDomain\" value=\"blankDomain\" selected>"+domainValues["blankDomain"]+"</option>";
	// domainField.appendChild(domainField); => NOPE : créer l'élément avant

	htmlElement.insertAdjacentHTML("beforeend", domainFieldHTML);

	for(let i=1;i<domainCount;i++){
		//var domainKey = getKey("blank", domainValues);
		var domainObject = domainArray[i];
		//var domainKey = Object.keys(domainObject);
		//domainField = "<option value=\""+domainKey+"\" selected>"+domainValues[domainKey]+"</option>";
		
		domainFieldHTML = "<option id=\""+domainObject[0]+"Domain\" value=\""+domainObject[0]+"\">"+domainObject[1]+"</option>";
		//console.log(domainField);
		htmlElement.insertAdjacentHTML("beforeend", domainFieldHTML);
	}
}

function htmlStatusFields(htmlElement) {
	var statusCount = statusArray.length;
	
	var statusFieldHTML = "<option id=\"blankStatus\" value=\"blankStatus\" selected>"+statusValues["blankStatus"]+"</option>";

	htmlElement.insertAdjacentHTML("beforeend", statusFieldHTML);

	for(let i=1;i<statusCount;i++){
		var statusObject = statusArray[i];
		
		statusFieldHTML = "<option id=\""+statusObject[0]+"Status\" value=\""+statusObject[0]+"\">"+statusObject[1]+"</option>";
		htmlElement.insertAdjacentHTML("beforeend", statusFieldHTML);
	}
}

function htmlProgressFields(htmlElement) {
	var progressCount = progressArray.length;

	var progressFieldHTML = "<option id=\"unstarted\" value=\"unstarted\" selected>"+progressValues["unstarted"]+"</option>";


	htmlElement.insertAdjacentHTML("beforeend", progressFieldHTML);

	for(let i=1;i<progressCount;i++){

		var progressObject = progressArray[i];
		
		progressFieldHTML = "<option id=\""+progressObject[0]+"Progress\" value=\""+progressObject[0]+"\">"+progressObject[1]+"</option>";
		htmlElement.insertAdjacentHTML("beforeend", progressFieldHTML);
	}
}

// =======  Fonctions pour gestion domaines / statuts / progressions - FIN ======= //


// Récupérer la date (jour et heure) //
function printDayInfo() {
	// Initialiser la String pour le jour ET l'insérer dans le HTML //
	let date_options = {
		weekday:'long',
		year: 'numeric',
		month:'long',
		day:'2-digit'
	}
	//let current_day = current_date.toLocaleDateString('fr-FR',date_options);
	current_day = current_date.toLocaleDateString('fr-FR',date_options);
	//console.log(current_day);

	current_day_short_FR = new Intl.DateTimeFormat(['fr']).format(current_date);
	
	let date_options_EN = {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	}
	//current_day_short_EN = new Intl.DateTimeFormat('en-US',date_options_EN).format(current_date);
	current_day_short_EN = new Intl.DateTimeFormat('en-GB',date_options_EN).format(current_date);
	//console.log(current_day_short_FR);

	//document.getElementById('current_day').innerHTML = current_day;
	//document.getElementById('creation_date').innerHTML = current_day;
	document.getElementById('creation_date').innerHTML = current_day_short_FR;
	//document.getElementById('creation_date').innerHTML = current_day_short_EN;

	// Initialiser la String pour l'heure ET l'insérer dans le HTML //
	let time_options = {
		hour:'numeric',
		minute:'numeric',
		second:'numeric'
	}
	current_time = current_date.toLocaleTimeString('fr-FR',time_options);
	//console.log(current_time);
	// document.getElementById('current_time').innerHTML = current_time;

	//let current_day_short_FR = new Intl.DateTimeFormat(['fr']).format(current_date);
}

// Montrer un  élément 
function showElement(element) {
    element.style.display = "block";
}

// Cacher un  élément 
function hideElement(element) {
    element.style.display = "none";
}

// Cacher tous les éléments d'un groupe d'éléments (Array en argument et non NodeList )
function hideAll(array) {
	array.forEach(function(element){
      console.log(element.id);
      hideElement(element);
    })
}

// Changer la valeur pour le Display d'un élément
// function changeDisplay(elmt) {
// 	//var elmt = document.getElementById("id");

// 	if (elmt.style.display === "none") {
// 	    elmt.style.display = "block";
// 	  } else {
// 	    elmt.style.display = "none";
// 	  }
// }

// Changer la value d'un bouton
function changeBtnContent(btn, elmt, string1, string2) {
	//console.log(elmt.style.display);
	if (elmt.style.display === "none") {
		//console.log(btn.innerHTML+" - "+string1);
		btn.innerHTML = string2;
	} else {
		btn.innerHTML = string1;
	}
} 

function storageLocal(storeName,text){
	window.localStorage.setItem(storeName,text);
}

// ======= A VOIR ======= //
function clearForm(item) {
	//document.myForm.reset();
	document.getElementById(item).reset();
	console.log('formulaire '+item+' réinitialisé');
}

function printError(event) {
	console.log("Erreur : "+event.target.errorCode);
}

function jsonStringToArray(jsonString) {
	var prepList = (jsonString).replace(/(\r\n|\n|\r)/gm, " ");
	var itemArray = JSON.parse(prepList);
	return itemArray;	
}
// ======= FIN A VOIR ======= //

// =======  CSV ======= //
var csvHeader = "ID, Date, Description, Domaine, Statut, Échéance, Progression, Commentaire, Dernière MAJ\n";

// var csvHeader = "ID, Date, Description, Domaine, Statut, Échéance, Progression, Clôture, Dernière MAJ, Commentaire\n";

function testCSVtype(file) {
	//return file.type === 'text/csv';
	return true;
}


//Import
function csvToArrayOfObjects(csvContent) {
	var allRows = csvContent.split(/\r?\n|\r/); // renvoie un tableau : 1 ligne entête + lignes des instances + 1 ligne vide
	console.log(allRows);
	var tasksArray = [];
	for(let i =1; i<(allRows.length-1);i++){
		var taskValues = allRows[i].split(",");
		
		var task = new Task(taskValues);
		tasksArray.push(task);
		//console.log(taskValues);
	}
	console.log(tasksArray);
	addListToDBTasks(tasksArray);
}

//Export

function dateForCSVFile() {
	current_month_2digit = ((current_date.getMonth()+1) > 9 ? (current_date.getMonth()+1) : "0"+(current_date.getMonth()+1));
	current_day_2digit = (current_date.getDate() > 9 ? (current_date.getDate()) : "0"+(current_date.getDate()));
	current_hour_2digit =(current_date.getHours() > 9 ? (current_date.getHours()) : "0"+(current_date.getHours()));
	current_minute_2digit =(current_date.getMinutes() > 9 ? (current_date.getMinutes()) : "0"+(current_date.getMinutes()));

	current_timestamp = current_date.getFullYear()+"_"+current_month_2digit+"_"+current_day_2digit+"-"+current_hour_2digit+"_"+current_minute_2digit;
}

function toCSVFile(exportType, exportArray) {
	dateForCSVFile();
	var csv_file_name = exportType+'-'+current_timestamp+'.csv';
	console.log(csv_file_name);

	var csvExportContent = 'data:text/csv;charset=utf-8,'+csvHeader;
	exportArray.forEach(function(row){
		csvExportContent += row.join(',');
		csvExportContent += "\n";
	});
	//console.log(csvExportContent);
	var hiddenDownloadLink = document.createElement('a');
	//var hiddenDownloadLink = document.getElementById('hiddenDownloadLink');
	//hiddenDownloadLink.href = 'date:text/csv;charset=utf-8,'+encodeURI(csvExportContent);
	var exportURI = encodeURI(csvExportContent);
	//window.open(exportURI);
	console.log(exportURI);
	hiddenDownloadLink.setAttribute('href',exportURI);
	hiddenDownloadLink.target = '_blank';

	//hiddenDownloadLink.download = csv_file_name+'.csv';
	hiddenDownloadLink.setAttribute('download',csv_file_name);
	document.body.appendChild(hiddenDownloadLink);
	hiddenDownloadLink.click();
}

// =======  CSV - FIN ======= //

// =======  Import - Gestion asynchronicité  ======= //

function fileImportPromise(importedFile) {
	const extListReader = new FileReader();
	return new Promise((resolve,reject) => {

		extListReader.onload = () => {
 	    	externalList = extListReader.result;
 	    	resolve(extListReader.result);
 	    };
 
		extListReader.onerror = () => {
	      extListReader.abort();
 	      reject(new DOMException("Problem parsing input file."));
 	    };

		extListReader.readAsText(importedFile);
	});
}

async function handleUpload(event){
	const selectedFile = document.getElementById('taskExtListFile').files[0];

	if (testCSVtype(selectedFile)) { 
		try {
			const fileContents = await fileImportPromise(selectedFile);
			csvToArrayOfObjects(externalList);
			printFromDBTasks();
			// document.getElementById("hideTaskList").innerHTML = "Cacher la liste";
			alert("Import réussi");
			showElement(tasksTable);
		} 
		catch (e) {
	 	    console.log(e.message);
	 	 }
	}
	else {
			//alert("Le fichier sélectionné n'est pas au bon format (csv).");
			//clearForm('addFileList');
	}
}
// =======  Import - Gestion asynchronicité - FIN ======= //

// ======= Export de fichiers - CSV ======= //
function exportFromDBTasks(dbVersion = dbVersionTasks) {
	// Ouverture / création
	var request = window.indexedDB.open(dbNameTasks, dbVersion); 
	
	// Gérer le succès / l'échec de la création / de l'ouverture
	request.onerror = function(event) {
  		console.log("Request Error : "+event.target.errorCode+" "+getVersion(dbNameTasks)+" "+dbVersion);
  		var newDBVersion = ++dbVersion;
		createDBTasksWithArgs(newDBVersion);
		exportFromDBTasks(newDBVersion);
	};

	request.onsuccess = function(event) {
		var db = request.result;
		console.log("fn exportFromDBTasks() - openRequest Success");

		db.onerror = function(event) {
	  // Gestionnaire d'erreur générique pour toutes les erreurs de requêtes de cette base
		console.log("Database error: " + event.target.errorCode);
		};

		try {
			var objectStoreTasks = db.transaction("taskObjSt", "readonly").objectStore("taskObjSt");

			try {
				console.log("try exportFromDBTasks()");
				var exportItemRequest =  db.transaction("taskObjSt", "readonly").objectStore("taskObjSt");
				exportItemRequest.openCursor(null,'prev').onsuccess = function(event) {
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
						toCSVFile("tasks",exportPrep);
					}
				}

		}
				catch (e) {
					var newDBVersion = ++dbVersion;
					createDBTasksWithArgs(newDBVersion);
					exportFromDBTasks(newDBVersion);
				}
			//}
		
		}
		catch {
			console.log("catch exportFromDBTasks()");
			var newDBVersion = ++dbVersion;
			createDBTasksWithArgs(newDBVersion);
			console.log("catch exportFromDBTasks() - createDBTasksWithArgs()");
			exportFromDBTasks(newDBVersion);
			console.log("catch exportFromDBTasks() - exportFromDBTasks(newDBVersion)");
		}
	}
}
// ======= Export de fichiers - CSV - FIN ======= //

// ======= IndexedDB ======= //
/*Fonction pour 
1- Vérifier existence d'une DB
2- Récupérer la version si elle existe*/
function getVersion(dbName) {

	var request = window.indexedDB.open(dbName); 

	request.onerror = function(event) {
  		console.log("getVersion() - Request Error : "+event.target.errorCode);
	};

	request.onsuccess = function(event) {
	  var db = request.result;
	  var dbVersionTasks = db.version;
	  storageLocal(dbName,dbVersionTasks);
	};
}

function latestdbVersionTasks(dbName) {
		getVersion(dbName);		
		return window.localStorage.getItem(dbName);
}

// ======= IndexedDB - fn non utilisées ======= //
function createDBTasks() {
	//-- Ouverture 
	var request = window.indexedDB.open(dbNameTasks, dbVersionTasks); 
	
	// Gérer le succès / l'échec de la création / de l'ouverture
	request.onerror = function(event) {
  		console.log("Request Error : "+event.target.errorCode);
  		/* A AJOUTER 
  		- test si conflit de version + affichage des 2 versions
  		- possibilité de tenter ouverture avec changement de #version*/
	};

	request.onsuccess = function(event) {
	  var db = request.result;
	  console.log("createRequest Success");

	  db.onerror = function(event) {
	  // Gestionnaire d'erreur générique pour toutes les erreurs de requêtes de cette base
	  console.log("Database error: " + event.target.errorCode);
		};
	};
	
	// Structure de la base de données
	request.onupgradeneeded = function(event) {
	console.log("fn createDBTasks() - request.onupgradeneeded");

	var db = event.target.result;
	var dbObjectStore = db.createObjectStore("taskObjSt", {keyPath: 'tk_id', autoIncrement: true});

	dbObjectStore.createIndex('tk_date_created', 'tk_date_created', {unique : false});
	dbObjectStore.createIndex('tk_domain', 'tk_domain', {unique : false});
	dbObjectStore.createIndex('tk_status', 'tk_status', {unique : false});
	dbObjectStore.createIndex('tk_deadline', 'tk_deadline', {unique : false});
	dbObjectStore.createIndex('tk_progress', 'tk_progress', {unique : false});
	dbObjectStore.createIndex('tk_text', 'tk_text', {unique : true});
	dbObjectStore.createIndex('tk_comment', 'tk_comment', {unique : false});
	dbObjectStore.createIndex('tk_date_update', 'tk_date_update', {unique : false});
	//dbObjectStore.createIndex('tk_date_closing', 'tk_date_closing', {unique : false});
	}		
}

function openDBTasks(dbVersion = dbVersionTasks) {
	//-- Ouverture / création
	var request = window.indexedDB.open(dbNameTasks, dbVersion); 
	
	// Gérer le succès / l'échec de la création / de l'ouverture
	request.onerror = function(event) {
  		console.log("Request Error : "+event.target.errorCode);
  		//  A AJOUTER 
  		// - test si conflit de version + affichage des 2 versions
  		// - possibilité de tenter ouverture avec changement de #version
	};

	// Structure de la base de données
	request.onupgradeneeded = function(event) {
		//console.log("fn addListToDBTasks() - request.onupgradeneeded");

		var db = event.target.result;
		var dbObjectStore = db.createObjectStore("taskObjSt", {keyPath: 'tk_id', autoIncrement: true});
		dbObjectStore.createIndex('tk_date_created', 'tk_date_created', {unique : false});
		dbObjectStore.createIndex('tk_domain', 'tk_domain', {unique : false});
		dbObjectStore.createIndex('tk_status', 'tk_status', {unique : false});
		dbObjectStore.createIndex('tk_deadline', 'tk_deadline', {unique : false});
		dbObjectStore.createIndex('tk_progress', 'tk_progress', {unique : false});
		dbObjectStore.createIndex('tk_text', 'tk_text', {unique : true});
		dbObjectStore.createIndex('tk_comment', 'tk_comment', {unique : false});
		dbObjectStore.createIndex('tk_date_update', 'tk_date_update', {unique : false});
		//dbObjectStore.createIndex('tk_date_closing', 'tk_date_closing', {unique : false});
	}	

	request.onsuccess = function(event) {
	  var db = request.result;
	  //console.log("openRequest Success");

	  db.onerror = function(event) {
	  // Gestionnaire d'erreur générique pour toutes les erreurs de requêtes de cette base
	  console.log("Database error: " + event.target.errorCode);
		};

		objectStoreTasks = db.transaction("taskObjSt", "readwrite").objectStore("taskObjSt");

		var db = request.result;
	  console.log("openRequest Success");

		try {
			var objectStoreTasks = db.transaction("taskObjSt", "readwrite").objectStore("taskObjSt");
		}
		catch (e) {
			var newDBVersion = ++dbVersion;
			openDBTasks(newDBVersion);
		}
				
		db.close();
	};	
}

function cleanObjectStoreStoreTasks() {
	//-- Ouverture / création
	var request = window.indexedDB.open(dbNameTasks, dbVersionTasks); 
	
	// Gérer le succès / l'échec de la création / de l'ouverture
	request.onerror = function(event) {
  		console.log("Request Error : "+event.target.errorCode);
  		/* A AJOUTER 
  		- test si conflit de version + affichage des 2 versions
  		- possibilité de tenter ouverture avec changement de #version*/
	};

	request.onsuccess = function(event) {
	  var db = request.result;
	  console.log("openRequest Success");

	  db.onerror = function(event) {
	  // Gestionnaire d'erreur générique pour toutes les erreurs de requêtes de cette base
	  console.log("Database error: " + event.target.errorCode);
		};

		var taskObjectTransaction = db.transaction("taskObjSt", "readwrite");

		// en cas de succès de l'ouverture de la transaction
		taskObjectTransaction.oncomplete = function(event) {
			console.log("Transaction complétée : modification de la base de données terminée.");
		  };

		// en cas d'échec de l'ouverture de la transaction
		taskObjectTransaction.onerror = function(event) {
		     console.log("Transaction en échec à cause de l\'erreur : ' + transaction.error");
		  };

		var taskObjectClearRequest = db.transaction("taskObjSt", "readwrite").objectStore("taskObjSt").clear();

		taskObjectClearRequest.onsuccess = function(event){		
			console.log("Enregistrements effacés");
		}
	};	
}
// ======= IndexedDB - fn non utilisées - FIN ======= //

function createDBTasksWithArgs(newDBVersion) {
	//-- Ouverture 
	var request = window.indexedDB.open(dbNameTasks, newDBVersion); 
	
	// Gérer le succès / l'échec de la création / de l'ouverture
	request.onerror = function(event) {
  		console.log("Request Error : "+event.target.errorCode);
  		/* A AJOUTER 
  		- test si conflit de version + affichage des 2 versions
  		- possibilité de tenter ouverture avec changement de #version*/
	};

	request.onsuccess = function(event) {
	  var db = request.result;
	  console.log("createRequest Success");

	  db.onerror = function(event) {
	  // Gestionnaire d'erreur générique pour toutes les erreurs de requêtes de cette base
	  console.log("Database error: " + event.target.errorCode);
		};
	};
	
	// Structure de la base de données
	request.onupgradeneeded = function(event) {
	console.log("fn createDBTasksWithArgs() - request.onupgradeneeded");

	var db = event.target.result;

	var listObjectStore = db.objectStoreNames;

	if (listObjectStore.contains("taskObjSt")) {
		console.log("L'objectstore 'taskObjSt' existe déjà");
	
	}
	else {
		var dbObjectStore = db.createObjectStore("taskObjSt", {keyPath: 'tk_id', autoIncrement: true});
	}

	dbObjectStore.createIndex('tk_date_created', 'tk_date_created', {unique : false});
	dbObjectStore.createIndex('tk_domain', 'tk_domain', {unique : false});
	dbObjectStore.createIndex('tk_status', 'tk_status', {unique : false});
	dbObjectStore.createIndex('tk_deadline', 'tk_deadline', {unique : false});
	dbObjectStore.createIndex('tk_progress', 'tk_progress', {unique : false});
	dbObjectStore.createIndex('tk_text', 'tk_text', {unique : true});
	dbObjectStore.createIndex('tk_comment', 'tk_comment', {unique : false});
	dbObjectStore.createIndex('tk_date_update', 'tk_date_update', {unique : false});
	//dbObjectStore.createIndex('tk_date_closing', 'tk_date_closing', {unique : false});
	}		
}

function storeObjectStoreCount(dbName, dbVersionTasks, currentObjectStore){
	//console.log(currentObjectStore);

	var request = window.indexedDB.open(dbNameTasks, dbVersionTasks); 
	
	// Gérer le succès / l'échec de la création / de l'ouverture
	request.onerror = function(event) {
  		console.log("Request Error : "+event.target.errorCode);
  		/* A AJOUTER 
  		- test si conflit de version + affichage des 2 versions
  		- possibilité de tenter ouverture avec changement de #version*/
	};

	request.onsuccess = function(event) {
	  var db = request.result;
	  console.log("fn getObjectStoreCount - openRequest Success");

	  db.onerror = function(event) {
	  // Gestionnaire d'erreur générique pour toutes les erreurs de requêtes de cette base
	  console.log("Database error: " + event.target.errorCode);
		};

	var itemsCount =  db.transaction(currentObjectStore.name, "readonly").objectStore(currentObjectStore.name).count();
	itemsCount.onsuccess = function() {
		//console.log(itemsCount.result);
		storageLocal("latestItemsCountTasks",itemsCount.result);
		}
	/* FAIL
	//Stockage de l'ID de la dernière tâche en base
	var itemReq =  db.transaction(currentObjectStore.name, "readonly").objectStore(currentObjectStore.name).get(itemsCount.result);
	console.log(itemReq);
	itemReq.onsuccess = function() {
			storageLocal("latestUsedId",itemReq.result.tk_id);
		}*/
	};
}

function storeLatestIdTask (currentObjectStore) {
	//console.log(currentObjectStore);


	var allKeysRequest =  currentObjectStore.getAllKeys();
	

	allKeysRequest.onsuccess = function(event) {
		var allItems = event.target.result;
		storageLocal("latestUsedIdTask",allItems[allItems.length-1]);
	}
	
}

function setUpLatestIdTask() {


}

// Ajout d'une tâche à la DB depuis une liste - Appel dans fn addListToDBTasks()
function addItemToDBTasks(task,objectStore) {
    
    var obj = { 
    	tk_id: task.tk_id,
		tk_date_created: task.tk_date_created,
		tk_text: task.tk_text,
		tk_domain: task.tk_domain,
		tk_status: task.tk_status,
		tk_deadline: task.tk_deadline,
		tk_progress: task.tk_progress,
		tk_comment: task.tk_comment,
		tk_date_update: task.tk_date_update
		//, tk_date_closing: task.tk_date_closing
	};

    if (typeof blob != 'undefined')
      obj.blob = blob;
    
    try {
    	var store = objectStore;
    	var req;
      	req = store.add(obj);
      //console.log("task"+obj.tk_id + "added");
    } catch (e) {
      	if (e.name == 'DataCloneError')
        displayActionFailure("This engine doesn't know how to clone a Blob, "+"use Firefox");
      	throw e;
    }
    req.onsuccess = function (evt) {
      console.log("Insertion in DB successful - "+obj.tk_id);
      //displayActionSuccess();
    };
    req.onerror = function() {
      console.error("addItemToDBTasks", this.error);
      //displayActionFailure(this.error);
    };
}

function displayActionSuccess(msg) {
    // msg = typeof msg != 'undefined' ? "Success: " + msg : "Success";
    // $('#msg').html('<span class="action-success">' + msg + '</span>');
    console.log(msg);
}

function displayActionFailure(msg) {
    // msg = typeof msg != 'undefined' ? "Failure: " + msg : "Failure";
    // $('#msg').html('<span class="action-failure">' + msg + '</span>');
    console.log(msg);
}

function addListToDBTasks(taskArray, dbVersion = dbVersionTasks) {

	//-- Ouverture / création
	console.log("pre opening request - addListToDBTasks - "+ dbNameTasks);
	var request = window.indexedDB.open(dbNameTasks, dbVersion); 
	console.log("post opening request - addListToDBTasks - "+ dbNameTasks);
	// console.log(request);
	// console.log(request.readyState);


	getVersion(dbNameTasks);
	
	// Gérer le succès / l'échec de la création / de l'ouverture
	request.onerror = function(event) {

		var currentDBVersion = window.localStorage.getItem(dbNameTasks);
		console.log("addListToDBTasks() - Request Error : "+event.target.errorCode+" - prev : "+currentDBVersion);
		
		var newDBVersion = ++currentDBVersion;
		console.log("addListToDBTasks() - Request Error : "+event.target.errorCode+" - new : "+newDBVersion);

 		//createDBTasksWithArgs(newDBVersion);
		addListToDBTasks(taskArray, newDBVersion);
	};

	// Structure de la base de données
	request.onupgradeneeded = function(event) {
		console.log("fn addListToDBTasks() - request.onupgradeneeded");

		var db = event.target.result;

		var listObjectStore = db.objectStoreNames;
		console.log(listObjectStore.contains("taskObjSt"));
		
		if (listObjectStore.contains("taskObjSt")){
				console.log("L'objectstore 'taskObjSt' existe déjà");

		}
		else {
			var dbObjectStore = db.createObjectStore("taskObjSt", {keyPath: 'tk_id', autoIncrement: true});
		}
		
		dbObjectStore.createIndex('tk_date_created', 'tk_date_created', {unique : false});
		dbObjectStore.createIndex('tk_domain', 'tk_domain', {unique : false});
		dbObjectStore.createIndex('tk_status', 'tk_status', {unique : false});
		dbObjectStore.createIndex('tk_deadline', 'tk_deadline', {unique : false});
		dbObjectStore.createIndex('tk_progress', 'tk_progress', {unique : false});
		dbObjectStore.createIndex('tk_text', 'tk_text', {unique : true});
		dbObjectStore.createIndex('tk_comment', 'tk_comment', {unique : false});
		dbObjectStore.createIndex('tk_date_update', 'tk_date_update', {unique : false});
		//dbObjectStore.createIndex('tk_date_closing', 'tk_date_closing', {unique : false});
	}		
	console.log("addListToDBTasks() - post onupgradeneeded");
	
	request.onblocked = function(event) {
		alert("Bloqué !");
	}

	request.onsuccess = function(event) {
		var db = request.result;
		console.log("addListToDBTasks() - openRequest Success");

		db.onerror = function(event) {
	  // Gestionnaire d'erreur générique pour toutes les erreurs de requêtes de cette base
			console.log("Database error: " + event.target.errorCode);
		};

		try {
			console.log("try addListToDBTasks()");
			var objectStoreTasks = db.transaction("taskObjSt", "readwrite").objectStore("taskObjSt");
			
			console.log("addListToDBTasks()"+objectStoreTasks.name);
			
			for(let i in taskArray) {
			addItemToDBTasks(taskArray[i],objectStoreTasks);
			}
		}

		catch {
			console.log("catch addListToDBTasks()");
			
			getVersion(dbNameTasks);
			var currentDBVersion = window.localStorage.getItem(dbNameTasks);
			console.log("addListToDBTasks() - catch - Error : "+event.target.errorCode+"- prev : "+currentDBVersion);
		
			var newDBVersion = ++currentDBVersion;
			console.log("addListToDBTasks() - catch - Error : "+event.target.errorCode+" - new : "+newDBVersion);

			addListToDBTasks(taskArray, newDBVersion);
		}
		

		db.close();
	};
	console.log("addListToDBTasks() - post onsuccess");	
}
// ======= IndexedDB - FIN ======= //


// ======= Affichage des tâches ======= //
// function showTasksTable() {
// 	if (document.getElementById("tasksTable").style.display === "none") {
// 	    changeDisplay(document.getElementById("tasksTable"));
// 	} 
// }

// Affichage d'un item comme ligne de tableau
function printItemTasks(item){
	//console.log(item);
	//console.log("printItemTasks()");
	//console.log(item);
	//console.log(item.tk_id);

	//let itemTask = "<td class=\"to_do_list_item\">"+item.tk_id+"</td><td class=\"to_do_list_item\">"+item.tk_date_created+"</td><td class=\"to_do_list_item\">"+item.tk_text+"</td><td class=\"to_do_list_item\">"+item.tk_domain+"</td><td class=\"to_do_list_item\">"+item.tk_status+"</td><td class=\"to_do_list_item\">"+item.tk_deadline+"</td><td class=\"to_do_list_item\">"+item.tk_progress+"</td><td class=\"to_do_list_item_actions\"><button id=\"item"+item.tk_id+"_btnM\" class=\"btn btn-info btn-modify\"> M </button><button id=\"item"+item.tk_id+"_btnF\" class=\"btn btn-info btn-close\"> F </button>";
	let itemID = "task"+item.tk_id;
	//console.log(itemID);
	
	var deadline_date = new Date(item.tk_deadline);
	//console.log(itemID+" "+deadline_date);
	let deadline_formatted = new Intl.DateTimeFormat(['fr']).format(deadline_date);

	let status_formatted = (openProgressValues.includes(item.tk_progress) && urgentStatusValues.includes(item.tk_status)) ? "<td id=\""+itemID+"_status\" class=\"to_do_list_item urgent_task\">"+item.tk_status+"</td>" : "<td id=\""+itemID+"_status\" class=\"to_do_list_item\">"+item.tk_status+"</td>";

	// let itemTask = "<td id=\""+itemID+"_id\" class=\"to_do_list_item\">"+item.tk_id+"</td><td id=\""+itemID+"_date_created\" class=\"to_do_list_item\">"+item.tk_date_created+"</td><td id=\""+itemID+"_text\" class=\"to_do_list_item\">"+item.tk_text+"</td><td id=\""+itemID+"_domain\" class=\"to_do_list_item\">"+item.tk_domain+"</td><td id=\""+itemID+"_status\" class=\"to_do_list_item\">"+item.tk_status+"</td><td id=\""+itemID+"_deadline\" class=\"to_do_list_item\">"+deadline_formatted+"</td><td id=\""+itemID+"_progress\" class=\"to_do_list_item\">"+item.tk_progress+"</td><td id=\""+itemID+"_actions\" class=\"to_do_list_item_actions\"><button id=\"item"+item.tk_id+"_btnM\" class=\"btn btn-info btn-modify\"> M </button><button id=\"item"+item.tk_id+"_btnV\" class=\"btn btn-info btn-view\"> V </button>";

	let itemTask = "<td id=\""+itemID+"_id\" class=\"to_do_list_item\">"+item.tk_id+"</td><td id=\""+itemID+"_date_created\" class=\"to_do_list_item\">"+item.tk_date_created+"</td><td id=\""+itemID+"_text\" class=\"to_do_list_item\">"+item.tk_text+"</td><td id=\""+itemID+"_domain\" class=\"to_do_list_item\">"+item.tk_domain+"</td>"+status_formatted+"<td id=\""+itemID+"_deadline\" class=\"to_do_list_item\">"+deadline_formatted+"</td><td id=\""+itemID+"_progress\" class=\"to_do_list_item\">"+item.tk_progress+"</td><td id=\""+itemID+"_actions\" class=\"to_do_list_item_actions\"><button id=\"item"+item.tk_id+"_btnM\" class=\"btn btn-info btn-modify\"> M </button>";
	//console.log(itemTask);

	/*v1*/
	var row = document.createElement("tr");
	row.id = itemID;
	row.innerHTML = itemTask;
	
	tableToDoList.appendChild(row);
	

	//console.log(row.id);
	//console.log(document.getElementById(row.tk_id));

	/*v2 => NON RETENUE > perte de l'alternance des couleurs + création d'un tbody à chaque ligne ajoutée*/
	//var row = "<tr id=\""+itemID+"\">"+itemTask+"</tr>";
	//tableToDoList.insertAdjacentHTML("beforeend",row);

	/*
	// Ajout de l'eventListener sur le bouton "Fermer"
	var btnF = "item"+item.tk_id+"_btnF";

	document.getElementById(btnF).addEventListener("click",function(){
  	//console.log(document.getElementById(row.tk_id));
  	document.getElementById(row.tk_id).classList.toggle("closed")});
  	*/

  	/*
	// Ajout de l'eventListener sur le bouton "Voir"
	var btnV = "item"+item.tk_id+"_btnV";

	document.getElementById(btnV).addEventListener("click",function(){
  	
  	});*/
 

  	// Ajout de l'eventListener sur le bouton "Modifier"
	var btnM = "item"+item.tk_id+"_btnM";

	document.getElementById(btnM).addEventListener("click",function(){
  	//console.log(document.getElementById(row.tk_id));
  		showTaskToUpdate(item);
		
  	});
}

function printFromDBTasks(range = "all",dbVersion = dbVersionTasks) {
	//-- Ouverture / création
	//var request = window.indexedDB.open(dbNameTasks,dbVersionTasks);
	var request = window.indexedDB.open(dbNameTasks, dbVersion); 
	getVersion(dbNameTasks);
	
	// Gérer le succès / l'échec de la création / de l'ouverture
	request.onerror = function(event) {
		var currentDBVersion = window.localStorage.getItem(dbNameTasks)
		var newDBVersion = ++currentDBVersion;
		// var newDBVersion = ++dbVersion;

  		console.log("printFromDBTasks() - Request Error : "+event.target.errorCode+" - prev : "+currentDBVersion+" - new : "+newDBVersion);
  		
		createDBTasksWithArgs(newDBVersion);
		printFromDBTasks(newDBVersion);

  		/* A AJOUTER 
  		- test si conflit de version + affichage des 2 versions
  		- possibilité de tenter ouverture avec changement de #version*/
	};

	request.onsuccess = function(event) {
		var db = request.result;
		console.log("fn printFromDBTasks() - openRequest Success");

		db.onerror = function(event) {
	  // Gestionnaire d'erreur générique pour toutes les erreurs de requêtes de cette base
		console.log("Database error: " + event.target.errorCode);
		};

		try {
			var objectStoreTasks = db.transaction("taskObjSt", "readonly").objectStore("taskObjSt");

				try {
					console.log("try printFromDBTasks()");

					var itemRequest =  db.transaction("taskObjSt", "readonly").objectStore("taskObjSt");
					itemRequest.openCursor(null,'prev').onsuccess = function(event) {
						var cursor = event.target.result;
						//console.log("itemRequest.openCursor");
	
						if (cursor) {
							switch(range) {
								case "open":
									if (openProgressValues.includes(cursor.value.tk_progress)) {
										showElement(openTasksSortBtn);
										printItemTasks(cursor.value);

									}
									break;
								case "closed":
									if (closedProgressValues.includes(cursor.value.tk_progress)) {
										showElement(closedTasksSortBtn);
										printItemTasks(cursor.value);
									}
									break;
								default :
								showElement(allTasksSortBtn);
								printItemTasks(cursor.value);
							}
							cursor.continue();
						}
						else {
							console.log('Plus de tâches à afficher');
							storeLatestIdTask (itemRequest);
						}
							
					}

				}
				catch (e) {
					var newDBVersion = ++dbVersion;
					createDBTasksWithArgs(newDBVersion);
					printFromDBTasks(newDBVersion);

				}

			//}
			// showTasksTable();
			showElement(tasksTable);
			
		}
		catch {
			console.log("catch printFromDBTasks()");
			var newDBVersion = ++dbVersion;
			createDBTasksWithArgs(newDBVersion);
			console.log("catch printFromDBTasks() - createDBTasksWithArgs()");
			printFromDBTasks(newDBVersion);
			console.log("catch printFromDBTasks() - printFromDBTasks(newDBVersion)");
		}
	}
}

function resetTaskTable() {
	let blankTableHTML= "<tr id = \"tasksTableHeaders\"><th class=\"to_do_list_th\">#</th><th class=\"to_do_list_th\">Créé le</th><th class=\"to_do_list_th\">Tâche</th>	<th class=\"to_do_list_th\">Domaine</th><th class=\"to_do_list_th\">Statut</th><th class=\"to_do_list_th\">Echéance</th><th class=\"to_do_list_th\">Progression</th><th class=\"to_do_list_th\">Actions</th></tr><tr id=\"taskList\"></tr>";

	tableToDoList.innerHTML = blankTableHTML;
}


function resetSortBtnZones() {
	console.log("resetSortBtnZones");
	var buttonZones = Array.from(document.querySelectorAll(".sort-btn-zone"));
	console.log(buttonZones);
	hideAll(buttonZones);
}

function resetDisplay() {
	resetTaskTable();
	resetSortBtnZones();
	hideElement(document.getElementById("formAddTaskDiv"));
	hideElement(document.getElementById("formChangeTaskDiv"));
}

function refreshTaskTable(range = "open") {
	resetDisplay();

  	printFromDBTasks(range);
  	//showTasksTable();

  	showElement(tasksTable);
  	// document.getElementById("hideTaskList").innerHTML = "Cacher la liste";
}
// ======= Affichage des tâches - FIN ======= //


// ======= Ajout d'une tâche ======= //
// Ajout d'une tâche depuis le formulaire de création
function insertNewItemIntoDB(task, dbVersion = dbVersionTasks) {
	//-- Ouverture / création
	var request = window.indexedDB.open(dbNameTasks, dbVersion); 
	
	// Gérer le succès / l'échec de la création / de l'ouverture
	request.onerror = function(event) {
  		console.log("Request Error : "+event.target.errorCode);
  		var newDBVersion = ++dbVersion;
		insertNewItemIntoDB(task, newDBVersion);
  	};

	// Structure de la base de données
	request.onupgradeneeded = function(event) {
		//console.log("fn addListToDBTasks() - request.onupgradeneeded");

		var db = event.target.result;
		var dbObjectStore = db.createObjectStore("taskObjSt", {keyPath: 'tk_id', autoIncrement: true});
		dbObjectStore.createIndex('tk_date_created', 'tk_date_created', {unique : false});
		dbObjectStore.createIndex('tk_domain', 'tk_domain', {unique : false});
		dbObjectStore.createIndex('tk_status', 'tk_status', {unique : false});
		dbObjectStore.createIndex('tk_deadline', 'tk_deadline', {unique : false});
		dbObjectStore.createIndex('tk_progress', 'tk_progress', {unique : false});
		dbObjectStore.createIndex('tk_text', 'tk_text', {unique : true});
		dbObjectStore.createIndex('tk_comment', 'tk_comment', {unique : false});
		dbObjectStore.createIndex('tk_date_update', 'tk_date_update', {unique : false});
		//dbObjectStore.createIndex('tk_date_closing', 'tk_date_closing', {unique : false});
	}	

	request.onsuccess = function(event) {
		var db = request.result;
	  //console.log("openRequest Success");

		db.onerror = function(event) {
	  // Gestionnaire d'erreur générique pour toutes les erreurs de requêtes de cette base
	  console.log("Database error: " + event.target.errorCode);
		};

		objectStoreTasks = db.transaction("taskObjSt", "readwrite").objectStore("taskObjSt");

		var db = request.result;
	 	console.log("openRequest Success");

		try {
			console.log("try insertNewItemIntoDB()");
			var objectStoreTasks = db.transaction("taskObjSt", "readwrite").objectStore("taskObjSt");
			try {
				addItemToDBTasks(task,objectStoreTasks);
				refreshTaskTable()
				hideElement(document.getElementById("formAddTaskDiv"));
			}
			catch (e) {
				console.log (e.message);
				alert("La tentative d'ajout pour la tâche "+task.tk_id+" a échoué.");
			}
			
		}
		catch (e) {
			console.log("catch insertNewItemIntoDB()");
			var newDBVersion = ++dbVersion;
			insertNewItemIntoDB(task, newDBVersion);
		}
				
		db.close();
	};	
}

function createTaskFromAddForm() {
	//console.log("yep !"); //=> PAS EXECUTE 
	var taskArgsAdd = [];
	
	// var tk_id = document.getElementById("input-tk-id").value;
	var latestUsedIdIntTask = parseInt(window.localStorage.getItem("latestUsedIdTask"));
	var tk_id = latestUsedIdIntTask + 1;


	var tk_date_created = new Intl.DateTimeFormat(['fr']).format(current_date);

	var tk_text = document.getElementById("input-tk-text").value;
	var tk_domain = domainValues[document.getElementById("input-tk-domain").value];
	var tk_status = statusValues[document.getElementById("input-tk-status").value];

	var tk_deadline = document.getElementById("input-tk-deadline").value;
	//console.log(tk_deadline+"-"+typeof(tk_deadline)); //=> PAS EXECUTE > passage par alert

	var tk_progress = progressValues[document.getElementById("input-tk-progress").value];

	var tk_comment = document.getElementById("input-tk-comment").value;

	taskArgsAdd.push(tk_id, tk_date_created, tk_text, tk_domain, tk_status, tk_deadline, tk_progress, tk_comment);
	var newTask = new Task(taskArgsAdd); 
	insertNewItemIntoDB(newTask);
	
	alert("Tâche "+newTask.tk_id+" ajoutée");
	clearForm("formAddTask");

}
// ======= Ajout d'une tâche - FIN ======= //


// ======= Modification d'une tâche  ======= //
// Mise à jour d'une tâche depuis le formulaire de création
function updateItemIntoDB(task, dbVersion = dbVersionTasks) {
	//-- Ouverture / création
	var request = window.indexedDB.open(dbNameTasks, dbVersion); 
	
	// Gérer le succès / l'échec de la création / de l'ouverture
	request.onerror = function(event) {
  		console.log("Request Error : "+event.target.errorCode);
  		var newDBVersion = ++dbVersion;
		updateItemIntoDB(task, newDBVersion);
	};

	// Structure de la base de données
	request.onupgradeneeded = function(event) {
		//console.log("fn addListToDBTasks() - request.onupgradeneeded");

		var db = event.target.result;
		var dbObjectStore = db.createObjectStore("taskObjSt", {keyPath: 'tk_id', autoIncrement: true});
		dbObjectStore.createIndex('tk_date_created', 'tk_date_created', {unique : false});
		dbObjectStore.createIndex('tk_domain', 'tk_domain', {unique : false});
		dbObjectStore.createIndex('tk_status', 'tk_status', {unique : false});
		dbObjectStore.createIndex('tk_deadline', 'tk_deadline', {unique : false});
		dbObjectStore.createIndex('tk_progress', 'tk_progress', {unique : false});
		dbObjectStore.createIndex('tk_text', 'tk_text', {unique : true});
		dbObjectStore.createIndex('tk_comment', 'tk_comment', {unique : false});
		dbObjectStore.createIndex('tk_date_update', 'tk_date_update', {unique : false});
		//dbObjectStore.createIndex('tk_date_closing', 'tk_date_closing', {unique : false});
	}	

	request.onsuccess = function(event) {
		var db = request.result;
	  //console.log("openRequest Success");

		db.onerror = function(event) {
	  // Gestionnaire d'erreur générique pour toutes les erreurs de requêtes de cette base
	  console.log("Database error: " + event.target.errorCode);
		};

		try {
			objectStoreTasks = db.transaction("taskObjSt", "readwrite").objectStore("taskObjSt");
			//console.log(task.tk_id);
		
			var updateRequest = objectStoreTasks.get(task.tk_id);
		 	
		 	updateRequest.onerror = function(event) {
		 		console.log ("updateRequest - Erreur :"+e.message);
		 	}

		 	updateRequest.onsuccess = function(event) {
		 		console.log("updateRequest Success");
		 		var itemToUpdate = updateRequest.result;
		 		console.log(itemToUpdate);

				try {
				
					var updateKeys = Object.keys(task);
					var updateEntries = Object.entries(task);

					var beforeKeys = Object.keys(itemToUpdate);
					var beforeEntries = Object.entries(itemToUpdate);

					beforeKeys.forEach (key =>{
						
						if (!Object.is(itemToUpdate[key],task[key])){
							itemToUpdate[key] = task[key];
						}
					});

					var updateDBRequest = objectStoreTasks.put(itemToUpdate);
					updateDBRequest.onerror = function(event) {
						console.log("updateRequest - Echec de la mise à jour de la base de données pour la tâche "+task.tk_id+" - "+e.message);
					}

					updateDBRequest.onsuccess = function(event) {
						
						alert("Tâche "+task.tk_id+" mise à jour");
						document.getElementById('formChangeTaskDiv').style.display="none";
						refreshTaskTable();
					}

				}
				catch (e) {
					console.log (e.message);
					alert("La tentative de mise à jour pour la tâche "+task.tk_id+" a échoué.");
				}
			}
			
		}
		catch (e) {
			console.log("catch updateItemIntoDB()");
			var newDBVersion = ++dbVersion;
			updateItemIntoDB(task, newDBVersion);
		}
				
		db.close();
	};	
}

function showTaskToUpdate(taskObject) {
	document.getElementById('formChangeTaskDiv').style.display="block";
	document.getElementById('hideFormChangeTaskDiv').focus();


	document.getElementById('chg_creation_date').innerHTML = taskObject.tk_date_created;
	document.getElementById('chg_update_time').innerHTML = taskObject.tk_date_update;
	document.getElementById('input-chg-tk-deadline').value = taskObject.tk_deadline;
	document.getElementById('chg_tk_id').innerHTML = taskObject.tk_id;

	document.getElementById('input-chg-tk-status').value = getKey(taskObject.tk_status, statusArray);

	document.getElementById('input-chg-tk-domain').value = getKey(taskObject.tk_domain, domainArray);

	document.getElementById('input-chg-tk-progress').value = getKey(taskObject.tk_progress, progressArray);

	document.getElementById('input-chg-tk-text').value = taskObject.tk_text;

	document.getElementById('input-chg-tk-comment').value = taskObject.tk_comment;
}

function updateTaskData() {
	var taskArgsUpdate = [];
	
	var tk_id = document.getElementById("chg_tk_id").innerHTML;
	
	var tk_date_created = document.getElementById("chg_creation_date").innerHTML;

	var tk_text = document.getElementById("input-chg-tk-text").value;
	var tk_domain = domainValues[document.getElementById("input-chg-tk-domain").value];
	var tk_status = statusValues[document.getElementById("input-chg-tk-status").value];
	var tk_deadline = document.getElementById("input-chg-tk-deadline").value;
	var tk_progress = progressValues[document.getElementById("input-chg-tk-progress").value];

	var tk_comment = document.getElementById("input-chg-tk-comment").value;

	var tk_date_update = current_day_short_EN+" "+current_time;

	taskArgsUpdate.push(tk_id, tk_date_created, tk_text, tk_domain, tk_status, tk_deadline, tk_progress, tk_comment,tk_date_update);
	var newTask = new Task(taskArgsUpdate); 
	updateItemIntoDB(newTask);

}

// ======= Modification d'une tâche - FIN ======= //


// ======= Initialisation ======= //

// Intialiser les affichages et eventListener
function pageSetup(){
	// Ajout des eventListener
		
	// Bouton "Ajouter une tâche"
	document.getElementById("addToDoListItem").addEventListener("click",function(){
		var latestUsedIdIntTask = parseInt(window.localStorage.getItem("latestUsedIdTask"));
	document.getElementById("generated_id").innerHTML = latestUsedIdIntTask + 1;
		showElement(document.getElementById("formAddTaskDiv"));});

	// Bouton "Effacer les données"
	document.getElementById('cleartaskObjSt').addEventListener('click', function(){
		try {	

			/*v1*/
			// var deleteRequest = indexedDB.deleteDatabase("toDoListDB");
			// console.log("deleteRequest - ongoing "+deleteRequest.readyState);

			// deleteRequest.onblocked = function(e) {
			// 	console.log("DB open blocked", e);
			// 	alert("Veuillez fermer tous les autres onglets ouverts \npuis rafraîchir cet onglet \npour pouvoir effacer les données.");
			// };

			// deleteRequest.onerror = function(event) {
			// 	console.log("deleteRequest - ongoing step 2 "+deleteRequest.readyState);
			// 	console.log("Erreur lors de la suppression de la base 'toDoListDB'"+ event.target.errorCode);
			// };

			// deleteRequest.onsuccess = function(event) {
			// 	console.log("Suppression de la base 'toDoListDB' réussie");
			// 	alert("Les données ont été effacées");
				
				
			// 	resetDisplay();
			// 	showElement(tasksTable);
			// }
			confirm("Voulez-vous effacer cette liste ?\nLe contenu ne pourra pas être récupéré.");
			cleanObjectStoreStoreTasks();
			resetDisplay();
			window.localStorage.setItem("latestUsedIdTask","1");
			showElement(tasksTable);
			alert("Les données ont été effacées");

		} 
		catch (e){
			console.log("effacer la liste - fail : "+e.message);
		}
	
	});

	// // Bouton "Afficher la liste"
	// document.getElementById("hideTaskList").addEventListener("click",function(){
	// 	//document.getElementById("tasksTable").style.display="none";
	// 	changeBtnContent(document.getElementById("hideTaskList"), tasksTable, "Montrer la liste", "Cacher la liste");
	// 	showElement(tasksTable);

	// }); 

	// Bouton "Voir les tâches en cours"
	document.getElementById("showOpenToDoListItem").addEventListener("click", function(){
			resetDisplay();

  			printFromDBTasks("open");
  			showElement(openTasksSortBtn);
	});
	
	// Bouton "Voir les tâches fermées"
	document.getElementById("showClosedToDoListItem").addEventListener("click", function(){
			resetDisplay();

  			printFromDBTasks("closed");
  			showElement(closedTasksSortBtn);
	});

	// Bouton "Afficher toutes les tâches"
	document.getElementById("showAllToDoListItem").addEventListener("click", function(){
			resetDisplay();
  			
  			printFromDBTasks();
  			showElement(allTasksSortBtn);
	});
	// Bouton "Récupérer une liste externe"
	document.querySelector('input#taskExtListFile').addEventListener('change', handleUpload);


	// Bouton "Créer une liste"
	document.getElementById('createListBtn').addEventListener('click', function() {
		createDBTasks();
		showElement(tasksTable);
	});

	// Bouton "Cacher la zone de modification"
	document.getElementById("hideFormChangeTaskDiv").addEventListener('click', function() {hideElement(document.getElementById("formChangeTaskDiv"));});		

	// Bouton "Cacher la zone de modification"
	document.getElementById("hideFormAddTaskDiv").addEventListener('click', function() {hideElement(document.getElementById("formAddTaskDiv"));});	


	// Bouton "Exporter la liste"
	document.getElementById("exportList").addEventListener("click",function(){exportFromDBTasks();});

	// Ajout des eventListener - FIN


	// ==== Liste déroulante - Génération auto === //

	htmlDomainFields(domainField);
	htmlStatusFields(statusField); 
	htmlProgressFields(progressField);

	htmlDomainFields(domainFieldChange);
	htmlStatusFields(statusFieldChange); 
	htmlProgressFields(progressFieldChange);

	// ==== Liste déroulante - Génération auto - FIN === //

	printDayInfo();
}

// ======= Initialisation - FIN ======= //

window.onload = pageSetup();
// Vérification de la compatibilité du navigateur
if (!window.indexedDB) {
   window.alert("Votre navigateur ne supporte pas une version stable d'IndexedDB. Quelques fonctionnalités ne seront pas disponibles.")
	} 
else {
	console.log("IndexedDB OK !");
	}


//localStorage.clear();

