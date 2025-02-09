// Create the 'basemap' tile layer that will be the background of our map.
let basemap = L.tileLayer(
    "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'",
    {
      attribution:
        'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    });
  
  
  // Create the map object with center and zoom options.
  let map = L.map("map", {
    center: [
      40.7, -94.5
    ],
    zoom: 5
  });
  
  // Then add the 'basemap' tile layer to the map.
  basemap.addTo(map);

  d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(
    (data)=>{
        console.log(data);
    }
  );

  //add markers with radius and colors matching the map
  //colors are based off of the depth (third attribute inside coordinates)
  //radius is based off of magnitudes- properties > mag
  //add the legend per the vertical legend in Module 15 challenge, already updated CSS styling for the legend

  //part 2: toggleable layer (won't look exactly like the assignment photo, which is old)
  //d3 JSON call
  // add the below to a layer to toggle on and off
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/refs/heads/master/GeoJSON/PB2002_boundaries.json").then(
    (plateData)=>{
        console.log(plateData);

        L.geoJson(plateData, {
            color: "yellow"
        }).addTo(map);
    }
  )