window.onload = function() {

	var dataset = generateRandomDataset(20, 0, 100);

	var margin = {top: 30, right: 20, bottom: 30, left: 50}
	var width = 1000;
	var height = 250;

	var graph = new SmartGraph(margin, width, height);
	graph.setXAxis(dataset);
	graph.setYAxis(dataset);

	graph.drawLine(dataset);
	graph.scatterPlot(dataset);
	graph.tooltip();
	graph.extremes(dataset);

	// setInterval(function() { 
	// 	document.getElementsByClassName("d3-tip")[0].style.display = "none";
	// 	dataset = generateRandomDataset(20, 0, 100);
	// 	graph.setXAxis(dataset);
	// 	graph.setYAxis(dataset);
	// 	graph.scatterPlot(dataset);
	// 	graph.drawLine(dataset);
	// }, 2000);

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