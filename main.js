var margin = {top: 30, right: 20, bottom: 30, left: 50}

var width = 1000 - margin.left - margin.right;
var height = 250 - margin.top - margin.bottom;

var svg;

// Define x and y ranges based on canvas size - IMMUTABLE
//var x = d3.time.scale().range([0, width]);
var x = d3.scale.linear().range([0, width]);
var y = d3.scale.linear().range([height, 0]);

// Define x and y axis
var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(5);
var yAxis = d3.svg.axis().scale(y).orient("left").ticks(5);

var valueline = d3.svg.line()
    .x(function(d) { return x(d.id); })
    .y(function(d) { return y(d.value); })
    .interpolate("linear");;

function createSmartGraph(dataset) {

	svg = d3.select("body").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	x.domain(d3.extent(dataset, function(d) { return d.id; }));
    y.domain([0, d3.max(dataset, function(d) { return d.value; })]);

    svg.append("path")
        .attr("class", "line")
        .attr("d", valueline(dataset));

    // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    var tip = d3.tip()
  		.attr('class', 'd3-tip')
  		.offset([-10, 0])
  		.html(function(d) {
    		return "<strong>Frequency:</strong> <span style='color:red'>" + d.value + "</span>";
  		});

  	svg.call(tip);

    // Add the scatterplot
   	svg.selectAll("circle")
        .data(dataset)
      	.enter()
      	.append("circle")
        .attr("r", 3.5)
        .attr("cx", function(d) { return x(d.id); })
        .attr("cy", function(d) { return y(d.value); })
        .on('mouseover', tip.show)
      	.on('mouseout', tip.hide)

}

function updateSmartGraph(dataset) {

	x.domain(d3.extent(dataset, function(d) { return d.id; }));
    y.domain([0, d3.max(dataset, function(d) { return d.value; })]);

	svg.select("path")
	   .transition()
	   .duration(500)
	   .attr("d", valueline(dataset));

	svg.selectAll("circle")
        .data(dataset)
        .transition()
        .attr("r", 3.5)
        .attr("cx", function(d) { return x(d.id); })
        .attr("cy", function(d) { return y(d.value); });

	svg.select(".x.axis")
		.transition()
		.duration(1000)
		.call(xAxis);
					
	svg.select(".y.axis")
		.transition()
		.duration(1000)
		.call(yAxis);



}