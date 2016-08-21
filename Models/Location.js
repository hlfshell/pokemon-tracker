"use strict"
const geolib = require('geolib');

class Location {

	constructor(latitude, longitude){
		if(typeof latitude == 'object'){
			this.latitude = latitude.latitude;
			this.longitude = latitude.longitude; 
		} else {
			this.latitude = latitude;
			this.longitude = longitude;
		}
		this.created = new Date();
	}

	get pokemonLocation(){
		return {
			type: 'coords',
			coords: {
				latitude: this.location.latitude,
				longitude: this.location.longitude
			}
		};
	}

	distanceFrom(location){
		return geolib.getDistance(this,	location);
	}

	bearingFrom(location){
		return geolib.getBearing(this, location);
	}

	cardinalDirectionFrom(location){
		return geolib.getCompassDirection(this, location);
	}

	generateLocation(distance, bearing){
		return new Location(geolib.computeDestinationPoint(this, distance, bearing);
	}

}