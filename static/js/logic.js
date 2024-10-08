// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
  createFeatures(data.features);
});

function QuakeColor(depth) {
    if (depth > 90) return "#8B0000"; // dark red
    else if (depth > 70) return "#FF0000"; // red
    else if (depth > 50) return "#FFA500"; // orange
    else if (depth > 30) return "#FFFF00"; // yellow
    else if (depth > 10) return "#D4EE00"; // brick yellow    
    else return "#90EE90";
     // green
}

function createFeatures(earthquakeData) {
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>Location: ${feature.properties.place}</h3><hr><p>Date: ${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
  }

  function CircleMaker(features, latlng){
    var CircleOptions = {
        radius: features.properties.mag * 5,
        fillColor: QuakeColor(features.geometry.coordinates[2]),
        color: "grey",
        opacity: 1.0,
        fillOpacity: 0.5
    }
    return L.circleMarker(latlng, CircleOptions);
  }

  let earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: CircleMaker,
    onEachFeature: onEachFeature
  });

  createMap(earthquakes);
}

function createMap(earthquakes) {
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  let overlayMaps = {
    Earthquakes: earthquakes
  };

  let myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [street, earthquakes]
  });

  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Add legend
  var legend = L.control({ position: "bottomright" });
  
  legend.onAdd = function() {
      var div = L.DomUtil.create("div", "info legend");
      var depth = [-10, 10, 30, 50, 70, 90];
      var colors = ["#90EE90", "#D4EE00", "#FFFF00", "#FFA500", "#FF0000", "#8B0000"];
      var labels = [];
  
      // Add the minimum and maximum.
      //var legendInfo = "<h3 style='text-align: center'>Depth</h3>" +
          "<div class=\"labels\">" +
              "<div class=\"min\">" + depth[0] + "</div>" +
              "<div class=\"max\">" + depth[depth.length - 1] + "</div>" +
          "</div>";
  
      //div.innerHTML = legendInfo;
  
      // Using a for loop to create a stacked legend without spaces
      for (var i = 0; i < depth.length; i++) {
          labels.push("<div style='display: flex; align-items: center;'>" +
              "<div style='background-color: " + colors[i] + "; width: 20px; height: 20px; margin-right: 5px;'></div> " +
              depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] : '+') +
              "</div>");
      }
  
      div.innerHTML += labels.join("");
      return div;
  };
  
  // Adding the legend to the map
  legend.addTo(myMap);

}