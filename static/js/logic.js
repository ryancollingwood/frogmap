// Store our API endpoint inside queryUrl
// Found the dataset at https://data.gov.au/dataset/ds-melbournewater-41661bf68b25b2854a62cf34407b16a32851b182eec342e31505e98230beeeb8/details?q=frog%20census
var queryUrl = "https://services5.arcgis.com/ZSYwjtv8RKVhkXIL/arcgis/rest/services/Frog_Location_OpenData/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json";

// Perform a GET request to the query URL
d3.json(queryUrl).then(function(data) {
  console.log("Fetching Data");
  // Call our buildMap function that kicks off all of the things
  buildMap(data.features);
});

function filterData(responseData) {
  console.log("Filtering Frog Data");

  // decided to filter the data down the only the attributes I needed
  var filteredData = responseData.map(function(d){
    return {
      common_name: d.attributes.Common_name,
      date: Date(d.attributes.Date),
      latitude: d.attributes.Latitude,
      longitude: d.attributes.Longitude      
    }
  });

  return filteredData;
}

function createFrogLayer(filteredData) {
  console.log("Creating Frog Layer");

  var markers = L.markerClusterGroup();

  for (var i = 0; i < filteredData.length; i++) {
    var frog = filteredData[i];

    var frogMarker = L.marker([frog.latitude, frog.longitude]);
      
    // bind a pop-up to show the complaint description
    frogMarker.bindPopup(frog.common_name);

    // Add a new marker to the cluster group and bind a pop-up
    markers.addLayer(frogMarker);    
  }

  return markers;
}

function createMap(frogLayer) {
  console.log("Creating Map");

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    "Frog Sightings": frogLayer
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      -37.8136, 144.9631
    ],
    zoom: 5,
    layers: [streetmap, frogLayer]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // load suburb data
  // https://data.gov.au/dataset/ds-dga-af33dd8c-0534-4e18-9245-fc64440f742e/details?q=geojson%20melbourne%20suburbs
  d3.json("./data/suburbs.json").then(function(data) {
    // Creating a GeoJSON layer with the retrieved data
    L.geoJson(data, {
      fillOpacity: 0.0,
      weight: 0.5,
      color: "#00EE00"    
    }).addTo(myMap);
  });

  // load Wetland and Lake Assets
  // https://data.gov.au/dataset/ds-melbournewater-0002367d3b0221dac405011c3b84392123dd14679f7d99e8c8337f9c6af4c049/details?q=geojson
  d3.json("./data/Wetland_and_Lake_Assets.geojson").then(function(data) {
    // Creating a GeoJSON layer with the retrieved data
    L.geoJson(data, {
      fillOpacity: 0.2,
      weight: 1.5      
    }).addTo(myMap);
  });

}

function buildMap(ResponseData) {
  var filteredFrogData = filterData(ResponseData);
  var frogLayer = createFrogLayer(filteredFrogData);
  createMap(frogLayer);
}