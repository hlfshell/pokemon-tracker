const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const PokemonGo = require('pokemon-go-node-api');
const pokeAPI = new PokemonGo.Pokeio();
const geolib = require('geolib');
const gps = require('gps');
//const SerialPort = require('serialport');

//JSON object of pokemon credentials, with username/password
const pokemonCredentials = require('./pokemon-credentials.json');

let mainWindow;
let status = {
	pokemongo: "loading",
	gps: "loading"
};

//Until the GPS is loaded, we'll set this as our lat/long
let location = {
	latitude: 42.273850,
	longitude: -71.809566
};

function createWindow(){
	//create the window
	mainWindow = new BrowserWindow({
		width: 320,
		height: 240,
		fullscreen: true,
		alwaysOnTop: true,
		setAutoHideMenuBar: true
	});
	mainWindow.setMenu(null);
	mainWindow.loadURL(`file://${__dirname}/index.html`);
	mainWindow.on('closed', function(){ mainWindow = null; });
}

app.on('ready', createWindow);

//Load up and handle all of the gps stuff

//Handle all the pokemon go stuff.
let heartbeat;
let nearby = [];

function connectToPokemonGo(){
	status.pokemongo = "connecting"
	pokeAPI.init(pokemonCredentials.username, pokemonCredentials.password, location, 'ptc', function(err){
		if(err){ 
			status.pokemongo = "disconnected"
			console.error("Something has gone wrong with connecting to the server - trying again in 20 seconds", err);
			setTimeout(connectToPokemon, 20000);
			return;
		}

		console.log("Connected to pokemon go");
		status.pokemongo = "connected"

		heartbeat = setInterval(function(){
			pokeAPI.Heartbeat(function(err, hb){
				if(err) return handleHeartbeatFailure(err);
				nearby = [];
				hb.cells.forEach(function(cell){
					if(cell.MapPokemon.length <= 0) return;
					
					cell.MapPokemon.forEach(function(pokemon){
						announcePokemon(pokemon);
					});
				});
			});
		}, 5000);

	});
}

function handleHeartbeatFailure(err){
	status.pokemongo = "disconnected"
	console.log("Heartbeat failure, resetting.", err);
	clearInterval(heartbeat);
	pokeAPI = null;
	pokeAPI = new PokemonGo.Pokeio();
	connectToPokemon();
}

//Finally, on request from the electron app return necessary information
