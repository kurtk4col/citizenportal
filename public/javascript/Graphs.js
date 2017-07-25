$(document).ready(function(){
// Written & Commented by Sean Stout for Lucity, Inc. (c) 2014. Some scripts provided by 3rd party authors & are copyright to their respective owners
/* *****************************************************************************************
 *	TABLE OF CONTENTS: Hit Ctrl + F and search for the key to jump to that part of the code.
 *******************************************************************************************
 *	KEY    || Area
 *	----------------------------------------------------------------------------------------
 *	GGGGG  || Table of Contents
 *	HHHHH  || Initial Setup
 *	IIIII  || Top Level Functionality
 *	JJJJJ  || Open/Closed Tab
 *	KKKKK  || Request Bar Tab
 *	LLLLL  || Request Pie Tab
 *	MMMMM  || Average Time Tab
 ****************************************************************************************** */
	
/* IIIII -- Top Level functionality */
	var top = this; // Keep tabs on top level
	this.tabSelected = 'OpenClosed'; // Initial tab
	this.numberLoaded = 0;
	$(document).scrollTop(0); // Make sure we're up top
	jQuery.support.cors = true; // Needed for IE
	
	// Keep within standalone app
	$( document ).on( "click", "a", function( event ){
		event.preventDefault();
		location.href = $( event.target ).attr( "href" );
	});
	
	// Check if the tab has changed
	$('li').each(function() {
		var el = $(this);
		el.click(function() {
			if (!(el.hasClass('active'))) {
				$('li').removeClass('active');
				el.addClass('active');
				top.tabSelected = el.attr('id')
				top.redrawGraphs();
			}
		});
	});
	
	// onorientationchange doesn't always fire in a timely manner in Android so check for both orientationchange and resize
	var supportsOrientationChange = "onorientationchange" in window, orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";

	window.addEventListener(orientationEvent, function () {
		orientationChanged();
	}, false);
	
	function orientationChanged() {
		top.redrawGraphs();
	}
	  
	window.onresize = function(event) {
		top.redrawGraphs();
	}
	
	// Redraw graphs on resize, orientation change, or tab change
	this.redrawGraphs = function() {
		if (top.tabSelected == "OpenClosed")
			top.openClosedTab();
		else if ((top.tabSelected == "RequestBar")&&(top.numberLoaded >= 6))
			top.requestBarTab();
		else if ((top.tabSelected == "RequestBarSlide")&&(top.numberLoaded >= 6))
			top.requestBarSlideTab();
		else if ((top.tabSelected == "RequestPie")&&(top.numberLoaded >= 6))
			top.requestPieTab();
		else if ((top.tabSelected == "AverageTime")&&(top.numberLoaded >= 6))
			top.averageTimeTab();
		else if ($("#loadingmask2").length == 0) { // If the tab is not loaded yet
			document.getElementById("BodyContainer").innerHTML = "";
			$("body").append("<div id='loadingmask2'></div>");
		}
	}
	
/* JJJJJ -- Open/Closed Tab */
	this.openClosedTab = function() {
		document.getElementById("BodyContainer").innerHTML = "<center><div id='GraphBody1' class='one'></div><div id='GraphBody2' class='two'></div></center>";
	
		var data1 = [Number(top.open30), Number(top.closed30)];
		
		var margin = {top: 20, right: 30, bottom: 30, left: 40};
		var barPadding = 1;
		var filler = function(d,i) {
			if (i == 0)
				return "#EC9B28";
			else
				return "#9ACD32";
		}
		
		var w1 = $("#GraphBody1").width() - margin.left - margin.right;
		var h1 = $("#GraphBody1").height() - margin.top - margin.bottom;
		var scale1 = d3.scale.linear()
						.domain([0, d3.max(data1, function(d) { return d; })])
						.range([0, 8*h1/10]);
						
		var xAxis = d3.svg.axis();
		
		var svg1 = d3.select("#GraphBody1")
						.append("svg")
						.attr("width", w1 + margin.left + margin.right)
						.attr("height", h1 + margin.top + margin.bottom)
						.append("g")
							.attr("class", "axis")
							.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		var graphBars1 = svg1.selectAll("rect")
		   .data(data1)
		   .enter()
		   .append("rect")
		   .attr("x", function(d, i) {return i * (w1 / data1.length); })
		   .attr("y", 0)
		   .attr("width", w1 / data1.length - barPadding)
		   .attr("y", function(d) { return h1 - scale1(d);})
		   .attr("height", function(d) { return scale1(d); })
		   .attr("fill", function(d,i) {return filler(d,i);});
			   
		var graphLabels1 = svg1.selectAll("text") 
			.data(data1)
			.enter()
			.append("text")
			.text(function(d) {
				return d;
			})
			.attr("text-anchor", "middle")
			.attr("x", function(d, i) {
				return i * (w1 / data1.length) + (w1 / data1.length - barPadding) / 2;
			})
			.attr("y", function(d) {
				return h1 - scale1(d)+14;
			})
			.attr("font-family", "sans-serif")
			.attr("font-size", "11px")
			.attr("fill", "white");
			
		String.prototype.width = function() {
			o = $('<div>' + this + '</div>')
				.css({'position': 'absolute', 'float': 'left', 'white-space': 'nowrap', 'visibility': 'hidden'})
				.appendTo($('body'));
			w = o.width();

			o.remove();

			return w;
		}
		
		if (graphLabels1[0][0].offsetHeight+3 > graphBars1[0][0].getBBox().height) {
			graphLabels1[0][0].setAttribute('y', graphLabels1[0][0].getAttribute('y') - 18);
			graphLabels1[0][0].setAttribute('fill', 'black');
		}
		
		if (graphLabels1[0][1].offsetHeight+3 > graphBars1[0][1].getBBox().height) {
			graphLabels1[0][1].setAttribute('y', graphLabels1[0][1].getAttribute('y') - 18);
			graphLabels1[0][1].setAttribute('fill', 'black');
		}
			   
		var x1 = d3.scale.ordinal()
			.domain(["Open", "Closed"])
			.range([(w1 / data1.length - barPadding) / 2, (w1 / data1.length) + (w1 / data1.length - barPadding) / 2]);

		var xAxis1 = d3.svg.axis()
			.scale(x1)
			.orient("bottom");
			
		var y1 = d3.scale.linear()
			.domain([d3.max(data1, function(d) { return d; }), 0])
			.range([0, 8*h1/10]);
			
		var yAxis1 = d3.svg.axis()
			.scale(y1)
			.ticks(5)
			.orient("left");
		   
		svg1.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + h1 + ")")
			.call(xAxis1);
			
		svg1.append("text")
			.text("30 Days")
			.attr("text-anchor", "middle")
			.attr("x", (w1 / data1.length - barPadding))
			.attr("y", "1em")
			.attr("font-family", "sans-serif")
			.attr("font-size", "1.5em");
							
		svg1.append("g")
				.attr("class", "y axis")
				.attr("transform", "translate(0," + 2*h1/10 + ")")
				.call(yAxis1)
				.append("text")
					.attr("transform", "rotate(-90)")
					.attr("y", w1+14)
					.attr("x", -2*h1/10)
					.style("text-anchor", "end")
					.text("Requests");
			  
		var data2 = [Number(top.open365), Number(top.closed365)];
		
		var w2 = $("#GraphBody2").width() - margin.left - margin.right;
		var h2 = $("#GraphBody2").height() - margin.top - margin.bottom;
		var scale2 = d3.scale.linear()
						.domain([0, d3.max(data2, function(d) { return d; })])
						.range([0, 8*h2/10]);
		var svg2 = d3.select("#GraphBody2")
						.append("svg")
						.attr("width", w2 + margin.left + margin.right)
						.attr("height", h2 + margin.top + margin.bottom)
						.append("g")
							.attr("class", "axis")
							.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		var graphBars2 = svg2.selectAll("rect")
		   .data(data2)
		   .enter()
		   .append("rect")
		   .attr("x", function(d, i) {return i * (w2 / data2.length); })
		   .attr("y", 0)
		   .attr("width", w2 / data2.length - barPadding)
		   .attr("y", function(d) { return h2 - scale2(d);})
		   .attr("height", function(d) { return scale2(d); })
		   .attr("fill", function(d,i) {return filler(d,i);});
			   
		var graphLabels2 = svg2.selectAll("text")
			.data(data2)
			.enter()
			.append("text")
			.text(function(d) {
				return d;
			})
			.attr("text-anchor", "middle")
			.attr("x", function(d, i) {
				return i * (w2 / data2.length) + (w2 / data2.length - barPadding) / 2;
			})
			.attr("y", function(d) {
				return h2 - scale2(d)+14;
			})
			.attr("font-family", "sans-serif")
			.attr("font-size", "11px")
			.attr("fill", "white");
			
		if (graphLabels2[0][0].offsetHeight+3 > graphBars2[0][0].getBBox().height) {
			graphLabels2[0][0].setAttribute('y', graphLabels2[0][0].getAttribute('y') - 18);
			graphLabels2[0][0].setAttribute('fill', 'black');
		}
		
		if (graphLabels2[0][1].offsetHeight+3 > graphBars2[0][1].getBBox().height) {
			graphLabels2[0][1].setAttribute('y', graphLabels2[0][1].getAttribute('y') - 18);
			graphLabels2[0][1].setAttribute('fill', 'black');
		}
			   
			var x2 = d3.scale.ordinal()
				.domain(["Open", "Closed"])
				.range([(w2 / data2.length - barPadding) / 2, (w2 / data2.length) + (w2 / data2.length - barPadding) / 2]);
	
			var xAxis2 = d3.svg.axis()
				.scale(x2)
				.orient("bottom");
				
			var y2 = d3.scale.linear()
					.domain([d3.max(data2, function(d) { return d; }), 0])
					.range([0, 8*h2/10]);
				
			var yAxis2 = d3.svg.axis()
				.scale(y2).ticks(5)
				.orient("left");
			   
			svg2.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + h2 + ")")
				.call(xAxis2);
				
			svg2.append("text")
				.text("365 Days")
				.attr("text-anchor", "middle")
				.attr("x", (w2 / data2.length - barPadding))
				.attr("y", "1em")
				.attr("font-family", "sans-serif")
				.attr("font-size", "1.5em");
								
			svg2.append("g")
					.attr("class", "y axis")
					.attr("transform", "translate(0," + 2*h2/10 + ")")
					.call(yAxis2)
					.append("text")
						.attr("transform", "rotate(-90)")
						.attr("y", w2+14)
						.attr("x", -2*h2/10)
						.style("text-anchor", "end")
						.text("Requests");
	}
	
/* KKKKK -- Request Bar Tab */
	this.requestBarTab = function() {
		document.getElementById("BodyContainer").innerHTML = "<div id='GraphBody1' style='border: solid 1px black;' class='three'>";
		
		var dataArray = [];
		var data1 = [];
		var endData1 = [];
		var labels = [];
		var others1 = 0;
		var data2 = [];
		var endData2 = [];
		var others2 = 0;
		
		for (var k in top.closedProblems){
			data1.push(top.closedProblems[k]);
			data2.push(top.openProblems[k]);
			labels.push(k);
		}
		
		for (var k in data1) {
			dataArray.push({"data1":data1[k], "labels":labels[k],"data2":data2[k], "totalData":(data1[k]+data2[k])});
		}
		
		dataArray.sort(function(a,b){return b.totalData-a.totalData});

		for (var k in data1) {
			data1[k] = dataArray[k].data1
			labels[k] = dataArray[k].labels
			data2[k] = dataArray[k].data2
		}
		
		if (data1.length>7) {
			endData1 = data1.slice(7); // The data that will be grouped under "other"
			endData2 = data2.slice(7);
			data1 = data1.slice(0,7); // The data that survives this "other" gathering
			data2 = data2.slice(0,7);
			for (var k = 0; k<endData1.length; k++) {
				others1 += endData1[k]; // Sum up the total of "others"
				others2 += endData2[k];
			}
			data1.push(others1);
			data2.push(others2);
			labels = labels.slice(0,7);
			labels.push("Other");
		}
		
		dataArray = [];

		for (var k in data1) {
			dataArray.push({"data1":data1[k], "labels":labels[k],"data2":data2[k], "totalData":(data1[k]+data2[k])});
		}

		dataArray.sort(function(a,b){return b.totalData-a.totalData});
		
		for (var k in data1) {
			data1[k] = dataArray[k].data1
			labels[k] = dataArray[k].labels
			data2[k] = dataArray[k].data2
		}
		
		var dataConcat = data1.concat(data2);
		
		var margin = {top: 20, right: 30, bottom: 30, left: 40};
		var barPadding = 1;
		
		var w1 = $("#GraphBody1").width() - margin.left - margin.right;
		var h1 = $("#GraphBody1").height() - margin.top - margin.bottom;
		var scale1 = d3.scale.linear()
						.domain([0, d3.max(dataConcat, function(d) { return d; })])
						.range([0, 8*h1/10]);

		var svg1 = d3.select("#GraphBody1")
						.append("svg")
						.attr("width", w1 + margin.left + margin.right)
						.attr("height", h1 + margin.top + margin.bottom)
						.append("g")
							.attr("class", "axis")
							.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
							
		svg1.selectAll("rect")
		   .data(data1)
		   .enter()
		   .append("rect")
		   .attr("x", function(d, i) {return i * (w1 / data1.length); })
		   .attr("y", 0)
		   .attr("width", w1 / data1.length - barPadding)
		   .attr("y", function(d) { return h1 - scale1(d);})
		   .attr("height", function(d) { return scale1(d); })
		   .attr("fill", function(d) {return "#669900";})
		   .attr("class", "transparent");

		// Creating a faux x axis. Needs to be done this way for strange reasons
		var xAxis = svg1.selectAll("div") 
			.data(data1)
			.enter()
			.append("text")
			.text(function(d,i) {
				return labels[i];
			})
			.attr("text-anchor", "middle")
			.attr("x", function(d, i) {
				return i * (w1 / data1.length) + (w1 / data1.length - barPadding) / 2;
			})
			.attr("y", function(d) {
				return h1+16;
			})
			.attr("font-family", "sans-serif")
			.attr("font-size", "11px")
			.attr("fill", "black");
		
		var k;
		
		var xAxisLabels = [];
		for (k = 0; k<xAxis[0].length; k++) {
			xAxisLabels.push(xAxis[0][k]);
		}
		
		var prev;
		k = 0;
		$.each(xAxisLabels, function(k) {
			if (k > 0) {
				var thisbb = this.getBoundingClientRect(),
					prevbb = prev.getBoundingClientRect();
				// move if they overlap
				if(!(thisbb.right < prevbb.left || thisbb.left > prevbb.right || thisbb.bottom < prevbb.top || thisbb.top > prevbb.bottom)) {
					var ctx = thisbb.left + (thisbb.right - thisbb.left)/2,
						cty = thisbb.top + (thisbb.bottom - thisbb.top)/2,
						cpx = prevbb.left + (prevbb.right - prevbb.left)/2,
						cpy = prevbb.top + (prevbb.bottom - prevbb.top)/2,
						off = Math.sqrt(Math.pow(ctx - cpx, 2) + Math.pow(cty - cpy, 2))/2;
						if (k % 2 == 0)
							d3.select(this).attr("transform","translate(0 , -" + (this.getBBox().height/2) + ")");
						else
							d3.select(this).attr("transform","translate(0 , " + (this.getBBox().height/2) + ")");
						if (k == 1)
							d3.select(prev).attr("transform","translate(0 , -" + (this.getBBox().height/2) + ")");
				}
			}
			prev = this;
		});
		
		var y1 = d3.scale.linear()
			.domain([d3.max(dataConcat, function(d) { return d; }), 0])
			.range([0, 8*h1/10]);

		var yAxis1 = d3.svg.axis()
			.scale(y1)
			.ticks(5)
			.orient("left");
			
		svg1.append("text")
			.text("Types of Requests in the Past 30 Days")
			.attr("text-anchor", "middle")
			.attr("x", w1/2 )
			.attr("y", "1em")
			.attr("font-family", "sans-serif")
			.attr("font-size", "1.5em");
							
		svg1.append("g")
				.attr("class", "y axis")
				.attr("transform", "translate(0," + 2*h1/10 + ")")
				.call(yAxis1)
				.append("text")
					.attr("transform", "rotate(-90)")
					.attr("y", w1+14)
					.attr("x", -2*h1/10)
					.style("text-anchor", "end")
					.text("Requests");
							
		svg1.selectAll("div")
		   .data(data2)
		   .enter()
		   .append("rect")
		   .attr("x", function(d, i) {return i * (w1 / data1.length); })
		   .attr("y", 0)
		   .attr("width", w1 / data1.length - barPadding)
		   .attr("y", function(d) { return h1 - scale1(d);})
		   .attr("height", function(d) { return scale1(d); })
		   .attr("fill", function(d) {return "#99CC33";})
		   .attr("class", "transparent");
		   
		var topLabelClosed = svg1.selectAll("div") 
			.data(data1)
			.enter()
			.append("text")
			.text(function(d) {
				return d;
			})
			.attr("text-anchor", "middle")
			.attr("x", function(d, i) {
				return i * (w1 / data1.length) + (w1 / data1.length - barPadding) / 2;
			})
			.attr("y", function(d) {
				return h1 - scale1(d)-4;
			})
			.attr("font-family", "sans-serif")
			.attr("font-size", "11px")
			.attr("fill", "black");
		   
		var topLabelOpen = svg1.selectAll("div") 
			.data(data2)
			.enter()
			.append("text")
			.text(function(d) {
				if (d==0) 
					return ""; 
				else 
					return d;
			})
			.attr("text-anchor", "middle")
			.attr("x", function(d, i) {
				return i * (w1 / data1.length) + (w1 / data1.length - barPadding) / 2;
			})
			.attr("y", function(d) {
				return h1 - scale1(d)-4;
			})
			.attr("font-family", "sans-serif")
			.attr("font-size", "11px")
			.attr("fill", "black");
		
		for (k = 0; k<topLabelOpen[0].length; k++) { // Only displays both labels if they don't overlap
			var openbb = topLabelOpen[0][k].getBoundingClientRect();
			var closedbb = topLabelClosed[0][k].getBoundingClientRect();
			if(!(openbb.right < closedbb.left || openbb.left > closedbb.right || openbb.bottom < closedbb.top || openbb.top > closedbb.bottom)) {
				if (Number(topLabelOpen[0][k].textContent) > Number(topLabelClosed[0][k].textContent)) 
					topLabelClosed[0][k].textContent = "";
				else
					topLabelOpen[0][k].textContent = "";
			}
		}
		
	}
	
/* LLLLL -- Request Pie Tab */
	this.requestPieTab = function() {
		document.getElementById("BodyContainer").innerHTML = "<div id='piechart'></div>";
		
		var data = [];
		var data1 = [];
		var endData1 = [];
		var labels1 = [];
		var others = 0;
		var data2 = [];
		var others2 = 0;
		var dataConcat = [];
		var labelsConcat = [];
		
		for (var k in top.closedProblems){
			data1.push(top.closedProblems[k]+top.openProblems[k]);
			labels1.push(k);
		}
		
		
		for (var k in data1) {
			data.push({"value":data1[k], "name":labels1[k]});
		}
		
		data.sort(function(a,b){return b.value-a.value});
		
		if (data.length>7) {
			for (var k = 0; k<7; k++) {
				dataConcat.push(data[k].value);
				labelsConcat.push(data[k].name);
			}
			for (var k = 7; k<(data.length); k++) {
					others += data[k].value;
			}
		}
		
		data=[];
		
		for (var k in dataConcat) {
			data.push({"value":dataConcat[k], "name":labelsConcat[k]});
		}
		
		data.push({"value":others, "name":"Other"});

		data.sort(function(a,b){return b.value-a.value});
		
		var container = d3.select("#piechart");
				
		var width = $("#piechart").width();
		var height = $("#piechart").height();
		var radius = $("#piechart").height() / 3;
		var textOffset = 14;

		var color = d3.scale.category20c();

		var svg = container.append("svg:svg")
			.attr("width", width)
			.attr("height", height);

		var pie = d3.layout.pie().value(function(d) {
			return d.value;
		});

		var arc = d3.svg.arc()
			.outerRadius(function(d) { return radius; });

		var arc_group = svg.append("svg:g")
			.attr("class", "arc")
			.attr("transform", "translate(" + (width/2) + "," + (height/2) + ")");

		var label_group = svg.append("svg:g")
			.attr("class", "arc")
			.attr("transform", "translate(" + (width/2) + "," + (height/2) + ")");

		var pieData = pie(data);

		var paths = arc_group.selectAll("path")
			.data(pieData)
			.enter()
			.append("svg:path")
			.attr("stroke", "white")
			.attr("stroke-width", 0.5)
			.attr("fill", function(d, i) { return color(i); })
			.attr("d", function(d) {
				return arc({startAngle: d.startAngle, endAngle: d.endAngle});
			});
			
		var labelList = [];

		var labels = label_group.selectAll("path")
			.data(pieData)
			.enter()
			.append("svg:text")
			.attr("transform", function(d) {
				return "translate(" + Math.cos(((d.startAngle + d.endAngle - Math.PI) / 2)) * (radius + textOffset) + "," + Math.sin((d.startAngle + d.endAngle - Math.PI) / 2) * (radius + textOffset) + ")";
			})
			.attr("text-anchor", function(d){
				if ((d.startAngle  +d.endAngle) / 2 < Math.PI) {
					return "beginning";
				} else {
					return "end";
				}
			})
			.text(function(d) {
				labelList.push(d.data.name);
				return d.data.value;
			});
			
			svg.append("text")
			.text("Types of Requests in the Past 30 Days")
			.attr("text-anchor", "middle")
			.attr("x", (width / 2))
			.attr("y", "1em")
			.attr("font-family", "sans-serif")
			.attr("font-size", "1.5em");

		var prev;
		labels.each(function(d, i) {
			if(i > 0) {
				var thisbb = this.getBoundingClientRect(),
					prevbb = prev.getBoundingClientRect();
				// move if they overlap
				if(!(thisbb.right < prevbb.left || 
						thisbb.left > prevbb.right || 
						thisbb.bottom < prevbb.top || 
						thisbb.top > prevbb.bottom)) {
					var ctx = thisbb.left + (thisbb.right - thisbb.left)/2,
						cty = thisbb.top + (thisbb.bottom - thisbb.top)/2,
						cpx = prevbb.left + (prevbb.right - prevbb.left)/2,
						cpy = prevbb.top + (prevbb.bottom - prevbb.top)/2,
						off = Math.sqrt(Math.pow(ctx - cpx, 2) + Math.pow(cty - cpy, 2))/2;
					d3.select(this).attr("transform",
						"translate(" + Math.cos(((d.startAngle + d.endAngle - Math.PI) / 2)) * (radius + textOffset + off) + "," + Math.sin((d.startAngle + d.endAngle - Math.PI) / 2) * (radius + textOffset + off) + ")");
				}
			}
			prev = this;
		});
		
		var legend = svg.append("svg")
			.attr("class", "legend")
			.attr("width", radius * 2.5)
			.attr("height", radius * 2)
			.selectAll("g")
				.data(color.domain().slice().reverse())
				.enter().append("g")
					.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

		legend.append("rect")
			.attr("width", 18)
			.attr("height", 18)
			.style("fill", color);

		legend.append("text")
			.attr("x", 24)
			.attr("y", 9)
			.attr("dy", ".35em")
			.text(function(d) { return labelList[d]; });
	
	}
	
/* MMMMM -- Average Time Tab */
	this.averageTimeTab = function() {
		document.getElementById("BodyContainer").innerHTML = "<div id='chart'>";
		
		var k = 0;
		var average = 0;
		var _MS_PER_DAY = 1000 * 60 * 60 * 24;
		function timeDiff(a, b) {
		  // Discard the time and time-zone information.
		  var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
		  var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

		  return (utc2 - utc1) / _MS_PER_DAY;
		}
		
		for (k=0; k<top.closedProblemsTime.length; k++) {
			average+= timeDiff(new Date(top.closedProblemsTime[k].RecordedDate), new Date(top.closedProblemsTime[k].StatusDate));
		}
		
		average = average / k;
		
		(function(dialMaker) {

			var w = $("#chart").width(),
			h = $("#chart").height();

			var layout = [ 
				{ x: w/2, y: h/2, r: h/3, m: 30, ticks: 4, mark: 'line' }
			];
			var chart = layout.map(function(d) { 
				return NBXDialChart()
					.width(d.r * 2)
					.height(d.r * 2)
					.domain([0, d.m])
					.range([-150, 150])
					.minorTicks(d.ticks)
					.minorMark(d.mark);
			});      
		  
			var svg = d3.select(dialMaker)
				.append('svg:svg')
				.attr('width', w) 
				.attr('height', h);
				
			svg.append("text")
			.text("Average Open Request Time (Days)")
			.attr("text-anchor", "middle")
			.attr("x", (w / 2))
			.attr("y", "1em")
			.attr("font-family", "sans-serif")
			.attr("font-size", "1.5em");
		  
			var dial = svg.selectAll('g.dial')
				.data(layout)
				.enter().append('svg:g')
					.attr('class', 'dial')
					.attr('id', function(d, i) { return 'dial-' + i; })
					.attr('transform', function(d) { return 'translate(' + (d.x - d.r) + ',' + (d.y - d.r) + ')'; } );

			dial.each(function(d, i) { d3.select(this).data([average]).call(chart[i]); });

		})('#chart');
		
		$(".label").show();
	
	}
	
/* HHHHH -- Initial Setup */
	top.openProblems = {};
	top.closedProblems = {};
	top.closedProblemsTime = [];
	
	$.get($('#RESTAPI').html() + '/Requests.svc/$count?statusflag=closed&statusdays=30', function(data) {
		top.closed30=data;
		}).done(function() {
			$.get($('#RESTAPI').html() + '/Requests.svc/$count?statusflag=open&statusdays=30', function(data) {
				top.open30=data;
			}).done(function() {
				$.get($('#RESTAPI').html() + '/Requests.svc/$count?statusflag=closed&statusdays=365', function(data) {
					top.closed365=data;
				}).done(function() {
					$.get($('#RESTAPI').html() + '/Requests.svc/$count?statusflag=open&statusdays=365', function(data) {
						top.open365=data;
					}).done(function() {
						top.numberLoaded = 4;
						$('#loadingmask').fadeOut(500, function(){ $(this).remove(); }); // Ready to go
						top.redrawGraphs();
						$.getJSON($('#RESTAPI').html()+'/Requests.svc/?format=json&coordsys=mercator&statusflag=open&take=999', function(data) {
							top.open999 = data;
								$.each(data, function(id, rec) {
									if (typeof top.openProblems[rec.ProblemType] == 'undefined') {
										if ((rec.ProblemType != "")||(rec.ProblemType == "Undefined"))
											top.openProblems[rec.ProblemType] = 0;
									}
									if ((rec.ProblemType != "")||(rec.ProblemType == "Undefined"))
										top.openProblems[rec.ProblemType] = top.openProblems[rec.ProblemType] + 1;
									else {
										if (typeof top.openProblems.Unspecified == 'undefined')
											top.openProblems.Unspecified = 0;
										top.openProblems.Unspecified = top.openProblems.Unspecified + 1;
										}
								});
						}).done(function() {
							top.numberLoaded = 5;
							$.getJSON($('#RESTAPI').html()+'/Requests.svc/?format=json&coordsys=mercator&statusflag=closed&take=999', function(data) {
								top.closed999 = data;
								top.closedProblems = $.extend(true, {}, top.openProblems);
								for (var k in top.closedProblems) {
									top.closedProblems[k] = 0;
								}
								$.each(data, function(id, rec) {
									if (typeof top.closedProblems[rec.ProblemType] == 'undefined') {
										if ((rec.ProblemType != "")||(rec.ProblemType == "Undefined")) {
											top.closedProblems[rec.ProblemType] = 0;
											top.openProblems[rec.ProblemType] = 0; // If this data didn't exist in the open problems, make it 0
										}
									}
									if ((rec.ProblemType != "")||(rec.ProblemType == "Undefined"))
										top.closedProblems[rec.ProblemType] = top.closedProblems[rec.ProblemType] + 1;
									else {
										if (typeof top.closedProblems.Unspecified == 'undefined') {
											top.closedProblems.Unspecified = 0;
											top.openProblems.Unspecified = 0; // If this data didn't exist in the open problems, make it 0
										}
										top.closedProblems.Unspecified = top.closedProblems.Unspecified + 1;
									}
							
									top.closedProblemsTime.push({"StatusDate":rec.StatusDate, "RecordedDate":rec.RecordedDate});	
								});
							}).done(function() {
								top.numberLoaded = 6;
								$('#loadingmask2').fadeOut(500, function(){ $(this).remove(); });
								top.redrawGraphs();
								// Totally Done
							})
						})
					})
				})
			})
		});

});