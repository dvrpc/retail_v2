var retail, districts, d2;
var geojson;

var retailSearch = [];

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
  map.flyTo({
    center: [-75.24, 40.023],
    zoom: 8,
    bearing: 0,
    pitch: 0,
    speed: 0.5,
  });
});

function handleSidebarDisplay(e) {
  // If the sidebar is not display=block ...
  // ... set the sidebar display to block and resize the map div

  var sidebarViz = $("#sidebar").css("display");
  if (sidebarViz !== "block") {
    $("#map").toggleClass("col-sm-6 col-lg-6 col-sm-12 col-lg-12");
    $("#sidebar").css("display", "block");
  }
  $(window.map).resize();
  return false;
}

map.on("load", function () {
    console.log(retailSearch);
 
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
    id: "d2",
    type: "line",
    source: {
      type: "geojson",
      data: districts,
    },
    layout: {},
    paint: {
      "line-width": 2,
      "line-color": "#0078ae",
    },
    /*  paint: {
                "line-color": [ 'case',
               ['boolean', ['feature-state', 'click'], false],
                '#FFFF00', '#0078ae'
               ],
                "line-width": [ 'case',
               ['boolean', ['feature-state', 'click'], false],
                5, 3
               ]
             }
             */
  });

  map.addLayer({
    id: "districts",
    type: "fill",
    source: {
      type: "geojson",
      data: districts,
    },
    layout: {},
    paint: {
      "fill-outline-color": "#0078ae",
      "fill-color": "rgba(0, 120, 174,0.35)",
    },
  });

  map.addLayer({
    id: "retail",
    type: "symbol",
    source: {
      type: "geojson",
      data: retail,
    },
  });

  retail.features.forEach(function (marker) {
    var el = document.createElement("div");
    el.className = "marker1";
    el.style.backgroundImage = "assets/img/Retail_Blue.png";

    var popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
    });

    retailSearch.push({
        name:  marker.properties.DISTRICT,
        source: "Retail",
        id: marker.id,
       bounds: marker.geometry.coordinates,
    });

    el.addEventListener("mouseenter", function () {
      var coordinates = marker.geometry.coordinates.slice();
      popup
        .setLngLat(coordinates)
        .setHTML(
          "<h4>" +
            marker.properties.DISTRICT +
            '</h4><p style="border-bottom: 8px solid #42708A;"</p>'
        )
        .addTo(map);
    });

    el.addEventListener("mouseleave", function () {
      popup.remove();
    });

    el.addEventListener("click", handleSidebarDisplay);

    el.addEventListener("click", function () {
      var props = marker.properties;

      // get all the elements with class "marker2"
      /*    var x = document.getElementsByClassName("marker2");
                var i;
                for (i = 0; i < x.length; i++) {
                x[i].className = "marker1"; // set "marker" as the class for each of those elements
                }
                // at this point all markers are back to the original state

                // now you set the class of the current clicked marker
                this.className = 'marker2'; //don't use the variable "el", it's out of the scope and can change, "this" is the current clicked element
            */
      //  window.alert(marker.properties.name);
      //   console.log(marker.properties);
      if (marker.properties.BREW === 0) {
        var BREW = "<div class='hidden'></div>";
      } else {
        var BREW ='<span class="label label-default">Brewery</span>';
      }

      if (marker.properties.CIRCUIT === 0) {
        var CIRCUIT = "<div class='hidden'></div>";
      } else {
        var CIRCUIT = '<span class="label label-default">The Circuit Trails</span>';
      }

      if (marker.properties.CLASSIC === 0) {
        var CTOWN = "<div class='hidden'></div>";
      } else {
        var CTOWN = '<span class="label label-default">Classic Town</span>';
      }

      if (marker.properties.COLLEGE === 0) {
        var COLLEGE = "<div class='hidden'></div>";
      } else {
        var COLLEGE = '<span class="label label-default">College</span>';
      }

      if (marker.properties.CORE === 0) {
        var CORE = "<div class='hidden'></div>";
      } else {
        var CORE = '<span class="label label-default">Core City</span>';
      }

      if (marker.properties.EXPAND === 0) {
        var EXPAND = "<div class='hidden'></div>";
      } else {
        var EXPAND = '<span class="label label-default">Expanding</span>';
      }

      if (marker.properties.HIST === 0) {
        var HDIST = "<div class='hidden'></div>";
      } else {
        var HDIST =
          '<span class="label label-default">Historic District (NRHP)</span>';
      }

      if (marker.properties.OPP === 0) {
        var OPP = "<div class='hidden'></div>";
      } else {
        var OPP = '<span class="label label-default">Opportunity Zones</span>';
      }

      if (marker.properties.TRANSIT_1 === 0) {
        var TRANSIT = "<div class='hidden'></div>";
      } else {
        var TRANSIT =
          '<span class="label label-default">Transit-Oriented</span>';
      }

      var info =
        "<h3 style='margin-top:0;'><span>" +
        marker.properties.DISTRICT +
        "</span><br/><small><span>" +
        marker.properties.RDISTCROSS +
        "</span>, <span></span> County, <span>" +
        marker.properties.STATE +
        "</span></small></h3>" +
        BREW +
        CIRCUIT +
        CTOWN +
        COLLEGE +
        CORE +
        EXPAND +
        HDIST +
        OPP +
        TRANSIT;
      var content1 =
        "<h3 class='data-heading'>Transit and Accessibility</h3>" +
        "<span class='data-info'>Number of Blocks: </span><span class='data-value'> " +
        marker.properties.DTRETAIL +
        "</span>" +
        "<br><span class='data-info'>Maximum Sidewalk Width: </span><span class='data-value'> " +
        marker.properties.MAXSWW +
        "</span>" +
        "<br><span class='data-info'>Maximum Cartway Width: </span><span class='data-value'> " +
        marker.properties.MAXCARTW +
        "</span>" +
        "<br><span class='data-info'>Walk Score: </span><span class='data-value'> " +
        marker.properties.WSCORE +
        "</span>" +
        "<br><span class='data-info'>Transit: </span><span class='data-value'> " +
        marker.properties.TRANSIT +
        "</span>" +
        "<br><span class='data-info'>Bus Routes: </span><span class='data-value'> " +
        marker.properties.BUSROUTE +
        "</span>" +
        "<br><span class='data-info'>Parking: </span><span class='data-value'> " +
        marker.properties.PARKING +
        "</span>";
      if (marker.properties.BID === undefined) {
        var BID = "<div class='hidden'></div>";
      } else {
        var BID =
          "<span class='data-info'>Business Improvement District: </span><span class='data-value'> " +
          marker.properties.BID +
          "</span><br>";
      }

      if (marker.properties.CHAMCOM === undefined) {
        var CHAMCOM = "<div class='hidden'></div>";
      } else {
        var CHAMCOM =
          "<span class='data-info'>Chamber of Commerce: </span><span class='data-value'> " +
          marker.properties.CHAMCOM +
          "</span><br>";
      }

      if (marker.properties.BUSASC === undefined) {
        var BUSASC = "<div class='hidden'></div>";
      } else {
        var BUSASC =
          "<span class='data-info'>Business Association: </span><span class='data-value'> " +
          marker.properties.BUSASC +
          "</span><br>";
      }

      if (marker.properties.MERCHASC === undefined) {
        var MERCHASC = "<div class='hidden'></div>";
      } else {
        var MERCHASC =
          "<span class='data-info'>Merchants Association: </span><span class='data-value'> " +
          marker.properties.MERCHASC +
          "</span><br>";
      }

      if (marker.properties.MAINST === undefined) {
        var MAINST = "<div class='hidden'></div>";
      } else {
        var MAINST =
          "<span class='data-info'>Main Street: </span><span class='data-value'> " +
          marker.properties.MAINST +
          "</span><br>";
      }

      if (marker.properties.ZONING === undefined) {
        var ZONING = "<div class='hidden'></div>";
      } else {
        var ZONING =
          "<span class='data-info'>Zoning: </span><span class='data-value'> " +
          marker.properties.ZONING +
          "</span>";
      }

      var content2 =
        "<h3 class='data-heading'>Demographic (within 1/2 mile)</h3>" +
        "<span class='data-info'>Population: </span><span class='data-value'> " +
        numeral(marker.properties.POP).format("(0,0)") +
        "</span>" +
        "<br><span class='data-info'>Households: </span><span class='data-value'> " +
        numeral(marker.properties.HH).format("(0,0)") +
        "</span>" +
        "<br><span class='data-info'>Median Household Income: </span><span class='data-value'> " +
        numeral(marker.properties.MEDHH).format("($0,0)") +
        "</span>" +
        "<h3 class='data-heading'>Management Structure</h3>" +
        BID +
        CHAMCOM +
        BUSASC +
        MERCHASC +
        MAINST +
        ZONING +
        "<h3 class='data-heading'>Traffic Counts</h3>" +
        "<span class='data-info'>Count Location: </span><span class='data-value'> " +
        marker.properties.COUNTLOC +
        "</span>" +
        "<br><span class='data-info'>Center Point: </span><span class='data-value'> " +
        marker.properties.CENTERPT +
        "</span>" +
        "<br><span class='data-info'>AADT: </span><span class='data-value'> " +
        marker.properties.AADT +
        "</span>" +
        "<br><span class='data-info'>Date: </span><span class='data-value'> " +
        marker.properties.DATE +
        "</span>";
      document.getElementById("resultsheader").innerHTML = info;
      // document.getElementById('resultsheader').className = 'rhEL';

      document.getElementById("info1").innerHTML = content1;
      document.getElementById("info2").innerHTML = content2;

      map.flyTo({
        center: marker.geometry.coordinates,
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
        props.FB20,
        props.GAFO20,
        props.NGS20,
        props.OFFICE20,
        props.RES20,
        props.VACANT20,
        props.EXP20,
        props.HOSP20,
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
            plotShadow: true,
            height: 220,
            width: 300,
            colors: [
              "#8ec63f",
              "#5bc5cf",
              "#eb555c",
              "#ca1820",
              "#ef2e37",
              "#0c877b",
              "#fbb040",
              "#A80000",
            ],
          },
          title: {
            text: "2013",
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
                style: "{text-align: center}",
                verticalAlign: "middle",
                distance: 5,
                format: "<span>{point.percentage:.0f} %</span>",
                filter: {
                  property: "percentage",
                  operator: ">",
                  value: "8",
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
                "#eb555c",
                "#ca1820",
                "#ef2e37",
                "#0c877b",
                "#fbb040",
                "#bdd2ff",
              ],
              data: [],
            },
          ],
        };
        var Labels = [
            "Civic",
            "Cultural",
            "Food & Beverage",
            "GAFO",
            "NG & S",
            "Office",
            "Residential",
            "Vacant",
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
            plotShadow: true,
            height: 220,
            width: 300,
            colors: [
              "#8ec63f",
              "#5bc5cf",
              "#eb555c",
              "#ca1820",
              "#ef2e37",
              "#0c877b",
              "#fbb040",
              "#bdd2ff",
              "#eb555c",
              "#f08085",
              "#878787",
              "#da7b27",
            ],
          },
          title: {
            text: "2020",
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
                style: "{text-align: center}",
                verticalAlign: "middle",
                distance: 5,
                format: "<span>{point.percentage:.0f} %</span>",
                filter: {
                  property: "percentage",
                  operator: ">",
                  value: "8",
                },
              },
              showInLegend: false,
            },
          },
          /*  legend: {
          title: {
              text: '<span style="text-align:center;font-size: 9px; color: #666; font-weight: normal">Retail Mix 2015</span>',
              style: {
                    fontStyle: 'italic'
              }
            },
          layout:'horizontal'
        }, */
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
                "#eb555c",
                "#ca1820",
                "#ef2e37",
                "#0c877b",
                "#fbb040",
                "#bdd2ff",
                "#eb555c",
                "#f08085",
                "#878787",
                "#da7b27",
              ],
              data: [],
            },
          ],
        };
        var Labels = [
            "Civic",
            "Cultural",
            "Food & Beverage",
            "GAFO",
            "NG & S",
            "Office",
            "Residential",
            "Vacant",
            "Experimental",
            "HOSP",
            "Construction",
            "Institutional",
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
    });

    new mapboxgl.Marker(el).setLngLat(marker.geometry.coordinates).addTo(map);
});
});

