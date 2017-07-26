var map;
require([ // We need these in order for the script to work
	"dojo/parser",
	"dojo/ready",
	"dojo/_base/array",
	"esri/Color",
	"dojo/dom-style",
	"dojo/query",
	"dojo/number",
	"dojo/dom",
	"dijit/registry",

	"esri/map",
	"esri/request",
	"esri/graphic",
	"esri/geometry/Extent",
	"esri/dijit/BasemapToggle",
	"esri/tasks/locator",
	"esri/symbols/Font",
	"esri/symbols/TextSymbol",

	"esri/symbols/SimpleMarkerSymbol",
	"esri/symbols/SimpleFillSymbol",
	"esri/symbols/PictureMarkerSymbol",
	"esri/renderers/ClassBreaksRenderer",

	"esri/layers/GraphicsLayer",
	"esri/SpatialReference",
	"esri/dijit/PopupTemplate",
	"esri/geometry/Point",
	"esri/geometry/webMercatorUtils",

	"extras/ClusterLayer",

	"dijit/layout/BorderContainer",
	"dijit/layout/ContentPane",
	"dojo/domReady!"
], function (
	parser, ready, arrayUtils, Color, domStyle, query, number, dom, registry,
	Map, esriRequest, Graphic, Extent, BasemapToggle, Locator, Font, TextSymbol,
	SimpleMarkerSymbol, SimpleFillSymbol, PictureMarkerSymbol, ClassBreaksRenderer,
	GraphicsLayer, SpatialReference, PopupTemplate, Point, webMercatorUtils,
	ClusterLayer
   ) {
	ready(function () {
		$("#days").addClass("form-control");
		$("label").addClass("control-label");

		var top = this; // Keep tabs on the topmost level

		this.totalRed;
		this.totalGreen;

		function getLocation() { // If possible, get the users location
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(showPosition, noLocation, geoOptions);
			}
			else
				readyfunc();
		};

		function showPosition(position) { // Set user coordinates & continue
			var crd = position.coords;
			top.UserYCoordinate = crd.latitude;
			top.UserXCoordinate = crd.longitude;
			readyfunc();
		};

		function noLocation(err) { // It's ok, it will work anyway
			readyfunc();
		}

		var geoOptions = { // We want to be as accurate as possible. But nobody is going to wait more than 10 seconds for this. The app already takes a long time to launch
			enableHighAccuracy: true,
			timeout: 10000
		};

		getLocation();


		function readyfunc() { // The main function
			thisready = this;	// Keep tabs on this level

			this.jsonData1;
			this.jsonData2;
			parser.parse();
			this.clusterLayerRed;
			this.clusterLayerGreen;
			this.addedLayers = 0;
			var popupOptions = {
				"markerSymbol": new SimpleMarkerSymbol("circle", 20, null, new Color([0, 0, 0, 0.25])),
				"marginLeft": "20",
				"marginTop": "20"
			};
			if (!(typeof top.UserXCoordinate === 'undefined')) { // If we have the user's location
				map = new Map("map", {
					center: [top.UserXCoordinate, top.UserYCoordinate],
					zoom: 15,
					basemap: "streets",
					slider: false,
					logo: false
				});
			}
			else {
				map = new Map("map", { // If we don't
						center: [-94.664, 38.937], // These are standard lat & long coordinates. Order goes: [Longitude, Latitude]
					zoom: 15, // Base zoom level, can be changed
					basemap: "streets",
					slider: false,
					logo: false
				});
			}

			map.on("load", function () { // Once the map is loaded
				createSlider();
				$('#loadingmask').delay(100).fadeOut(500, function () { $(this).remove(); });
				// Hide the popup's ZoomTo link as it doesn't make sense for cluster features
				domStyle.set(query("a.action.zoomTo")[0], "display", "none");

				$.getJSON($('#RESTAPI').html() + '/Requests.svc/?format=json&coordsys=mercator&statusflag=open&take=500', function (data) { // Get the 500 most recent open requests
					thisready.jsonData1 = data;
				}).always(function () {
					$.getJSON($('#RESTAPI').html() + '/Requests.svc/?format=json&coordsys=mercator&statusflag=closed&statusdays=30&take=250', function (data) { // Get the 250 most recent closed requests
						thisready.jsonData2 = data;
					}).always(function () {  // Once we have the data

						// We need to get the latitude and longitude of requests that don't have that information readily available. This NEEDS to be handled asynchronously if we want it to be done in any reasonable amount of time
						// This makes the following code a little cryptic 
						process = function (dat, col) {
							var jsonDataCount = dat.length; // Used to confirm when all asyncs have come back
							var dataCounter = 0; // Used in conjunction with jsonData1Count
							var thisAdded = false; // If this cluster layer has been added yet or not. We only want to add this layer once
							$.each(dat, function () { // We need to check each returned piece of data to see if it has coordinates already
								p = this; // The data we're working with
								locator = new Locator("https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer"); // Get the locator ready
								function locate(rec) { // Get ready to locate

									// Build the address as best as possible
									rec.address = {
										"SingleLine": createAddressString(rec)
									};
									locator.outSpatialReference = map.spatialReference;
									var options = {
										address: rec.address,
										outFields: ["*"]
									}
									locator.addressToLocations(options, function (evt) {
										dataCounter++;
										arrayUtils.every(evt, function (candidate) {
											if (candidate.score > 80) { // If it is a likely candidate
												rec.XCoordinate = candidate.location.x; // Set the X coordinate for the proper request
												rec.YCoordinate = candidate.location.y; // Set the Y coordinate for the proper request

												if ((dataCounter == jsonDataCount) && (thisAdded == false)) { // Once all of the coordinates have been mapped
													thisAdded = true;
													addClusters(dat, col); // Add the data points, since these requests are still open, we're using the color red to indicate they're 'bad'
												}
												return false; // We found the best candidate, let's get out of here (If we don't, multiple points may be added for each individual request. We only want one point to show up per request)
											}
											if ((dataCounter == jsonDataCount) && (thisAdded == false)) { // If the last datapoint didn't end in the high candidate score area
												thisAdded = true;
												addClusters(dat, col);
											}
										});
										if ((dataCounter == jsonDataCount) && (thisAdded == false)) { // If the last datapoint didn't end in the above at all
											thisAdded = true;
											addClusters(dat, col);
										}
									}); // Get the options
								}

								if (p.XCoordinate == null || p.YCoordinate == null) {
									locate(p);
								}
								else {
									jsonDataCount--;
								}

								console.log(p);
							});

							if (jsonDataCount === 0) {// Still need to 'add clusters', even if there are no clusters to add or if there are only xys
								addClusters(dat, col);
							}

						}

						process(jsonData1, "Red");
						process(jsonData2, "Green");
					});
				});
			});

			function createAddressString(p) {
				var addressBuilder = {};
				addressBuilder.BuildingNumber = "";
				addressBuilder.Street = "";
				addressBuilder.Street2 = "";
				addressBuilder.LocationCity = "";
				addressBuilder.LocationState = "";
				addressBuilder.LocationZipCode = "";
				if ((p.BuildingNumber != null) && (p.BuildingNumber != "")) // We only want to add the spaces and symbols if there is something provided
					addressBuilder.BuildingNumber = p.BuildingNumber + " ";
				if ((p.Street != null) && (p.Street != ""))
					addressBuilder.Street = p.Street + " ";
				if ((p.Street2 != null) && (p.Street2 != ""))
					addressBuilder.Street2 = "& " + p.Street2 + " ";
				if ((p.LocationCity != null) && (p.LocationCity != ""))
					addressBuilder.LocationCity = p.LocationCity + " ";
				if ((p.LocationState != null) && (p.LocationState != ""))
					addressBuilder.LocationState = p.LocationState + " ";
				if ((p.LocationZipCode != null) && (p.LocationZipCode != ""))
					addressBuilder.LocationZipCode = p.LocationZipCode;
				return addressBuilder.BuildingNumber + addressBuilder.Street + addressBuilder.Street2 + " Overland Park, KS"//this.LocationZipCode 
			}

			function addClusters(resp, col) { // Add the cluster layers. The data is resp, the color we want to use is col
				var openRequestInfo = {};
				var wgs = new SpatialReference({ "wkid": 3857 }); // The spacial reference we're using. This number is web mercator 
				openRequestInfo.data = arrayUtils.map(resp, function (p) {
					if (p.XCoordinate != null) { // If we have coordinates
						var latlng = new Point(p.XCoordinate, p.YCoordinate, wgs);
						var date = new Date(p.StatusDate.replace("00:00:00", "12:00:00"));
						if (typeof Date.prototype.toISOString == "function")
							date = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear(); // Format the date string
						else
							date = p.StatusDate;
						var attributes = { // What our popup box will say
							"ProblemType": p.ProblemType,
							"StatusType": p.StatusType,
							"StatusDate": date
						};
						return { // The cluster point we'll be returning
							"x": latlng.x,
							"y": latlng.y,
							"attributes": attributes
						};
					}
					else { // If we don't have the coordinates, we don't want the info on the map
						return {
							"x": 99999999999999,
							"y": 99999999999999,
							"attributes": ""
						};
					}
				});

				// popupTemplate to work with attributes specific to this dataset
				var popupTemplate = PopupTemplate({
					"title": "Open Request",
					"fieldInfos": [{
						"fieldName": "ProblemType",
						"label": "Problem: ",
						visible: true
					},
						{
							"fieldName": "StatusType",
							"label": "Status: ",
							visible: true
						},
						{
							"fieldName": "StatusDate",
							"label": "Status Date: ",
							visible: true
						}
					]
				});
				thisColor = function (c) { // Simple function to pick red or green
					if (c == "Red")
						return new Color("#FF0000");
					else if (c == "Green")
						return new Color("#00FF00");
					else { // If not red or green, we want it to be invisible
						var color = new Color("#FFFFFF");
						color.a = 0;
						return color;
					}
				}
				// Cluster layer that uses OpenLayers style clustering
				var labelCol = "#fff";
				if ((col == "Open") || (col == "Closed")) // Invisible labels
					labelCol = [0, 0, 0, 0];
				thisready["clusterLayer" + col] = new ClusterLayer({
					"data": openRequestInfo.data,
					"distance": 100,
					"id": col + "clusters",  // Each layer needs a unique ID
					"labelColor": labelCol,
					"labelOffset": 10,
					"resolution": map.extent.getWidth() / map.width,
					"singleSymbol": new SimpleMarkerSymbol("circle", 6, null, thisColor(col)),
					"singleTemplate": popupTemplate
				});
				var defaultSym = new SimpleMarkerSymbol().setSize(4);
				var renderer = new ClassBreaksRenderer(defaultSym, "clusterCount");
				var picBaseUrl = "https://static.arcgis.com/images/Symbols/Shapes/"; // Get ready for image declaration
				if ((col == "Red") || (col == "Green")) {
					var small = new PictureMarkerSymbol(picBaseUrl + col + "Pin1LargeB.png", 32, 32).setOffset(0, 15); // We'll pick the color of pins based off of the color passed in
					var medium = new PictureMarkerSymbol(picBaseUrl + col + "Pin1LargeB.png", 64, 64).setOffset(0, 15);
					var large = new PictureMarkerSymbol(picBaseUrl + col + "Pin1LargeB.png", 72, 72).setOffset(0, 15);
				}
				else {
					var small = new PictureMarkerSymbol("images/clear.png", 32, 32).setOffset(0, 15); // Invisible icons
					var medium = new PictureMarkerSymbol("images/clear.png", 64, 64).setOffset(0, 15);
					var large = new PictureMarkerSymbol("images/clear.png", 72, 72).setOffset(0, 15);
				}
				renderer.addBreak(0, 2, small); // We'll use the small pictures for only a few requests
				renderer.addBreak(2, 200, medium); // Bump up to medium
				renderer.addBreak(200, 1001, large); // Bump up to large
				thisready["clusterLayer" + col].setRenderer(renderer); // Render!

				map.addLayer(thisready["clusterLayer" + col]); // Add the layer
				thisready.addedLayers++; // Let's keep track of how many layers are added
				if (thisready.addedLayers == 2) // If all layers have been added
					$('#loadingindicator').delay(100).fadeOut(500, function () { $(this).remove(); }); // When all layers have been added, we'll remove the loading mask. This way once the map is up, it's up, no more points will pop up over time
				// Close the info window when the map is clicked
				map.on("click", cleanUp);
				// Close the info window when esc is pressed
				map.on("key-down", function (e) {
					if (e.keyCode === 27) {
						cleanUp();
					}
				});
			}

			function cleanUp() { // We don't want this stuff here when we call cleanUp
				map.infoWindow.hide(); // Put away the info window
				thisready.clusterLayerRed.clearSingles(); // Hide the singles
				thisready.clusterLayerGreen.clearSingles(); // For both layers
			}

			function error(err) { // This shouldn't happen
				console.log("something failed: ", err); // Prepare yourself for some extreme error messages
			}

			// onorientationchange doesn't always fire in a timely manner in Android so check for both orientationchange and resize
			var supportsOrientationChange = "onorientationchange" in window, orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";

			window.addEventListener(orientationEvent, function () {
				orientationChanged();
			}, false);

			function orientationChanged() { // Resize the map on orientation change
				resizeMap();
			}

			window.onresize = function (event) { // Resize the map on window resize
				resizeMap();
			}

			var resizeMap = function () { // We want this map to be huge
				if (map) {
					$("#MapWrapper").css("width", $(window).width);
					$("#MapWrapper").css("height", $(window).height);
					$("#map").css("width", $(window).width);
					$("#map").css("height", $(window).height);

					map.reposition();
					map.resize();
				}
			}

			var toggle = new BasemapToggle({ // Swap between street and satellite views
				map: map,
				basemap: "satellite"
			}, "BasemapToggle");

			toggle.startup();

			function createSlider() { // We want a cool custom slider
				$("#Slider").slider({
					min: 0,
					max: map.getLayer(map.layerIds[0]).tileInfo.lods.length - 1,
					value: map.getLevel(),
					orientation: "vertical",
					range: "min",
					change: function (event, ui) {
						map.setLevel(ui.value);
					}
				});

				map.on("zoom-end", function () { // Adjust zoom level on slider when done zooming. Also clean up the map
					$("#Slider").slider("value", map.getLevel());
					if (thisready.addedLayers == 2)
						cleanUp();
				});

				map.on("update-end", function () { // Keeps track of how many open and closed requests are currently visible
					if (thisready.addedLayers == 2)
						redrawGraphs();
				});

				map.on("layer-add-result", function () { // Keeps track of how many open and closed requests are currently visible
					if (thisready.addedLayers == 1) {
						setTimeout(redrawGraphs, 200); // Small delay is necessary
					}
				});

				function redrawGraphs() {
					top.totalRed = 0;

					$.each($("#Redclusters_layer image"), function () {
						top.totalRed++;

					});
					$.each($("#Redclusters_layer text"), function () {
						var el = $(this);
						top.totalRed += Number(el.text());
						top.totalRed--;

					});

					top.totalGreen = 0;

					$.each($("#Greenclusters_layer image"), function () {
						top.totalGreen++;

					});
					$.each($("#Greenclusters_layer text"), function () {
						var el = $(this);
						top.totalGreen += Number(el.text());
						top.totalGreen--;

					});
					refreshGraphs(top.totalRed, top.totalGreen);
				}

				refreshGraphs = function (tr, tg) {
					document.getElementById('GraphBody').innerHTML = '<div class="chart"></div>'; // Reset the graph area
					var data = [tr, tg];
					var x = d3.scale.linear()
						.domain([0, d3.max(data)])
						.range([0, 210]);

					var graphLabels = d3.select(".chart")
					  .selectAll("div")
						.data(data)
					  .enter().append("div")
						.style("width", function (d) { return x(d) + "px"; })
						.text(function (d) { return d; });

					String.prototype.width = function () {
						var o = $('<div>' + this + '</div>')
							.css({ 'position': 'absolute', 'float': 'left', 'white-space': 'nowrap', 'visibility': 'hidden' })
							.appendTo($('body'));
						var w = o.width();

						o.remove();

						return w;
					}

					if (graphLabels[0][0].offsetWidth < graphLabels[0][0].innerHTML.width() + 2) {
						graphLabels[0][0].innerHTML = "<span style='color: black; margin-left: " + graphLabels[0][0].offsetWidth + "px'>" + graphLabels[0][0].innerHTML + "</span>";
					}
					if (graphLabels[0][1].offsetWidth < graphLabels[0][1].innerHTML.width() + 2) {
						graphLabels[0][1].innerHTML = "<span style='color: black; margin-left: " + graphLabels[0][1].offsetWidth + "px'>" + graphLabels[0][1].innerHTML + "</span>";
					}

				}
			}
		}
	});
});
