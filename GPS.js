"use strict"

const gps = require('gps');
const geolib = require('geolib');

class GPS {

	constructor(serialport){
		
	}

	set status (status) {
		this.status = {
			lastUpdated: new Date(),
			status: status
		}
	}

	_connect(cb){
		
	}

	_onUpdate(){

	}

	get currentLocation(){
		return this.lastLocation;
	}

}