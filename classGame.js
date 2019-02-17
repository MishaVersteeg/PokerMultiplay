
export class Game {
    constructor(name) {
      this._names = name,
      this._deckHighCard = ['aC','bC','cC','dC','eC','fC','gC','hC','iC','jC','kC','lC','mC','aD','bD','cD','dD','eD','fD','gD','hD','iD','jD','kD','lD','mD','aH','bH','cH','dH','eH','fH','gH','hH','iH','jH','kH','lH','mH','aS','bS','cS','dS','eS','fS','gS','hS','iS','jS','kS','lS','mS'];
      this._deck = [];
      this._cardsDealt = [];
      this._cardsDealtSorted = [];
      this._stacks = [];
      this._seatsByServer = 0;
      this._dealer = "nameDealer";
      this._SB = 25;
      this._BB = 50;
      this._playersInHand = [];
      this._seatsByServerInhand = [];
      this._stacksInHand = [];
      this._lastAction = false;
      this._PMIP_ForEach = [];
      this._PMIP_LastAction = 0;
      this._pot = 0;
      this._stageHand = "PF";
      this._flop = [];
      this._turn = [];
      this._river = [];
      this._winnerHand = "winnerHand";
      this._winningStack = 0
      this._winnerSeat = 0;
      this._gameStarted = false;
      this._newStackAfterAction = 0;
      this._handsConcat = [];
      this._handsOrderd_notSorted = [];
      this._handsSorted = [ [], [], [], [], [], [], [], [], [], [], [], [], [], [], [] ]
      this._bestHands = []
      }
   
    get names()                     { return this._names }
    get deckHighCard()              { return this._deckHighCard }
    get deck()                      { return this._deck }
    get cardsDealt()                { return this._cardsDealt }
    get cardsDealtSorted()          { return this._cardsDealtSorted }
    get stacks()                    { return this._stacks }
    get seatsByServer()             { return this._seatsByServer }
    get dealer()                    { return this._dealer }              
    get SB()                        { return this._SB } 
    get BB()                        { return this._BB}                      
    get playersInHand()             { return this._playersInHand }     
    get seatsByServerInhand()       { return this._seatsByServerInhand }  
    get stacksInHand()              { return this._stacksInHand }                  
    get lastAction()                { return this._lastAction }                 
    get PMIP_ForEach()              { return this._PMIP_ForEach }     
    get PMIP_lastAction()           { return this._PMIP_LastAction }               
    get pot()                       { return this._pot }                            
    get stageHand()                 { return this._stageHand }                   
    get flop()                      { return this._flop }                         
    get turn()                      { return this._turn }                         
    get river()                     { return this._river }  
    get winnerHand()                { return this._winnerHand }
    get winnerSeat()                { return this._winnerSeat }
    get gameStarted()               { return this._gameStarted }
    get newStackAfterAction()       { return this._newStackAfterAction }
    get handsConcat()               { return this._handsConcat }
    get handsOrderd_notSorted()     { return this._handsOrderd_notSorted }
    get handsSorted()               { return this._handsSorted }
    get bestHands()                 { return this._bestHands }
  
    set cardsDealtSorted(cards)     { this._cardsDealtSorted = cards }
    set dealer(name)                { this._dealer = name }
    set seatsByServer(seats)        { this._seatsByServer = seats }
    set playersInHand(players)      { this._playersInHand = players }
    set seatsByServerInhand(seats)  { this._seatsByServerInhand = seats }
    set stacksInHand(stacks)        { this._stacksInHand = stacks }
    set pot(pot)                    { this._pot = pot }
    set winnerHand(hand)            { this._winnerHand = hand }
    set winnerSeat(seat)            { this._winnerSeat = seat }
    set gameStarted(bool)           { this._gameStarted = bool }
    set newStackAfterAction(action) { this._newStackAfterAction = action }
    set PMIP_lastAction(PMIP)       { this._PMIP_LastAction = PMIP}
    set lastAction(action)          { this._lastAction = action }
    set flop(flop)                  { this._flop = flop }
    set turn(turn)                  { this._turn = turn }
    set river(river)                { this._river = river }
    set PMIP_ForEach(PMIP)          { this._PMIP_ForEach = PMIP}  
    set stageHand(stage)            { this._stageHand = stage }
    set handsConcat(hands)          { this._handsConcat = hands }
    set handsOrderd_notSorted(hands){ this._handsOrderd_notSorted = hands }
    set handsSorted(hands)          { this._handsSorted = hands }
    set bestHands(hands)            { this._bestHands = hands}
  
                                   
    addNames(newName) {

      this.names.push(newName);
    }
  
    initiateSeatsByServer() {

      let set = new Set();
  
      do { set.add(Math.floor(Math.random() * 10)) }
      while (set.size < this.names.length);
  
      this.seatsByServer = Array.from(set).sort();
    }
  
    shuffleDealHighCards() {

      this.deckHighCard.sort( (a, b) => { return 0.5 - Math.random() });
      for (let i in this.playersInHand) { 
        this.cardsDealt.push(this.deckHighCard[i])
      };
    }
  
    ShuffleDealDeck() {

      this.deck.splice(0,52,'Sa', 'Sb', 'Sc', 'Sd', 'Se', 'Sf', 'Sg', 'Sh', 'Si', 'Sj', 'Sk', 'Sl', 'Sm', 'Ca', 'Cb', 'Cc', 'Cd', 'Ce', 'Cf', 'Cg', 'Ch', 'Ci', 'Cj', 'Ck', 'Cl', 'Cm', 'Ha', 'Hb', 'Hc', 'Hd', 'He', 'Hf', 'Hg', 'Hh', 'Hi', 'Hj', 'Hk', 'Hl', 'Hm', 'Da', 'Db', 'Dc', 'Dd', 'De', 'Df', 'Dg', 'Dh', 'Di', 'Dj', 'Dk', 'Dl', 'Dm')
      this.deck.sort( (a, b) => { return 0.5 - Math.random() });
      this.cardsDealt.splice(0);
      for (let i in this.playersInHand) {
        this.cardsDealt.splice(1, 1, (this.deck.splice(0, 2)));
      }
    }
    updatePlayersInHand() {
  
      this.playersInHand = this.names.slice(0);
    }
  
    updateSeatsByServerInhand() {
  
      this.seatsByServerInhand = this.seatsByServer.slice(0);
    }
  
    updateStacksInHand() {
  
      this.stacksInHand = this.stacks.slice(0);
    }
  
    determineWinnerHighCard() { // and sets initial dealer
  
      this.cardsDealtSorted = this.cardsDealt.slice(0);
  
      this.cardsDealtSorted = this.cardsDealtSorted.sort( (a,b) => {
        a = a.toLowerCase();
        b = b.toLowerCase();
        return a > b ? 1 : b > a ? -1 : 0;
      }).reverse();
  
      let winningCard = this.cardsDealtSorted[0];
      let index = this.cardsDealt.indexOf(winningCard);
      this.dealer = this.playersInHand[index];
    }
  
    dealCards() {
  
      for (let i in this.playersInHand) {
        this.cardsDealt.splice(1, 1, (this.deck.splice(0, 2)));
      }
    }
  
    showSharedCards() {
  
      if (this.stageHand == "PF") {
        this.flop = this.deck.splice(0,3);
      }
      if (this.stageHand == "PT") {
        this.turn = this.deck.splice(0,1);
      }
      if (this.stageHand == "PR") {
        this.river = this.deck.splice(0,1);
      }
      this.lastAction = false;
      this.updatePMIP_ForEach();
    }
  
    toNextStageHand () {
      if (this.stageHand == "PR") {this.stageHand = "SD"};
      if (this.stageHand == "PT") {this.stageHand = "PR"};
      if (this.stageHand == "PF") {this.stageHand = "PT"};
    }
  
    updatePMIP_ForEach () {
  
      for (let i in this.playersInHand) {
        this.PMIP_ForEach.push(0)
      };
    }
  
    rotateHandState() {
  
      do {
        a = this.playersInHand.shift(); this.playersInHand.push(a);
        a = this.seatsByServerInhand.shift(); this.seatsByServerInhand.push(a);
        a = this.stacksInHand.shift(); this.stacksInHand.push(a);
  
      } while ((this.playersInHand[0] != this.dealer));
  
      this.dealer = this.playersInHand[0 + 1];
    }
  
    processBlinds() {
  
      if (this.playersInHand.length == 2) {
        this.stacksInHand[0] -= this.SB;
        this.PMIP_ForEach[0] = this.SB;
        this.stacksInHand[1] -= this.BB;
        this.PMIP_ForEach[1] = this.BB;
  
        let indexName = this.playersInHand[0];
        let indexStack = this.names.indexOf(indexName);
        this.stacks[indexStack] -= this.SB;
  
        indexName = this.playersInHand[1];
        indexStack = this.names.indexOf(indexName);
        this.stacks[indexStack] -= this.BB;
        
      } else {
        this.stacksInHand[1] -= this.SB;
        this.PMIP_ForEach[1] = this.SB;
        this.stacksInHand[2] -= this.BB;
        this.PMIP_ForEach[2] = this.BB;
  
        let indexName = this.playersInHand[1];
        let indexStack = this.names.indexOf(indexName);
        this.stacks[indexStack] -= this.SB;
  
        indexName = this.playersInHand[2];
        indexStack = this.names.indexOf(indexName);
        this.stacks[indexStack] -= this.BB;
              
      }
    }
  
    addStacks(stacks) {
  
      for (let i in this.names) {
      this.stacks.push(stacks)
      };
    }
  
    removePlayerFromInHand(seat) {
  
      let indexName = this.seatsByServerInhand.indexOf(seat);
      this.playersInHand.splice(indexName, 1);
      this.seatsByServerInhand.splice(indexName, 1);
      this.stacksInHand.splice(indexName, 1);
      this.cardsDealt.splice(indexName, 1);
      let deadMoney = this.PMIP_ForEach.splice(indexName, 1); this.pot += deadMoney[0];
    }
  
    takePotNoShowDown() {
  
      for (let i in this.PMIP_ForEach) {
        this.pot += this.PMIP_ForEach[i];
      }
  
      this.winnerHand = this.playersInHand[0];
      this.winnerSeat = this.seatsByServerInhand[0];
  
      let indexWinnerhand = this.names.indexOf(this.winnerHand);
      this.stacks[indexWinnerhand] += this.pot;
      this.winningStack = this.stacks[indexWinnerhand];
    }
  
    showDown() {
  
      for (let i in this.cardsDealt) {
        this.handsConcat.push(this.cardsDealt[i].concat(this.flop, this.turn, this.river));
      }
  
      this.handsConcat.forEach((element) => {
        determineHand(thisGame, element);
      })
  
      for (let i in this.handsSorted) {
        if (this.handsSorted[i]) {
          this.handsSorted[i] = this.handsSorted[i].sort().reverse();
        }
      }
      
      for (let i in this.handsSorted) {
        for (let ii in this.handsSorted[i]) {
          if (this.handsSorted[i][ii]) {
            this.bestHands.push(this.handsSorted[i][ii])
          }
        }
      }
    }
  
  
    processbet(name) {
  
      let bettingSeat = this.playersInHand.indexOf(name);
      let indexGameState = this.names.indexOf(name);
  
      this.stacks[indexGameState] -= this.BB;
      this.PMIP_ForEach[bettingSeat] = this.BB;
      this.PMIP_lastAction = this.BB;
      this.stacksInHand[bettingSeat] -= this.BB;
      this.newStackAfterAction = this.stacksInHand[bettingSeat];
    }
  
    processCall(seat) {
  
      let callingSeat = this.seatsByServerInhand.indexOf(seat);
      let seatToMatch = callingSeat -1;
      let indexGameState = this.seatsByServer.indexOf(seat);
      
      if (seatToMatch < 0) {
        seatToMatch = this.seatsByServerInhand.length -1;
      }
  
      let callAmount = this.PMIP_ForEach[seatToMatch] - this.PMIP_ForEach[callingSeat];
      this.PMIP_lastAction = callAmount + this.PMIP_ForEach[callingSeat];
      this.PMIP_ForEach[callingSeat] += callAmount;
      this.newStackAfterAction = this.stacksInHand[callingSeat] - callAmount;
      this.stacksInHand[callingSeat] = this.newStackAfterAction;
      this.stacks[indexGameState] -= callAmount;
    }
  
    buildPot() {
  
      let sum = this.PMIP_ForEach.reduce((a, b) => a + b);
  
      this.pot += sum;
      this.PMIP_ForEach = new Array;
    }
  
    nextTurn() {
  
      a = this.playersInHand.shift(); this.playersInHand.push(a);
      a = this.seatsByServerInhand.shift(); this.seatsByServerInhand.push(a);
      a = this.stacksInHand.shift(); this.stacksInHand.push(a);
      a = this.PMIP_ForEach.shift(); this.PMIP_ForEach.push(a);
    }
  
    changeStageHand(stage) {
  
      this.stageHand.splice(0,1,stage)
    }
  
    clearHandState() {
  
      this.PMIP_ForEach.splice(0)
      this.playersInHand.splice(0);
      this.seatsByServerInhand.splice(0);
      this.stacksInHand.splice(0);
      this.cardsDealt.splice(0);
      this.lastAction = false;
      this.pot = 0;
    }
  }