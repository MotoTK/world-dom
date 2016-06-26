var viewer = new Cesium.Viewer('cesiumContainer');

var territories = {};
var territoryUSA,
    territoryCanada,
    territoryBrazil,
    territorySomolia,
    territoryBritain,
    territoryUAE,
    territoryRussia,
    territoryChina,
    territoryAustralia;

var players = [];
var player1,
    player2,
    player3;

var numPlayers,
    numTerritories,
    maxNumTerritoriesOwned,
    numTroopsDeployable,
    curPlayerIndex;
var mainMenu;
var initTerritoryOwners = [];


//Main menu billboard
function MainMenu(name, x, y, img) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.img = img;
    this.entity = viewer.entities.add({
        name: name,
        description : '<p>Welcome to a game about world domination!</p>\
            <div display="inline-block">\
            How many players?\
            <button type="submit" class="2Player">2</button> or \
            <button type="submit" class="3Player">3</button>\
            </div>',
        position : Cesium.Cartesian3.fromDegrees(x, y),
        billboard : {
            image : img,
            width : 64,
            height : 32
        },
        label : {
            text : name,
            font : '14pt monospace',
            style: Cesium.LabelStyle.OUTLINE,
            outlineWidth : 2,
            verticalOrigin : Cesium.VerticalOrigin.TOP,
            pixelOffset : new Cesium.Cartesian2(0, 32)
        }
    });
}

//Territory constructor
function Territory(name, x, y, img) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.img = img;
    this.entity = viewer.entities.add({
        name: name,
        description: name,
        position : Cesium.Cartesian3.fromDegrees(x, y),
        billboard : {
            image : img,
            width : 64,
            height : 32
        },
        label : {
            text : name,
            font : '14pt monospace',
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth : 2,
            verticalOrigin : Cesium.VerticalOrigin.TOP,
            pixelOffset : new Cesium.Cartesian2(0, 32)
        }
    });
    this.ownedBy = null;
    this.numTroopsOccupied = 2;
    this.beenSelected = false;
    this.line = [];
}

function initTerritories() {
    territoryUSA = new Territory("USA", -98.35, 39.50, "https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg");
    territoryCanada = new Territory("Canada", -110, 55, "https://upload.wikimedia.org/wikipedia/en/thumb/c/cf/Flag_of_Canada.svg/300px-Flag_of_Canada.svg.png");
    territoryBrazil = new Territory("Brazil", -60, -10, "https://upload.wikimedia.org/wikipedia/en/thumb/0/05/Flag_of_Brazil.svg/214px-Flag_of_Brazil.svg.png");
    territorySomolia = new Territory("Somolia", 15, 15, "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Flag_of_Somalia.svg/125px-Flag_of_Somalia.svg.png");
    territoryBritain = new Territory("Britain", 8.5, 50, "https://upload.wikimedia.org/wikipedia/en/thumb/a/ae/Flag_of_the_United_Kingdom.svg/300px-Flag_of_the_United_Kingdom.svg.png");
    territoryUAE = new Territory("UAE", 47, 25, "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Flag_of_the_United_Arab_Emirates.svg/300px-Flag_of_the_United_Arab_Emirates.svg.png");
    territoryRussia = new Territory("Russia", 80, 60, "https://upload.wikimedia.org/wikipedia/en/thumb/f/f3/Flag_of_Russia.svg/225px-Flag_of_Russia.svg.png");
    territoryChina = new Territory("China", 100, 30, "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Flag_of_the_People%27s_Republic_of_China.svg/225px-Flag_of_the_People%27s_Republic_of_China.svg.png");
    createLine(territoryUSA, territoryCanada);
    createLine(territoryUSA, territoryBrazil);
    createLine(territoryRussia, territoryChina);
    createLine(territoryUAE, territoryRussia);
    createLine(territoryUAE, territoryChina);
    createLine(territoryUAE, territorySomolia);
    createLine(territoryUAE, territoryBritain);
    createLine(territorySomolia, territoryBritain);
    createLine(territoryRussia, territoryBritain);
    createLine(territoryUSA, territoryBritain);
    createLine(territoryRussia, territoryCanada);
    createLine(territorySomolia, territoryBrazil);
}
//Needed for three player games so that each player gets an even amount of territories
function initAustralia() {
    territoryAustralia = new Territory("Australia", 133,-25, "https://upload.wikimedia.org/wikipedia/en/thumb/b/b9/Flag_of_Australia.svg/300px-Flag_of_Australia.svg.png");
    createLine(territoryAustralia, territoryChina);
}
//creates 2 lines which span half the distance from the two territories
function createLine(ter1, ter2) {
    var midPointX = (ter1.x + ter2.x) / 2;
    var midPointY = (ter1.y + ter2.y) / 2;
    ter1.line[ter1.line.length] = viewer.entities.add({
        name : ter1.name + " to " + ter2.name,
        description : '<button type="submit" class="send' + ter1.name + 'to' + ter2.name + '">Send Troops</button>',
        polyline : {
            positions : Cesium.Cartesian3.fromDegreesArray([ter1.x, ter1.y, midPointX, midPointY]),
            width : 5,
            material : Cesium.Color.GREEN.withAlpha(0.7)
        }
    });
    ter2.line[ter2.line.length] = viewer.entities.add({
        name : ter2.name + " to " + ter1.name,
        description : '<button type="submit" class="send' + ter2.name + 'to' + ter1.name + '">Send Troops</button>',
        polyline : {
            positions : Cesium.Cartesian3.fromDegreesArray([ter2.x, ter2.y, midPointX, midPointY]),
            width : 5,
            material : Cesium.Color.GREEN.withAlpha(0.7)
        }
    });
}
//changes lines to specified color for the given territory
function changeLineColor(ter, color) {
    var temp;
    if(color === "RED") {
        temp = Cesium.Color.RED;
    } else if(color === "WHITE") {
        temp = Cesium.Color.WHITE;
    } else if(color === "BLUE") {
        temp = Cesium.Color.BLUE;
    }
    for(var i = 0; i < ter.line.length; i++) {
        ter.line[i].polyline.material = temp;
    }
}

function twoPlayer() {
    numPlayers = 2;
    numTerritories = 8;
    maxNumTerritoriesOwned = 4;
    initTerritories();
    player1 = new Player("Red","RED");
    players[0]=player1;
    player2 = new Player("White","WHITE");
    players[1] = player2;
    buttonTerritoryDisplay();
}

function threePlayer() {
    numPlayers = 3;
    numTerritories = 9;
    maxNumTerritoriesOwned = 3;
    initTerritories();
    initAustralia();
    player1 = new Player("Red","RED");
    players[0] = player1;
    player2 = new Player("White","WHITE");
    players[1] = player2;
    player3 = new Player("Blue","BLUE");
    players[2] = player3;
    buttonTerritoryDisplay();
}

function Player(name, color) {
    this.name = name;
    this.color = color;
    this.totalNumberOfTroops = numTerritories / numPlayers * 2;
    this.numTerritoriesOwned = 0;
}

//after territories are selected at the start, method gives players territories
function givePlayersTerritories() {
    var i;
    if(numPlayers === 2) {
        for(i = 0; i < initTerritoryOwners.length; i++) {
            if(i % 2 === 0) {
                initGiveTerritory(player1, initTerritoryOwners[i]);
            } else {
                initGiveTerritory(player2, initTerritoryOwners[i]);
            }
        }
    } else if(numPlayers === 3) {
        for(i = 0; i < initTerritoryOwners.length; i++) {
            if((i + 1) % 3 === 0) {
                initGiveTerritory(player3, initTerritoryOwners[i]);
            } else if((i - 1) % 2 === 0) {
                initGiveTerritory(player2, initTerritoryOwners[i]);
            } else {
                initGiveTerritory(player1, initTerritoryOwners[i]);
            }
        }
    }
}
//adds the territory to the specified person
function initGiveTerritory(player, territory) {
    territory.ownedBy = player;
	player.numTerritoriesOwned++;
    territories[territory.name] = territory;
    updateTerritoryDescription(territories[territory.name]);
    changeLineColor(territory, player.color);
}

//Gives the territory to the first players index, removes territory from second players index
function giveTerritory(conquerorIndex, concederIndex, territoryName) {
    territories[territoryName].ownedBy = players[conquerorIndex];
    players[conquerorIndex].numTerritoriesOwned++;
    players[concederIndex].numTerritoriesOwned--;
    changeLineColor(territories[territoryName], players[conquerorIndex].color);
}


//Allows for clickable buttons inside descriptions
viewer.infoBox.frame.setAttribute('sandbox', 'allow-same-origin allow-popups allow-forms allow-scripts allow-top-navigation');
viewer.infoBox.frame.addEventListener('load', function() {
    viewer.infoBox.frame.contentDocument.body.addEventListener('click', function(e) {
        if (e.target.className === '2Player') {
            twoPlayer();
        } else if(e.target.className === '3Player') {
            threePlayer();
        } else if(e.target.className.substring(0,3) === 'dep') {
            deployTroop(e.target.className.slice(3));
        } else if(e.target.className.substring(0,4) === 'send') {
            sendTroopsForward(e.target.className.slice(4));
        } else if(e.target.className === 'nextPlayer') {
            loadNextPlayer();
        } else if(e.target.className === 'Begin Game') {
            givePlayersTerritories();
            curPlayerIndex = numPlayers - 1;
            loadNextPlayer();
        } else if(e.target.className === 'Brazil') {
            if(hasBeenSelected(territoryBrazil)) {
                initTerritoryOwners[initTerritoryOwners.length] = territoryBrazil;
            }
        } else if(e.target.className === 'Britain') {
            if(hasBeenSelected(territoryBritain)) {
                initTerritoryOwners[initTerritoryOwners.length] = territoryBritain;
            }
        } else if(e.target.className === 'Canada') {
            if(hasBeenSelected(territoryCanada)) {
                initTerritoryOwners[initTerritoryOwners.length] = territoryCanada;
            }
        } else if(e.target.className === 'China') {
            if(hasBeenSelected(territoryChina)) {
                initTerritoryOwners[initTerritoryOwners.length] = territoryChina;
            }
        } else if(e.target.className === 'Russia') {
            if(hasBeenSelected(territoryRussia)) {
                initTerritoryOwners[initTerritoryOwners.length] = territoryRussia;
            }
        } else if(e.target.className === 'Somolia') {
            if(hasBeenSelected(territorySomolia)) {
                initTerritoryOwners[initTerritoryOwners.length] = territorySomolia;
            }
        } else if(e.target.className === 'UAE') {
            if(hasBeenSelected(territoryUAE)) {
                initTerritoryOwners[initTerritoryOwners.length] = territoryUAE;
            }
        } else if(e.target.className === 'USA') {
            if(hasBeenSelected(territoryUSA)) {
                initTerritoryOwners[initTerritoryOwners.length] = territoryUSA;
            }
        } else if(e.target.className === 'Australia') {
            if(hasBeenSelected(territoryAustralia)) {
                initTerritoryOwners[initTerritoryOwners.length] = territoryAustralia;
            }
        }
    }, false);
}, false);

//Ensures a territory can initially only be selected by one player
function hasBeenSelected(ter) {
    if(ter.beenSelected === false) {
        ter.beenSelected = true;
        return true;
    }
    console.log("ERROR: Territory has already been selected, please choose another.");
    return false;
}

//If the player whos turn it is sends troops to a territory that they own, one troop is sent
//If the player sends troops to a territory that they do no own, it initiates a battle
//If the player trys to send troops from a territory that they do not own, an error is sent
function sendTroopsForward(teritoriesSplitByTo) {
    var twoTerritories = teritoriesSplitByTo.split('to');
    if(territories[twoTerritories[0]].ownedBy.name !== players[curPlayerIndex].name) {
        console.log("ERROR: You can not send troops from a territory owned by another player.");
    } else if(territories[twoTerritories[0]].numTroopsOccupied === 1) {
        console.log("ERROR: You must keep at least one troop on a territory that you own.");
    } else if(territories[twoTerritories[0]].ownedBy.name === territories[twoTerritories[1]].ownedBy.name) {
        territories[twoTerritories[0]].numTroopsOccupied--;
        territories[twoTerritories[1]].numTroopsOccupied++;
        updateTerritoryDescription(territories[twoTerritories[0]]);
        updateTerritoryDescription(territories[twoTerritories[1]]);
    } else {
        battleHandler(twoTerritories[0], twoTerritories[1]);
    }
}

//Determines how many troops will be sent to battle for the attacker/defender
//An attacker must keep one person on a territory at all times which leads to:
//attacker has more than 3 players, attacker gets 3 troops in battle
//attacker has 3 or less players, attacker gets current amount on territory - 1 troop sent to battle
//A defender will get 2 troops if they have 2 or more people on their territory and 1 otherwise.
//Any territories involved with the battle are updated as well as the current players description.
function battleHandler(attackerTerName, defenderTerName) {
    var troopsLost = [];
    var numAttackers = 3;
    var numDefenders = 2;
    var defenderPlayerIndex;
    if(territories[attackerTerName].numTroopsOccupied < 4) {
        numAttackers = territories[attackerTerName].numTroopsOccupied - 1;
    }
    if(territories[defenderTerName].numTroopsOccupied === 1) {
        numDefenders = 1;
    }
    troopsLost = battle(numAttackers, numDefenders);
    territories[attackerTerName].numTroopsOccupied-=troopsLost[0];
    territories[defenderTerName].numTroopsOccupied-=troopsLost[1];
    for(var i = 0; i < players.length; i++) {
        if(territories[defenderTerName].ownedBy.name === players[i].name) {
            defenderPlayerIndex = i;
            break;
        }
    }
    players[curPlayerIndex].totalNumberOfTroops-=troopsLost[0];
    players[defenderPlayerIndex].totalNumberOfTroops-=troopsLost[1];
    
	//If a territory being attacked loses all of their troops, this block of
	//code gives the territory to the attacker. Advances one troop to the new territory
    if(territories[defenderTerName].numTroopsOccupied === 0) {
        giveTerritory(curPlayerIndex, defenderPlayerIndex, defenderTerName);
        territories[attackerTerName].numTroopsOccupied--;
        territories[defenderTerName].numTroopsOccupied++;
    }
    updateTerritoryDescription(territories[attackerTerName]);
    updateTerritoryDescription(territories[defenderTerName]);
    updateCurrentPlayerDescription();
	
	//Keeps track of the most amount of territories owned by one player, if that number equals
	//the amount of territories their are for the game, the game is over
    if(players[curPlayerIndex].numTerritoriesOwned > maxNumTerritoriesOwned) {
        maxNumTerritoriesOwned = players[curPlayerIndex].numTerritoriesOwned;
    }
    if(maxNumTerritoriesOwned === numTerritories) {
        mainMenu.entity.description.setValue(players[curPlayerIndex].name + " wins the game!");
    }
	//Removes any player who no longer has a single territory from the game
    if(players[defenderPlayerIndex].numTerritoriesOwned === 0) {
        players.splice(defenderPlayerIndex, 1);
    }
}

//2 arrays are filled with numbers between 1-6 inclusive which act as dice
//Lengths of arrays determined by how many troops are sent into battle for attacker/defender
//Highest numbers from both arrays are compared, player with lower number loses a troop
//Process repeats until all troops battle
//Index 0 of returned array is num troops lost by the attacker
//Index 1 of returned array is num troops lost by the defender
function battle(numAttackers, numDefenders) {
    var troopsLost = [0, 0];
    var attackersDice = [];
    var defendersDice = [];
    var curHighestAttackersDice;
    var curHighestDefendersDice;
    var smallerNumAttackers = numAttackers;
    
    if(numAttackers > numDefenders) {
        smallerNumAttackers = numDefenders;
    }
    console.log("");
    console.log("Battle");
    attackersDice = fillDiceArray(numAttackers);
    defendersDice = fillDiceArray(numDefenders);
    console.log(" Attacker rolled: " + attackersDice);
    console.log(" Defender rolled: " + defendersDice);
    
    for(var i = 0; i < smallerNumAttackers; i++) {
        curHighestAttackersDice = highestDiceOfArray(attackersDice);
        curHighestDefendersDice = highestDiceOfArray(defendersDice);
        if(curHighestAttackersDice > curHighestDefendersDice) {
            troopsLost[1]++;
            console.log("  Defender lost a troop");
            console.log("   Attacker had: " + curHighestAttackersDice);
            console.log("   Defender had: " + curHighestDefendersDice);
        } else if(curHighestAttackersDice < curHighestDefendersDice) {
            troopsLost[0]++;
            console.log("  Attacker lost a troop");
            console.log("   Attacker had: " + curHighestAttackersDice);
            console.log("   Defender had: " + curHighestDefendersDice);
        } else {
            console.log("  Tie!");
            console.log("   Attacker had: " + curHighestAttackersDice);
            console.log("   Defender had: " + curHighestDefendersDice);
        }
        attackersDice.splice(attackersDice.indexOf(curHighestAttackersDice),1);
        defendersDice.splice(defendersDice.indexOf(curHighestDefendersDice),1);
    }
    console.log("");
    return troopsLost;
}
function fillDiceArray(numDice) {
    var diceArray = [];
    for(var i = 0; i < numDice; i++) {
        diceArray[i] = Math.floor(Math.random()*(6)+1);
    }
    return diceArray;
}
function highestDiceOfArray(diceArray) {var highestDice = 0;
    for(var i = 0; i < diceArray.length; i++) {
        if(diceArray[i] > highestDice) {
            highestDice = diceArray[i];
        }
    }
    return highestDice;
}

function updateCurrentPlayerDescription() {
    var loadNextPlayerButton = '<button type="submit" class="nextPlayer" style="width:120px;">Next Player</button>';
    var text = '<p>' + players[curPlayerIndex].name + '\'s Turn</p>\
            <p> Number of territories owned: ' + players[curPlayerIndex].numTerritoriesOwned + '</p>\
            <p> Number of troops: ' + players[curPlayerIndex].totalNumberOfTroops + '</p>\
            <p> Number of deployable troops: ' + numTroopsDeployable + '</p>';
    mainMenu.entity.description.setValue(text + loadNextPlayerButton);
}

function loadNextPlayer() {
    curPlayerIndex++;
    if(curPlayerIndex >= players.length) {
        curPlayerIndex = 0;
    }
    numTroopsDeployable = players[curPlayerIndex].numTerritoriesOwned;
    updateCurrentPlayerDescription();
}

function updateTerritoryDescription(territory) {
    var newDescript = '\
        <p>Owned By: ' + territory.ownedBy.name + '</p>\
        <p>Troops Deployed: ' + territory.numTroopsOccupied + '</p>\
        <button type="submit" class="dep' + territory.name + '" style="width:120px;">Deploy Troops</button>\
        ';
    territory.entity.description.setValue(newDescript);
}

//Gives one troop to the given territory, if that territory is not owned by the current player an error is shown
//If current player has exhausted all of their troops for their turn, they can not deploy any more troops
function deployTroop(terName) {
    if(territories[terName].ownedBy.name !== players[curPlayerIndex].name) {
        console.log("ERROR: You do not own that territory");
    } else if (numTroopsDeployable === 0) {
        console.log("ERROR: No more troops to deploy");
    } else {
        territories[terName].numTroopsOccupied++;
        players[curPlayerIndex].totalNumberOfTroops++;
        numTroopsDeployable--;
        updateCurrentPlayerDescription();
        updateTerritoryDescription(territories[terName]);
    }
}


function buttonTerritoryDisplay() {
    var leftSubString = '<div display="inline-block">\
        <button type="submit" class="Brazil" style="width:120px;">Brazil</button>\
        <button type="submit" class="Britain" style="width:120px;">Britain</button>\
        <button type="submit" class="Canada" style="width:120px;">Canada</button>\
        </div>\
        <div display="inline-block">\
        <button type="submit" class="China" style="width:120px;">China</button>\
        <button type="submit" class="Russia" style="width:120px;">Russia</button>\
        <button type="submit" class="Somolia" style="width:120px;">Somolia</button>\
        </div>\
        <div display="inline-block">\
        <button type="submit" class="UAE" style="width:120px;">UAE</button>\
        <button type="submit" class="USA" style="width:120px;">USA</button> ';
    var rightSubString = '</div> <button type="submit" class="Begin Game" style="width:120px;">Begin Game</button>';
    var australia = '<button type="submit" class="Australia" style="width:120px;">Australia</button>';
    
    if(numPlayers === 2) {
        mainMenu.entity.description.setValue(leftSubString + rightSubString);
    } else if(numPlayers === 3) {
        mainMenu.entity.description.setValue(leftSubString + australia + rightSubString);
        
    }
}

function main() {
    mainMenu = new MainMenu("World Domination", 0, -90, 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/White_flag_waving.svg/249px-White_flag_waving.svg.png');
}
main();