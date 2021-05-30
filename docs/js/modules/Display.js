import * as TaskJS from './Task.js';
import * as Database from './Database.js';
import * as Date from './Date.js'
import * as DateJS from './Date.js';

const taskBtns = document.querySelectorAll(".taskBtn");

// =  Variables pour la modale  = //
var modal = document.getElementById("modal");
var modalContent = document.getElementById("modalContent");
var modalTitle = document.getElementById("modalTitle");
var modalQuestion = document.getElementById("modalQuestion");
var modalComment = document.getElementById("modalComment");
var modalCancelBtn = document.getElementById("modalCancelBtn");
var modalBtnChoice1 = document.getElementById("modalBtnChoice1");
var modalBtnChoice2 = document.getElementById("modalBtnChoice2");
var modalBtnOK = document.getElementById("modalBtnOK");
// =  Variables pour la modale - FIN  = //


// Désactiver un élément
export function disableElement(element) {
	element.disabled = true;
}

// Activer un élément
export function activateElement(element) {
	element.removeAttribute("disabled");
}

// Montrer un  élément 
export function showElement(element) {
    element.style.display = "block";
}

// Cacher un  élément 
export function hideElement(element) {
    element.style.display = "none";
}

// Cacher tous les éléments d'un groupe d'éléments (Array en argument et non NodeList)
export function hideAll(array) {
	array.forEach(function(element){
      //console.log(element.id);
      hideElement(element);
    })
}

// 
export function clearForm(item) {
	document.getElementById(item).reset();
	console.log('formulaire '+item+' réinitialisé');
}

// == Activation et désactivation des boutons == //


export function activateTaskMnt() {
	disableElement(document.getElementById("createListBtn"));
	showElement(document.getElementById("progressFilters"));
	taskBtns.forEach(element => activateElement(element));
}

export function deactivateTaskMnt() {
	activateElement(document.getElementById("createListBtn"));

	taskBtns.forEach(element => disableElement(element));
}
// == Activation et désactivation des boutons - FIN == //

// Updater la value d'un bouton en fonction de la visibilité d'un élément
export function changeBtnContent(btn, elmt, string1, string2) {
	//console.log(elmt.style.display);
	if (elmt.style.display === "none") {
		//console.log(btn.innerHTML+" - "+string1);
		btn.innerHTML = string2;
	} else {
		btn.innerHTML = string1;
	}
} 

export function storeLocal(storeName,text){
	window.localStorage.setItem(storeName,text);
}

/* == Fonctions d'affichage spécifiques aux tâches == */
export function resetTaskTable() {
	let blankTableHTML= "<tr id = \"tasksTableHeaders\"><th class=\"toDoList-th\">#</th><th class=\"toDoList-th\">Créé le</th><th class=\"toDoList-th\">Tâche</th>	<th class=\"toDoList-th\">Domaine</th><th class=\"toDoList-th\">Statut</th><th class=\"toDoList-th\">Echéance</th><th class=\"toDoList-th\">Progression</th><th class=\"toDoList-th actions-col\">Actions</th></tr><tr id=\"taskList\"></tr>";

	tableToDoList.innerHTML = blankTableHTML;
}

export function resetSortBtnZones() {
	//console.log("resetSortBtnZones");
	var buttonZones = Array.from(document.querySelectorAll(".sort-btn-zone"));
	//console.log(buttonZones);
	hideAll(buttonZones);
}

export function resetDisplay() {
	resetTaskTable();
	resetSortBtnZones();
	hideElement(document.getElementById("formAddTaskDiv"));
	hideElement(document.getElementById("formUpdateTaskDiv"));
}

export function refreshTaskTable(range = "open") {resetDisplay();
  	Database.useDB("print",undefined,undefined,range,undefined,undefined);

  	////showElement(tasksTable);
  	// document.getElementById("hideTaskList").innerHTML = "Cacher la liste";
}

export function setDefaultTaskTableDisplay() {
	resetDisplay();
	////showElement(tasksTable);
}

export function htmlDomainFields(htmlElement) {
	
	var domainCount = TaskJS.getDomainDataListOptions().length;

	for(let i=0;i<domainCount;i++){
		var domainFieldHTML = "<option value=\""+TaskJS.getDomainDataListOptions()[i]+"\">";
		//console.log(domainFieldHTML);
		htmlElement.insertAdjacentHTML("beforeend", domainFieldHTML);
	}
}

export function htmlStatusFields(htmlElement) {
	var statusCount = TaskJS.getStatusArray().length;
	
	var statusFieldHTML = "<option id=\"blankStatus\" value=\"blankStatus\" selected>"+TaskJS.getStatusValues()["blankStatus"]+"</option>";

	htmlElement.insertAdjacentHTML("beforeend", statusFieldHTML);

	for(let i=1;i<statusCount;i++){
		var statusObject = TaskJS.getStatusArray()[i];
		
		statusFieldHTML = "<option id=\""+statusObject[0]+"Status\" value=\""+statusObject[0]+"\">"+statusObject[1]+"</option>";
		htmlElement.insertAdjacentHTML("beforeend", statusFieldHTML);
	}
}

export function htmlProgressFields(htmlElement) {
	var progressCount = TaskJS.getProgressArray().length;

	var progressFieldHTML = "<option id=\"unstarted\" value=\"unstarted\" selected>"+TaskJS.getProgressValues()["unstarted"]+"</option>";


	htmlElement.insertAdjacentHTML("beforeend", progressFieldHTML);

	for(let i=1;i<progressCount;i++){

		var progressObject = TaskJS.getProgressArray()[i];
		
		progressFieldHTML = "<option id=\""+progressObject[0]+"Progress\" value=\""+progressObject[0]+"\">"+progressObject[1]+"</option>";
		htmlElement.insertAdjacentHTML("beforeend", progressFieldHTML);
	}
}

export function showTaskToUpdate(taskObject) {
	document.getElementById('formUpdateTaskDiv').style.display="block";
	document.getElementById('hideFormUpdateTaskDiv').focus();


	document.getElementById('updCreationDate').innerHTML = taskObject.tkDateCreated;
	document.getElementById('updUpdateTime').innerHTML = taskObject.tkDateUpdate;
	document.getElementById('input-upd-tk-deadline').value = taskObject.tkDeadline;
	document.getElementById('updTkId').innerHTML = taskObject.tkId;

	document.getElementById('input-upd-tk-status').value = TaskJS.getKey(taskObject.tkStatus, TaskJS.getStatusArray());

	document.getElementById('input-upd-tk-domain').value = taskObject.tkDomain;

	document.getElementById('input-upd-tk-progress').value = TaskJS.getKey(taskObject.tkProgress, TaskJS.getProgressArray());

	document.getElementById('input-upd-tk-text').value = taskObject.tkText;

	document.getElementById('input-upd-tk-comment').value = taskObject.tkComment;

	document.getElementById('updClosingDate').innerHTML = taskObject.tkDateClosing;
}

export function printItemTasks(item){
	//console.log(item);

	let itemID = "task"+item.tkId;
	
	var deadlineDate = new window.Date(item.tkDeadline);
	//console.log(itemID+" "+deadlineDate);
	let deadlineFormatted = new Intl.DateTimeFormat(['fr']).format(deadlineDate);

	let statusFormatted = (TaskJS.getOpenProgressValues().includes(item.tkProgress) && TaskJS.getUrgentStatusValues().includes(item.tkStatus)) ? "<td id=\""+itemID+"_status\" class=\"toDoList-item urgent-task\">"+item.tkStatus+"</td>" : "<td id=\""+itemID+"_status\" class=\"toDoList-item\">"+item.tkStatus+"</td>";

	let closingBtn = (TaskJS.getOpenProgressValues().includes(item.tkProgress)) ? "<button id=\"item"+item.tkId+"_btnF\" class=\"btn btn-info btn-close\"> F </button>" : ""; 

	let itemTask = "<td id=\""+itemID+"_id\" class=\"toDoList-item\">"+item.tkId+"</td><td id=\""+itemID+"_date_created\" class=\"toDoList-item\">"+item.tkDateCreated+"</td><td id=\""+itemID+"_text\" class=\"toDoList-item\">"+item.tkText+"</td><td id=\""+itemID+"_domain\" class=\"toDoList-item\">"+item.tkDomain+"</td>"+statusFormatted+"<td id=\""+itemID+"_deadline\" class=\"toDoList-item\">"+deadlineFormatted+"</td><td id=\""+itemID+"_progress\" class=\"toDoList-item\">"+item.tkProgress+"</td><td id=\""+itemID+"_actions\" class=\"toDoList-item-actions\"><button id=\"item"+item.tkId+"_btnM\" class=\"btn btn-info btn-modify\"> V/M </button>"+closingBtn;


	var row = document.createElement("tr");
	row.id = itemID;
	row.innerHTML = itemTask;
	
	tableToDoList.appendChild(row);

	
	// Ajout de l'eventListener sur le bouton "Fermer"
	if (TaskJS.getOpenProgressValues().includes(item.tkProgress)) {
		var btnF = "item"+item.tkId+"_btnF";

		document.getElementById(btnF).addEventListener("click",() =>setClosingModal(item));
	}

  	// Ajout de l'eventListener sur le bouton "Modifier"
	var btnM = "item"+item.tkId+"_btnM";

	document.getElementById(btnM).addEventListener("click",function(){
  	//console.log(document.getElementById(row.tkId));
  		showTaskToUpdate(item);
		
  	});
}

export function hideModal() {
	hideElement(modal);
}

export function showModal() {
	showElement(modal);
}

export function showInfoModal(title,info) {
	modalTitle.innerHTML = title;
	modalQuestion.innerHTML = info;
	
	hideElement(modalComment);
	hideElement(modalBtnChoice1);
	hideElement(modalBtnChoice2);
	hideElement(modalCancelBtn);

	showElement(modalBtnOK);


	modalBtnOK.addEventListener('click', hideModal); 
	showModal();
}


export function setClosingModal(task) {

	showElement(modalComment);
	showElement(modalBtnChoice1);
	showElement(modalBtnChoice2);
	showElement(modalCancelBtn);

	hideElement(modalBtnOK);

	modalTitle.innerHTML = "Clôture d'une tâche";
	modalQuestion.innerHTML = "La tâche "+task.tkId+" va être archivée. Est-elle terminée ou annulée ?";
	modalComment.innerHTML = "Commentaires de fermeture : ";

	modalBtnChoice1.innerHTML = "Tâche annulée";
	modalBtnChoice2.innerHTML = "Tâche terminée";

	modalBtnChoice1.addEventListener('click', () => TaskJS.closeTask(task, "Annulé", document.getElementById("modalComment").value));
	modalBtnChoice2.addEventListener('click', () => TaskJS.closeTask(task,"Terminé",  document.getElementById("modalComment").value)); 
	showModal();
}
// ======= Affichage des tâches - FIN ======= //
