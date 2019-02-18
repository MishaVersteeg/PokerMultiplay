var socket = io("http://127.0.0.1:3000");

handleHTML = new Vue({
    el: '#handleHTML',
    data: {
        createJoinGame: true,
        lobbyGame: false,
        game: false,
    },
    methods: {
    }
})

let gameID ;
let name;
let seatHeroByServer;
let seatHeroByServer_NewReference = []
let holeCards;
let flop;
let turn;
let river;

displayGame = (data, stage) => {

    let playersInHand = data[0];
    let seatsByServer = data[1];
    let stacks = data[2];
    let cards = data[3];
    let SB = data[4];
    let BB = data[5];

    seatHeroByServer = seatsByServer[playersInHand.indexOf(name)];
    seatHeroByServer_NewReference.push(seatHeroByServer)

    for (let i in seatsByServer) {
        seatsByServer[i] -= seatHeroByServer
        if (seatsByServer[i] < 0) { seatsByServer[i] += 10 }
    };

    let seatsByClient = seatsByServer;

    for (let i = 0; i < 10; i++) {
        for (let ii in seatsByClient) {

            if (i == seatsByClient[ii]) {

                let index = seatsByClient.indexOf(i)

                if (stage == "names_Stacks") {
                    document.getElementById(`seat${i}Name`).innerHTML = playersInHand[index];
                    document.getElementById(`seat${i}Stack`).innerHTML = stacks[index];
                }

                if (stage == "highCards") {
                    document.getElementById(`seat${i}Card0`).src = "cardsHighCard/" + cards[index] + ".jpg";

                    timer = setTimeout(() => {
                        document.getElementById(`seat${i}Card0`).src = "";
                    }, 3500)
                }

                if (stage == "holeCards") {
                    timer = setTimeout(() => {
                        document.getElementById(`seat${i}Card0`).src = "cards/" + cards[index][0] + ".jpg";
                        document.getElementById(`seat${i}Card1`).src = "cards/" + cards[index][1] + ".jpg";
                    }, 10)
                    holeCards = cards[playersInHand.indexOf(name)]
                }

                if (stage == "settingBlinds") {

                    document.getElementById(`seat${seatsByClient[0]}Stack`).innerHTML = stacks[0];
                    document.getElementById(`chipsOnTable${seatsByClient[0]}`).innerHTML = SB;

                    timer = setTimeout(() => {
                        document.getElementById(`seat${seatsByClient[1]}Stack`).innerHTML = stacks[1];
                        document.getElementById(`chipsOnTable${seatsByClient[1]}`).innerHTML = BB;
                    }, 800)
                }
            }
        }
    }
}

createGame = () => {

    gameID = document.getElementById("createGameID").value;

    socket.emit('createGame', { gameID })

    socket.on('statusCreateGameAccepted', function (gameState) {

        if (gameState == 'aproved') {

            socket.emit('join', gameID)

            getNameList = setInterval(getNameList, 3000)

            handleHTML.createJoinGame = false;
            handleHTML.lobbyGame = true;
            handleHTML.game = false;

            document.getElementById("createGameID").value = "";
        }

        if (gameState == 'neglected') {

            document.getElementById("messageCreategame").innerHTML = 'this GameID seems to be in use...';
        }
    })
}

startGame = () => {

    socket.emit('startGame', { gameID })

    //document.getElementById("button").disabled = true;
};

joinGame = () => {

    gameID = document.getElementById("submitGameID").value;

    socket.emit('joinGame', { gameID })

    document.getElementById("submitGameID").value = ''

    socket.on('joinGame', (gameState) => {

        if (gameState == 'aproved') {

            socket.emit('join', gameID)

            handleHTML.createJoinGame = false; handleHTML.lobbyGame = true;
            document.getElementById("messageJoingame").innerHTML = 'joining game...';

            getNameList = setInterval(getNameList, 3000)
        }

        if (gameState == 'neglected') {
            document.getElementById("messageJoingame").innerHTML = 'this gameID is not yet created'
        }
    })
};

getNameList = () => {

    socket.emit('getNameList', { gameID })
};

socket.on('getNameList', (gameState) => {

    handleHTML.registerdPlayers.splice(0, 1, gameState)
});

submitName = () => {

    name = document.getElementById("submitName").value;
    document.getElementById("submitName").value = "";

    socket.emit('submitName', { gameID, name })
};

socket.on('submitName', (gameState) => {

    if (gameState == 'aproved') {
        document.getElementById("submitName").disabled = true;
        document.getElementById("buttonSubmitName").disabled = true

    } else if (gameState == 'neglected') {
        // document.getElementById("messageCreatename").innerHTML = 'this name is already in use...'
    }
});

socket.on('dealingHighCard', (data) => { 

    clearInterval(getNameList);

    handleHTML.createJoinGame = false;
    handleHTML.lobbyGame = false;
    handleHTML.game = true;

    timer = setTimeout ( () => {document.getElementById("gameID").innerHTML = gameID}, 100);
    timer = setTimeout ( () => {displayGame(data, stage = "names_Stacks") }, 100);
    timer = setTimeout ( () => {displayGame(data, stage = "highCards") }, 2000);

    timer = setTimeout ( () => {document.getElementById("message").innerHTML = data[4] + " will be the dealer!" }, 3000)
    timer = setTimeout ( () => {document.getElementById("message").innerHTML = "" }, 6500)
});


socket.on('dealingHoleCards', (data) => {

    displayGame(data, stage = "holeCards");

    timer = setTimeout ( () => { displayGame(data, stage = "settingBlinds") }, 800);

    timer = setTimeout ( () => { playerAction(data) }, 2400);
});

socket.on("playerActionToClient", (data) => { 
    playerAction(data) 
})

playerAction = (data) => {

    playersInHand = data[0];
    SB = data[4];
    BB = data[5];
    let lastAction = data[6];
    let PMIP_ForEach = data[7];
    stageHand = data[8];

    seatHeroByServer = seatHeroByServer_NewReference[0];

    if (playersInHand[0] == name) {

        if (lastAction == false && stageHand == "PF" ||
            lastAction == "bet" && stageHand != "PF"  ) { 

            let buttonFold = document.createElement("button"); buttonFold.innerHTML = "fold";
            let bodyButtonFold = document.getElementById("buttonFoldCheck"); bodyButtonFold.appendChild(buttonFold);
            
            let buttonBetCall = document.createElement("button"); buttonBetCall.innerHTML = "call " + ( PMIP_ForEach[PMIP_ForEach.length -1] - PMIP_ForEach[0]);
            let bodyButtonBetCall = document.getElementById("buttonBetCall"); bodyButtonBetCall.appendChild(buttonBetCall);

            let buttonraise2 = document.createElement("button"); buttonraise2.innerHTML = "raise " + (BB+BB);
            let bodyButtonraise2 = document.getElementById("buttonraise2"); bodyButtonraise2.appendChild(buttonraise2);

            let buttonRaise2_5 = document.createElement("button"); buttonRaise2_5.innerHTML = "raise " + (BB+BB+SB);
            let bodyButtonRaise2_5 = document.getElementById("buttonRaise2_5"); bodyButtonRaise2_5.appendChild(buttonRaise2_5);

            removeHeroButtons = () => {

                bodyButtonFold.removeChild(buttonFold);
                bodyButtonBetCall.removeChild(buttonBetCall);
                bodyButtonraise2.removeChild(buttonraise2);
                bodyButtonRaise2_5.removeChild(buttonRaise2_5);
            };

            buttonFold.addEventListener("click", () => {
    
                socket.emit('playerActionToServer',  { gameID, seatHeroByServer, action: 'fold' } )
    
                document.getElementById("seat0Card0").src = "";
                document.getElementById("seat0Card1").src = "";
                removeHeroButtons();
            });

            buttonBetCall.addEventListener("click", function () {
    
                socket.emit('playerActionToServer', { gameID, seatHeroByServer, action: "call"});
    
                removeHeroButtons();
            });

            return
        }

        if (stageHand != "PF") { 

            let buttonCheck = document.createElement("button"); buttonCheck.innerHTML = "check";
            let bodyButtonCheck = document.getElementById("buttonFoldCheck"); bodyButtonCheck.appendChild(buttonCheck);
            
            let buttonBetCall = document.createElement("button"); buttonBetCall.innerHTML = "bet " + ( BB );
            let bodyButtonBetCall = document.getElementById("buttonBetCall"); bodyButtonBetCall.appendChild(buttonBetCall);

            let buttonraise2 = document.createElement("button"); buttonraise2.innerHTML = "raise " + (BB+BB);
            let bodyButtonraise2 = document.getElementById("buttonraise2"); bodyButtonraise2.appendChild(buttonraise2);

            let buttonRaise2_5 = document.createElement("button"); buttonRaise2_5.innerHTML = "raise " + (BB+BB+SB);
            let bodyButtonRaise2_5 = document.getElementById("buttonRaise2_5"); bodyButtonRaise2_5.appendChild(buttonRaise2_5);

            removeHeroButtons = () => {

                bodyButtonCheck.removeChild(buttonCheck);
                bodyButtonBetCall.removeChild(buttonBetCall);
                bodyButtonraise2.removeChild(buttonraise2);
                bodyButtonRaise2_5.removeChild(buttonRaise2_5);
            };

            buttonCheck.addEventListener("click", () => {
    
                socket.emit('playerActionToServer',  { gameID, seatHeroByServer, action: 'check' } )

                document.getElementById("chipsOnTable0").innerHTML = "check"

                removeHeroButtons();
            });

            buttonBetCall.addEventListener("click", function () {
    
                socket.emit('playerActionToServer', { gameID, seatHeroByServer, name, action: "bet"});
    
                removeHeroButtons();
            });
        }

        if (lastAction == "call") {  // check, raise ---- e.g. checking the BB:

            let buttonCheck = document.createElement("button"); buttonCheck.innerHTML = "check";
            let bodyButtonCheck = document.getElementById("buttonFoldCheck"); bodyButtonCheck.appendChild(buttonCheck);
    
            let buttonraise2 = document.createElement("button"); buttonraise2.innerHTML = "raise " + (BB+BB);
            let bodyButtonraise2 = document.getElementById("buttonraise2"); bodyButtonraise2.appendChild(buttonraise2);
    
            let buttonRaise2_5 = document.createElement("button"); buttonRaise2_5.innerHTML = "raise " + (BB+BB+SB);
            let bodyButtonRaise2_5 = document.getElementById("buttonRaise2_5"); bodyButtonRaise2_5.appendChild(buttonRaise2_5);
    
            removeHeroButtons_CHECK_RAISE = () => {
    
                bodyButtonCheck.removeChild(buttonCheck)
                bodyButtonraise2.removeChild(buttonraise2);
                bodyButtonRaise2_5.removeChild(buttonRaise2_5);
            }
    
            buttonCheck.addEventListener("click", () => {
    
                socket.emit('playerActionToServer',  { gameID, name, seatHeroByServer, action: 'check' } )
    
                removeHeroButtons_CHECK_RAISE(); 
            });
        }
    }
}

socket.on("showFold", (data) => {

    a = data - seatHeroByServer_NewReference[0]; if (a < 0) { a += 10 };
    document.getElementById(`seat${a}Card0`).src = "";
    document.getElementById(`seat${a}Card1`).src = "";
})

socket.on("showCheck", (data) => {

    a = data - seatHeroByServer_NewReference[0]; if (a < 0) { a += 10 };
    document.getElementById(`chipsOnTable${a}`).innerHTML = "check";
})

socket.on("showCall", (data) => {
    seatCallerByServer = data[0];
    let PMIP_Caller = data[1];
    let newStackCaller = data[2];

    a = seatCallerByServer - seatHeroByServer_NewReference[0]; if (a < 0) { a += 10 };

    document.getElementById(`chipsOnTable${a}`).innerHTML = PMIP_Caller;
    document.getElementById(`seat${a}Stack`).innerHTML = newStackCaller;
})

socket.on("showBet", (data) => {

    seatBetterByServer = data[0];
    PMIP_lastAction = data[1];
    newStackAfterAction = data[2]

    a = seatBetterByServer - seatHeroByServer_NewReference[0]; if (a < 0) { a += 10 };

    document.getElementById(`chipsOnTable${a}`).innerHTML = PMIP_lastAction;
    document.getElementById(`seat${a}Stack`).innerHTML = newStackAfterAction;
})

socket.on("takePotNoShowDown", (data) => { 

    winnerHand = data[0];
    winnerSeat = data[1];
    pot = data[2];
    winningStack = data[3];

    timer = setTimeout( () => { for (let i = 0; i < 10; i++) {document.getElementById(`chipsOnTable${i}`).innerHTML = ''} }, 500);

    a = winnerSeat - seatHeroByServer_NewReference[0]; if (a < 0) { a += 10 };

    timer = setTimeout( () => { document.getElementById("chipsOnTableAll").innerHTML = pot }, 500);
    timer = setTimeout( () => { document.getElementById("chipsOnTableAll").innerHTML = "" }, 1500);
    
    timer = setTimeout( () => { document.getElementById(`chipsOnTable${a}`).innerHTML = pot}, 1500);
    timer = setTimeout( () => { document.getElementById(`chipsOnTable${a}`).innerHTML = ""}, 3000);
    timer = setTimeout( () => { document.getElementById(`seat${a}Stack`).innerHTML = winningStack }, 3000)
    

    timer = setTimeout ( () => {document.getElementById("message").innerHTML = `${winnerHand} takes the pot and wins ${pot}`}, 500);
    timer = setTimeout ( () => {document.getElementById("message").innerHTML = ""}, 3000);

    timer = setTimeout ( () => {
        document.getElementById("flop0").src = "cards/back.jpg"
        document.getElementById("flop1").src = "cards/back.jpg"
        document.getElementById("flop2").src = "cards/back.jpg"
        document.getElementById("turn").src  = "cards/back.jpg"
        document.getElementById("river").src = "cards/back.jpg"
    }, 4500);


    timer = setTimeout(() => {
        for (let i = 0; i < 10; i++) {
            document.getElementById(`seat${i}Card0`).src = ""
            document.getElementById(`seat${i}Card1`).src = ""
        }
    }, 4500)
})

socket.on('ShowSharedCards', (data) => {

    flop = [];
    turn = [];
    river = [];
    
    let stageHandforCards = data[0];
    flop = data[1];
    turn = data[2]
    river = data[3]
    pot = data[4];

    timer = setTimeout(() => { for (let i = 0; i < 10; i++) { document.getElementById(`chipsOnTable${i}`).innerHTML = '' } }, 500);
    timer = setTimeout(() => { document.getElementById(`chipsOnTableAll`).innerHTML = pot } , 500)

    timer = setTimeout(() => {
        if (stageHandforCards == "PF") {
            document.getElementById("flop0").src = "cards/" + flop[0] + ".jpg";
            document.getElementById("flop1").src = "cards/" + flop[1] + ".jpg";
            document.getElementById("flop2").src = "cards/" + flop[2] + ".jpg";
        }
    }, 1500)

    timer = setTimeout(() => {
        if (stageHandforCards == "PT") {
            document.getElementById("turn").src = "cards/" + turn[0] + ".jpg";
        }
    }, 1500)

    timer = setTimeout(() => {
        if (stageHandforCards == "PR") {
            document.getElementById("river").src = "cards/" + river[0] + ".jpg";
        }
    }, 1500)

    determineHand(holeCards.concat(flop, turn, river))

});

determineHand = (allCards) => {

	spades = new Array;
	clubs = new Array;
	hearts = new Array;
	diamonds = new Array;

	cardSuit = new Array;
	cardValue = new Array;
	suit = new Array;
	cardNumbers = new Array;
	numbersUnique = new Array;
	ifStraight = new Array;
	sameValue = new Array;


	emptyArrays = () => {

		spades = new Array;
		clubs = new Array;
		hearts = new Array;
		diamonds = new Array;

		cardSuit = new Array;
		cardValue = new Array;
		suit = new Array;
		cardNumbers = new Array;
		numbersUnique = new Array;
		ifStraight = new Array;
		sameValue = new Array;
	};


	pushSuits = () => {

		spades = allCards.filter((suit) => suit.startsWith('S'));
		clubs = allCards.filter((suit) => suit.startsWith('C'));
		hearts = allCards.filter((suit) => suit.startsWith('H'));
		diamonds = allCards.filter((suit) => suit.startsWith('D'));

		if (spades.length > 4) {
			for (let i = 0; i < spades.length; i++) {
				let split = spades[i].split('');
				cardSuit.push(split[0]);
				cardValue.push(split[1]);
			}
			suit.push('Spades');

		} if (clubs.length > 4) {
			for (let i = 0; i < clubs.length; i++) {
				let split = clubs[i].split('');
				cardSuit.push(split[0]);
				cardValue.push(split[1]);
			}
			suit.push('clubs');

		} if (hearts.length > 4) {
			for (let i = 0; i < hearts.length; i++) {
				let split = hearts[i].split('');
				cardSuit.push(split[0]);
				cardValue.push(split[1]);
			}
			suit.push('hearts');

		} if (diamonds.length > 4) {
			for (let i = 0; i < diamonds.length; i++) {
				let split = diamonds[i].split('');
				cardSuit.push(split[0]);
				cardValue.push(split[1]);
			}
			suit.push('diamonds')
		}
	};


	toInteger = () => {

		for (let i = 0; i < cardValue.length; i++) {
			cardNumbers.push(cardValue[i].charCodeAt() - 96);
		}
	};


	split = () => {

		for (let i = 0; i < allCards.length; i++) {
			let split = allCards[i].split('');
			cardSuit.push(split[0]);
			cardValue.push(split[1]);
		}
	};


	testStraightFlush = () => {

		pushSuits();

		if (cardSuit.length > 4) {

			cardValue.sort(); toInteger();

			if (cardNumbers.indexOf(1) !== -1
				&& cardNumbers.indexOf(10) !== -1
				&& cardNumbers.indexOf(11) !== -1
				&& cardNumbers.indexOf(12) !== -1
				&& cardNumbers.indexOf(13) !== -1) {
				hand = 'royalFlush';

			} else {

				for (let i = 0; i < cardNumbers.length; i++) {
					if (cardNumbers[i + 1] == cardNumbers[i] + 1 || cardNumbers[i] - 1 == cardNumbers[i - 1]) {
						ifStraight.push(cardNumbers[i]);
					}
				}

				ifStraight.reverse();

				if (ifStraight[0] - ifStraight[4] == 4) {
					ifStraight.splice(5, 2);
				} else if (ifStraight[2] - ifStraight[6] == 4) {
					ifStraight.splice(0, 2);
				} else if (ifStraight[1] - ifStraight[5] == 4) {
					ifStraight.splice(0, 1); ifStraight.splice(6, 1);
				} else {
					ifStraight = new Array;
				}

				if (ifStraight.length > 4) {
					hand = 'straightFlush';
				} else {
					testFourkind();
				}
			}
		} else {
			testFourkind();
		}
	};


	testFourkind = () => {

		emptyArrays(); split(); cardValue.sort(); toInteger();

		for (let i = 0; i < cardNumbers.length; i++) {
			if (cardNumbers[i] == cardNumbers[i + 3]) {
				sameValue.push(cardNumbers[i]);
			}
		}

		if (sameValue.length == 1) {
			hand = 'fourKind';
		} else {
			testFullHouse();
		}

	};


	testFullHouse = () => {

		emptyArrays(); split(); cardValue.sort().reverse(); toInteger();

		for (let i = 0; i < cardNumbers.length; i++) {
			if (cardNumbers[i] == cardNumbers[i + 2]) {
				sameValue.push(cardNumbers[i]);
			}
		}

		if (sameValue.length >= 1) {

			sameValue.splice(1, 1);

			for (let i = 0; i < cardNumbers.length; i++) {
				if (cardNumbers[i] == cardNumbers[i + 1] &&
					cardNumbers[i] !== sameValue[0]) {
					sameValue.push(cardNumbers[i]);
				}
			}

			if (sameValue.length >= 2) {
				hand = 'fullHouse';
			} else {
				testFlush();
			}

		}
		else {
			testFlush();
		}
	};


	testFlush = () => {

		emptyArrays(); pushSuits();

		if (suit.length == 1) {

			cardValue.sort().reverse(); toInteger();

			console.log(cardValue)

			if (cardValue.indexOf('a') !== -1) {
				hand = 'flushAce';
			} else {
				hand = 'flush';
			}

		} else {
			testStraight();
		}
	};


	testStraight = () => {

		emptyArrays(); split(); cardValue.sort(); toInteger();

		if (cardNumbers.indexOf(1) !== -1
			&& cardNumbers.indexOf(10) !== -1
			&& cardNumbers.indexOf(11) !== -1
			&& cardNumbers.indexOf(12) !== -1
			&& cardNumbers.indexOf(13) !== -1) {
			hand = 'straightAce';
		} else {

			for (let i = 0; i < cardNumbers.length; i++) {
				if (cardNumbers[i] !== cardNumbers[i + 1]) {
					numbersUnique.push(cardNumbers[i])
				}
			}

			for (let i = 0; i < numbersUnique.length; i++) {
				if (numbersUnique[i + 1] == numbersUnique[i] + 1 || numbersUnique[i] - 1 == numbersUnique[i - 1]) {
					ifStraight.push(numbersUnique[i]);
				}
			}

			ifStraight.reverse();

			if (ifStraight[0] - ifStraight[4] == 4) {
				ifStraight.splice(0,0);
			} else if (ifStraight[1] - ifStraight[5] == 4) {
				ifStraight.splice(0, 1);
			} else if (ifStraight[2] - ifStraight[6] == 4) {
				ifStraight.splice(0, 2);
			} else if (ifStraight[3] -ifStraight[7] == 4) {
				ifStraight.splice(0,3);
			} else {
				ifStraight = new Array;
			}

			if (ifStraight.length > 4) {
				hand = 'straight';
			} else {
				testThreeKind();
			}
		}
	};


	testThreeKind = () => {

		emptyArrays(); split(); cardValue.sort().reverse(); toInteger();

		for (let i = 0; i < cardNumbers.length; i++) {
			if (cardNumbers[i] == cardNumbers[i + 2]) {
				sameValue.push(cardNumbers[i]);
			}
		}

		if (sameValue.length == 1) {
			hand = 'threeKind';
		} else {
			testTwoPair();
		}
	};


	testTwoPair = () => {

		emptyArrays(); split(); cardValue.sort().reverse(); toInteger();

		for (let i = 0; i < cardNumbers.length; i++) {
			if (cardNumbers[i] == cardNumbers[i + 1]) {
				sameValue.push(cardNumbers[i]);
			}
		}

		for (let i = 0; i < cardNumbers.length; i++) {
			if (cardNumbers[i] == cardNumbers[i + 1] && cardNumbers[i] !== sameValue[0]) {
				sameValue.push(cardNumbers[i]);
			}
		}

		if (sameValue.indexOf(1) != -1 && sameValue.length > 1) {
			hand = 'twoPairAce';
		} else if (sameValue.length > 1) {
			hand = 'twoPair';
		} else {
			testPocketPair();
		}
	};


	testPocketPair = () => {

		emptyArrays(); split(); toInteger();

		if (cardNumbers[0] == cardNumbers[1]) {
			hand = 'pocketPair';
		} else {
			testPair();
		}
	};


	testPair = () => {

		emptyArrays(); split(); toInteger(); cardNumbers.sort();

		for (let i = 0; i < cardNumbers.length; i++) {
			if (cardNumbers[i] == cardNumbers[i + 1]) {
				sameValue.push(cardNumbers[i]);
			}
		}

		if (sameValue.length > 0) {
			hand = 'pair';
		} else {
			testHighCard();
		}
	};


	testHighCard = () => {

		emptyArrays(); split(); cardValue.sort().reverse(); toInteger();

		if (cardNumbers.indexOf(1) !== -1) {
			hand = 'highCardAce';
		} else {
			hand = 'highCard';
		}
	};


	testStraightFlush();

	displayHand = new Array;

	fiftyHandsArr = new Array;


	let a = cardNumbers.indexOf(1); if (a > -1) { cardNumbers[a] = 'Ace' }
	let b = cardNumbers.indexOf(11); if (b > -1) { cardNumbers[b] = 'Jack' }
	let c = cardNumbers.indexOf(12); if (c > -1) { cardNumbers[c] = 'Queen' }
	let d = cardNumbers.indexOf(13); if (d > -1) { cardNumbers[d] = 'King' }

	let e = sameValue.indexOf(1); if (e > -1) { sameValue[e] = 'Ace' }
	let f = sameValue.indexOf(11); if (f > -1) { sameValue[f] = 'Jack' }
	let g = sameValue.indexOf(12); if (g > -1) { sameValue[g] = 'Queen' }
	let h = sameValue.indexOf(13); if (h > -1) { sameValue[h] = 'King' }

	let i = ifStraight.indexOf(1); if (i > -1) { ifStraight[i] = 'Ace' }
	let j = ifStraight.indexOf(11); if (j > -1) { ifStraight[j] = 'Jack' }
	let k = ifStraight.indexOf(12); if (k > -1) { ifStraight[k] = 'Queen' }
	let l = ifStraight.indexOf(13); if (l > -1) { ifStraight[l] = 'King' }

	let m = cardSuit.indexOf('S'); if (m > -1) { cardSuit[m] = 'Spades' }
	let n = cardSuit.indexOf('C'); if (n > -1) { cardSuit[n] = 'Clubs' }
	let o = cardSuit.indexOf('H'); if (o > -1) { cardSuit[o] = 'Hearts' }
	let p = cardSuit.indexOf('D'); if (p > -1) { cardSuit[p] = 'Diamonds' }


	switch (hand) {
		case 'royalFlush':
			displayHand = `!! A royal flush of ${suit} !!`
			break;
		case 'straightFlush':
			displayHand = `!! A straight flush of ${suit}, ${ifStraight[0]} high !!`
			break;
		case 'fourKind':
			displayHand = `!! Four-of-a-kind ${sameValue[0]}'s !!`
			break;
		case 'fullHouse':
			displayHand = `!! A full house, ${sameValue[0]}'s over ${sameValue[1]}'s !!`
			break;
		case 'flushAce':
			displayHand = `!! A Flush of ${cardSuit[0]}, Ace high !!`
			break;
		case 'flush':
			displayHand = `!! A Flush of ${cardSuit[0]}, ${cardNumbers[0]} high !!`
			break;
		case 'straightAce':
			displayHand = `!! A Straight, Ace high !!`
			break;
		case 'straight':
			displayHand = `!! A Straight, ${ifStraight[0]} high !!`
			break;
		case 'littleStraightAce':
			displayHand = `!! A Little Straight (Jort-Straight), Ace high !!`
			break;
		case 'littleStraight':
			displayHand = `!! A Little Straight (Jort-Straight), ${ifStraight[0]} high !!`
			break;
		case 'threeKind':
			displayHand = `!! Three-of-a-kind ${sameValue[0]}'s !!`
			break;
		case 'twoPairAce':
			displayHand = `!! Two pair Ace's and ${sameValue[0]}'s !!`
			break;
		case 'twoPair':
			displayHand = `!! Two pair ${sameValue[0]}'s and ${sameValue[1]}'s !!`
			break;
		case 'pocketPair':
			displayHand = `!! A pocketpair of ${cardNumbers[0]}'s !!`
			break;
		case 'pair':
			displayHand = `!! A pair of ${sameValue[0]}'s !!`
			break;
		case 'highCard':
			displayHand = `!! High card ${cardNumbers[0]} !!`
			break;
		case 'highCardAce':
			displayHand = `!! High card Ace !!`
			break;
	}

	document.getElementById("hand").innerHTML = displayHand;
};
/*
socket.on("playerActionToClient", (data) => { 


    handState = data.handState
    console.log("​playerActionToClient", handState)

    if (data.lastPMIP) {
    s = data.seatHeroByClient - seatHerobyServerHardCopy[0]; if (s < 0) { s += 10 };
    document.getElementById(`chipsOnTable${s}`).innerHTML = data.lastPMIP;
    //a = document.getElementById(`seat${s}Stack`).innerHTML;
    document.getElementById(`seat${s}Stack`).innerHTML = data.updatedStack;

    }

    if (handState[0][0] == name) {

        seatHeroByClient = seatHerobyServerHardCopy[0]

       if (handState[1][handState[1].length -1] != handState[1][0]) { // fold, call, raise ---- e.g. completing the SB:

            let buttonFold = document.createElement("button"); buttonFold.innerHTML = "fold";
            let bodyButtonFold = document.getElementById("buttonFoldCheck"); bodyButtonFold.appendChild(buttonFold);
            
            let buttonBetCall = document.createElement("button"); buttonBetCall.innerHTML = "call " + (handState[1][handState[1].length -1] - handState[1][0]);
            let bodyButtonBetCall = document.getElementById("buttonBetCall"); bodyButtonBetCall.appendChild(buttonBetCall);

            let buttonraise2 = document.createElement("button"); buttonraise2.innerHTML = "raise " + (BB+BB);
            let bodyButtonraise2 = document.getElementById("buttonraise2"); bodyButtonraise2.appendChild(buttonraise2);

            let buttonRaise2_5 = document.createElement("button"); buttonRaise2_5.innerHTML = "raise " + (BB+BB+SB);
            let bodyButtonRaise2_5 = document.getElementById("buttonRaise2_5"); bodyButtonRaise2_5.appendChild(buttonRaise2_5);

            removeHeroButtons = () => {

                bodyButtonFold.removeChild(buttonFold);
                bodyButtonBetCall.removeChild(buttonBetCall);
                bodyButtonraise2.removeChild(buttonraise2);
                bodyButtonRaise2_5.removeChild(buttonRaise2_5);
            };

            buttonFold.addEventListener("click", () => {
    
                socket.emit('playerActionToServer',  { gameID, name, seatHeroByClient, action: 'fold' } )
    
                document.getElementById("seat0Card0").src = "";
                document.getElementById("seat0Card1").src = "";
                removeHeroButtons();
            });

            buttonBetCall.addEventListener("click", function () {
    
                socket.emit('playerActionToServer', { gameID, name, seatHeroByClient, action: "call"});
    
                removeHeroButtons();
            });
        }
        
        
        if (handState[1][handState[1].length -1] == handState[1][0] && handState[1][0] != 0) {  // check, raise ---- e.g. checking the BB:

            let buttonCheck = document.createElement("button"); buttonCheck.innerHTML = "check";
            let bodyButtonCheck = document.getElementById("buttonFoldCheck"); bodyButtonCheck.appendChild(buttonCheck);

            let buttonraise2 = document.createElement("button"); buttonraise2.innerHTML = "raise " + (BB+BB);
            let bodyButtonraise2 = document.getElementById("buttonraise2"); bodyButtonraise2.appendChild(buttonraise2);

            let buttonRaise2_5 = document.createElement("button"); buttonRaise2_5.innerHTML = "raise " + (BB+BB+SB);
            let bodyButtonRaise2_5 = document.getElementById("buttonRaise2_5"); bodyButtonRaise2_5.appendChild(buttonRaise2_5);

            removeHeroButtons_CHECK_RAISE = () => {

                bodyButtonCheck.removeChild(buttonCheck)
                bodyButtonraise2.removeChild(buttonraise2);
                bodyButtonRaise2_5.removeChild(buttonRaise2_5);
            }

            buttonCheck.addEventListener("click", () => {
    
                socket.emit('playerActionToServer',  { gameID, name, seatHeroByClient, action: 'check' } )
    
                removeHeroButtons_CHECK_RAISE(); 
            });
        }
        

        if (handState[1][0] == 0) {  // check, bet, raise e.g. UTG post-flop

            let buttonCheck = document.createElement("button"); buttonCheck.innerHTML = "check";
            let bodyButtonCheck = document.getElementById("buttonFoldCheck"); bodyButtonCheck.appendChild(buttonCheck);
           
            let buttonBetBB = document.createElement("button"); buttonBetBB.innerHTML = "bet " + BB;
            let bodyButtonBetBB = document.getElementById("buttonBetCall"); bodyButtonBetBB.appendChild(buttonBetBB);
            
            let buttonraise2 = document.createElement("button"); buttonraise2.innerHTML = "raise " + (BB+BB);
            let bodyButtonraise2 = document.getElementById("buttonraise2"); bodyButtonraise2.appendChild(buttonraise2);

            let buttonRaise2_5 = document.createElement("button"); buttonRaise2_5.innerHTML = "raise " + (BB+BB+SB);
            let bodyButtonRaise2_5 = document.getElementById("buttonRaise2_5"); bodyButtonRaise2_5.appendChild(buttonRaise2_5);

            removeHeroButtons_CHECK_BET_RAISE = () => {

                bodyButtonCheck.removeChild(buttonCheck);
                bodyButtonBetBB.removeChild(buttonBetBB);
                bodyButtonraise2.removeChild(buttonraise2);
                bodyButtonRaise2_5.removeChild(buttonRaise2_5);
            };

            buttonCheck.addEventListener("click", () => {
    
                socket.emit('playerActionToServer',  { gameID, name, seatHeroByClient, action: 'check' } )
    
                removeHeroButtons_CHECK_BET_RAISE(); 
            });

            buttonBetBB.addEventListener("click", () => {
    
                socket.emit('playerActionToServer',  { gameID, name, seatHeroByClient, action: "Bet", ammount: BB } )
    
                removeHeroButtons_CHECK_BET_RAISE(); 
            });
        }



        //////////buttonFold

/*
        buttonCheck.addEventListener("click", () => {

            seatHeroByClient = seatHerobyServerHardCopy[0]

            socket.emit('playerActionToServer',  { gameID, name, seatHeroByClient, action: 'check' } )

            removeHeroButtonsCheck(); 
        });


        buttonBetCall.addEventListener("click", function () {

            seatHeroByClient = seatHerobyServerHardCopy[0];

            socket.emit('playerActionToServer', { gameID, name, seatHeroByClient, action: "call" });

            removeHeroButtonsFold();
        });

        buttonraise2.addEventListener("click", () => {

            action = 'raise2';

            socket.emit('playerActionToServer',  { gameID, name, action } )
        });

        buttonRaise2_5.addEventListener("click", function () {

            action = 'raise2_5';

            socket.emit('playerActionToServer', { gameID, name, action })
        });
        
    


    }
});

socket.on("takePotNoShowDown", (data) => { 

    data = Object.assign({}, data);

    timer = setTimeout( () => { for (let i = 0; i < 10; i++) {document.getElementById(`chipsOnTable${i}`).innerHTML = ''} }, 500) 

    timer = setTimeout( () => { document.getElementById("chipsOnTableAll").innerHTML = data.pot }, 500);
    timer = setTimeout( () => { document.getElementById("chipsOnTableAll").innerHTML = "" }, 3000);

    timer = setTimeout ( () => {document.getElementById("message").innerHTML = `${data.winnerHand} takes the pot and wins ${data.pot}`}, 500);
    timer = setTimeout ( () => {document.getElementById("message").innerHTML = ""}, 3000);

    timer = setTimeout ( () => { for (let i = 0; i < 10; i++) {document.getElementById(`seat${i}Card0`).src = ""; 
    document.getElementById(`seat${i}Card1`).src = "" } }, 3000)
})

socket.on("showFold", (data) => {

    s = data - seatHerobyServerHardCopy[0]; if (s < 0) { s += 10 };
    document.getElementById(`seat${s}Card0`).src = "";
    document.getElementById(`seat${s}Card1`).src = "";
})

/*

socket.on("!UTG", (data) => { console.log(data)

    if (data.playersTurn[0][0] == name) {
        displayActionButtons(data);
    }    

    //show SB gets completed:
    s = data.seatHeroByClient - seatHerobyServerHardCopy[0]; if (s < 0) { s += 10 };
    document.getElementById(`chipsOnTable${s}`).innerHTML = data.lastPMIP;
})




displayActionButtons = (data) => {

    if (data.stage == "PF") {
        var buttonFold = document.createElement("button"); buttonFold.innerHTML = "fold";
        var bodyButtonFold = document.getElementById("buttonFoldCheck"); bodyButtonFold.appendChild(buttonFold);

        buttonFold.addEventListener("click", () => {

            let seatHeroByClient = seatHerobyServerHardCopy[0];

            socket.emit('playerActionToServer', { gameID, name, seatHeroByClient, action: "fold" });

            document.getElementById("seat0Card0").src = "";
            document.getElementById("seat0Card1").src = "";

            removeHeroButtons();
        });

    } else if (data.stage == "finalCheck") {
        var buttonCheck = document.createElement("button"); buttonCheck.innerHTML = "check";
        var bodyButtonCheck = document.getElementById("buttonFoldCheck"); bodyButtonCheck.appendChild(buttonCheck);

        buttonCheck.addEventListener("click", () => {

            let seatHeroByClient = seatHerobyServerHardCopy[0];

            socket.emit('playerActionToServer', { gameID, name, seatHeroByClient, action: "check" });

            removeHeroButtons();
        });
    }

    if (data.stage == "PF") {
        if (data.gameState.length == 2 && data.lastAction == 0) {
            var buttonBetBB = document.createElement("button"); buttonBetBB.innerHTML = "complete " + SB;

            buttonBetBB.addEventListener("click", () => {

                let seatHeroByClient = seatHerobyServerHardCopy[0];

                if (data.gameState.length == 2) {
                    socket.emit('playerActionToServer', { gameID, name, seatHeroByClient, PMIP: SB, action: "completeSB" })
                    /////////////////////////////    
                }


                removeHeroButtons();
            });

        } else {
            var buttonBetBB = document.createElement("button"); buttonBetBB.innerHTML = "bet " + BB;
        }
        var bodyButtonBetBB = document.getElementById("buttonBetBB"); bodyButtonBetBB.appendChild(buttonBetBB);
    }



    var buttonraise2 = document.createElement("button"); buttonraise2.innerHTML = "raise " + (BB + BB);
    var bodyButtonraise2 = document.getElementById("buttonraise2"); bodyButtonraise2.appendChild(buttonraise2);

    var buttonRaise2_5 = document.createElement("button"); buttonRaise2_5.innerHTML = "raise " + (BB + BB + SB);
    var bodyButtonRaise2_5 = document.getElementById("buttonRaise2_5"); bodyButtonRaise2_5.appendChild(buttonRaise2_5);






    buttonraise2.addEventListener("click", () => {

        action = 'raise2';

        socket.emit('playerActionToServer',  { gameID, name, action } )
        removeHeroButtons();
    });

    buttonRaise2_5.addEventListener("click", function () {

        action = 'raise2_5';

        socket.emit('playerActionToServer', { gameID, name, action })
        removeHeroButtons();
    });

    //var list = document.getElementById("myList");
    //list.removeChild(list.childNodes[0]);

    removeHeroButtons  = () => {
        bodyButtonFold.removeChild(buttonFold);
        bodyButtonBetBB.removeChild(buttonBetBB);
        bodyButtonraise2.removeChild(buttonraise2);
        bodyButtonRaise2_5.removeChild(buttonRaise2_5);
    }
}

socket.on("showFold", (data) => {

    s = data - seatHerobyServerHardCopy[0]; if (s < 0) { s += 10 };
    document.getElementById(`seat${s}Card0`).src = "";
    document.getElementById(`seat${s}Card1`).src = "";
})

socket.on("takePotNoShowDown", (data1) => { 

    data = Object.assign({}, data1);

    timer = setTimeout( () => { for (let i = 0; i < 10; i++) {document.getElementById(`chipsOnTable${i}`).innerHTML = ''} }, 500) 

    timer = setTimeout( () => { document.getElementById("chipsOnTableAll").innerHTML = data.pot }, 500);
    timer = setTimeout( () => { document.getElementById("chipsOnTableAll").innerHTML = "" }, 3000);

    timer = setTimeout ( () => {document.getElementById("message").innerHTML = `${data.winnerHand} takes the pot and wins ${data.pot}`}, 500);
    timer = setTimeout ( () => {document.getElementById("message").innerHTML = ""}, 3000);

    timer = setTimeout ( () => { for (let i = 0; i < 10; i++) {document.getElementById(`seat${i}Card0`).src = ""; 
    document.getElementById(`seat${i}Card1`).src = "" } }, 3000)
})



    buttonFoldCheck.addEventListener("click", () => {

        alert('fold')

        action = 'foldCheck';

        socket.emit('playerActionToServer',  { gameID, name, action = "foldCheck" } )

        document.getElementById("seat0Card0").src = "cards/back.jpg";
        document.getElementById("seat0Card1").src = "cards/back.jpg";
    });

    bodyButtonBetBB.addEventListener("click", function () {

        action = 'betBB';

        socket.emit('playerActionToServer', { gameID, name, action })
    });

    buttonraise2.addEventListener("click", () => {

        action = 'raise2';

        socket.emit('playerActionToServer',  { gameID, name, action } )
    });

    buttonRaise2_5.addEventListener("click", function () {

        action = 'raise2_5';

        socket.emit('playerActionToServer', { gameID, name, action })
    });





firstActionPF = gameState => { console.log(gameState)

    if (gameState.length == 2) {
        if (gameState[0][0] == name) {
            displayActionButtons(stage = "preflopHU");
        }
    }  else {
        if (gameState[2][0] == name) {
            displayActionButtons();
        }

    }


}
    names = gameState.names;
    cards = gameState.cards;
    playerSeats = gameState.positionPositions[0];

    gameMap = new Map();
    playerSeatsArr = playerSeats.slice(0);  // werkt dit ook in nieuwe functie?


    if (names.length >= 1) { gameMap.set(names[0], [cards[0][0]] ) }
    if (names.length >= 2) { gameMap.set(names[1], [cards[0][1]] ) }
    if (names.length >= 3) { gameMap.set(names[2], [cards[0][2]] ) }
    if (names.length >= 4) { gameMap.set(names[3], [cards[0][3]] ) }
    if (names.length >= 5) { gameMap.set(names[4], [cards[0][4]] ) }
    if (names.length >= 6) { gameMap.set(names[5], [cards[0][5]] ) }
    if (names.length >= 7) { gameMap.set(names[6], [cards[0][6]] ) }
    if (names.length >= 8) { gameMap.set(names[7], [cards[0][7]] ) }
    if (names.length >= 9) { gameMap.set(names[8], [cards[0][8]] ) }
    if (names.length >= 10){ gameMap.set(names[9], [cards[0][9]] ) }

    gameArr = Array.from(gameMap);



    playerPosServer = playerSeatsArr[names.indexOf(name)]


    for (let i = 0; i < playerSeatsArr.length; i++) {

        playerSeatsArr[i] -= playerPosServer;

        if (playerSeatsArr[i] == -1) { playerSeatsArr[i] = 9 }
        if (playerSeatsArr[i] == -2) { playerSeatsArr[i] = 8 }
        if (playerSeatsArr[i] == -3) { playerSeatsArr[i] = 7 }
        if (playerSeatsArr[i] == -4) { playerSeatsArr[i] = 6 }
        if (playerSeatsArr[i] == -5) { playerSeatsArr[i] = 5 }
        if (playerSeatsArr[i] == -6) { playerSeatsArr[i] = 4 }
        if (playerSeatsArr[i] == -7) { playerSeatsArr[i] = 3 }
        if (playerSeatsArr[i] == -8) { playerSeatsArr[i] = 2 }
        if (playerSeatsArr[i] == -9) { playerSeatsArr[i] = 1 }
    }

    displayGameHighCard();






socket.on('dealer', (gameState) => {

    document.getElementById("message").innerHTML = gameState + ' has the button!'
    document.getElementById("gameID").innerHTML = gameID
})


socket.on('dealingHoleCards', (dataHC) => { console.log('dataHC =', dataHC)

    names = dataHC.positionAll[0];
    seatsByServerData = dataHC.positionAll[1];
    cards = dataHC.positionAll[2];
    prevAction = dataHC.positionAll[3];
    stacks = dataHC.startStack

    seatsByServer = seatsByServerData.slice(0);

    seatHeroByServer = seatsByServer[names.indexOf(name)]

    console.log("cards =" , cards)



    for (let i = 0; i < seatsByServer.length; i++) {

        seatsByServer[i] -= seatHeroByServer;

        if (seatsByServer[i] == -1) { seatsByServer[i] = 9 }
        if (seatsByServer[i] == -2) { seatsByServer[i] = 8 }
        if (seatsByServer[i] == -3) { seatsByServer[i] = 7 }
        if (seatsByServer[i] == -4) { seatsByServer[i] = 6 }
        if (seatsByServer[i] == -5) { seatsByServer[i] = 5 }
        if (seatsByServer[i] == -6) { seatsByServer[i] = 4 }
        if (seatsByServer[i] == -7) { seatsByServer[i] = 3 }
        if (seatsByServer[i] == -8) { seatsByServer[i] = 2 }
        if (seatsByServer[i] == -9) { seatsByServer[i] = 1 }
    }

    seatsByClient = seatsByServer

    gameMap = new Map()

        if (names.length >= 2)  { gameMap.set( names[0], seatsByClient[0], cards[0][0] )}
        /*
        if (names.length >= 2)  { gameMap.set( names[1], seatsByClient[1], [cards[1][0],  cards[1][1]],  stacks[0] ) }
        if (names.length >= 3)  { gameMap.set( names[2], seatsByClient[2], [cards[2][0],  cards[2][1]],  stacks[0] ) }
        if (names.length >= 4)  { gameMap.set( names[3], seatsByClient[3], [cards[3][0],  cards[3][1]],  stacks[0] ) }
        if (names.length >= 5)  { gameMap.set( names[4], seatsByClient[4], [cards[4][0],  cards[4][1]],  stacks[0] ) }
        if (names.length >= 6)  { gameMap.set( names[5], seatsByClient[5], [cards[5][0],  cards[5][1]],  stacks[0] ) }
        if (names.length >= 7)  { gameMap.set( names[6], seatsByClient[6], [cards[6][0],  cards[6][1]],  stacks[0] ) }
        if (names.length >= 8)  { gameMap.set( names[7], seatsByClient[7], [cards[7][0],  cards[7][1]],  stacks[0] ) }
        if (names.length >= 9)  { gameMap.set( names[8], seatsByClient[8], [cards[8][0],  cards[8][1]],  stacks[0] ) }
        if (names.length >= 10) { gameMap.set( names[9], seatsByClient[9], [cards[9][0],  cards[9][1]],  stacks[0] ) }

    game = Array.from(gameMap);
    console.log("seatsByClient =", seatsByClient)

    console.log('game = ', game)

    displayGame(seatsByClient, game);

    postBlinds = () => {

        if (seatsByClient.indexOf(0) != -1) {

            if (seatsByClient.indexOf(0) == 1) {
                document.getElementById("chipsOnTable0").innerHTML = 'SB ' + SB
                document.getElementById("seat0Stack").innerHTML = gameArr[1][1][2]

            }
            i = seatsByClient.indexOf(0)
            document.getElementById("chipsOnTable0").innerHTML = 0
        }
        if (seatsByClient.indexOf(1) != -1) {
            i = seatsByClient.indexOf(1)
            document.getElementById("chipsOnTable1").innerHTML = 1
        }
        if (seatsByClient.indexOf(2) != -1) {
            i = seatsByClient.indexOf(2)
            document.getElementById("chipsOnTable2").innerHTML = 2
        }
        if (seatsByClient.indexOf(3) != -1) {
            i = seatsByClient.indexOf(3)
            document.getElementById("chipsOnTable3").innerHTML = 3
        }
        if (seatsByClient.indexOf(4) != -1) {
            i = seatsByClient.indexOf(4)
            document.getElementById("chipsOnTable4").innerHTML = 4
        }
        if (seatsByClient.indexOf(5) != -1) {
            i = seatsByClient.indexOf(5)
            document.getElementById("chipsOnTable5").innerHTML = 5
        }
        if (seatsByClient.indexOf(6) != -1) {
            i = seatsByClient.indexOf(6)
            document.getElementById("chipsOnTable6").innerHTML = 6
        }
        if (seatsByClient.indexOf(7) != -1) {
            i = seatsByClient.indexOf(7)
            document.getElementById("chipsOnTable7").innerHTML = 7
        }
        if (seatsByClient.indexOf(8) != -1) {
            i = seatsByClient.indexOf(8)
            document.getElementById("chipsOnTable8").innerHTML = 8
        }
        if (seatsByClient.indexOf(9) != -1) {
            i = seatsByClient.indexOf(9)
            document.getElementById("chipsOnTable9").innerHTML = 9
        }
    }

   // postBlinds();








        gameHoleCards = new Map();
        playerSeatsArr = playerSeats.slice(0);

        if (names.length >= 1)  { gameHoleCards.set( names[0], [cards[0][0],  cards[0][1],  stacks[0], posButton[0], playerSeats[names.indexOf(names[0])] ] ) }
        if (names.length >= 2)  { gameHoleCards.set( names[1], [cards[0][2],  cards[0][3],  stacks[1], posButton[1], playerSeats[names.indexOf(names[1])]] ) }
        if (names.length >= 3)  { gameHoleCards.set( names[2], [cards[0][4],  cards[0][5],  stacks[2], posButton[2], playerSeats[names.indexOf(names[2])]] ) }
        if (names.length >= 4)  { gameHoleCards.set( names[3], [cards[0][6],  cards[0][7],  stacks[3], posButton[3], playerSeats[names.indexOf(names[3])]] ) }
        if (names.length >= 5)  { gameHoleCards.set( names[4], [cards[0][8],  cards[0][9],  stacks[4], posButton[4], playerSeats[names.indexOf(names[4])]] ) }
        if (names.length >= 6)  { gameHoleCards.set( names[5], [cards[0][10], cards[0][11], stacks[5], posButton[5], playerSeats[names.indexOf(names[5])]] ) }
        if (names.length >= 7)  { gameHoleCards.set( names[6], [cards[0][12], cards[0][13], stacks[6], posButton[6], playerSeats[names.indexOf(names[6])]] ) }
        if (names.length >= 8)  { gameHoleCards.set( names[7], [cards[0][14], cards[0][15], stacks[7], posButton[7], playerSeats[names.indexOf(names[7])]] ) }
        if (names.length >= 9)  { gameHoleCards.set( names[8], [cards[0][16], cards[0][17], stacks[8], posButton[8], playerSeats[names.indexOf(names[8])]] ) }
        if (names.length >= 10) { gameHoleCards.set( names[9], [cards[0][18], cards[0][19], stacks[9], posButton[9], playerSeats[names.indexOf(names[9])]] ) }

        gameArr = Array.from(gameHoleCards);

        playerPosServer = playerSeatsArr[names.indexOf(name)];

        for (let i = 0; i < playerSeatsArr.length; i++) {

            playerSeatsArr[i] -= playerPosServer;

            if (playerSeatsArr[i] == -1) {playerSeatsArr[i] = 9}
            if (playerSeatsArr[i] == -2) {playerSeatsArr[i] = 8}
            if (playerSeatsArr[i] == -3) {playerSeatsArr[i] = 7}
            if (playerSeatsArr[i] == -4) {playerSeatsArr[i] = 6}
            if (playerSeatsArr[i] == -5) {playerSeatsArr[i] = 5}
            if (playerSeatsArr[i] == -6) {playerSeatsArr[i] = 4}
            if (playerSeatsArr[i] == -7) {playerSeatsArr[i] = 3}
            if (playerSeatsArr[i] == -8) {playerSeatsArr[i] = 2}
            if (playerSeatsArr[i] == -9) {playerSeatsArr[i] = 1}
        }

         //do { a = gameArr.shift(); gameArr.push(a) } while (gameArr[0][0] != name)

         console.log('dataHC =', gameState)
         console.log( 'playerSeatsArrHC =', playerSeatsArr)


        document.getElementById("message").innerHTML = ''

        displayGame();

        console.log('gameArr for Blinds =', gameArr)











        if (gameArr[0][1][3] == 'button') {

            gameArr[1][1][2] -= SB;

            postSB = setTimeout(() => {
                document.getElementById("chipsOnTable1").innerHTML = 'SB ' + SB
                document.getElementById("seat1Stack").innerHTML = gameArr[1][1][2]
            }, 1000)

            gameArr[2][1][2] -= BB;

            postBB = setTimeout(() => {
                document.getElementById("chipsOnTable2").innerHTML = 'BB ' + BB;
                document.getElementById("seat2Stack").innerHTML = gameArr[2][1][2]
            }, 2000)
        }


        if (gameArr[1][1][3] == 'button') {

            gameArr[2][1][2] -= SB;

            postSB = setTimeout(() => {
                document.getElementById("chipsOnTable2").innerHTML = 'SB ' + SB
                document.getElementById("seat2Stack").innerHTML = gameArr[2][1][2]
            }, 1000)

            gameArr[3][1][2] -= BB;

            postBB = setTimeout(() => {
                document.getElementById("chipsOnTable3").innerHTML = 'BB ' + BB;
                document.getElementById("seat3Stack").innerHTML = gameArr[3][1][2]
            }, 2000)
        }


        if (gameArr[2][1][3] == 'button') {

            gameArr[3][1][2] -= SB;

            postSB = setTimeout(() => {
                document.getElementById("chipsOnTable3").innerHTML = 'SB ' + SB
                document.getElementById("seat3Stack").innerHTML = gameArr[3][1][2]
            }, 1000)

            gameArr[0][1][2] -= BB;

            postBB = setTimeout(() => {
                document.getElementById("chipsOnTable0").innerHTML = 'BB ' + BB;
                document.getElementById("seat0Stack").innerHTML = gameArr[0][1][2]
            }, 2000)
        }


        if (gameArr[3][1][3] == 'button') {

            gameArr[0][1][2] -= SB;

            postSB = setTimeout(() => {
                document.getElementById("chipsOnTable0").innerHTML = 'SB ' + SB
                document.getElementById("seat0Stack").innerHTML = gameArr[0][1][2]
            }, 1000)

            gameArr[1][1][2] -= BB;

            postBB = setTimeout(() => {
                document.getElementById("chipsOnTable1").innerHTML = 'BB ' + BB;
                document.getElementById("seat1Stack").innerHTML = gameArr[1][1][2]
            }, 2000)
        }


})



socket.on('playerAction', (gameState) => {


     //   previous actions can be:
     // - false
     // - fold
     // - check
     // - call
     // - raise

    if (gameState.playerToAct == name) {

        if (gameState.previousAction == 'false') {

            var buttonFoldCheck = document.createElement("button"); buttonFoldCheck.innerHTML = "fold";
            var bodyButtonFoldCheck = document.getElementById("buttonFoldCheck"); bodyButtonFoldCheck.appendChild(buttonFoldCheck);

            var buttonBetBB = document.createElement("button"); buttonBetBB.innerHTML = "bet " + BB;
            var bodyButtonBetBB = document.getElementById("buttonBetBB"); bodyButtonBetBB.appendChild(buttonBetBB);

            var buttonraise2 = document.createElement("button"); buttonraise2.innerHTML = "raise " + (BB+BB);
            var bodyButtonraise2 = document.getElementById("buttonraise2"); bodyButtonraise2.appendChild(buttonraise2);

            var buttonRaise2_5 = document.createElement("button"); buttonRaise2_5.innerHTML = "raise " + (BB+BB+SB);
            var bodyButtonRaise2_5 = document.getElementById("buttonRaise2_5"); bodyButtonRaise2_5.appendChild(buttonRaise2_5);

            //var slider = document.createElement("range");
            //var bodyslider = document.getElementById("slider"); bodyslider.appendChild(slider);

            buttonFoldCheck.addEventListener("click", () => {

                alert('fold')

                action = 'foldCheck';

                socket.emit('playerActionToServer',  { gameID, name, action } )

                document.getElementById("seat0Card0").src = "cards/back.jpg";
                document.getElementById("seat0Card1").src = "cards/back.jpg";
            });

            bodyButtonBetBB.addEventListener("click", function () {

                action = 'betBB';

                socket.emit('playerActionToServer', { gameID, name, action })
            });

            buttonraise2.addEventListener("click", () => {

                action = 'raise2';

                socket.emit('playerActionToServer',  { gameID, name, action } )
            });

            buttonRaise2_5.addEventListener("click", function () {

                action = 'raise2_5';

                socket.emit('playerActionToServer', { gameID, name, action })
            });




        }

    }


    if (gameState != name) {

    }
})





        /*
        var buttonFoldCheck = document.createElement("button");
        button.innerHTML = "fold / check";

        var buttonCall = document.createElement("button");
        button.innerHTML = "call";

        var body = document.getElementById("foldButton"); //body?
        body.appendChild(buttonFoldCheck);

        var body = document.getElementById("foldButton");
        body.appendChild(buttonCall);

        buttonFoldCheck.addEventListener("click", function () {
            alert("folded!!");
        });

        buttonCall.addEventListener("click", function () {
            alert("folded!!");
        });


        ----------------------------------



    //var list = document.getElementById("myList");
    //list.removeChild(list.childNodes[0]);

    -----------------------------------------







    if (gameState[0] == name) {  // --> SB

        ChipsOnTable0 = gameArr[0][1][2] - 25,
        gameArr[0][1][2] =- 25;
    }

    if (gameState[1] == name) {

        ChipsOnTable1 = gameArr[0][1][2] - 50,
        gameArr[0][1][2] =- 50;
    }

    if (gameState[2] == name) {

    }


    displayGameHighCard = () => {
    console.log('function = ', playerSeatsArr)


    if (playerSeatsArr.indexOf(0) != -1) {
        i = playerSeatsArr.indexOf(0)
        document.getElementById("seat0Name").innerHTML = gameArr[i][0]
        document.getElementById("seat0Card0").src = "cardsHighCard/" + gameArr[i][1][0] + ".jpg";
    }

    if (playerSeatsArr.indexOf(1) != -1) {
        i = playerSeatsArr.indexOf(1)
        document.getElementById("seat1Name").innerHTML = gameArr[i][0]
        document.getElementById("seat1Card0").src = "cardsHighCard/" + gameArr[i][1][0] + ".jpg";
    }

    if (playerSeatsArr.indexOf(2) != -1) {
        i = playerSeatsArr.indexOf(2)
        document.getElementById("seat2Name").innerHTML = gameArr[i][0]
        document.getElementById("seat2Card0").src = "cardsHighCard/" + gameArr[i][1][0] + ".jpg";
    }

    if (playerSeatsArr.indexOf(3) != -1) {
        i = playerSeatsArr.indexOf(3)
        document.getElementById("seat3Name").innerHTML = gameArr[i][0]
        document.getElementById("seat3Card0").src = "cardsHighCard/" + gameArr[i][1][0] + ".jpg";
    }

    if (playerSeatsArr.indexOf(4) != -1) {
        i = playerSeatsArr.indexOf(4)
        document.getElementById("seat4Name").innerHTML = gameArr[i][0]
        document.getElementById("seat4Card0").src = "cardsHighCard/" + gameArr[i][1][0] + ".jpg";
    }

    if (playerSeatsArr.indexOf(5) != -1) {
        i = playerSeatsArr.indexOf(5)
        document.getElementById("seat5Name").innerHTML = gameArr[i][0]
        document.getElementById("seat5Card0").src = "cardsHighCard/" + gameArr[i][1][0] + ".jpg";
    }

    if (playerSeatsArr.indexOf(6) != -1) {
        i = playerSeatsArr.indexOf(6)
        document.getElementById("seat6Name").innerHTML = gameArr[i][0]
        document.getElementById("seat6Card0").src = "cardsHighCard/" + gameArr[i][1][0] + ".jpg";
    }

    if (playerSeatsArr.indexOf(7) != -1) {
        i = playerSeatsArr.indexOf(7)
        document.getElementById("seat7Name").innerHTML = gameArr[i][0]
        document.getElementById("seat7Card0").src = "cardsHighCard/" + gameArr[i][1][0] + ".jpg";
    }

    if (playerSeatsArr.indexOf(8) != -1) {
        i = playerSeatsArr.indexOf(8)
        document.getElementById("seat8Name").innerHTML = gameArr[i][0]
        document.getElementById("seat8Card0").src = "cardsHighCard/" + gameArr[i][1][0] + ".jpg";
    }

    if (playerSeatsArr.indexOf(9) != -1) {
        i = playerSeatsArr.indexOf(9)
        document.getElementById("seat9Name").innerHTML = gameArr[i][0]
        document.getElementById("seat9Card0").src = "cardsHighCard/" + gameArr[i][1][0] + ".jpg";
    }
}

*/





