$(function () {
	var mapleTree = $('#tree').maple({
		tree : {
			branches : [
				{
					name : 'animals',
					url : '/animals',
					onLoaded : animalsLoaded
				}
			]
		}
	});
});

function animalsLoaded ( animals ) {
	return animals.map(function ( animal ) {
		return {
			name: animal,
			url : "/" + animal,
			onLoaded : speciesLoaded
		}
	});
}


function speciesLoaded ( species ) {
	return species.map( function ( speciesName ) {
		return {	
			name: speciesName,
			url : "/" + speciesName,
			onLoaded : specificAnimalsLoaded
		}
	});
}

function specificAnimalsLoaded ( animals ) {
	return animals.map(function ( animal ) {
		return {
			name: animal.name,
			onClicked : function () {
				window.location.href= "/animal/" + animal.name;
			}
		}
	});
}


