import * as Database from './Database.js';
import * as DateJS from './Date.js';
import * as DisplayJS from './Display.js';

// =======  Classe Task  ======= //
class Task {
	constructor(arrayTaskValues) {
		this.tkId = arrayTaskValues[0];
		this.tkDateCreated = arrayTaskValues[1];
		this.tkText = arrayTaskValues[2];
		this.tkDomain = arrayTaskValues[3];
		this.tkStatus = arrayTaskValues[4];
		this.tkDeadline = arrayTaskValues[5];
		this.tkProgress = arrayTaskValues[6];
		this.tkComment = arrayTaskValues[7];
		this.tkDateUpdate = arrayTaskValues[8];
		this.tkDateClosing = arrayTaskValues[9];
	}

	toString() {
		return "id : "+this.tkId+" / date_created : "+this.tkDateCreated+" / text : "+this.tkText+" / domain : "+this.tkDomain+" / status : "+this.tkStatus+" / deadline : "+this.tkDeadline+" / progress : "+this.tkProgress;
	} 

	toListOfStrings() {
		return this.tkId+","+this.tkDateCreated+","+this.tkText+","+this.tkDomain+","+this.tkStatus+","+this.tkDeadline+","+this.tkProgress;
	}

	setText(text) {
		this.tkText = text;
	}

	setDomain(text) {
		this.tkDomain = text;
	}

	setStatus(text) {
		this.tkStatus = text;
	}

	setDeadline(date) {
		this.tkDeadline = date;
	}

	setProgress(text) {
		this.tkProgress = text;
	}

	setLinked(linkedTasks) {
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
// =======  Classe Task - FIN  ======= //

// =  Variables pour gestion domaines / statuts / progressions  = //
var domainValues = {
"blankDomain": "À classer", "AcJ": "Acquisitions Jeunesse", "AnimJ": "Animation Jeunesse", "CatDoc": "Catalogage Documentaires", "CatJ": "Catalogage Jeunesse", "MDI": "Fonds MDI"
};

var domainDatalistOptions = ["Communication", "Formation des usagers", "Rédaction technique", "Suivi de l'activité du service", "Support"];

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


/*Getters pour les variables utilisées dans d'autres modules*/

export function getOpenProgressValues() {
	return openProgressValues;
}

export function getClosedProgressValues() {
	return closedProgressValues;
}

export function getUrgentStatusValues() {
	return urgentStatusValues;
}

export function getDomainArray() {
	return domainArray;
}
export function getStatusArray() {
	return statusArray;
}
export function getProgressArray() {
	return progressArray;
}

export function getDomainValues() {
	return domainValues;
}

export function getDomainDataListOptions() {
	return domainDatalistOptions;
}

export function getStatusValues() {
	return statusValues;
}
export function getProgressValues() {
	return progressValues;
}

// =  Variables pour gestion domaines / statuts / progressions  - FIN = //
// =======  Variables globales - FIN ======= //

// =======  Gestion des tableaux associatifs pour domaines / statuts / progressions  ======= //
export function getKey(searchedValue, arrayKV) {
	var testSearch = false;
	var i = 0;
	var foundKey = "";

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
// ======= Gestion des tableaux associatifs pour domaines / statuts / progressions - FIN ======= //

// =======  CSV ======= //
var csvHeader = "ID, Date, Description, Domaine, Statut, Échéance, Progression, Commentaire, Clôture, Dernière MAJ\n";



 
export function testCSVtype(file) {
	var fileName = file.name;
	var fileExtension = fileName.substr((fileName.lastIndexOf('.')+1)).toLowerCase();

	var csvUsedMIMEType = ['text/csv', 'application/csv', 'text/x-csv', 'application/x-csv', 'text/x-comma-separated-values', 'text/comma-separated-values', 'application/vnd.ms-excel'];

	console.log(fileName+" importé");

	return (fileExtension.localeCompare("csv") == 0) && csvUsedMIMEType.includes(file.type);
}

//Import
export function csvToArrayOfObjects(csvContent) {
	var allRows = csvContent.split(/\r?\n|\r/); // renvoie un tableau : 1 ligne entête + lignes des instances + 1 ligne vide
	console.log(allRows);
	var tasksArray = [];
	for(let i =1; i<(allRows.length-1);i++){
		var taskValues = allRows[i].split(",");
		var task = new Task(taskValues);

	
		
		if ((typeof(task.tkDateUpdate) === "string") 
		&& (task.tkDateUpdate.localeCompare("") == 0)) {
			task.tkDateUpdate = DateJS.timestampForUpdate();
		}
		tasksArray.push(task);
	}
	console.log(tasksArray);
	Database.useDB("import",tasksArray);
}

//Export
export function toCSVFile(exportType, exportArray) {
	
	var csvFileName = exportType+'-'+DateJS.dateForCSVFile();+'.csv';
	console.log(csvFileName);

	var csvExportContent = 'data:text/csv;charset=utf-8,'+csvHeader;
	exportArray.forEach(function(row){
		csvExportContent += row.join(',');
		csvExportContent += "\n";
	});
	//console.log(csvExportContent);
	var hiddenDownloadLink = document.createElement('a');
	
	var exportURI = encodeURI(csvExportContent);
	//console.log(exportURI);
	
	hiddenDownloadLink.setAttribute('href',exportURI);
	hiddenDownloadLink.target = '_blank';

	hiddenDownloadLink.setAttribute('download',csvFileName);
	document.body.appendChild(hiddenDownloadLink);
	hiddenDownloadLink.click();
}
// =======  CSV - FIN ======= //

// == Affichage des tâches ==> VOIR Display.js == //

// ======= Ajout d'une tâche ======= //
// Ajout d'une tâche depuis le formulaire de création
export function createTaskFromAddForm() {
	var taskArgsAdd = [];
	
	var latestUsedIdIntTask = parseInt(window.localStorage.getItem("latestUsedIdTask"));
	var tkId = (latestUsedIdIntTask + 1).toString();


	var tkDateCreated = new Intl.DateTimeFormat(['fr']).format(new Date());

	var tkText = document.getElementById("input-tk-text").value;
	var tkDomain = document.getElementById("input-tk-domain").value;
	var tkStatus = statusValues[document.getElementById("input-tk-status").value];

	var tkDeadline = document.getElementById("input-tk-deadline").value;

	var tkProgress = progressValues[document.getElementById("input-tk-progress").value];

	var tkComment = document.getElementById("input-tk-comment").value;

	var tkDateUpdate = DateJS.timestampForUpdate();

	taskArgsAdd.push(tkId, tkDateCreated, tkText, tkDomain, tkStatus, tkDeadline, tkProgress, tkComment, tkDateUpdate);
	var newTask = new Task(taskArgsAdd); 

	Database.useDB("insert", newTask);
	
	DisplayJS.showInfoModal("Ajout d'une tâche","Tâche "+newTask.tkId+" ajoutée");
	DisplayJS.clearForm("formAddTask");
}
// ======= Ajout d'une tâche - FIN ======= //


// ======= Modification d'une tâche  ======= //
// Mise à jour d'une tâche depuis le formulaire de création
export function updateTaskData() {
	var taskArgsUpdate = [];
	
	var tkId = document.getElementById("updTkId").innerHTML;
	
	var tkDateCreated = document.getElementById("updCreationDate").innerHTML;

	var tkText = document.getElementById("input-upd-tk-text").value;
	var tkDomain = document.getElementById("input-upd-tk-domain").value;
	var tkStatus = statusValues[document.getElementById("input-upd-tk-status").value];
	var tkDeadline = document.getElementById("input-upd-tk-deadline").value;
	var tkProgress = progressValues[document.getElementById("input-upd-tk-progress").value];

	var tkComment = document.getElementById("input-upd-tk-comment").value;

	var tkDateUpdate = DateJS.timestampForUpdate();
	taskArgsUpdate.push(tkId, tkDateCreated, tkText, tkDomain, tkStatus, tkDeadline, tkProgress, tkComment,tkDateUpdate);
	var newTask = new Task(taskArgsUpdate); 
	Database.useDB("update",newTask);
}

export function closeTask(task,option, closingComment) {
	/* 
	- changer la progression => 'Terminé' OU 'Annulé' < option
	- ajouter une date et heure de clôture 
	*/
	console.log("closeTask() - start");
	console.log(task);
	console.log(option+" - "+closingComment);
	task.tkComment += closingComment;
	Database.useDB("close",task,undefined,undefined,undefined,undefined,option);

	document.getElementById("modalBtnChoice2").removeEventListener('click',closeTask,true);

	console.log("closeTask() - end");
}
// ======= Modification d'une tâche - FIN ======= //
