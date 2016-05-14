window.onload = function() {

	var dataset = generateRandomDataset(20, 0, 100);

	createSmartGraph(dataset);

	setInterval(dummyDataArrived.bind(null, dataset, 0, 50), 3000);

}

function dummyDataArrived(dataset, floor, ceil) {
	dataset.shift()

	var random = {};
	random.id = dataset[dataset.length-1].id + 1; 
	random.value = Math.floor(Math.random() * ceil) + floor;

	dataset.push(random);

	updateSmartGraph(dataset);
}

// DEMO -
function generateRandomDataset(length, floor, ceil) {
	
	var array = [];

	for (var i = 0; i < length; i++) {
		var random = {};
		random.id = i; 
		random.value = Math.floor(Math.random() * ceil) + floor;
		array.push(random);
	}
	return array;
}