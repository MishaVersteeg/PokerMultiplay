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

	let displayHand;

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




