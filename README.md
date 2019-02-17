Multi-play Poker (NL Holdem) through Websocket.io, powered by Node.js

Stage: development

Project dependencies:
-	Express
-	Lodash
-	Socket.io
-	Vue
-	Mocha
-	Nodemon
-	Webpack


Introduction

The aim of this project is primarily to practice and display newly achieved skills. Besides my love for this game, I find that its ecosystem is perfect suitable for simulating events and game play behavior in the form of code.

Right from the start of this project it was my desire to implement OOP since I did not brought it into practice before. This paradigm gave the opportunity to let the server-side program host multiple games at once.

As to now the GUI is not elaborated and merely serves debugging purposes and code functioning.


General operation

A client-side user can connect to the server. When connected, this user is able to create a game by providing a game ID of choice. This game ID will be used as a key to instantiate an object from which all following game logic will run and let the server communicate with the particular joined clients who provided this very same game ID.

When the game initiator has created a game, the lobby appears in which the initiator can choose a name as well as the clients who have joined this given game ID. From this point the initiator is able to start the game.

When the game is started data management is maintained briefly as fallows:
Before any cards are dealt relevant properties are populated (e.g stacks, seatsByServer). These properties keep track of the ‘global’ data. ‘global’ as opposed to ‘inHand’ whereas the latter keeps track of data that is relevant to a round (or hand) itself.
For example, there is a property called ‘PMIP_ForEach’. PMIP is general poker jargon for put money in pot. This property is solely used for data management of the hand action itself. When a new hand starts, the content of these arrays, if needed, are copied to the global properties and empties before the new hand starts. Other arrays for ‘inHand-’ data management properties are e.g. ‘stacksInHand’ and ‘playersInHand.


Short-term prospects:
-	finalization of coding game logic
-	further implementation of Vue. For now, Vue is only implemented to facilitate the employment of the SPA. Vue is able to do much more
-	GUI enhancement
-	functionality, e.g. game settings customization


Long-term prospects:
-	cross-platform mobile client support (React Native)
-	enhanced GUI experience
-	….
