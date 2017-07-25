$(document).ready(function(){
// Written & Commented by Sean Stout for Lucity, Inc. (c) 2014. Some scripts provided by 3rd party authors & are copyright to their respective owners
	$(document).scrollTop(0);
	$('#loadingmask').fadeOut(500, function(){ $(this).remove(); });
	$("a").each(function () {
		var el = $(this);
		if (el.attr('id') != "footer") {
			el.addClass("btn btn-primary").after("<br><br>");
			el.width($("span").width());
		}
	});
	$( document ).on("click","a",function( event ){
		if ($(event.target).attr('id') != 'footer') {
			event.preventDefault();
			location.href = $( event.target ).attr( "href" );
		}
	});
	
	var openClosedTab = function() {
	
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
						openClosedTab();
					})
				})
			})
		})
});