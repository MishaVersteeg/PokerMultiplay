
import {Game} from "./classGame.js"


var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  console.log('client connected');
});

http.listen(3000, function () {
  console.log('listening on [3000]');
});


let activeGames = [];

io.on('connection', (socket) => {

  socket.on('join', (data) => {
    socket.join(data)
    console.log(" socket connected to ", data)
  })

  socket.on('createGame', (data) => {

    if (activeGames.indexOf(data.gameID) == -1) {

      activeGames.push(data.gameID);

      this[data.gameID] = new Game([]);

      activeGames.push(this[data.gameID])

      socket.emit('statusCreateGameAccepted', 'aproved');

    } else {
      socket.emit('statusCreateGameAccepted', 'neglected')
    }
  });

  socket.on('joinGame', (data) => {

    activeGames.indexOf(this[data.gameID])

    if (activeGames.indexOf(this[data.gameID]) != -1) {
      socket.emit('joinGame', 'aproved')
    } else {
      socket.emit('joinGame', 'neglected')
    }
  });

  socket.on('getNameList', (data) => {

    a = activeGames.indexOf(this[data.gameID])

    socket.emit('getNameList', activeGames[a].names)
  });

  socket.on('submitName', (data) => {

    a = activeGames.indexOf(this[data.gameID]);
    b = activeGames[a].names;

    if (b.indexOf(data.name) == -1) {
      activeGames[a].addNames(data.name);
      socket.emit('submitName', 'aproved')
    } else {
      socket.emit('submitName', 'neglected')
    }
  });

  socket.on('startGame', (data) => {

    thisGame = activeGames[activeGames.indexOf(this[data.gameID])];

    thisGame.updatePlayersInHand();
    thisGame.initiateSeatsByServer();
    thisGame.addStacks(1000);
    thisGame.updateSeatsByServerInhand();
    thisGame.updateStacksInHand();
    thisGame.shuffleDealHighCards();
    thisGame.determineWinnerHighCard();

    io.sockets.in(data.gameID).emit('dealingHighCard', [thisGame.playersInHand, thisGame.seatsByServerInhand, 
    thisGame.stacksInHand, thisGame.cardsDealt, thisGame.dealer]);

    thisGame.rotateHandState();

    timer = setTimeout ( () => {dealHoleCards(data)}, 7500)
  });

  dealHoleCards = (data) => {  

    thisGame = activeGames[activeGames.indexOf(this[data.gameID])];

    if (thisGame.gameStarted == true) { 
    thisGame.updatePlayersInHand();
    thisGame.updateSeatsByServerInhand();
    thisGame.updateStacksInHand();
    thisGame.updatePMIP_ForEach();
    thisGame.rotateHandState();
    thisGame.stageHand = "PF"
    }
    
    thisGame.ShuffleDealDeck();
    thisGame.processBlinds();

    io.sockets.in(data.gameID).emit('dealingHoleCards', [thisGame.playersInHand, thisGame.seatsByServerInhand, 
    thisGame.stacksInHand, thisGame.cardsDealt, thisGame.SB, thisGame.BB, thisGame.lastAction, thisGame.PMIP_ForEach, thisGame.stageHand]);

    thisGame.gameStarted = true;
  }

  socket.on('playerActionToServer', (data) => { 

    thisGame = activeGames[activeGames.indexOf(this[data.gameID])];

    if (data.action == "fold") {
      thisGame.lastAction = "fold";
      thisGame.removePlayerFromInHand(data.seatHeroByServer);
      io.sockets.in(data.gameID).emit('showFold', data.seatHeroByServer);

      if (thisGame.playersInHand.length == 1) {
        takePotNoShowDown(data);
      }
    }

    if (data.action == "bet") {

      thisGame.lastAction = "bet";

      thisGame.processbet(data.name)

      io.sockets.in(data.gameID).emit('showBet', [ data.seatHeroByServer, thisGame.PMIP_lastAction, thisGame.newStackAfterAction ] );

      thisGame.nextTurn();

      timer = setTimeout(() => {
        io.sockets.in(data.gameID).emit('playerActionToClient',
          [thisGame.playersInHand, thisGame.seatsByServerInhand,
          thisGame.stacksInHand, thisGame.cardsDealt, thisGame.SB,
          thisGame.BB, thisGame.lastAction, thisGame.PMIP_ForEach, thisGame.stageHand])
      }, 1000)

    }

    if (data.action == "call") {

      thisGame.lastAction = "call";

      thisGame.processCall(data.seatHeroByServer)

      io.sockets.in(data.gameID).emit('showCall', [data.seatHeroByServer, thisGame.PMIP_lastAction, thisGame.newStackAfterAction]);


      if (thisGame.stageHand != "PF") {

        if (thisGame.PMIP_ForEach[0] == thisGame.PMIP_ForEach[thisGame.PMIP_ForEach.length - 1]) {

          if (thisGame.stageHand == "SD") {

            thisGame.buildPot();
            io.sockets.in(data.gameID).emit('ShowSharedCards', [thisGame.stageHand, thisGame.flop,
              thisGame.turn, thisGame.river, thisGame.pot]);
  

            console.log("SHOWDOWN!!!!")

          } else {
            thisGame.buildPot();
            thisGame.showSharedCards();
  
            io.sockets.in(data.gameID).emit('ShowSharedCards', [thisGame.stageHand, thisGame.flop,
            thisGame.turn, thisGame.river, thisGame.pot]);
  
            thisGame.toNextStageHand();
  
            thisGame.nextTurn();
  
            timer = setTimeout(() => {
              io.sockets.in(data.gameID).emit('playerActionToClient',
                [thisGame.playersInHand, thisGame.seatsByServerInhand,
                thisGame.stacksInHand, thisGame.cardsDealt, thisGame.SB,
                thisGame.BB, thisGame.lastAction, thisGame.PMIP_ForEach, thisGame.stageHand])
            }, 1000)
          }
        }
      } else { // stage = PF:

        thisGame.nextTurn();

        timer = setTimeout(() => {
          io.sockets.in(data.gameID).emit('playerActionToClient',
            [thisGame.playersInHand, thisGame.seatsByServerInhand,
            thisGame.stacksInHand, thisGame.cardsDealt, thisGame.SB,
            thisGame.BB, thisGame.lastAction, thisGame.PMIP_ForEach, thisGame.stageHand])
        }, 1000)
      }
    }

    if (data.action == "check") {

      if (thisGame.playersInHand.length == 2 && thisGame.stageHand != "PF") {

        if (thisGame.lastAction == "check") {

          if (thisGame.stageHand == "SD") {

            io.sockets.in(data.gameID).emit('showCheck', [data.seatHeroByServer]);

            thisGame.showDown(thisGame);

          } else {

            thisGame.showSharedCards();

            io.sockets.in(data.gameID).emit('ShowSharedCards', [thisGame.stageHand, thisGame.flop,
            thisGame.turn, thisGame.river, thisGame.pot]);

            thisGame.toNextStageHand();

            thisGame.nextTurn();

            timer = setTimeout(() => {
              io.sockets.in(data.gameID).emit('playerActionToClient',
                [thisGame.playersInHand, thisGame.seatsByServerInhand,
                thisGame.stacksInHand, thisGame.cardsDealt, thisGame.SB,
                thisGame.BB, thisGame.lastAction, thisGame.PMIP_ForEach, thisGame.stageHand]);
            }, 1000)

            return
          }
        }

        if (thisGame.lastAction == false) {

          thisGame.lastAction = "check";

          io.sockets.in(data.gameID).emit('showCheck', [data.seatHeroByServer]);

          thisGame.nextTurn();

          timer = setTimeout ( () => {
            io.sockets.in(data.gameID).emit('playerActionToClient', 
            [thisGame.playersInHand, thisGame.seatsByServerInhand, 
            thisGame.stacksInHand, thisGame.cardsDealt, thisGame.SB, 
            thisGame.BB, thisGame.lastAction, thisGame.PMIP_ForEach, thisGame.stageHand])
          }, 1000)
        }
      }

      if (thisGame.playersInHand.length == 2 && thisGame.stageHand == "PF") {

        thisGame.buildPot();
        thisGame.showSharedCards();

        io.sockets.in(data.gameID).emit('ShowSharedCards', [ thisGame.stageHand, thisGame.flop, 
        thisGame.turn, thisGame.river, thisGame.pot ]);

        thisGame.toNextStageHand()
     
        timer = setTimeout ( () => {
          io.sockets.in(data.gameID).emit('playerActionToClient', 
          [thisGame.playersInHand, thisGame.seatsByServerInhand, 
          thisGame.stacksInHand, thisGame.cardsDealt, thisGame.SB, 
          thisGame.BB, thisGame.lastAction, thisGame.PMIP_ForEach, thisGame.stageHand])
        }, 1000)
      }
    }
  });
});

takePotNoShowDown = data => { 

  thisGame = activeGames[activeGames.indexOf(this[data.gameID])];

  thisGame.takePotNoShowDown();

  io.sockets.in(data.gameID).emit('takePotNoShowDown', [thisGame.winnerHand, 
  thisGame.winnerSeat, thisGame.pot, thisGame.winningStack ]); 


  thisGame.clearHandState();

  timer = setTimeout(() => { dealHoleCards(data) }, 4500);
}
