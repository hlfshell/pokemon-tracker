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

	set status (status) {
		this.status = {
			lastUpdated: new Date(),
			status: status
		}
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
			this.location = 

			if(self.onUpdate) self.onUpdate();
		});

		self.on('open', cb);
	}

	get currentLocation(){
		return this.location;
	}

}

/*

var SerialPort = require('serialport');
var port = new SerialPort.SerialPort('/dev/ttyAMA0', {
  baudrate: 9600,
  parser: SerialPort.parsers.readline('\r\n')
});

var GPS = require('gps');
var gps = new GPS;

gps.on('data', function(data) {
  console.log(data, gps.state);
});

port.on('data', function(data) {
  gps.update(data);
});

module.exports = gps;



*/