"use strict"

const SerialPort = require('serialport');
const GPSModule = require('gps');
const geolib = require('geolib');
const Location = require('./Location.js');

class GPS {

	constructor(serialport){
		this.port = serialport;
		this.gps = new GPSModule();
		this.onUpdate = function(){};
		this.lastUpdated = 0;
		this.location = null;
	}

	_connect(cb){
		var self = this;
		self.sp = new SerialPort.SerialPort(self.port, {
			baudrate: 9600,
			parser: Serialport.parser.readline('\r\n')
		});

		self.sp.on('data', function(data){
			self.gps.update(data);
		});

		self.gps.on('data', function(data){
			this.location = new Location(data.lat, data.long);
			this.lastUpdated = new Date();
			if(self.onUpdate) self.onUpdate();
		});

		self.on('open', cb);
	}

	get currentLocation(){
		return this.location;
	}

}