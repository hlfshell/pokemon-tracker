const ipc = nodeRequire('electron').ipcRenderer;
let nearbyPokemon = [];
let herePokemon = [];

ipc.on('heartbeat', function(event, data){
	nearbyPokemon = data.nearbyPokemon;
	herePokemon = data.herePokmon;
	console.log(nearbyPokemon, herePokemon);
	// update();
});

function drawNearbyPokemon(){

}

function drawHerePokemon(){
	herePokemon.forEach(function(pokemon){
		
	});
}

function update(){
	drawNearbyPokemon();
	drawHerePokemon();
}