// Create the 'basemap' tile layer that will be the background of our map.
let defaultmap = L.tileLayer(
    "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'",
    {
      attribution:
        'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    });
//----------------------------------------------------
//adding other toggleable maps

//oceanbase layer
let Esri_OceanBasemap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri',
	maxZoom: 13
});

//darkmap layer
let Stadia_AlidadeSmoothDark = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.{ext}', {
	minZoom: 0,
	maxZoom: 20,
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'png'
});

// Then add the 'basemap' tile layer to the map.
let basemaps = {
  OceanBase : Esri_OceanBasemap,
  DarkMap : Stadia_AlidadeSmoothDark,
  Default: defaultmap
};

    // Create the map object with center and zoom options.
var myMap = L.map("map", {
  center: [
    40.7, -94.5
  ],
  zoom: 5,
  layers: [defaultmap, Esri_OceanBasemap, Stadia_AlidadeSmoothDark]
});


//add the default map to the map
defaultmap.addTo(myMap);

//--------------------------------------------------------------

//adding the tectonic plates (they will be made toggleable at the Layer Control portion of the code, below)

//creating a layergroup to hold the tectonic plate data
let tectonicplates = new L.layerGroup();

//use a d3 json call to load the tectonic plate data, which we store in the layergroup we created
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/refs/heads/master/GeoJSON/PB2002_boundaries.json").then(
  (plateData)=>{
      console.log(plateData);

      L.geoJson(plateData, {
          color: "yellow"
      }).addTo(tectonicplates);
  }
);

//add the tectonic plates layergroup to map
tectonicplates.addTo(myMap);


//--------------------------------------------------------------------
//adding the earthquakes and making them toggleable, remembering to:
  //add markers with radius and colors matching the map
    //colors are based off of the depth (third attribute inside coordinates)
    //radius is based off of magnitudes- properties > mag
  //add the legend per the vertical legend in Module 15 challenge, already updated CSS styling for the legend

//creating a layergroup to hold the earthquake data
let earthquakes = new L.layerGroup();

//use a d3 json call to load the earthquake data, which we store in the layergroup we created

d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(
  (earthquakeData)=>{
      console.log(earthquakeData);

      //make a function that chooses the color of the data point
      function dataColor(depth){
        if (depth > 90)
          return "red";
        else if (depth > 70)
          return "#f7740f";
        else if (depth > 50)
          return "#f7d80f";
        else if (depth > 30)
          return "#cff525";
        else if (depth > 10)
          return "#8efa41";
        else 
        return "green"
      }

      //make a function that determines the size of the radius
      function radiusSize(mag){
        if (mag == 0)
          return 1; //makes sure that a 0 mag earthquake shows up with a radius of 1
        else
        return mag * 5; //multiplies magnitude by 5, makes sure that the earthquake indicators are visible
      }

      //add on to the style for each data point
      function dataStyle(feature){
        return{
          opacity: 1,
          fillOpacity: 1,
          fillColor: dataColor(feature.geometry.coordinates[2]), //use index 2 to indicate the depth, 
          // which runs through the dataColor function to yield the color
          color: "000000", //making the outline of the circles black
          radius: radiusSize(feature.properties.mag), //calling the magnitude to plug into the radiusSize function
          weight: 1, //makes sure lines aren't too thick
          stroke: true
          
        }
      };

      //add the geoJSON data to the earthquake data layer we created
      L.geoJson(earthquakeData, {
        //make each feature a (circular) marker on the map
        pointToLayer: function(feature, latLng){
          return L.circleMarker(latLng);
        },
        //set the style for each marker
        style: dataStyle, //calls the dataStyle function to establish style parameters for each point
        onEachFeature: function(feature, layer){
          layer.bindPopup(`Magnitude: <b>${feature.properties.mag} </b><br>
            Depth: <b>${feature.geometry.coordinates[2]}</b><br>
            Location: <b>${feature.properties.place}</b>`)
        }
      }).addTo(earthquakes);

  }

);

//add the earthquakes layergroup to map
earthquakes.addTo(myMap);



//----------------------------------------------------------

//add the overlay for the tectonic plates and earthquakes
let overlays = {
  "Tectonic Plates": tectonicplates,
  "Earthquakes": earthquakes
}

//add the layer control
L.control
  .layers(basemaps, overlays)
  .addTo(myMap);


//add the legend to the map
let legend = L.control({
  position: "bottomright"
});

//add the properties for the legend
legend.onAdd = function(){
  //div for the legend to appear in the page
  let div = L.DomUtil.create("div", "info legend");

  //set up the intervals
  let intervals = [-10, 10, 30, 50, 70, 90];
  //set up the colors for the intervals
  let colors = [
      "green",
      "#8efa41",
      "#cff525",
      "#f7d80f",
      "#f7740f",
      "red"
  ];

  //loop through the intervals and colors and generate a label with a colored square for each interval
  for(var i = 0; i < intervals.length; i++)
  {
    //inner html that sets the square for each interval and label
    div.innerHTML += "<i style='background: "
      +colors[i]
      +"'></i> "
      +intervals[i]
      +(intervals[i + 1] ? "km - " + intervals[i + 1] + "km<br>" : "km+");
  }

  return div;
};

//add the legend to the map
legend.addTo(myMap)