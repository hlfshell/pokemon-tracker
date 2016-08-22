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

	connect(cb){
		var self = this;
		self.sp = new SerialPort(self.port, {
			baudrate: 9600,
			parser: SerialPort.parsers.readline('\r\n')
		});

		self.sp.on('data', function(data){
			self.gps.update(data);
		});

		self.gps.on('data', function(data){
			this.location = new Location(data.lat, data.long);
			this.lastUpdated = new Date();
			if(self.onUpdate) self.onUpdate();
		});

		self.sp.on('open', cb);
	}

	get currentLocation(){
		return this.location;
	}

}

module.exports = GPS;