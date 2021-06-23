// var retail, districts, d2;
var geojson;
const searchForm = document.getElementById('search')

var retailSearch = {};
var clickedStateId = null;

function PrintElem(elem)
{
    var mywindow = window.open('', 'PRINT', 'height=400,width=600');

    mywindow.document.write('<html><head><title>' + document.title  + '</title>');
    mywindow.document.write("<link href=\"https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css\" rel=\"stylesheet\" media=\"print\" ><link href=\"../css/print.css\" rel=\"stylesheet\" media=\"print\">");
   // mywindow.document.write("<link href="../css/print.css" rel="stylesheet" media="print">");
    mywindow.document.write('</head><body >');
    mywindow.document.write('<h1>' + document.title  + '</h1>');
    mywindow.document.write(document.getElementById("sidebar").innerHTML);
   // mywindow.document.write(document.getElementById(elem).innerHTML);
    mywindow.document.write('</body></html>');

    mywindow.document.close(); // necessary for IE >= 10
    mywindow.focus(); // necessary for IE >= 10*/
  
    setTimeout(function () {
      mywindow.print();
      mywindow.close();
      }, 1000)
      return true;
}

function catShow() {
 $("#CATModal").modal("show");
} 
$(document).ready(function(){
  $('[data-toggle="tooltip"]').tooltip();   
  $("#aboutModal").modal("show");
});

mapboxgl.accessToken =
  "pk.eyJ1IjoiY3J2YW5wb2xsYXJkIiwiYSI6ImNqMHdvdnd5MTAwMWEycXBocm4zbXVjZm8ifQ.3zjbFccILu6mL7cOTtp40A";

// This adds the map
var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/light-v9",
  center: [-75.24, 40.023],
  bearing: 0, // Rotate Philly ~9° off of north, thanks Billy Penn.
  zoom: 8,
  attributionControl: false,
});
// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl(), ["top-right"]);
map.addControl(new mapboxgl.AttributionControl(), "bottom-right");

// Zoom to Extent
document.getElementById("zoomtoregion").addEventListener("click", function () {
  handleFullMapDisplay()
  map.flyTo({
    center: [-75.24, 40.023],
    zoom: 8,
    bearing: 0,
    pitch: 0,
    speed: 0.5,
  });

});

function handleSidebarDisplay() {
  // If the sidebar is not display=block ...
  // ... set the sidebar display to block and resize the map div

  var sidebarViz = $("#sidebar").css("display");
  if (sidebarViz !== "block") {
    $("#map").toggleClass("col-sm-6 col-md-6 col-lg-6 col-sm-12 col-md-12 col-lg-12");
    $("#sidebar").css("display", "block");
  }
  $(window.map).resize();
  return false;
}

function handleFullMapDisplay() {
  // If the sidebar is display=block ...
  // ... set the sidebar display not display=none and resize the map div

  var sidebarViz = $("#sidebar").css("display");
  if (sidebarViz !== "none") {
    $("#map").toggleClass("col-sm-12 col-md-12 col-lg-12 col-sm-6 col-md-6 col-lg-6");
    $("#sidebar").css("display", "none");
  }
  $(window.map).resize();
  return false;
}

fetch('https://services1.arcgis.com/LWtWv6q6BJyKidj8/ArcGIS/rest/services/Retail/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=geojson')
  .then(response => response.json())
  .then (data => {
    var retail = data;
    retail.features.forEach(function (geojsonrow) {
      retailSearch[geojsonrow.properties.DISTRICT] = geojsonrow
    });
  });
 // .then(data => console.log(data));
 console.log(retailSearch);

map.on("load", function () {
// add map events here (click, mousemove, etc)

// Create a popup, but don't add it to the map yet.
  var popup = new mapboxgl.Popup({
      className: "station-popup",
      closeButton: false,
      closeOnClick: false
  });

  map.addLayer({
    id: "county",
    type: "line",
    source: {
      type: "vector",
      url: "https://tiles.dvrpc.org/data/dvrpc-municipal.json",
    },
    "source-layer": "county",
    layout: {},
    paint: {
      "line-width": 2,
      "line-color": "#5d5d5d",
    },
    filter: ["==", "dvrpc", "Yes"],
  });

map.addLayer({
    id: "districts",
    type: "fill",
    source: {
      type: "geojson",
      'data':'https://services1.arcgis.com/LWtWv6q6BJyKidj8/ArcGIS/rest/services/Retail/FeatureServer/2/query?where=1%3D1&outFields=*&outSR=4326&f=geojson'
   //   data: districts,
    },
    layout: {},
    paint: {
      "fill-outline-color": "#39398e",
      "fill-color": "rgba(57, 57, 142,0.35)"       
    }
});
   // When the map loads, add the data from the USGS earthquake API as a source
   map.addSource('d2', {
    'type': 'geojson',
    'data':'https://services1.arcgis.com/LWtWv6q6BJyKidj8/ArcGIS/rest/services/Retail/FeatureServer/1/query?where=1%3D1&outFields=*&outSR=4326&f=geojson',
    //'data':d2, // Use the sevenDaysAgo variable to only retrieve quakes from the past week
    'generateId': true // This ensures that all features have unique IDs
  });
  
    map.addLayer({
      id: "d2",
      type: "line",
      source: "d2",
      layout: {},
      paint: {
        "line-color": [ 'case',
        ['boolean', ['feature-state', 'click'], false],
        '#FFD662', '#0078ae'
        ],
        "line-width": [ 'case',
        ['boolean', ['feature-state', 'click'], false],
        5, 3
        ]
      }
    });
 // When the map loads, add the data from the USGS earthquake API as a source
map.addSource('retail', {
  'type': 'geojson',
  //'data':retail, 
  'data':'https://services1.arcgis.com/LWtWv6q6BJyKidj8/ArcGIS/rest/services/Retail/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=geojson',
  'generateId': true // This ensures that all features have unique IDs
});

map.addLayer({
    id: 'retail',
    type: 'circle',
    source:'retail',
    layout: {
      'visibility':'visible'
       },
    paint: {
      'circle-radius': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        9,6
        ],
        'circle-stroke-color': '#e5e5e5',
        'circle-stroke-width': .5,
        'circle-color': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
        //  '#fbb040',
          '#ad0074',
          '#39398e'
          ],
      }
});


  map.addLayer({
      'id': 'Buildings',
      'source': 'composite',
      'minzoom':15,
      'source-layer': 'building',
      'filter': ['==', 'extrude', 'true'],
      'type': 'fill-extrusion',
    //  'minzoom': 14,
        'paint': {
          'fill-extrusion-color': '#aaa',
           
          // Use an 'interpolate' expression to
          // add a smooth transition effect to
          // the buildings as the user zooms in.
          'fill-extrusion-height': [
          'interpolate',
          ['linear'],
          ['zoom'],
          15,
          0,
          15.05,
          ['get', 'height']
          ],
          'fill-extrusion-base': [
          'interpolate',
          ['linear'],
          ['zoom'],
          15,
          0,
          15.05,
          ['get', 'min_height']
          ],
          'fill-extrusion-opacity': 0.6
          }
    });

var districtID = null;
var polygonID = null;
map.on('mousemove', 'retail', (marker) => {
    map.getCanvas().style.cursor = 'pointer';
    var coordinates = marker.features[0].geometry.coordinates.slice();
    var description = '<h3>'+ marker.features[0].properties.DISTRICT+'</h3>';

    popup.setLngLat(coordinates).setHTML(description).addTo(map);
    if (marker.features.length > 0) {
      // When the mouse moves over the retail-viz layer, update the
      // feature state for the feature under the mouse
      if (districtID) {
        map.removeFeatureState({
          source: 'retail',
          id: districtID
        });
      }

      districtID = marker.features[0].id;

      map.setFeatureState(
        {
          source: 'retail',
          id: districtID
        },
        {
          hover: true
        }
      );
    }
   
});

  // When the mouse leaves the retail-viz layer, update the
  // feature state of the previously hovered feature
map.on('mouseleave', 'retail', function () {
    if (districtID) {
      map.setFeatureState(
        {
          source: 'retail',
          id: districtID
        },
        {
          hover: false
        }
      );
    }
    districtID = null;

    // Reset the cursor style
    map.getCanvas().style.cursor = '';
    popup.remove();
});



map.on('click','retail', (marker) => {
    // mapbox function calling of geojson properties
    var props = marker.features[0].properties;
    var coordinates = marker.features[0].geometry.coordinates;
    var FID = marker.features[0].id;
  //  console.log(FID);
    if (props.RD_Year == '2021') {
     // alert ("nope");
      $("#chart2013").css("display", "none");
      $("#data-wrapper").css("display", "none");
      handleSidebarDisplay()
      handleDistrict(props,coordinates,map)
      handleHighlight(FID)
    } else {
      $("#chart2013").css("display", "block");
      $("#data-wrapper").css("display", "block");
      handleSidebarDisplay()
      handleDistrict(props,coordinates,map)
      handleHighlight(FID)
    }
});  


searchForm.onsubmit = function (e) {
  e.preventDefault()
  const input = e.target.children[0].children[0]
  const searched = input.value
  const location = retailSearch[searched]
  
  if(!location) {
    alert('Please select a value from the dropdown list')
    input.value = ''
    return
  }
 
  // non-mapbox function calling the geojson properties and coordinates that get pushed to the handleDisctrict function
  var props = location.properties;
  var coordinates = location.geometry.coordinates;
  var FID = props.RETAIL_ID;
 // console.log(FID);

  if (props.RD_Year == '2021') {
     // alert ("nope");
      $("#chart2013").css("display", "none");
      $("#data-wrapper").css("display", "none");
      handleSidebarDisplay()
      handleDistrict(props,coordinates,map)
      handleHighlight(FID-1)
    } else {
      $("#chart2013").css("display", "block");
      $("#data-wrapper").css("display", "block");
      handleSidebarDisplay()
      handleDistrict(props,coordinates,map)
      handleHighlight(FID-1)
    }
}

const handleHighlight = function (FID){

  if (FID > 0) {
    if(polygonID) { // Need to change this
        map.removeFeatureState({
            source: 'd2',
            id: polygonID
        });
    }
   // polygonID = marker.features[0].id; // Get generated ID
    polygonID = FID;
    map.setFeatureState({
        source: 'd2',
        id: polygonID
    }, {
        click: true
    });
}
// console.log(polygonID);
}

// pull click event into standalone function in order to apply to both form submit and map click
// added 2 parameters props and coordinates to handle the different approaches to working with GeoJson features
const handleDistrict = function (props,coordinates,map) {
 // var props = marker.properties;
 // console.log(marker.features[0].properties);
 // var props = marker.features[0].properties;
  if (props.BREW === 0) {
    var BREW = "<div class='hidden'></div>";
  } else {
    var BREW ='<span class="label label-default">Brewery</span>';
  }

  if (props.CIRCUIT === 0) {
    var CIRCUIT = "<div class='hidden'></div>";
  } else {
    var CIRCUIT = '<span class="label label-default">Circuit</span>';
  }

  if (props.CLASSIC === 0) {
    var CTOWN = "<div class='hidden'></div>";
  } else {
    var CTOWN = '<span class="label label-default">Classic Town</span>';
  }

  if (props.COLLEGE === 0) {
    var COLLEGE = "<div class='hidden'></div>";
  } else {
    var COLLEGE = '<span class="label label-default">College</span>';
  }

  if (props.CORE === 0) {
    var CORE = "<div class='hidden'></div>";
  } else {
    var CORE = '<span class="label label-default">Core City</span>';
  }

  if (props.EXPAND === 0) {
    var EXPAND = "<div class='hidden'></div>";
  } else {
    var EXPAND = '<span class="label label-default">Expanding</span>';
  }

  if (props.HIST === 0) {
    var HDIST = "<div class='hidden'></div>";
  } else {
    var HDIST =
      '<span class="label label-default">Historic</span>';
  }

  if (props.OPP === 0) {
    var OPP = "<div class='hidden'></div>";
  } else {
    var OPP = '<span class="label label-default">Opportunity</span>';
  }

  if (props.TRANSIT_1 === 0) {
    var TRANSIT = "<div class='hidden'></div>";
  } else {
    var TRANSIT =
      '<span class="label label-default">Transit-Oriented</span>';
  }

  var info =
    "<div id='d-name'><h3 style='margin-top:0;'>" +
    props.DISTRICT +
    "</span><small><span> " +
    props.COUNTY +
    "</span><span></span> County, <span>" +
    props.STATE +
    "</span></small></h3></div>"+
    "<div id='dt-section'><h4 style=''>District Typologies</h4>"+
    BREW +
    CIRCUIT +
    CTOWN +
    COLLEGE +
    CORE +
    EXPAND +
    HDIST +
    OPP +
    TRANSIT+
    "</div>" 
    ;
  var content1 = "<div class='data-row'><span class='data-info'>Number of Blocks </span><span class='data-value'> " +
    props.DTRETAIL +
    "</span></div>" +
    "<br><div class='data-row'><span class='data-info'>Maximum Sidewalk Width (ft) </span><span class='data-value'> " +
    props.MAXSWW +
    "</span></div>" +
    "<br><div class='data-row'><span class='data-info'>Maximum Cartway Width (ft) </span><span class='data-value'> " +
    props.MAXCARTW +
    "</span></div>" +
    "<br><div class='data-row'><span class='data-info'>Walk Score® </span><span class='data-value'> " +
    props.WSCORE +
    "</span></div>" +
    "<br><div class='data-row'><span class='data-info'>Transit </span><span class='data-value'> " +
    props.TRANSIT +
    "</span></div>" +
    "<br><div class='data-row'><span class='data-info'>Bus Route(s) </span><span class='data-value'> " +
    props.BUSROUTE +
    "</span></div>" +
    "<br><div class='data-row'><span class='data-info'>Parking </span><span class='data-value'> " +
    props.PARKING +
    "</span></div>" +
    "<br><div class='data-row'><span class='data-info'>Population </span><span class='data-value'> " +
    numeral(props.POP).format("(0,0)") +
    "</span></div>" +
    "<br><div class='data-row'><span class='data-info'>Households </span><span class='data-value'> " +
    numeral(props.HH).format("(0,0)") +
    "</span></div>" +
    "<br><div class='data-row-last'><span class='data-info'>Median Household Income </span><span class='data-value'> " +
    numeral(props.MEDHH).format("($0,0)") +
    "</span></div>" 
    ;
  document.getElementById("resultsHeader").innerHTML = info;
  document.getElementById("info1").innerHTML = content1;

  map.flyTo({
    // created a parameter that pulls the lat/long values from the geojson
    center: coordinates,
    pitch: 20,
    speed: 0.7,
    zoom: 15,
  });
  // charts
  Retail = [
    props.CIVIC,
    props.CULT,
    props.FB,
    props.GAFO,
    props.NGS,
    props.NONREOFF,
    props.RESIDE,
    props.VACANT,
  ];
  Retail2 = [
    props.CIVIC20,
    props.CULTURAL20,
    props.EXP20,
    props.FB20,
    props.GAFO20,
    props.HOSP20,
    props.NGS20,
    props.OFFICE20,
    props.RES20,
    props.VACANT20,
    props.CONSTR20,
    props.INST20,
  ];

  updateRetailChart(Retail);
  updateRetailChart2(Retail2);

  function updateRetailChart(Values) {
    var RetailChart = {
      chart: {
        renderTo: "Chart1",
        type: "pie",
        plotBackgroundColor: null,
        plotBorderWidth: 0, //null,
        plotShadow: false,
        height: 300,
      //  width: 370,
        colors: [
          "#8ec63f",
          "#5bc5cf",
          "#f29195",
          "#eb555c",
          "#90565c",
          "#0c877b",
          "#fbb040",
          "#bdd2ff"
        ],
      },
      title: {
        text: "",
      },
      plotOptions: {
        pie: {
          //  allowPointSelect: true,
          cursor: "pointer",
          point: {
            events: {
              legendItemClick: function (e) {
                e.preventDefault();
              },
            },
          },
          dataLabels: {
        //   enabled: false
            enabled: true,
         //   style: "{text-align: center}",
            verticalAlign: "middle",
            distance: 5,
            format: "<span>{point.percentage:.0f} %</span>",
            filter: {
              property: "percentage",
              operator: ">",
              value: ".5",
            },
          },
          showInLegend: false,
        },
      },
      tooltip: {
        formatter: function () {
          //  return '<b>'+Highcharts.numberFormat(this.point.y,0,',',',')+' Acres</b><br/>';
          return (
            "<b>" +
            this.point.name +
            "</b><br/>" +
            Highcharts.numberFormat(this.percentage, 2) +
            " %"
          );
        },
      },
      credits: {
        enabled: false,
      },
      series: [
        {
          name: "Total",
          id: "Values",
          innerSize: "40%",
          colors: [
            "#8ec63f",
            "#5bc5cf",
            "#f29195",
            "#eb555c",
            "#90565c",
            "#0c877b",
            "#fbb040",
            "#bdd2ff"
          ],
          data: [],
        },
      ],
    };
    var Labels = [
        "Civic",
        "Cultural",
        "Food and Beverage",
        "General Merchandise, Apparel, Furnishings, and Other",
        "Neighborhood Goods and Services",
        "Office",
        "Residential",
        "Vacant"
      ],
      counData = [];
    for (var i = 0; i < Values.length; i++) {
      counData.push({
        name: Labels[i],
        y: Values[i],
      });
    }
    RetailChart.series[0].data = counData;
    var chart2 = new Highcharts.Chart(RetailChart);
  }
  // start second chart
  function updateRetailChart2(Values) {
    var RetailChart2 = {
      chart: {
        renderTo: "Chart2",
        type: "pie",
        plotBackgroundColor: null,
        plotBorderWidth: 0, //null,
        plotShadow: false,
         height: 300,
      //  width: 75,
        colors: [
          "#8ec63f",
          "#5bc5cf",
          "#fad5d6",    
          "#f29195",
          "#eb555c",
          "#bc565c",   
          "#90565c",
          "#0c877b",
          "#fbb040",
          "#bdd2ff",
          "#878787",
          "#da7b27"
        ],
      },
      title: {
        text: "",
      },
      plotOptions: {
        pie: {
          //  allowPointSelect: true,
          cursor: "pointer",
          point: {
            events: {
              legendItemClick: function (e) {
                e.preventDefault();
              },
            },
          },
          dataLabels: {
            //   enabled: false
            enabled: true,
          //  style: "{text-align: center}",
            verticalAlign: "middle",
            distance: 5,
            format: "<span>{point.percentage:.0f} %</span>",
            filter: {
              property: "percentage",
              operator: ">",
              value: ".5",
            },
          },
          showInLegend: false,
        },
      },
  /*   legend: {
      title: {
          text: '<span style="text-align:center;font-size: 9px; color: #666; font-weight: normal">Retail Mix 2015</span>',
          style: {
                fontStyle: 'italic'
          }
        },
      layout:'horizontal'
    }, 
  */  
      tooltip: {
        formatter: function () {
          //  return '<b>'+Highcharts.numberFormat(this.point.y,0,',',',')+' Acres</b><br/>';
          return (
            "<b>" +
            this.point.name +
            "</b><br/>" +
            Highcharts.numberFormat(this.percentage, 2) +
            " %"
          );
        },
      },
      credits: {
        enabled: false,
      },
      series: [
        {
          name: "Total",
          id: "Values",
          innerSize: "40%",
          colors: [
            "#8ec63f",
            "#5bc5cf",
            "#fad5d6",    
            "#f29195",
            "#eb555c",
            "#bc565c",   
            "#90565c",
            "#0c877b",
            "#fbb040",
            "#bdd2ff",
            "#878787",
            "#da7b27"
          ],
          data: [],
        },
      ],
    };
    var Labels = [
        "Civic",
        "Cultural",
        "Experiential",
        "Food and Beverage",
        "General Merchandise, Apparel, Furnishings, and Other",
        "Hospitality",
        "Neighborhood Goods and Services",
        "Office",
        "Residential",
        "Vacant",
        "Construction",
        "Institutional"
      ],
      counData = [];
    for (var i = 0; i < Values.length; i++) {
      counData.push({
        name: Labels[i],
        y: Values[i],
      });
    }
    RetailChart2.series[0].data = counData;
    var chart4 = new Highcharts.Chart(RetailChart2);
  }
}
// add typeahead
const populateOptions = function (obj) {
  const datalist = document.getElementById('retail-districts-list')
  const frag = document.createDocumentFragment()
  
  Object.keys(obj).sort((a, b) => a > b).forEach(function(el) {
    const option = document.createElement('option')
    option.value = el
    frag.appendChild(option)
  })

  datalist.appendChild(frag)
}

populateOptions(retailSearch)

}); 