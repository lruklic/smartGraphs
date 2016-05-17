/*
 * SmartGraph constructor. Receives margin JSON, width, height and dataset. 
 */

function SmartGraph(margin, width, height, dataset) {
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

	for (var i = 0; i < dataset.length; i++) {
		if (typeof dataset[i].value === "string") {
			dataset[i].value = Number(dataset[i].value.replace(",", "."));
		}
	}

	this.dataset = dataset;

}

SmartGraph.prototype.updateDataset = function(dataset) {
	this.dataset = dataset;
	// TODO refresh all active instances
}

SmartGraph.prototype.setDomains = function() {
	this.x.domain(d3.extent(this.dataset, function(d) { return d.id; }));
	this.y.domain([0, d3.max(this.dataset, function(d) { return d.value; })]);
}

SmartGraph.prototype.setXAxis = function() {
	this.setDomains();

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

SmartGraph.prototype.setYAxis = function() {
	this.setDomains();

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
SmartGraph.prototype.drawLine = function(interpolation) {

	var x = this.x;
	var y = this.y;

	var valueline = d3.svg.line()
    	.x(function(d) { return x(d.id); })
    	.y(function(d) { return y(d.value); })
    	.interpolate(interpolation ? interpolation : "monotone");

    var selection = this.svg.select("path#linegraph");

	if (selection.empty()) {
		selection = this.svg
			.append("g")
			.append("path")
			.attr("class", "line")
			.attr("id", "linegraph")
	} else {
		selection = selection.transition().duration(500);
	}
		
	selection.attr("d", valueline(this.dataset));

}

SmartGraph.prototype.scatterPlot = function() {

	var x = this.x;
	var y = this.y;

	var max = Number.MIN_VALUE, min = Number.MAX_VALUE;

	for (var i = 0; i < this.dataset.length; i++) {
		if (this.dataset[i].value > max) max = this.dataset[i].value;
		if (this.dataset[i].value < min) min = this.dataset[i].value;
	}

	var selection = this.svg.selectAll("circle");

	if (selection.empty()) {
		selection = selection.data(this.dataset).enter().append("g").append("circle");
	} else {
		selection = selection.data(this.dataset).transition();
	}

	selection.attr("cx", function(d) { return x(d.id); })
    	.attr("cy", function(d) { return y(d.value); })
    	.attr("r", function(d) {
    		if (d.value === max || d.value === min) {
    			return 4.5;
			} else {
				return 3.5;
			}
    	})
    	.attr("fill", function(d) {
    		if (d.value === max) {
    			return "red";
			} else if (d.value === min) {
				return "blue";
			} else {
				return "black";
			}
    	});

}

SmartGraph.prototype.crosshair = function() {

	var x = this.x;
	var y = this.y;
	var height = this.height;
	var width = this.width;
	var dataset = this.dataset;

	var focus = this.svg
		.append("g")
		.attr("class", "focus")
		.style("display", "none");

	focus.append("line")
        .attr("class", "x")
       	.style("stroke", "blue")
       	.style("stroke-dasharray", "3,3")
       	.style("opacity", 0.5)
       	.attr("y1", 0)
       	.attr("y2", height);

    focus.append("line")
        .attr("class", "y")
        .style("stroke", "blue")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.5)
        .attr("x1", width)
        .attr("x2", width);

	this.svg.append("rect")
      .attr("class", "overlay")
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .attr("width", this.width)
      .attr("height", this.height)
      .on("mouseover", function() { focus.style("display", null); })
      .on("mouseout", function() { focus.style("display", "none"); })
      .on("mousemove", function() {

      	var xValue = Math.round(x.invert(d3.mouse(this)[0]));

		focus.select(".x")
			.attr("transform", "translate(" + x(xValue) + "," + y(dataset[xValue].value) + ")")
			.attr("y2", height - y(dataset[xValue].value));

		focus.select(".y")
		    .attr("transform", "translate(" + width * -1 + "," + y(dataset[xValue].value) + ")")
		    .attr("x2", width + width);

      });

}

SmartGraph.prototype.tooltip = function() {

	var tip = d3.tip()
  		.attr('class', 'd3-tip')
  		.offset([-10, 0])
  		.html(function(d) {
    		return "<strong>Temperature:</strong> <span style='color:red'>" + d.value + "</span>";
  		});

  	this.svg.call(tip);

  	this.svg.selectAll("circle")
  		.on('mouseover', function(d) {
  			var circleSize = d3.select(this).attr("r");
  			d3.select(this).attr("r", circleSize*2);
  			tip.show(d);
  			document.getElementsByClassName("d3-tip")[0].style.display = ""; 
  		})
      	.on('mouseout', function(d) {	// issue on mouseout on graph change
      		var circleSize = d3.select(this).attr("r");
  			d3.select(this).attr("r", circleSize / 2);
  			tip.hide(d); 
  		})

}