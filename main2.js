const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
//const SerialPort = require('serialport');
const Trainer = require('./Trainer.js');

//JSON object of pokemon credentials, with username/password for each
const pokemonCredentials = require('./pokemon-credentials.json');

let mainWindow;

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
