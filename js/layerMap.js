var riverSystem = new L.LayerGroup();


var mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
    'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

var grayscale = L.tileLayer(mbUrl, {
        id: 'mapbox/light-v9',
        tileSize: 512,
        zoomOffset: -1,
        attribution: mbAttr
    }),
    streets = L.tileLayer(mbUrl, {
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        attribution: mbAttr
    });

var layerMap = L.map('layerMap', {
    center: [41.8781, -87.6298],
    zoom: 13,
    layers: [grayscale]
});

//Get the river data
//console.log(Chicago_River_data.features[0].geometry.coordinates)
latlngs = [];
for (let i = 0; i < Chicago_River_data.features.length; i++) {
    let feature = Chicago_River_data.features[i];
    latlngs[i] = [];
    for (let j = 0; j < feature.geometry.coordinates[0].length; j++) {
        latlngs[i].push(new L.LatLng(feature.geometry.coordinates[0][j][1], feature.geometry.coordinates[0][j][0]));
    }
}

// console.log(latlngs);

var rivers = new L.Polyline(latlngs, {
    color: 'blue',
    weight: 2,
    smoothFactor: 0
}).addTo(riverSystem);

layerMap.addLayer(rivers);

//Get the TIA 1_10 DATA
tia_1_10_latlngs = [];
for (let i = 0; i < tia_data_1_10.features.length; i++) {
    let feature = tia_data_1_10.features[i];
    tia_1_10_latlngs[i] = [];
    tia_1_10_latlngs[i][0] = []
    for (let j = 0; j < feature.geometry.coordinates[0].length; j++) {
        let latlngObject = new L.LatLng(feature.geometry.coordinates[0][j][1], feature.geometry.coordinates[0][j][0]);
        tia_1_10_latlngs[i][0].push(latlngObject);
    }
}

var imperviousness_1_10 = new L.Polygon(tia_1_10_latlngs[0], {
    color: 'green'
}).addTo(layerMap);

var baseLayers = {
    "Grayscale": grayscale,
    "Streets": streets
};

var overlays = {
    // fill out your code here.	
    "River Systems": riverSystem
};
L.control.layers(baseLayers, overlays).addTo(layerMap);
// L.geoJson(tia_data_1_10).addTo(map);