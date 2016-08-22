var pokemon = [];
var lastUpdated = 0;

//First let's set up the websocket connection
var ws = new WebSocket('ws://localhost:9000');

//Handled incoming data IE pokemon!
ws.onmessage = function(event){
	console.log(JSON.parse(event.data));
	pokemon = JSON.parse(event.data);
	lastUpdated = new Date();
};
