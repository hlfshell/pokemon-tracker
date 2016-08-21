"use strict"

const PokemonGo = require('pokemon-go-node-api');
const Location = require('./Location.js');

class Trainer{

	constructor(username, password, location){
		this.username = username;
		this.password = password;
		this.pokemon = [];
		this.location = new Location(location);

		this.createPokeAPI();
		this.connect();
		this.onUpdate = function(){};

		this.pokemon = [];
	}

	set location(location){
		this.location.coords = location;
	}

	createPokeAPI(){
		this.pokeAPI = null;
		this.pokeAPI = new PokemonGo.Pokeio();
	}

	connect(cb){
		var self = this;
		self.pokeAPI.init(self.username, self.password, self.location.pokemonLocation, 'ptc', function(err){
			if(err){ 
				return cb ?  cb(err) : false;
			}

			self.heartbeatInterval = setInterval(function(){
				self._heartbeat();
			}, 5000);

			if(cb) cb();
		});
	}

	_heartbeatFailure(){
		createPokeAPI();
		connect();
	}

	_heartbeat(){
		var self = this;
		self.pokeAPI.Heartbeat(function(err, hb){
			if(err) return self._heartbeatFailure(err);
			// let nearby = [];
			let here = [];

			//Until the tracker is fixed, anything outside of 70m is useless data :-(
			// hb.cells.forEach(function(cell){
			// 	if(cell.NearbyPokemon.length <= 0) return;

			// 	cell.NearbyPokemon.forEach(function(pokemon){
			// 		pokemon.name = pokeAPI.pokemonlist[parseInt(pokemon.PokedexNumber)-1].name;
			// 		nearby.push(pokemon);
			// 	});
			// });

			hb.cells.forEach(function(cell){
				if(cell.MapPokemon.length <= 0) return;
				
				cell.MapPokemon.forEach(function(pokemon){
					pokemon.name = pokeAPI.pokemonlist[parseInt(pokemon.PokedexTypeId)-1].name;
					here.push(pokemon);
				});
			});

			self.pokemon = here;
			if(onUpdate) onUpdate();
		});
	}


}