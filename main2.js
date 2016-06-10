var graph;

window.onload = function() {

	var dataset = generateRandomDataset(20, 0, 100);

	var margin = {top: 10, right: 10, bottom: 100, left: 40}
	var width = 960;
	var height = 500;

	graph = new SmartGraph(margin, width, height, dataDayTemperature);
	graph.setXAxis();
	graph.setYAxis();

	graph.gridBackground();
	graph.drawLine();
	graph.crosshair();
	
	//graph.scatterPlot();
	graph.tooltip();

	setInterval(function() { 
		document.getElementsByClassName("d3-tip")[0].style.display = "none";
		dataset = generateRandomDataset(20, 0, 100);
		graph.updateDataset(dataset);
		graph.setXAxis();
		graph.setYAxis();
		graph.crosshair();
		graph.drawLine();
		//graph.scatterPlot();
	}, 10000000);

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