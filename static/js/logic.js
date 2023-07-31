// Save the API endpoint URL for earthquakes in the past 7 days.
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Function to select marker color based on the earthquake's depth.
function chooseColor(depth) {
  if (depth < 10 && depth > -10) return "lawngreen";
  else if (depth >= 10 && depth < 30) return "greenyellow";
  else if (depth >= 30 && depth < 50) return "yellow";
  else if (depth >= 50 && depth < 70) return "orange";
  else if (depth >= 70 && depth < 90) return "tomato";
  else if (depth >= 90) return "red";
  else return "white";
}

// Perform a GET request to fetch data from the API endpoint.
d3.json(queryUrl).then(function (data) {

  // Once we receive a response, invoke the createFeatures function with the data.features object.
  createFeatures(data.features);

  // Function to create a GeoJSON layer with circle markers and popups.
  function createFeatures(earthquakeData) {
    var earthquakes = L.geoJSON(earthquakeData, {
      pointToLayer: function (feature, latlng) {
        // Generate circle markers with customized properties.
        return L.circleMarker(latlng, {
          radius: feature.properties.mag * 3,
          fillColor: chooseColor(feature.geometry.coordinates[2]),
          color: "#000",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        }).bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><hr><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]} km</p>`);
      }
    });

    // Invoke the createMap function with the earthquakes layer.
    createMap(earthquakes);
  }

  // Function to create the map with a base layer and legend.
  function createMap(earthquakes) {
    // Create the base layer using OpenStreetMap tiles.
    var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    // Create a baseMaps object to store the base layers.
    var baseMaps = {
      "Street Map": street
    };

    // Create the map and set the initial view and layers.
    var mymap = L.map("map", {
      center: [37.09, -95.71],
      zoom: 4,
      layers: [street, earthquakes]
    });

    // Create and add the legend control to the map.
    var info = L.control({
      position: "bottomright"
    });

    // When the layer control is added, insert a div with the class of 'info' and "legend".
    info.onAdd = function() {
      var div = L.DomUtil.create("div", "info legend");
      var depths = [-10, 10, 30, 50, 70, 90];

      // Include a title for the legend.
      div.innerHTML += "<h3>Earthquake Depth</h3>";

      // Iterate through depths to add color hex and label in the legend (e.g., [lightgreen]10-30).
      for (var i = 0; i < depths.length; i++) {
        div.innerHTML +=
          '<i style="background:' + chooseColor(depths[i]) + '"></i> ' +
          depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
      }
      return div;
    };
    // Add the info legend to the map.
    info.addTo(mymap);
  }
});