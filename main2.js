const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const GPS = require('./Models/GPS.js');
const Scanner = require('./Models/Scanner.js');
let scanner;

//JSON object of pokemon credentials, with username/password for each
const pokemonCredentials = require('./pokemon-credentials.json');

let mainWindow;

function createWindow(){
	//create the window
	mainWindow = new BrowserWindow({
		width: 320,
		height: 240,
		// fullscreen: true,
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
const gps = new GPS("/dev/AMA0");
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
	mainWindow.webContents.send('pokemon', scanner.detectedPokemon);
};