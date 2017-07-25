var mapFunc;

var getLocation = function() {
	if (navigator.geolocation) 
		navigator.geolocation.getCurrentPosition(showPosition, noLocation, geoOptions);
};

function showPosition(position) {
	var crd = position.coords;
	top.UserYCoordinate = crd.latitude;
	top.UserXCoordinate = crd.longitude;
	mapper();
	$('#loadingmask').delay(1100).fadeOut(500, function(){ $(this).remove(); }); // Remove loadingmask after map is created
};
	
function noLocation(err) {
	mapper();
	$('#loadingmask').delay(1100).fadeOut(500, function(){ $(this).remove(); }); // Remove loadingmask after map is created
}

var geoOptions = {
  enableHighAccuracy: true, 
  timeout           : 10000
};

function customSlideToggle(e) { // If the map actually gets 'display: none' it will break. This simulates it without actually doing it
	var show = e.hasClass('map-hidden');
	if (show) {
		e.hide();
		e.removeClass('map-hidden');
		e.addClass('map-show');
		e.slideDown('slow');
   }
   else {
		e.slideUp('slow', function() {
			e.css("display", "block");
			e.removeClass('map-show');
			e.addClass('map-hidden');
		});
   }
};

function mapper() {
	var map;
	require([
	"esri/config",
	"esri/graphic",
	"esri/lang",
	"esri/map",
	"esri/geometry/Point",
	"esri/dijit/BasemapToggle",
	"esri/geometry/webMercatorUtils",
	"esri/symbols/SimpleFillSymbol",
	"esri/symbols/SimpleLineSymbol",
	"esri/symbols/SimpleMarkerSymbol",
	"dojo/dom",
	"dojo/on",
	"esri/Color",
	"dojo/domReady!"
	],
	function (
	  esriConfig, Graphic, lang, Map, Point, BasemapToggle, webMercatorUtils, SimpleFillSymbol,
	  SimpleLineSymbol, SimpleMarkerSymbol, dom, on, Color) {

		var zoomSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
			new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
				new Color([20, 156, 255]), 1), new Color([141, 185, 219, 0.3]));
			  
		var graphic;
		
		var markerSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_X,
			12, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
				new Color([92, 156, 255, 1]), 4));

		esriConfig.defaults.map.zoomSymbol = zoomSymbol.toJson();
		if (!(typeof top.UserXCoordinate === 'undefined')) {
			map = new Map("map", {
				center: [top.UserXCoordinate, top.UserYCoordinate],
				zoom: 15,
				basemap: "streets",
				slider: false,
				logo: false
			});
		}
		else {
			map = new Map("map", {
				center: [-88.279, 42.675],
				zoom: 15,
				basemap: "streets",
				slider: false,
				logo: false
			});
		}

		map.on("load", function () {
			$(document).ready(jQueryReady);
		});

		function jQueryReady () {
		  
			mapFunc = this;
			
			// onorientationchange doesn't always fire in a timely manner in Android so check for both orientationchange and resize
			var supportsOrientationChange = "onorientationchange" in window, orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";

			window.addEventListener(orientationEvent, function () {
				orientationChanged();
			}, false);
			
			function orientationChanged() {
				mapFunc.resizeMap();
			}
			  
			window.onresize = function(event) {
				mapFunc.resizeMap();
			}

			this.resizeMap = function() {
				if (map) {
					if ($(window).width() > 991) {
						$("#MapWrapper").css("width", 700);
						$("#MapWrapper").css("height", 500);
						$("#map").css("width", 700);
						$("#map").css("height", 500);
					}
					else if ( /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) { // If it's a touch device, this is how we want to resize. iPad is an exception. Tested to work on iPod, iPad, iPhone, Nexus 7, Samsung Galaxy Tab
						if (("standalone" in window.navigator) && !window.navigator.standalone){ // User has an iOS device and is using Safari
							if (navigator.userAgent.match(/iPod/i)) { // Fix scaling issue in safari
								var viewportmeta = document.querySelector('meta[name="viewport"]');
								if (viewportmeta) {
									viewportmeta.content = 'width=device-width, minimum-scale=1.0, maximum-scale=1.0, initial-scale=1.0';
									document.body.addEventListener('gesturestart', function () {
										viewportmeta.content = 'width=device-width, minimum-scale=0.25, maximum-scale=1.6';
									}, false);
								}
							}
						}
						else if (("standalone" in window.navigator) && !window.navigator.standalone) { // User has an iOS device and is using standalone app
							if ( /iPad/i.test(navigator.userAgent) )
								$(document).scrollTop(0); // Fix issue standalone
						}
						else { // User is not using an iOS device
							// Handle
						}
						if ($("#OpenMap").text() == "Close Map")
							$("#bodyWrapper").css("width", "100%");
						else
							$("#bodyWrapper").css("width", "85%");
						$("#MapWrapper").css("width", $(window).width);
						$("#MapWrapper").css("height", $(window).height);
						$("#map").css("width", $(window).width);
						$("#map").css("height", $(window).height);
					}
					else { // If it's a desktop, this is how we want to resize
						$("#MapWrapper").css("width", screen.width);
						$("#MapWrapper").css("height", screen.height);
						$("#map").css("width", screen.width);
						$("#map").css("height", screen.height);
					}
				
					map.reposition();
					map.resize();
				}
			}
			
			createSlider();
			
			if (!(typeof top.UserXCoordinate === 'undefined')) {
				var pt = esri.geometry.geographicToWebMercator(new Point(top.UserXCoordinate, top.UserYCoordinate))
				graphic = new Graphic(pt, markerSymbol);
				map.graphics.add(graphic);
				top.YCoordinate = Number(lang.substitute(webMercatorUtils.webMercatorToGeographic(pt), "${y}"));
				top.XCoordinate = Number(lang.substitute(webMercatorUtils.webMercatorToGeographic(pt), "${x}"));
			}

			map.on("click", function (event) {
				// Add a graphic at the clicked location
				if (graphic)
					graphic.setGeometry(event.mapPoint);
				else {
					graphic = new Graphic(event.mapPoint, markerSymbol);
					map.graphics.add(graphic);
				}
				top.YCoordinate = Number(lang.substitute(webMercatorUtils.webMercatorToGeographic(event.mapPoint), "${y}"));
				top.XCoordinate = Number(lang.substitute(webMercatorUtils.webMercatorToGeographic(event.mapPoint), "${x}"));
			});
		}
		  
		var toggle = new BasemapToggle({
			map: map,
			basemap: "satellite"
		}, "BasemapToggle");
		
		toggle.startup();

		function createSlider () {
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

			map.on("zoom-end", function () {
				$("#Slider").slider("value", map.getLevel());
			});
		}
		  
		customSlideToggle($("#mapDiv")); //Initially hide the map
	});
};

openMap = function () {
	customSlideToggle($("#mapDiv"));
	if ($("#OpenMap").text() == "Open Map")
		$("#OpenMap").text("Close Map");
	else
		$("#OpenMap").text("Open Map");
	mapFunc.resizeMap(); // Prevents marker error
};

cancelMap = function() {
	customSlideToggle($("#mapDiv"))
	$("#OpenMap").text("Open Map");
	$("#UseCoords").prop('checked',false);
	mapFunc.resizeMap(); // Prevents marker error
};

confirmCoords = function() {
	customSlideToggle($("#mapDiv"))
	$("#OpenMap").text("Open Map");
	$("#UseRequestorsAddress").prop('checked',false);
	if (!(typeof top.XCoordinate === 'undefined')) // We can only use map coordinates if they're defined
		$("#UseCoords").prop('checked',true);
	mapFunc.resizeMap(); // Prevents marker error
};