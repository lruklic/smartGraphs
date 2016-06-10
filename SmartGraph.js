/*
 * SmartGraph constructor. Receives margin JSON, width, height and dataset. 
 */

function DatasetObject() {
	this.data = [];
}

function SmartGraph(margin, width, height, dataset) {
	this.margin = margin;
	this.width = width - margin.left - margin.right;;
	this.height = height - margin.top - margin.bottom;

	this.x = d3.time.scale().range([0, this.width]);
	this.y = d3.scale.linear().range([this.height, 0]);

	var axisTimeFormat = d3.time.format.multi([
    	[".%L", function(d) { return d.getMilliseconds(); }],
    	[":%S", function(d) { return d.getSeconds(); }],
    	["%H:%M", function(d) { return d.getMinutes(); }],
    	["%H:%M", function(d) { return d.getHours(); }],
    	["%a %d", function(d) { return d.getDay() && d.getDate() != 1; }],
    	["%b %d", function(d) { return d.getDate() != 1; }],
    	["%B", function(d) { return d.getMonth(); }],
    	["%Y", function() { return true; }]
 	]);

	this.xAxis = d3.svg.axis().scale(this.x).orient("bottom").tickFormat(axisTimeFormat);
	this.yAxis = d3.svg.axis().scale(this.y).orient("left").ticks(5);

	this.svg = d3.select("body").append("svg")
		.attr("width", this.width + margin.left + margin.right)
		.attr("height", this.height + margin.top + margin.bottom)
		.append("g")
		.attr("class", "main")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var datasetObject = new DatasetObject();
	for (var i = 0; i < dataset.length; i++) {
		if (typeof dataset[i].value === "string") {
			var reading = new Reading(new Date(dataset[i].date).getTime(), Number(dataset[i].value.replace(",", ".")));
			datasetObject.data.push(reading);
		}
	}

	this.dataset = datasetObject;

	this.createContextGraph();

}

SmartGraph.prototype.createContextGraph = function() {
	// TODO define margins of context graph based on margins, h and w of the focus graph
	var margin2 = {top: 430, right: 10, bottom: 20, left: 40}
	this.height2 = this.height + this.margin.top + this.margin.bottom - margin2.top - margin2.bottom;
	this.x2 = d3.time.scale().range([0, this.width]);
	this.y2 = d3.scale.linear().range([this.height2, 0]);

	var x = this.x;
	var y = this.y;
	var x2 = this.x2;
	var y2 = this.y2;
	var xAxis = this.xAxis;

	var dataset = this.dataset;

	this.x.domain([new Date(this.dataset.data[0].date), new Date(this.dataset.data[this.dataset.data.length-1].date)]);
	this.y.domain([d3.min(this.dataset.data, function(d) { return d.value; }), d3.max(this.dataset.data, function(d) { return d.value; })]);
	this.x2.domain(this.x.domain());
	this.y2.domain(this.y.domain());

	this.xAxis2 = d3.svg.axis().scale(this.x2).orient("bottom").tickFormat(this.axisTimeFormat);

	var area2 = d3.svg.area()
	    .interpolate("monotone")
    	.x(function(d) {
    		return x(new Date(d.date)); })
    	.y0(this.height2)
    	.y1(function(d) {
    		return y2(d.value); 
    	});

	this.contextSvg = d3.select("body").select("svg")
		.append("g")
		.attr("class", "context")
		.attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

	this.contextSvg.append("path")
      	.datum(this.dataset.data)
      	.attr("class", "area")
      	.attr("d", area2);

    this.contextSvg.append("g")
      	.attr("class", "x axis")
      	.attr("transform", "translate(0," + this.height2 + ")")
      	.call(this.xAxis2);

    var brush = d3.svg.brush()
    	.x(x2)
    	.on("brush", function() {
    		x.domain(brush.empty() ? x2.domain() : brush.extent());
    		var valueline = d3.svg.line()
    			.x(function(d) {
    				return x(new Date(d.date)); 
    			})
    			.y(function(d) { return y(d.value); })
    			.interpolate("monotone");

   			var selection = d3.select("svg").select("g").select("path#linegraph");
			selection.attr("d", valueline(dataset.data));

			d3.select("svg").select(".x.axis").call(xAxis);

    	});

    this.contextSvg.append("g")
      	.attr("class", "x brush")
     	.call(brush)
    	.selectAll("rect")
      	.attr("y", -6)
      	.attr("height", this.height2 + 7);

    this.svg.append("defs").append("clipPath")
    	.attr("id", "clip")
  		.append("rect")
    	.attr("width", this.width)
    	.attr("height", this.height);
}

SmartGraph.prototype.updateDataset = function(dataset) {

	var readings = [];
	for (var i = 0; i < dataset.length; i++) {
		if (typeof dataset[i].value === "string") {
			var reading = new Reading(new Date(dataset[i].date).getTime(), Number(dataset[i].value.replace(",", ".")));
			readings.push(reading);
		}
	}

	this.dataset.data = readings;

	this.setXAxis();
	this.setYAxis();
	this.crosshair();
	this.drawLine();
}

/**
 * Method that sets domains for graph.
 */
SmartGraph.prototype.setDomains = function() {
	this.x.domain([new Date(this.dataset.data[0].date), new Date(this.dataset.data[this.dataset.data.length-1].date)]);

	var min = d3.min(this.dataset.data, function(d) { return d.value; });
	var max = d3.max(this.dataset.data, function(d) { return d.value; });

	// Fixed threshold to prevent "false" boundaries 
	this.y.domain([min - 0.5, max + 0.5]);
}

SmartGraph.prototype.setXAxis = function() {
	this.setDomains();

	var selection = this.svg.select(".x.axis")

	if (selection.empty()) {
		selection = this.svg.append("g")
    		.attr("class", "x axis")
    		.attr("transform", "translate(0," + this.height + ")");

    	this.svg.append("text")
	  		.attr("class", "xlabel")
	  		.attr("text-anchor", "middle")
	  		.attr("x", this.width / 2)
	  		.attr("y", this.height + this.margin.bottom);

	  	selection.call(this.xAxis);
	} else {
		selection.transition().duration(1000).call(this.xAxis);
	}

}

SmartGraph.prototype.setYAxis = function() {
	this.setDomains();

	var selection = this.svg.select(".y.axis")

	if (selection.empty()) {
		selection = this.svg.append("g")
    		.attr("class", "y axis")
    		.call(this.yAxis);
	} else {
		selection.transition().duration(1000).call(this.yAxis);
	}
}

/**
 * Method that draws or updates line graph based on received dataset.
 */
SmartGraph.prototype.drawLine = function(interpolation) {

	var x = this.x;
	var y = this.y;

	var valueline = d3.svg.line()
    	.x(function(d) { 
    		return x(new Date(d.date)); 
    	})
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
		
	selection.attr("d", valueline(this.dataset.data));

}

SmartGraph.prototype.scatterPlot = function() {

	var x = this.x;
	var y = this.y;

	var max = Number.MIN_VALUE, min = Number.MAX_VALUE;

	for (var i = 0; i < this.dataset.data.length; i++) {
		if (this.dataset.data[i].value > max) max = this.dataset.data[i].value;
		if (this.dataset.data[i].value < min) min = this.dataset.data[i].value;
	}

	var selection = this.svg.selectAll("circle");

	if (selection.empty()) {
		selection = selection.data(this.dataset.data).enter().append("g").append("circle");
	} else {
		selection = selection.data(this.dataset.data).transition();
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

SmartGraph.prototype.gridBackground = function() {

	this.svg.append("g")         
        .attr("class", "grid")
        .attr("transform", "translate(0," + this.height + ")")
        .call(d3.svg.axis().scale(this.x).orient("bottom").ticks(5)
            .tickSize(-this.height, 0, 0)
            .tickFormat("")
        )

    this.svg.append("g")         
        .attr("class", "grid")
        .call(d3.svg.axis().scale(this.y).orient("left").ticks(5)
            .tickSize(-this.width, 0, 0)
            .tickFormat("")
        )
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

      	var minimalDifference = Number.MAX_VALUE;
      	var minDiffElementIndex;
      	for (var i = 0; i < dataset.data.length; i++) {
      		if (Math.abs(dataset.data[i].date - xValue) < minimalDifference) {
      			minimalDifference = Math.abs(dataset.data[i].date - xValue);
      			minDiffElementIndex = i;
      		}
      	}

		focus.select(".x")
			.attr("transform", "translate(" + x(dataset.data[minDiffElementIndex].date) + "," + y(dataset.data[minDiffElementIndex].value) + ")")
			.attr("y2", height - y(dataset.data[minDiffElementIndex].value));

		focus.select(".y")
		    .attr("transform", "translate(" + width * -1 + "," + y(dataset.data[minDiffElementIndex].value) + ")")
		    .attr("x2", width + width);

      });

}

/**
 * Method that adds tooltips over selected units.
 */
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