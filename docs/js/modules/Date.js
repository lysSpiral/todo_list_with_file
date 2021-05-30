// =  Variables pour gestion date  = //
var currentDay;
var currentDayShortEN;
var currentDayShortFR;
var currentTime;
var currentMonth2Digit;
var currentDay2Digit;
var currentHour2Digit;
var currentMinute2Digit;
var currentTimestamp;

const dateOptions = {
	weekday:'long',
	year: 'numeric',
	month:'long',
	day:'2-digit'
};
const timeOptions = {
	hour:'numeric',
	minute:'numeric',
	second:'numeric'
};
const dateOptionsEN = {
	year: 'numeric',
	month: '2-digit',
	day: '2-digit'
};

// =  Variables pour gestion date - FIN  = //

export function dateForCSVFile() {
	setCurrentMonth2Digit();
	setCurrentDay2Digit();
	setCurrentHour2Digit();
	setCurrentMinute2Digit();
	currentTimestamp = new Date().getFullYear()+"-"+currentMonth2Digit+"-"+currentDay2Digit+"-"+currentHour2Digit+"h"+currentMinute2Digit;
	return currentTimestamp;
}

// =======  Fonctions pour les dates et heures ======= //

// Récupérer la date (jour et heure) //
export function printDayInfo() {
	// Initialiser la String pour le jour ET l'insérer dans le HTML //
	setCurrentDay();
	setCurrentDayShortEN();

	document.getElementById('creationDate').innerHTML = setCurrentDayShortFR();

	// Initialiser la String pour l'heure [ET l'insérer dans le HTML] //
	setCurrentTime();
}

export function setCurrentDay() {
	currentDay = new Date().toLocaleDateString('fr-FR',dateOptions);
	//console.log(currentDay);
}

export function setCurrentDayShortFR() {
	currentDayShortFR = new Intl.DateTimeFormat(['fr']).format(new Date());
	//console.log(currentDayShortFR);

	return currentDayShortFR;
}

export function setCurrentDayShortEN() {
	currentDayShortEN = new Intl.DateTimeFormat('en-GB',dateOptionsEN).format(new Date());
	//console.log(currentDayShortEN);
	return currentDayShortEN;
}

export function setCurrentTime() {
	currentTime = new Date().toLocaleTimeString('fr-FR',timeOptions);
	//console.log(currentTime);
	return currentTime;
}

export function timestampForUpdate() {
	return setCurrentDayShortEN()+" "+setCurrentTime();
}

export function setCurrentMonth2Digit(){
	currentMonth2Digit = ((new Date().getMonth()+1) > 9 ? (new Date().getMonth()+1) : "0"+(new Date().getMonth()+1));
}

export function setCurrentDay2Digit(){
	currentDay2Digit = (new Date().getDate() > 9 ? (new Date().getDate()) : "0"+(new Date().getDate()));
}

export function setCurrentHour2Digit(){
	currentHour2Digit =(new Date().getHours() > 9 ? (new Date().getHours()) : "0"+(new Date().getHours()));
}

export function setCurrentMinute2Digit(){
	currentMinute2Digit =(new Date().getMinutes() > 9 ? (new Date().getMinutes()) : "0"+(new Date().getMinutes()));
}
// =======  Fonctions pour les dates et heures - FIN ======= //
