const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const PokemonGo = require('pokemon-go-node-api');
let pokeAPI = new PokemonGo.Pokeio();
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
	type: 'coords',
	coords: {
		latitude: 42.273850,
		longitude: -71.809566
	}
};

function createWindow(){
	//create the window
	mainWindow = new BrowserWindow({
		width: 320,
		height: 240,
		//fullscreen: true,
		//alwaysOnTop: true,
		//setAutoHideMenuBar: true,
		webPreferences: {
			nodeIntegation: false
		}
	});
	mainWindow.setMenu(null);
	mainWindow.loadURL(`file://${__dirname}/index.html`);
	mainWindow.on('closed', function(){ mainWindow = null; });
	mainWindow.webContents.openDevTools();
}

app.on('ready', createWindow);

//Load up and handle all of the gps stuff

//Handle all the pokemon go stuff.
let heartbeat;

function connectToPokemonGo(){
	status.pokemongo = "connecting"
	pokeAPI.init(pokemonCredentials.username, pokemonCredentials.password, location, 'ptc', function(err){
		if(err){ 
			status.pokemongo = "disconnected"
			console.error("Something has gone wrong with connecting to the server - trying again in 20 seconds", err);
			setTimeout(connectToPokemonGo, 20000);
			return;
		}

		console.log("Connected to pokemon go");
		status.pokemongo = "connected"

		heartbeat = setInterval(function(){
			pokeAPI.Heartbeat(function(err, hb){
				if(err) return handleHeartbeatFailure(err);
				let nearby = [];
				let here = [];

				hb.cells.forEach(function(cell){
					if(cell.NearbyPokemon.length <= 0) return;

					cell.NearbyPokemon.forEach(function(pokemon){
						pokemon.name = pokeAPI.pokemonlist[parseInt(pokemon.PokedexNumber)-1].name;
						nearby.push(pokemon);
					});
				});

				hb.cells.forEach(function(cell){
					if(cell.MapPokemon.length <= 0) return;
					
					cell.MapPokemon.forEach(function(pokemon){
						pokemon.name = pokeAPI.pokemonlist[parseInt(pokemon.PokedexTypeId)-1].name;

						pokemon.distance = geolib.getDistance(
									{ latitude: location.coords.latitude, longitude: location.coords.longitude },
									{ latitude: pokemon.Latitude, longitude: pokemon.Longitude });
						pokemon.compassDirection = geolib.getCompassDirection(
									{ latitude: location.coords.latitude, longitude: location.coords.longitude },
									{ latitude: pokemon.Latitude, longitude: pokemon.Longitude });
						here.push(pokemon);
					});
				});

				mainWindow.webContents.send('heartbeat', { herePokemon: here, nearbyPokemon: nearby });
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

connectToPokemonGo();

//Finally, on request from the electron app return necessary information
