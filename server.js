"use strict"

const WebSocketServer = require('ws').Server;
const wss = new WebSocketServer({ port: 9001 });
const GPS = require('./Models/GPS.js');
const Scanner = require('./Models/Scanner.js');
let scanner;
const express = require('express');
const app = express();

//JSON object of pokemon credentials, with username/password for each
const pokemonCredentials = require('./pokemon-credentials.json');

//Web socket stuff
wss.on('connection', function connection(ws){
	console.log("Client connected");
});

//Load up and handle all of the gps stuff
const gps = new GPS(process.argv[2]);
gps.connect(function(err){
	if(err){
		console.log("Something has gone wrong opening the serial port", err);
		process.exit(0);
	}

	gps.onUpdate = function(){ 
		mainWindow.webContents.send('gps', gps.location);
		if(!scanner){
			scanner = new Scanner();
			scanner._initTrainers(gps.location);
			scanner.onScan = onScan;
		} else {
			scanner.update(gps.location);
		}
	}
});

//Function to be called upon scan info updates
var onScan = function onScan(){
	wss.clients.forEach(client => client.send(scanner.detectedPokemon));
};

app.use(express.static('Static'));
app.get('/', (req, res) => res.sendFile("Static/views/index.html"));

app.listen(9000);