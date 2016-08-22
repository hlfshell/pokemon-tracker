"use strict"

const Location = require('./Location.js');
const Trainer = require('./Trainer.js');

//JSON object of pokemon credentials, with username/password
const pokemonCredentials = require('../pokemon-credentials.json');

//As of writing, a scan radius for a trainer is 70 meters
const trainerScanRadius = 70;
//It seems silly to have the trainers right on top of eachother, so I added a spacer gap
const trainerGap = 20;

class Scanner {

	constructor(){
		this.mainTrainer = null;
		this.radarTrainers = [];
		this.detectedPokemon = [];
		this.onScan = function(){};
	}

	update(location) {
		var self = this;
		if(!self.mainTrainer) return self._initTrainers(location);
		
		mainTrainer.location = location;
		radarTrainers.forEach(function(trainer, index){
			var offset
			trainer.location = self._offsetLocation(location, index);
		});
	}

	_offsetLocation(location, rotation){
		return location.generateLocation(trainerGap + (1.5 * trainerScanRadius), 90 * rotation);
	}

	_initTrainers(location){
		var self = this;
		var first = pokemonCredentials.shift();
		mainTrainer = new Trainer(first.username, first.password, location);
		//Put one trainer every 90 degrees around me, 1.5 scan radiuses away plus a gap
		pokemonCredentials.forEach(function(credentials, index){
			self.radarTrainers.push(new Trainer(credentials.username, credentials.password, self._offsetLocation(location, index)));
		});

		//Apply onUpdates
		mainTrainer.onUpdate = self._onTrainerUpdate;
		radarTrainers.forEach(function(trainer){
			trainer.onUpdate = self._onTrainerUpdate;
		});
	}
	
	_addPokemonMetaData(pokemon){
		//We need to add distance from the main trainer, cardinal direction, etc.
		pokemon.location = new Location(pokemon.Latitude, pokemon.Longitude);

		//The main trainer should have our most up to date location, so we'll use that
		pokemon.distance = mainTrainer.location.distanceFrom(pokemon.location);
		pokemon.bearing = mainTrainer.location.bearingFrom(pokemon.location);
		pokemon.direction = mainTrainer.location.cardinalDirectionFrom(pokemon.location);
	}

	_onTrainerUpdate(){
		var self = this;

		
		self.detectedPokemon = [];
		//Scan through all trainers, and generate the pokemon list.
		mainTrainer.pokemon.forEach(function(pokemon){
			self._addPokemonMetaData(pokemon);
			self.detectedPokemon.push(pokemon);
		});

		radarTrainers.forEach(function(trainer){
			trainer.pokemon.forEach(function(pokemon){
				self._addPokemonMetaData(pokemon);
				self.detectedPokemon.push(pokemon);
			});
		});

		//Now sort them by distance
		self.detectedPokemon.sort((a, b) => a.distance < b.distance);

		//Call the update function, on scan
		if(self.onScan) self.onScan();
	}

}

module.exports = Scanner;