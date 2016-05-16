/*
 * SmartGraph constructor. Receives margin JSON, width and height. 
 */

function SmartGraph(margin, width, height) {
	this.margin = margin;
	this.width = width - margin.left - margin.right;;
	this.height = height - margin.top - margin.bottom;

	this.x = d3.scale.linear().range([0, this.width]);
	this.y = d3.scale.linear().range([this.height, 0]);

	this.xAxis = d3.svg.axis().scale(this.x).orient("bottom").ticks(5);
	this.yAxis = d3.svg.axis().scale(this.y).orient("left").ticks(5);

	this.svg = d3.select("body").append("svg")
		.attr("width", this.width + margin.left + margin.right)
		.attr("height", this.height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

}

SmartGraph.prototype.setDomains = function(dataset) {
	this.x.domain(d3.extent(dataset, function(d) { return d.id; }));
	this.y.domain([0, d3.max(dataset, function(d) { return d.value; })]);
}

SmartGraph.prototype.setXAxis = function(dataset) {
	this.setDomains(dataset);

	var selection = this.svg.select(".x.axis")

	if (selection.empty()) {
		selection = this.svg.append("g")
    		.attr("class", "x axis")
    		.attr("transform", "translate(0," + this.height + ")")
	} else {
		selection.transition().duration(1000);
	}

	selection.call(this.xAxis);
}

SmartGraph.prototype.setYAxis = function(dataset) {
	this.setDomains(dataset);

	var selection = this.svg.select(".y.axis")

	if (selection.empty()) {
		selection = this.svg.append("g")
    		.attr("class", "y axis")
	} else {
		selection.transition().duration(1000);
	}

	selection.call(this.yAxis);
}

/**
 * Method that draws or updates line graph based on received dataset.
 */
SmartGraph.prototype.drawLine = function(dataset, interpolation) {

	var x = this.x;
	var y = this.y;

	var valueline = d3.svg.line()
    	.x(function(d) { return x(d.id); })
    	.y(function(d) { return y(d.value); })
    	.interpolate(interpolation ? interpolation : "linear");

    var selection = this.svg.select("path#linegraph");

	if (selection.empty()) {
		selection = this.svg
			.append("path")
			.attr("class", "line")
			.attr("id", "linegraph")
	  		.attr("d", valueline(dataset));
	} else {
		selection = selection.transition().duration(500);
	}
		
	selection.attr("d", valueline(dataset));

}

SmartGraph.prototype.scatterPlot = function(dataset) {

	var x = this.x;
	var y = this.y;

	var selection = this.svg.selectAll("circle");

	if (selection.empty()) {
		selection = selection.data(dataset).enter().append("circle");
	} else {
		selection = selection.data(dataset).transition();
	}

	selection.attr("r", 3.5)
    	.attr("cx", function(d) { return x(d.id); })
    	.attr("cy", function(d) { return y(d.value); })

}

SmartGraph.prototype.extremes = function(dataset) {

	var max = Number.MIN_VALUE, min = Number.MAX_VALUE;

	for (var i = 0; i < dataset.length; i++) {
		if (dataset[i].value > max) max = dataset[i].value;
		if (dataset[i].value < min) min = dataset[i].value;
	}

	var selection = this.svg.selectAll("circle").each(function(d) {
		if (d.value === max) {
			d3.select(this).attr("r", 4.5);
			d3.select(this).attr("fill", "red");
		}
		if (d.value === min) {

		}
	});

}

SmartGraph.prototype.tooltip = function() {

	var tip = d3.tip()
  		.attr('class', 'd3-tip')
  		.offset([-10, 0])
  		.html(function(d) {
    		return "<strong>Frequency:</strong> <span style='color:red'>" + d.value + "</span>";
  		});

  	this.svg.call(tip);

  	this.svg.selectAll("circle")
  		.on('mouseover', function(d) {
  			var circleSize = d3.select(this).attr("r");
  			d3.select(this).attr("r", circleSize*2);
  			tip.show(d);
  			document.getElementsByClassName("d3-tip")[0].style.display = ""; 
  		})
      	.on('mouseout', function(d) {
      		var circleSize = d3.select(this).attr("r");
  			d3.select(this).attr("r", circleSize / 2);
  			tip.hide(d); 
  		})

}