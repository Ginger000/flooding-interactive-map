// console.log(GEO_VARIABLES);
var info
var legend
// define global variables
var NO_DATA = -9999;
var TRACE = "Percent households of color";
var NUMBER_OF_CLASS = 9;                                      // range: 5 ~ 9
var CLASSIFICATION_METHOD = "Jenks"                        // Equal, Quantile or Jenks
var COLOR_HUE = "Blue";                              // Red, Green or Blue
var COLOR_CLASS = {
	"Red_5"     : ["#fee5d9", "#fcae91", "#fb6a4a", "#de2d26", "#a50f15"],
	"Red_6"     : ["#fee5d9", "#fcbba1", "#fc9272", "#fb6a4a", "#de2d26", "#a50f15"],
	"Red_7"     : ["#fee5d9", "#fcbba1", "#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d", "#99000d"],
	"Red_8"     : ["#fff5f0", "#fee0d2", "#fcbba1", "#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d", "#99000d"],
	"Red_9"     : ["#fff5f0", "#fee0d2", "#fcbba1", "#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d", "#a50f15", "#67000d"],
	"Green_5"   : ["#edf8e9", "#bae4b3", "#74c476", "#31a354", "#006d2c"],
	"Green_6"   : ["#edf8e9", "#c7e9c0", "#a1d99b", "#74c476", "#31a354", "#006d2c"],
	"Green_7"   : ["#edf8e9", "#c7e9c0", "#a1d99b", "#74c476", "#41ab5d", "#238b45", "#005a32"],
	"Green_8"   : ["#f7fcf5", "#e5f5e0", "#c7e9c0", "#a1d99b", "#74c476", "#41ab5d", "#238b45", "#005a32"],
	"Green_9"   : ["#f7fcf5", "#e5f5e0", "#c7e9c0", "#a1d99b", "#74c476", "#41ab5d", "#238b45", "#006d2c", "#00441b"],	
	"Blue_5"    : ["#eff3ff", "#bdd7e7", "#6baed6", "#3182bd", "#08519c"],
	"Blue_6"    : ["#eff3ff", "#c6dbef", "#9ecae1", "#6baed6", "#3182bd", "#08519c"],
	"Blue_7"    : ["#eff3ff", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#2171b5"],
	"Blue_8"    : ["#f7fbff", "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#084594"],
	"Blue_9"    : ["#f7fbff", "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#08519c", "#08306b"],
	//multi-hue
	"Yellow_to_Red_5"    : ["#ffffb2", "#fecc5c", "#fd8d3c", "#f03b20", "#bd0026"],
	"Yellow_to_Red_6"    : ["#ffffb2", "#fed976", "#feb24c", "#fd8d3c", "#f03b20", "#bd0026"],
	"Yellow_to_Red_7"    : ["#ffffb2", "#fed976", "#feb24c", "#fd8d3c", "#fc4e2a", "#e31a1c", "#b10026"],
	"Yellow_to_Red_8"    : ["#ffffcc" ,"#ffeda0", "#fed976", "#feb24c", "#fd8d3c", "#fc4e2a", "#e31a1c", "#b10026"],
   	"Yellow_to_Red_9"    : ["#ffffcc" ,"#ffeda0", "#fed976", "#feb24c", "#fd8d3c", "#fc4e2a", "#e31a1c", "#bd0026", "#800026"],	
};
// end of global variables

var assembledGeoJSON
var intervals
var colors
var map

function trace_selected() {
	var e = document.getElementById("traceSelect");
	var trace = e.options[e.selectedIndex].value;
	console.log(map, TRACE, assembledGeoJSON, intervals, colors)
	TRACE = trace
	var intervals = classification(CLASSIFICATION_METHOD, NUMBER_OF_CLASS, assembledGeoJSON, TRACE)
	draw_choroplethMap(map, TRACE, assembledGeoJSON, intervals, colors);
}


/**
 * entry point of this javascript
 * it's defined by <body> tag like this: <body onload="entryPoint()">
 */
function entryPoint() {

	console.log(TRACE);
	
	 assembledGeoJSON = assembleGeoJSON(GEO_JSON, GEO_VARIABLES);
	//console.log("assembledGeoJSON:", assembledGeoJSON)
	
	 intervals = classification(CLASSIFICATION_METHOD, NUMBER_OF_CLASS, assembledGeoJSON, TRACE)
	//console.log("intervals("+CLASSIFICATION_METHOD+"):", intervals)
	
	 colors = COLOR_CLASS[COLOR_HUE + "_" + NUMBER_OF_CLASS]
	//console.log("colors:", colors)
	
	 map = draw_baseMap()
	
	draw_choroplethMap(map, TRACE, assembledGeoJSON, intervals, colors);
	
}


/**
 * join geoJSON and geoVariables by geoid and assemble GeoJSON and return it
 * geoJSON: GeoJSON format with properties of geoid and geometry data
 * geoVariables: CSV format first column of each row must be geoid
 */
function assembleGeoJSON(geoJSON, geoVariables) {
	
	var geoFeatures = {}                                             // key: geoid,  value: {geometry, properties}
	geoJSON.features.forEach(function(row, i) {
		geoFeatures[row.properties.zip] = {"geometry": row.geometry, "properties": row.properties}
		// console.log(geoFeatures[row.properties.zip]);
	});
	
	var title = geoVariables[0];                                     // save 1st row to a title
	var resultGeoJSON = {"type":"FeatureCollection", "features":[]}
	geoVariables.forEach(function(row, i) {
		if (i == 0) return;                                          // skip the title's row
		var zip = row[0];
		// console.log(geoFeatures.hasOwnProperty(zip));
		if (!geoFeatures.hasOwnProperty(zip)) return;              // skip if no geometry data in the geoJSON
		var geoFeature = geoFeatures[zip];
		var feature = {"type": "Feature", "geometry": geoFeature.geometry, "properties": geoFeature.properties};
		for (var c=1; c<title.length; c++) 
			feature.properties[title[c]] = row[c];
			// console.log(feature);
		resultGeoJSON.features.push(feature);
		
	});
	// console.log(resultGeoJSON);
	return resultGeoJSON;
}


/**
 * get intervals from classification
 * method : "Equal", "Quantile" or "Jenks"
 * nClass : number of class for classification.
 * geoJSON: GeoJSON format with properties and geometry data
 * item   : selected variable == TRACE.
 */
function classification(method, nClass, geoJSON, item) {
	
	var values = [];
	geoJSON.features.forEach(function(feature, i) {                  // skip if NO_DATA
		if (feature.properties[item] != NO_DATA) values.push(feature.properties[item]);
	});
	
	var serie = new geostats();
	serie.setSerie(values);
	var intervals = [];
	if (method == 'Equal')      intervals = serie.getClassEqInterval(nClass);
	if (method == 'Quantile')   intervals = serie.getClassQuantile(nClass);
	if (method == 'Jenks')      intervals = serie.getClassJenks(nClass);
	
	return intervals;
}


/**
 * draw a base map
 * mDIV: id of <div> tag where to draw the map
 * return leaflet object of map
 */
function draw_baseMap(mDIV="map") {
	
	var mapdiv = document.getElementById(mDIV).getElementsByClassName("map")[0];
	
	var mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
	var grayscale   = L.tileLayer(mbUrl, {id: 'mapbox/light-v9', tileSize: 512, zoomOffset: -1}),
		streets  = L.tileLayer(mbUrl, {id: 'mapbox/streets-v11', tileSize: 512, zoomOffset: -1});
	
	var mapCenter = [37.09024, -95.712891];
	var mapZoomLevel = 6;
	var map = L.map(mapdiv, {
		center: mapCenter,
		zoom: mapZoomLevel,
		layers: [grayscale]
	});
	
	// map.scrollWheelZoom.disable();

    // var baseLayers = {
    //     "Grayscale": grayscale,
    //     "Streets": streets
    // };
	
    // L.control.layers(baseLayers).addTo(map);

	return map;	
}


/**
 * draw a choropleth map
 * map      : leaflet object of map
 * item     : selected variable == TRACE.  
 * intervals: intervals by number of class that result of classification
 * colors   : color hue
 */
function draw_choroplethMap(map, item, assembledGeoJSON, intervals, colors) {
	
	// control that shows state info on hover
	if (info != null) info.remove();
	info = L.control();
	info.onAdd = function(map) {
		this._div = L.DomUtil.create('div', 'info');
		this.update();
		return this._div;
	};
	info.update = function (props) {
		this._div.innerHTML = '<h4>' + item + '</h4>' +  (props ?
			props.zip + ' :&nbsp; &nbsp;' + ((props[item] == NO_DATA) ? "no data" : '<b>' + props[item] + '</b>')
			: 'Hover over an area');
	};
	info.addTo(map);
	
	// get getOpacity
	function getOpacity(feature) {
		return 0.9;
	}
	
	// get color depending on selected variable's value
	function getColor(d) {
		if (d == NO_DATA) {
			return "#5E5E5E";
		}
		for (var i=colors.length-1; i>=0; i--) {
			if (d >= intervals[i]) {
				return colors[i];
			}
		}
	}
	
	function style(feature) {
		return {
			weight: 0.3,
			opacity: 1,
			color: 'white',
			dashArray: '1',
			fillOpacity: getOpacity(feature),
			fillColor: getColor(feature.properties[item])
		};
	}
	
	function highlightFeature(e) {
		var layer = e.target;
		layer.setStyle({
			weight: 3,
			color: '#00ffff',
			dashArray: '',
			fillOpacity: 0.9
		});
		if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
			layer.bringToFront();
		}
		info.update(layer.feature.properties);
	}
	
	function resetHighlight(e) {
		geojson.resetStyle(e.target);
		info.update();
	}

	function zoomToFeature(e) {
		map.fitBounds(e.target.getBounds());
	}
	
	function onEachFeature(feature, layer) {
		layer.on({
			mouseover: highlightFeature,
			mouseout: resetHighlight,
			click: zoomToFeature
		});
	}
	
	var geojson = L.geoJson(assembledGeoJSON, {
		style: style,
		onEachFeature: onEachFeature
	}).addTo(map);
	map.fitBounds(geojson.getBounds());                              // fit bounds from geojson object

	if (legend != null) legend.remove();	
	legend = L.control({position: 'bottomright'});
	legend.onAdd = function (map) {
		var div = L.DomUtil.create('div', 'info legend');
		var labels = [];
		for (var i=0; i<colors.length; i++)
			labels.push('<i style="background:' + colors[i] + '"></i>&nbsp; &nbsp;' + intervals[i].toFixed(2));
		labels.push('<i style="background:' + getColor(NO_DATA) + '"></i>&nbsp; ' + 'no data'+ '<br>');
		div.innerHTML = labels.join('<br>');
		return div;
	};
	legend.addTo(map);
}
