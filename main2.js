window.onload = function() {

	var dataset = generateRandomDataset(20, 0, 100);

	var margin = {top: 30, right: 20, bottom: 30, left: 50}
	var width = 1000;
	var height = 250;

	var graph = new SmartGraph(margin, width, height, dataset);
	graph.setXAxis();
	graph.setYAxis();

	graph.crosshair();
	graph.drawLine();
	graph.scatterPlot();
	graph.tooltip();

	setInterval(function() { 
		document.getElementsByClassName("d3-tip")[0].style.display = "none";
		dataset = generateRandomDataset(20, 0, 100);
		graph.updateDataset(dataset);
		graph.setXAxis();
		graph.setYAxis();
		graph.crosshair();
		graph.drawLine();
		graph.scatterPlot();
	}, 10000);

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