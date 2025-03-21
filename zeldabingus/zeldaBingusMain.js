/*©Ondrej 2024 | AngelicChaos Productions*/
var dataArray = [];
var objSet = [];
var selectedObjs = [];
var objIndices = [];
var objIDArray = [];
var midObj;
var shareCode;
var fromCode = false;
var tooltip;
var currentGame;
var completionStyle = "Magenta";
var windowObjectReference = null;
var forcedRPValue = null;
var forcedRPValue2 = null;
var pos1 = null;
var pos2 = null;
const dungeons = ["Water", "Fire", "Wind", "Lightning", "Spirit"];

//OBJECTIVE OBJECT
function Objective(objText, objTooltip, objID, objDungeon) {
	this.objText = objText;
	this.objTooltip = objTooltip;
	this.objID = objID;
	this.objDungeon = objDungeon;
}

//GET RANDOM CELL
function randPosition(cardSize) {
	return Math.floor(Math.random() * (cardSize - 1));
}

//GET DATA FROM GOOGLE SPREADSHEET
function loadData(flag, source) {
	fromCode = flag;
	document.getElementById("codeInput").value = "";
	let gameSel = document.getElementById("gameSelect").value;
	let modeSel = document.getElementById("gameType");
	console.log("Selected Game: " + gameSel);
	if (gameSel === "none") {
		document.getElementById("gameSelect").focus();
		let gameSelDropdown = document.getElementById("gameSelect");
		gameSelDropdown.setAttribute("class", "error");
		setTimeout(function(){gameSelDropdown.classList.remove("error");}, 3000);
		console.log("No Game Selected");
		return;
	}
	if (modeSel.value === "none") {
		modeSel.focus();
		modeSel.setAttribute("class", "error");
		setTimeout(function(){modeSel.classList.remove("error");}, 3000);
		console.log("No Mode Selected");
		return;
	}	
	document.getElementById("loadingScreenParent").classList.toggle("hide");
	if (objSet.length == 0 || gameSel != currentGame) {
		var url="https://docs.google.com/spreadsheet/pub?key=1PfDEJaIZF16xtVEsyRg14nMhz9jdVyLpdCBwDEmloAA&single=false&gid=" + gameSel + "&range=A2:D&output=tsv";
		objSet = [];
		xmlhttp=new XMLHttpRequest();
		xmlhttp.onreadystatechange = function() {
			if(xmlhttp.readyState == 4 && xmlhttp.status==200){
				//document.getElementById("display").innerHTML = xmlhttp.responseText;
				currentGame = gameSel;
				let ret = xmlhttp.responseText;
				dataArray = ret.split("\r\n");

				for (let i=0;i<dataArray.length; i++){
					let dataItem = dataArray[i].toString().split("\t");
					objSet.push(new Objective(dataItem[0], dataItem[1], dataItem[2], dataItem[3]));
				}
				
				objectiveSelect();				
			}
		};
		xmlhttp.open("GET",url,true);
		xmlhttp.send(null);	
	} else {
		objectiveSelect(source);
	}
} 

function logData() {
	console.log(dataArray);
}

//SELECT OBJECTIVES
function objectiveSelect(source) {
	selectedObjs = [];
	let allObjs = objSet.slice();
	//console.log("All Objectives Length: " + allObjs.length);	
	document.getElementById("totalObjectives").innerText = allObjs.length;
	let newObject = { objText: "Test Text", objTooltip: "Test Tooltip", objID: "0" };
	let newObject2 = { objText: "Test Text", objTooltip: "Test Tooltip", objID: "0" };
	let compReq = document.getElementById("gameType").value;
	let cardWidth = document.getElementById("cardSize").value;
	let cardSize = Math.pow(cardWidth, 2);
	let idSelection, indexSelection, objByIndex;
	if (fromCode === false) {
		objIndices = [];
		objIDArray = [];
	}
	
	//One Dungeon Mode
	if (compReq == "1D") {
		newObject.objText = "Any Temple";
		newObject.objTooltip = "Can choose between Spirit, Water, Fire, Wind, and Lightning; completed upon receiving the Sage's Vow Key Item";
	}
	
	//Forced One Dungeon Mode
	if (compReq == "forced1D") {
		if (fromCode == false) {
			forcedRPValue = Math.floor(Math.random() * dungeons.length);
		}
		newObject.objText = dungeons[forcedRPValue] + " Temple";
		newObject.objTooltip = "Completed upon receiving the Sage's Vow Key Item from the designated Temple";
	}	
	
	//Forced 2 Dungeon Mode (1 Random)
	if (compReq == "forcedRP") {
		if (fromCode == false) {
			forcedRPValue = Math.floor(Math.random() * dungeons.length);
		}
		newObject.objText = dungeons[forcedRPValue] + " Temple";
		newObject.objTooltip = "Completed upon receiving the Sage's Vow Key Item";
		newObject2.objText = "Any Other Temple";
		newObject2.objTooltip = "Completed upon receiving the Sage's Vow Key Item for any Temple except for " + dungeons[forcedRPValue] + " Temple";
	}
	
	//2 Random Dungeons Mode
	if (compReq == "forced2D") {
		if (fromCode == false) {
			forcedRPValue = Math.floor(Math.random() * dungeons.length);
			forcedRPValue2 = Math.floor(Math.random() * dungeons.length);
			while (forcedRPValue === forcedRPValue2) {
				console.log("Dungeons are the same! " + dungeons[forcedRPValue] + " & " + dungeons[forcedRPValue2]);
				forcedRPValue2 = Math.floor(Math.random() * dungeons.length);
			}
		}
		newObject.objText = dungeons[forcedRPValue] + " Temple";
		newObject.objTooltip = "Completed upon receiving the Sage's Vow Key Item";
		newObject2.objText = dungeons[forcedRPValue2] + " Temple";
		newObject2.objTooltip = "Completed upon receiving the Sage's Vow Key Item";
	}	
	
	//Beat the Game Mode
	if (compReq == "BtG") {
		newObject.objText = "Save Zelda";
		newObject.objTooltip = "Completed upon grabbing Zelda's hand after defeating Demon Dragon";
	}	
	
	for (let i = 0; i < cardSize; i++) {
		if (fromCode === false) {
			indexSelection = Math.floor(Math.random() * (allObjs.length));
			objByIndex = (allObjs.splice(indexSelection, 1))[0];
			if (objByIndex != undefined) {
				if (compReq == "AD") {
					console.log("All Dungeons Mode");
					objIDArray.push(objByIndex.objID);
					selectedObjs.push(objByIndex);					
				}
				else if ((compReq != "1D" && compReq != "forcedRP" && compReq != "forced1D" && compReq != "forced2D") && objByIndex.objDungeon == "Yes") {
					console.log("Skipped 1D Objective: ", objByIndex.objID, objByIndex.objText, " Game Type: ", document.getElementById("gameType").value);
					if (allObjs.length > 0) {
						i--;
					}
				} else if ((compReq == "forced1D") && (forcedRPValue == 4) && (objByIndex.objDungeon == "Yes" && objByIndex.objID != 200)) {
					console.log("Skipped Regional Phenomena Objective (Spirit Selected): ", objByIndex.objID, objByIndex.objText, " Game Type: ", document.getElementById("gameType").value);
					if (allObjs.length > 0) {
						i--;
					}
				} else if ((compReq == "forced1D") && (forcedRPValue == 2) && (objByIndex.objID == 262)) {
					console.log("Skipped Regional Phenomena Fabric (Wind Selected): ", objByIndex.objID, objByIndex.objText, " Game Type: ", document.getElementById("gameType").value);
					if (allObjs.length > 0) {
						i--;
					}
				} else if ((compReq == "forced1D" || compReq == "forced2D") && (forcedRPValue != 2 && forcedRPValue2 != 2) && objByIndex.objID == "293") {
					console.log("Snowfield Pic w/o Wind:", objByIndex.objID, dungeons[forcedRPValue], dungeons[forcedRPValue2], "Game Type:", document.getElementById("gameType").value);
					if (allObjs.length > 0) {
						i--;
					}					
				} else {
					//console.log("Adding Objective: ", objByIndex);
					if (objByIndex.objID == "293") {
						console.log("Snowfield Pic Selected!");
					}
					objIDArray.push(objByIndex.objID);
					selectedObjs.push(objByIndex);					
				}			
				
			} else {
			console.log("Objective ID Not Found: ", indexSelection);
			if (allObjs.length > 0) {
				i--;
			} else {
				selectedObjs.push(new Objective("Not Enough Objectives", "Not Enough Objectives", null));				
				}
			}
		} else {
			console.log("Taking from code");
			idSelection = objIDArray[i];
			let findObj = allObjs.find(element => element.objID == idSelection);
			selectedObjs.push(findObj);
		}			
	} //END OF OBJ SELECTION LOOP
	
	//Replace random objectives w/ game mode objective(s)
	if (compReq != "std" && compReq != "AD" && fromCode === false) {
		pos1 = randPosition(cardSize);
		pos2 = randPosition(cardSize);
		
		while (pos1 == pos2) {
			console.log("Position Check");
			pos2 = randPosition(cardSize);
		}

		console.log("Pos1: " + pos1 + " Pos2: " + pos2);
		newObject.objID = pos1;
		selectedObjs[pos1] = newObject;
		if (compReq == "forcedRP" || compReq == "forced2D") {
			newObject2.objID = pos2;
			selectedObjs[pos2] = newObject2;
		}
		//midObj = selectedObjs[pos1];
		//console.log("Replacing random obj w/ game mode obj!");
		//console.log(selectedObjs[mid]);
		//console.log(selectedObjs);		
	}	
	
	if (compReq != "std" && compReq != "AD" && fromCode === true) {
		newObject.objID = pos1;
		selectedObjs[pos1] = newObject;
		if (compReq == "forcedRP" || compReq == "forced2D") {
			newObject2.objID = pos2;
			selectedObjs[pos2] = newObject2;
		}		
	}
	
	//All Dungeons Mode
	/*if (compReq == "AD") {
		let ADObjArray = [];
		let ADPosArray = [];
		for (let i = 0; i < 6; i++) {
			let newObj = new Objective({});
			ADObjArray.push(newObj);
		}
		ADObjArray[0].objID = "D0";
		ADObjArray[1].objID = "D1";
		ADObjArray[2].objID = "D2";
		ADObjArray[3].objID = "D3";
		ADObjArray[4].objID = "D4";
		ADObjArray[5].objID = "D5";
		ADObjArray[0].objText = "Spirit Temple";
		ADObjArray[1].objText = "Water Temple";
		ADObjArray[2].objText = "Fire Temple";
		ADObjArray[3].objText = "Wind Temple";
		ADObjArray[4].objText = "Lightning Temple";
		ADObjArray[5].objText = "Hyrule Castle";
		ADObjArray[0].objTooltip = "Completed upon receiving the Sage's Vow";
		ADObjArray[1].objTooltip = "Completed upon receiving the Sage's Vow";
		ADObjArray[2].objTooltip = "Completed upon receiving the Sage's Vow";
		ADObjArray[3].objTooltip = "Completed upon receiving the Sage's Vow";
		ADObjArray[4].objTooltip = "Completed upon receiving the Sage's Vow";
		ADObjArray[5].objTooltip = "Complete upon defeating Phantom Ganon in Hyrule Castle";
		
		
		while(ADPosArray.length < 6) {
			let ADPos = randPosition(cardSize);
			let i = 0;
			if(ADPosArray.indexOf(ADPos) === -1) {
				ADPosArray.push(ADPos);
				selectedObjs[ADPos] = ADObjArray[i];
				i++;
			}
		}
		
		console.log("ADPoSArray: ", ADPosArray);
		console.log("ADObjArray: ", ADObjArray);
		console.log("selectedObjs:", selectedObjs);		
	}*/
	
	//console.log(selectedObjs);
	let fontSlider = document.getElementById("cardFontSize");
	fontSlider.setAttribute("oninput", "adjustFontSize(this.value)");
	makeCard(selectedObjs, source);
}

//DYNAMICALLY ADJUST CELL SIZE
function cellSizeAdjust() {
	let table = document.getElementById("bingoCard");	
	let computedStyle = window.getComputedStyle(table, null);
	let parentWidth = computedStyle.getPropertyValue("width");
	let cardWidth = document.getElementById("cardSize").value;
	let cellDim = Math.floor(parseInt(parentWidth) / parseInt(cardWidth));
	let cellDivs = document.getElementsByClassName("bingoCell");
	
	for (let i = 0; i < cellDivs.length; i++) {
		cellDivs[i].style["width"] = (cellDim - 4) + "px";
		cellDivs[i].style["height"] = (cellDim - 4) + "px";	
	}
	//ADJUST FONT SIZE BASED ON DIMENSIONS
	let currentFontSize = document.getElementById("cardFontSize").value;
	let fontSizeLock;
	let fontSize;
	let defaultFontSizes = [2.0, 1.6, 1.3, 0.9, 0.6];
	
	try {
		fontSizeLock = document.querySelector('input[name="lockFontSize"]:checked').value;
	} catch (error) {
		console.log(error);
	}
	
	if (fontSizeLock != "Yes") {
		//console.log("Lock: ", fontSizeLock, fontSize);
		if (cardWidth == 3) {
			fontSize = defaultFontSizes[0];
		} else if (cardWidth == 4) {
			fontSize = defaultFontSizes[1];
		} else if (cardWidth == 5) {
			fontSize = defaultFontSizes[2];
		} else if (cardWidth == 6) {		
			fontSize = defaultFontSizes[3];
		} else if (cardWidth == 7) {
			fontSize = defaultFontSizes[4];
		}
	} else {
		fontSize = currentFontSize;
		//console.log("Lock: ", fontSizeLock, fontSize);
	}

	//console.log("Card/Font Size: " + cardWidth + "/" + fontSize);
	adjustFontSize(fontSize);
}

//GENERATE CARD STRUCTURE AND POPULATE WITH OBJECTIVES SET
function makeCard(array, source){
	let bingoCard = document.getElementById("bingoCard");
	bingoCard.replaceChildren();
	let cardWidth = document.getElementById("cardSize").value;
	let j = 0;
	for(; j < array.length; j++) {
		let newCell = document.createElement("div");
		newCell.setAttribute("id", array[j].objID);
		newCell.setAttribute("onclick", "completeObj(this, event)");
		newCell.setAttribute("oncontextmenu", "markObj(this)");
		newCell.setAttribute("onmouseenter", "tooltipUpdate(this)");
		newCell.setAttribute("onmouseleave", "tooltipHide()");
		let objText = document.createTextNode(array[j].objText);
		let countIndex = array[j].objText.indexOf("0/");
		let endCount = parseInt(array[j].objText[countIndex + 3]);
		if (countIndex > -1) {
			newCell.setAttribute("count", 0);
			newCell.setAttribute("countIndex", countIndex);
			if (isNaN(endCount)) {
				newCell.setAttribute("endCount", array[j].objText[countIndex + 2]);
			} else {
				newCell.setAttribute("endCount", array[j].objText.substring(countIndex + 2, countIndex + 4));
			}
		} else {
			newCell.setAttribute("count", -1);
			newCell.setAttribute("countIndex", -1);					
		}
		newCell.style["word-wrap"] = "break-word"
		newCell.style["user-select"] = "none";
		newCell.setAttribute("class", "bingoCell");
		newCell.appendChild(objText);
		bingoCard.appendChild(newCell);
	}
	
	//APPLY SPECIAL STYLING TO GAMEMODE OBJECTIVE(S)
	let compReq = document.getElementById("gameType").value;
	if (compReq != "std" && compReq != "AD") {		
		let cellsArray = bingoCard.children;
			cellsArray[pos1].classList.add("modeObjective");
		if (compReq == "forcedRP" || compReq == "forced2D") {
			cellsArray[pos2].classList.add("modeObjective");
		}
	}

	cellSizeAdjust();
	encodeCard(source);
	document.getElementById("infoParent").classList.remove("hide");
	document.getElementById("loadingScreenParent").classList.toggle("hide");
	document.getElementById("cardFontSizeParent").classList.remove("hide");
	document.getElementById("selectedAmount").innerText = cardWidth * cardWidth;
	document.getElementById("cardRevealDiv").classList.remove("hide");
	toggleSettings(source);
	//cardReveal();
}

//ENABLE INTERACTIVITY
function completeObj(cell, event) {
	console.log("Target Cell: ", cell);
	let countIndex = parseInt(cell.getAttribute("countIndex"));
	let count = parseInt(cell.getAttribute("count"));
	let endCount = parseInt(cell.getAttribute("endCount"));
	let divText = cell.innerText;
	let newStr;
	let countLength = count.toString().length;
	//Check if Obj has a counter mechanism
	if (countIndex != -1) {		
		if (event.getModifierState("Control")) {
			//console.log("Dec Count");
			count--;				
		} else if (event.getModifierState("Shift")) {
			count = endCount;
		} else {
			//console.log("Inc Count");
			count++;
		}
	
		if (count < 0 || count > endCount) {
			count = 0;
		}
		
		if (count == endCount) {
			cell.classList.remove("selected");
			cell.classList.toggle("completed" + completionStyle);
			checkOverflow(cell);				 
		} else {
			cell.classList.remove("completed" + completionStyle);
			if (countLength == 2) {
				newStr = divText.substring(0, countIndex) + count.toString() + divText.substring(countIndex + 2);			
				cell.innerText = newStr;
				cell.setAttribute("count", count);
				return;
			}
		}
		cell.setAttribute("count", count);
		//console.log("Obj Counter: " + count);
		if (count < 11) {
			newStr = divText.substring(0, countIndex) + count.toString() + divText.substring(countIndex + 1);
		} else {
			newStr = divText.substring(0, countIndex) + count.toString() + divText.substring(countIndex + countLength);
		}			
		cell.innerText = newStr;	
	} else {
		cell.classList.remove("selected");
		cell.classList.toggle("completed" + completionStyle);
		checkOverflow(cell);	
	}
	updateProgressCount();
}

function markObj(cell){
	event.preventDefault();
	//console.log("Selecting: " + cell.id);
	let count = parseInt(cell.getAttribute("count"));
	let endCount = parseInt(cell.getAttribute("endCount"));
	if (count != endCount) {
		cell.classList.remove("completed" + completionStyle);
	}
	cell.classList.toggle("selected");
	updateProgressCount();
}

//UPDATE MARKED/COMPLETED COUNT
function updateProgressCount() {
	let markedCellCount = document.getElementsByClassName("selected").length;
	let completedCellCount = document.getElementsByClassName("completed" + completionStyle).length;
	document.getElementById("completedCount").innerText = completedCellCount;
	document.getElementById("markedCount").innerText = markedCellCount;
	//console.log("Completed/Marked: ", completedCellCount, markedCellCount);
}

//ADJUST CARD BACKGROUND
function cardBG(){
	let bingoCard = document.getElementById("tbody");
	if (document.getElementById("gameSelect").value == "1940571458") {
		bingoCard.classList.add("totkBingus");
	}
}

//ENCODE CARD INFORMATION
function encodeCard(source){
	let array = objIDArray.slice();
	let game = document.getElementById("gameSelect");
	let mode = document.getElementById("gameType");
	let size = document.getElementById("cardSize");
	if (mode.value == "forcedRP" || mode.value == "forced1D"){
		array.unshift(game.value, mode.value, size.value,  forcedRPValue);
	} else if (mode.value == "forced2D") {
		array.unshift(game.value, mode.value, size.value,  forcedRPValue, forcedRPValue2);
	} else {
		array.unshift(
		game.value, mode.value, size.value);
	}
	//ENCODE POSITION VALUES
	array.unshift(pos1, pos2);
	
	shareCode = btoa(JSON.stringify(array));
	document.getElementById("cardCode").innerText = shareCode;
	//ADD CODE TO SESSION HISTORY
	if(source === null || source === undefined) {	
		let newLI = document.createElement("li");
		let list = document.getElementById("sessionHistory");
		let listLength = document.querySelectorAll("#sessionHistory li").length;
		let codeSpan = document.createElement("span");
		codeSpan.setAttribute("id", "code" + listLength);
		codeSpan.setAttribute("data-id", shareCode);
		codeSpan.innerText = " " + game.options[game.selectedIndex].text + " " + size.options[size.selectedIndex].text + " " + mode.options[mode.selectedIndex].text;
		
		if (mode.value == "forcedRP" || mode.value == "forced1D") {
			codeSpan.innerText = codeSpan.innerText + " (" + dungeons[forcedRPValue] + " Temple Required)";
		}
		
		if (mode.value == "forced2D") {
			codeSpan.innerText = codeSpan.innerText + " (" + dungeons[forcedRPValue] + " & " + dungeons[forcedRPValue2] + " Temple Required)";
		}		
		
		list.appendChild(newLI);
		newLI.appendChild(codeSpan);
		let newBtn = document.createElement("button");
		newBtn.innerText = "Load Card";
		newBtn.setAttribute("type", "button");
		newBtn.setAttribute("onclick", "decodeCard(true, " + listLength + ")");
		newLI.prepend(newBtn);
	}
	//newLI.setAttribute("id", shareCode);
}

//GENERATE NEW CARD CODE WHEN GAME TYPE CHANGES
function gameTypeUpdate(e) {
	let bingoCard = document.getElementById("bingoCard");
	if (bingoCard.childElementCount == 0) {
		console.log("Card is empty");
let gameSelect = document.getElementById("gameSelect");
console.log(Math.max(gameSelect.options));		
		return;
	} else {
		console.log("Card has elements");
		//console.log(objIDArray);
		let gameSelect = document.getElementById("gameSelect");
		console.log(Math.max(gameSelect.options));
	}
}

//DECODE CARD INFORMATION & POPULATE FIELDS
function decodeCard(flag, source) {
	let code;
	if (source === null) {
		code = document.getElementById("codeInput").value;
	} else {
		code = document.getElementById("code" + source).dataset.id;
	}
	//console.log(code);
	if (code == "") {
		//console.log("Empty Code Input");
		let input = document.getElementById("codeInput")
		input.focus();
		input.setAttribute("class", "error");
		setTimeout(function(){input.classList.remove("error");}, 3000);
		return;	 
	}
	fromCode = flag;
	let decodedCard = JSON.parse(atob(code));
	let positionVals = decodedCard.splice(0, 2);
	console.log("Position Values: " + positionVals[0], positionVals[1]);
	pos1 = positionVals[0];
	pos2 = positionVals[1];
	let gameSettings = decodedCard.splice(0, 3);
	document.getElementById("gameSelect").value = gameSettings[0];
	document.getElementById("gameType").value = gameSettings[1];
	document.getElementById("cardSize").value = gameSettings[2];
	
	if (document.getElementById("gameType").value == "forcedRP" || document.getElementById("gameType").value == "forced1D"){
		forcedRPValue = decodedCard.splice(0, 1); 
		//console.log("Decoded RP Value: ", forcedRPValue);
	}
	
	if (document.getElementById("gameType").value == "forced2D"){
		forcedRPValue = decodedCard.splice(0, 1);
		forcedRPValue2 = decodedCard.splice(0, 1);
		//console.log("Decoded RP Values: ", forcedRPValue, forcedRPValue2);
	}	
	
	objIDArray = decodedCard;
	//objSet = decodedCard;
	console.log("Game Settings: ", gameSettings, " Card: ", decodedCard);
	loadData(flag, source);
}

document.getElementById("codeInput").addEventListener('keydown', function(e) {
	let key = e.code;
	if (key === "Enter" || key === "NumpadEnter") {
		decodeCard(true, null);
	}
});

//COPY CODE TO CLIPBOARD
function copyCode(){
	let cardCode = document.getElementById("cardCode");
	const selection = window.getSelection();
	const range = document.createRange();
	selection.removeAllRanges();
	range.selectNodeContents(cardCode);
	selection.addRange(range);
	document.execCommand("copy");
	selection.removeAllRanges();
	document.getElementById("copyCodeBtn").innerText = "Copied!";
	setTimeout(function(){document.getElementById("copyCodeBtn").innerText = "Copy Code";}, 3000);
}

//VIEW SESSION HISTORY
function viewHistory() {
	document.getElementById("sessionHistoryParent").classList.toggle("hide");
	
}

//TOOLTIP
window.onmousemove = function (e) {
	const OFFSET = 20;
	tooltip = document.getElementById("tooltip");
	var x = e.pageX, y = e.pageY;
	//console.log(x, y);		
	tooltip.style.top = (y + OFFSET) + 'px';
	let tooltip_rect = tooltip.getBoundingClientRect();
	if (x < window.innerWidth * 0.7) {
		tooltip.style.left = (x + OFFSET) + "px";
		tooltip.style.right = "auto";
	} else {
		tooltip.style.right = (window.innerWidth - x) + "px";
		tooltip.style.left = "auto";		
	}
};

function tooltipUpdate(cell) {
	let objIndex = selectedObjs.findIndex((element) => parseInt(element.objID) == parseInt(cell.id));
	tooltip.innerText = selectedObjs[objIndex].objTooltip;
	tooltip.classList.remove("hide");
}

function tooltipHide() {
	tooltip.classList.add("hide");
}

//FONT SIZE ADJUST
function adjustFontSize(val) {
	val = parseFloat(val).toFixed(1);
	document.getElementById("bingoCard").style.fontSize = val + "vw";
	document.getElementById("cardFontSizeLabel").innerText = "Card Text Scaling: x" + val;
	document.getElementById("cardFontSize").value = val;
}

//FONT FACE CHANGE
function changeFont(val) {
	document.getElementById("bingoCard").style.fontFamily = val;
	document.getElementById("tooltip").style.fontFamily = val;
}

//CHANGE COMPLETION MARKING STYLE
function setCompletionType(val) {
	if (document.getElementById("bingoCard").childElementCount > 0 && val != completionStyle) {
		//Swap styles for cells marked before changing style type
		console.log("Prev: " + completionStyle + " New: " + val);
		let cells = document.getElementsByClassName("completed" + completionStyle);
		//getElementsByClassName returns a live HTML collection; leverage this during iteration
		while(cells.length > 0) {
			cells[0].classList.add("completed" + val);
			cells[0].classList.remove("completed" + completionStyle);
		}
	}
	completionStyle = val;
}

//TOGGLE SETTINGS VISIBILITY
function toggleSettings(source) {
	if (selectedObjs.length > 0 && (source === null || source === undefined)) {
		let settingsDiv = document.getElementById("configParent");
		let header = document.getElementById("header");
		settingsDiv.classList.toggle("hide");
		header.classList.toggle("hide");
		scroll(0,0);
	}
}

//CARD REVEAL LOGIC
function cardReveal() {
	document.getElementById("cardRevealDiv").classList.toggle("hide");
}

function searchObjSet(val) {
	let results = null;
	if(val == "") {
		results = objSet;
	} else {
		results = objSet.filter(element => element.objText.toLowerCase().includes(val.toLowerCase()));
	}
	console.log("Search Query: " + val + ", Results:\n")
	console.log(results)
}

function checkOverflow(el) {
	let diff;
	if (el.clientHeight < el.scrollHeight) {
		diff = el.scrollHeight - el.clientHeight;
		console.log("Cell Text is Overflowing by " + diff);
	} else {
		diff = el.clientHeight - el.scrollHeight;
		console.log("Cell Text is within bounds. ", el.clientHeight, el.scrollHeight);
	}
}
