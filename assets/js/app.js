// var retail, districts, d2;
var geojson;
const searchForm = document.getElementById("search");

// overall loaded data
var retailSearch = {};
var combinedChartData = {};
var salesTrendData = {};
var quarterlyVisitsData = {};

// extracted district data, populated when point selected
let districtChartData = {};
let districtSalesTrendData = {};
let regionalSalesTrendData = {};

// handles removing and adding 2013 buttons
let buttonRemoved = false;

const retailDistrictAverageColor = "#878787";

var clickedStateId = null;

Highcharts.setOptions({
  lang: {
    thousandsSep: ",",
  },
});

function PrintElem(elem) {
  var mywindow = window.open("", "PRINT", "height=400,width=600");

  mywindow.document.write("<html><head><title>" + document.title + "</title>");
  mywindow.document.write(
    '<link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css" rel="stylesheet" media="print" ><link href="../css/print.css" rel="stylesheet" media="print">'
  );
  // mywindow.document.write("<link href="../css/print.css" rel="stylesheet" media="print">");
  mywindow.document.write("</head><body >");
  mywindow.document.write("<h1>" + document.title + "</h1>");
  mywindow.document.write(document.getElementById("sidebar").innerHTML);
  // mywindow.document.write(document.getElementById(elem).innerHTML);
  mywindow.document.write("</body></html>");

  mywindow.document.close(); // necessary for IE >= 10
  mywindow.focus(); // necessary for IE >= 10*/

  setTimeout(function () {
    mywindow.print();
    mywindow.close();
  }, 1000);
  return true;
}

function catShow() {
  $("#CATModal").modal("show");
}
$(document).ready(function () {
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

const populateOptions = function (obj) {
  const datalist = document.getElementById("retail-districts-list");
  const frag = document.createDocumentFragment();

  Object.keys(obj)
    .sort((a, b) => a > b)
    .forEach(function (el) {
      const option = document.createElement("option");
      option.value = el;
      frag.appendChild(option);
    });

  console.log(frag);

  datalist.appendChild(frag);
};

// Zoom to Extent
document.getElementById("zoomtoregion").addEventListener("click", function () {
  handleFullMapDisplay();
  map.flyTo({
    center: [-75.24, 40.023],
    zoom: 8,
    bearing: 0,
    pitch: 0,
    speed: 0.5,
  });
});

fetch(
  "https://services1.arcgis.com/LWtWv6q6BJyKidj8/ArcGIS/rest/services/Retail/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=geojson"
)
  .then((response) => response.json())
  .then((data) => {
    var retail = data;
    retail.features.forEach(function (geojsonrow) {
      retailSearch[geojsonrow.properties.DISTRICT] = geojsonrow;
    });
    populateOptions(retailSearch);
  });

fetch(
  "https://services1.arcgis.com/LWtWv6q6BJyKidj8/ArcGIS/rest/services/Retail/FeatureServer/3/query?where=1%3D1&outFields=*&outSR=4326&f=json"
)
  .then((response) => response.json())
  .then((data) => {
    data.features.forEach((row) => {
      if (combinedChartData[row.attributes.dist_id]) {
        combinedChartData[row.attributes.dist_id][row.attributes.year] =
          row.attributes;
      } else {
        const dict = {};
        dict[row.attributes.year] = row.attributes;
        combinedChartData[row.attributes.dist_id] = dict;
      }
    });
  });

fetch(
  "https://services1.arcgis.com/LWtWv6q6BJyKidj8/ArcGIS/rest/services/Retail/FeatureServer/4/query?where=1%3D1&outFields=*&outSR=4326&f=json"
)
  .then((response) => response.json())
  .then((data) => {
    data.features.forEach((row) => {
      if (!row.attributes.dist_id) {
        salesTrendData[row.attributes.district] = row.attributes;
      } else {
        salesTrendData[row.attributes.dist_id] = row.attributes;
      }
    });
  });

fetch(
  "https://services1.arcgis.com/LWtWv6q6BJyKidj8/ArcGIS/rest/services/Retail/FeatureServer/5/query?where=1%3D1&outFields=*&outSR=4326&f=json"
)
  .then((response) => response.json())
  .then((data) => {
    data.features.forEach((row) => {
      if (row.attributes.dist_id === "#N/A") {
        if (quarterlyVisitsData[row.attributes.district]) {
          quarterlyVisitsData[row.attributes.district].push(row.attributes);
        } else {
          quarterlyVisitsData[row.attributes.district] = [row.attributes];
        }
      } else {
        if (quarterlyVisitsData[row.attributes.dist_id]) {
          quarterlyVisitsData[row.attributes.dist_id].push(row.attributes);
        } else {
          quarterlyVisitsData[row.attributes.dist_id] = [row.attributes];
        }
      }
    });
  });

function handleSidebarDisplay() {
  // If the sidebar is not display=block ...
  // ... set the sidebar display to block and resize the map div

  var sidebarViz = $("#sidebar").css("display");
  if (sidebarViz !== "block") {
    $("#map").toggleClass(
      "col-sm-7 col-md-7 col-lg-7 col-sm-12 col-md-12 col-lg-12"
    );
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
    $("#map").toggleClass(
      "col-sm-12 col-md-12 col-lg-12 col-sm-6 col-md-6 col-lg-6"
    );
    $("#sidebar").css("display", "none");
  }
  $(window.map).resize();
  return false;
}

map.on("load", function () {
  // add map events here (click, mousemove, etc)

  // Create a popup, but don't add it to the map yet.
  var popup = new mapboxgl.Popup({
    className: "station-popup",
    closeButton: false,
    closeOnClick: false,
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
      data: "https://services1.arcgis.com/LWtWv6q6BJyKidj8/ArcGIS/rest/services/Retail/FeatureServer/2/query?where=1%3D1&outFields=*&outSR=4326&f=geojson",
      //   data: districts,
    },
    layout: {},
    paint: {
      "fill-outline-color": "#39398e",
      "fill-color": "rgba(57, 57, 142,0.35)",
    },
  });
  // When the map loads, add the data from the USGS earthquake API as a source
  map.addSource("d2", {
    type: "geojson",
    data: "https://services1.arcgis.com/LWtWv6q6BJyKidj8/ArcGIS/rest/services/Retail/FeatureServer/1/query?where=1%3D1&outFields=*&outSR=4326&f=geojson",
    //'data':d2, // Use the sevenDaysAgo variable to only retrieve quakes from the past week
    generateId: true, // This ensures that all features have unique IDs
  });

  map.addLayer({
    id: "d2",
    type: "line",
    source: "d2",
    layout: {},
    paint: {
      "line-color": [
        "case",
        ["boolean", ["feature-state", "click"], false],
        "#FFD662",
        "#0078ae",
      ],
      "line-width": [
        "case",
        ["boolean", ["feature-state", "click"], false],
        5,
        3,
      ],
    },
  });
  // When the map loads, add the data from the USGS earthquake API as a source
  map.addSource("retail", {
    type: "geojson",
    //'data':retail,
    data: "https://services1.arcgis.com/LWtWv6q6BJyKidj8/ArcGIS/rest/services/Retail/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=geojson",
    generateId: true, // This ensures that all features have unique IDs
  });

  map.addLayer({
    id: "retail",
    type: "circle",
    source: "retail",
    layout: {
      visibility: "visible",
    },
    paint: {
      "circle-radius": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        9,
        6,
      ],
      "circle-stroke-color": "#e5e5e5",
      "circle-stroke-width": 0.5,
      "circle-color": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        //  '#fbb040',
        "#ad0074",
        "#39398e",
      ],
    },
  });

  map.addLayer({
    id: "Buildings",
    source: "composite",
    minzoom: 15,
    "source-layer": "building",
    filter: ["==", "extrude", "true"],
    type: "fill-extrusion",
    //  'minzoom': 14,
    paint: {
      "fill-extrusion-color": "#aaa",

      // Use an 'interpolate' expression to
      // add a smooth transition effect to
      // the buildings as the user zooms in.
      "fill-extrusion-height": [
        "interpolate",
        ["linear"],
        ["zoom"],
        15,
        0,
        15.05,
        ["get", "height"],
      ],
      "fill-extrusion-base": [
        "interpolate",
        ["linear"],
        ["zoom"],
        15,
        0,
        15.05,
        ["get", "min_height"],
      ],
      "fill-extrusion-opacity": 0.6,
    },
  });

  var districtID = null;
  var polygonID = null;
  map.on("mousemove", "retail", (marker) => {
    map.getCanvas().style.cursor = "pointer";
    var coordinates = marker.features[0].geometry.coordinates.slice();
    var description = "<h3>" + marker.features[0].properties.DISTRICT + "</h3>";

    popup.setLngLat(coordinates).setHTML(description).addTo(map);
    if (marker.features.length > 0) {
      // When the mouse moves over the retail-viz layer, update the
      // feature state for the feature under the mouse
      if (districtID) {
        map.removeFeatureState({
          source: "retail",
          id: districtID,
        });
      }

      districtID = marker.features[0].id;

      map.setFeatureState(
        {
          source: "retail",
          id: districtID,
        },
        {
          hover: true,
        }
      );
    }
  });

  // When the mouse leaves the retail-viz layer, update the
  // feature state of the previously hovered feature
  map.on("mouseleave", "retail", function () {
    if (districtID) {
      map.setFeatureState(
        {
          source: "retail",
          id: districtID,
        },
        {
          hover: false,
        }
      );
    }
    districtID = null;

    // Reset the cursor style
    map.getCanvas().style.cursor = "";
    popup.remove();
  });

  map.on("click", "retail", (marker) => {
    // mapbox function calling of geojson properties
    var props = marker.features[0].properties;
    var coordinates = marker.features[0].geometry.coordinates;
    var FID = marker.features[0].id;

    if (props.RD_Year == "2021") {
      // alert ("nope");
      $("#chart2013").css("display", "none");
      $("#data-wrapper").css("display", "none");
      handleSidebarDisplay();
      handleDistrict(props, coordinates, map);
      handleHighlight(FID);
    } else {
      $("#chart2013").css("display", "block");
      $("#data-wrapper").css("display", "block");
      handleSidebarDisplay();
      handleDistrict(props, coordinates, map);
      handleHighlight(FID);
    }
  });

  searchForm.onsubmit = function (e) {
    e.preventDefault();
    const input = e.target.children[0].children[0];
    const searched = input.value;
    const location = retailSearch[searched];

    if (!location) {
      alert("Please select a value from the dropdown list");
      input.value = "";
      return;
    }

    // non-mapbox function calling the geojson properties and coordinates that get pushed to the handleDisctrict function
    var props = location.properties;
    var coordinates = location.geometry.coordinates;
    var FID = props.RETAIL_ID;

    if (props.RD_Year == "2021") {
      // alert ("nope");
      $("#chart2013").css("display", "none");
      $("#data-wrapper").css("display", "none");
      handleSidebarDisplay();
      handleDistrict(props, coordinates, map);
      handleHighlight(FID - 1);
    } else {
      $("#chart2013").css("display", "block");
      $("#data-wrapper").css("display", "block");
      handleSidebarDisplay();
      handleDistrict(props, coordinates, map);
      handleHighlight(FID - 1);
    }
  };

  const handleHighlight = function (FID) {
    if (FID > 0) {
      if (polygonID) {
        // Need to change this
        map.removeFeatureState({
          source: "d2",
          id: polygonID,
        });
      }
      // polygonID = marker.features[0].id; // Get generated ID
      polygonID = FID;
      map.setFeatureState(
        {
          source: "d2",
          id: polygonID,
        },
        {
          click: true,
        }
      );
    }
  };

  // pull click event into standalone function in order to apply to both form submit and map click
  // added 2 parameters props and coordinates to handle the different approaches to working with GeoJson features
  const handleDistrict = function (props, coordinates, map) {
    // var props = marker.properties;
    // console.log(marker.features[0].properties);
    // var props = marker.features[0].properties;
    if (props.BREW === 0) {
      var BREW = "<div class='hidden'></div>";
    } else {
      var BREW = '<span class="label label-default">Brewery</span>';
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
      var HDIST = '<span class="label label-default">Historic</span>';
    }

    if (props.OPP === 0) {
      var OPP = "<div class='hidden'></div>";
    } else {
      var OPP = '<span class="label label-default">Opportunity</span>';
    }

    if (props.TRANSIT_1 === 0) {
      var TRANSIT = "<div class='hidden'></div>";
    } else {
      var TRANSIT = '<span class="label label-default">Transit-Oriented</span>';
    }

    var info =
      "<div id='d-name'><h3 style='margin-top:10px; margin-bottom:10px; width: 100%'>" +
      props.DISTRICT +
      "</span><small><span> " +
      props.COUNTY +
      "</span><span></span> County, <span>" +
      props.STATE +
      "</span></small></h3></div>" +
      "<div id='dt-section'><h4 style=''>District Typologies</h4>" +
      BREW +
      CIRCUIT +
      CTOWN +
      COLLEGE +
      CORE +
      EXPAND +
      HDIST +
      OPP +
      TRANSIT +
      "</div>";

    document.getElementById("resultsHeader").innerHTML = info;
    const quarterlyVisitsHyperlink = document.getElementById(
      "quarterly-visits-hyperlink"
    );
    const quarterlyVisitsHyperlinkText = document.getElementById(
      "quarterly-visits-hyperlink-text"
    );
    quarterlyVisitsHyperlinkText.textContent = props.DISTRICT;
    quarterlyVisitsHyperlink.href = props.report;

    map.flyTo({
      // created a parameter that pulls the lat/long values from the geojson
      center: coordinates,
      pitch: 20,
      speed: 0.7,
      zoom: 15,
    });

    districtChartData = combinedChartData[props.RETAIL_ID];
    districtSalesTrendData = salesTrendData[props.RETAIL_ID];
    regionalSalesTrendData = salesTrendData["Regional Average"];

    function sortAndMapQuarterlyVisits(quarterlyVisits) {
      return quarterlyVisits
        .sort((a, b) => {
          if (a.year !== b.year) {
            return a.year - b.year;
          } else {
            return a.quarter - b.quarter;
          }
        })
        .map((row) => row.tot_visits);
    }

    const districtQuarterlyVisits = sortAndMapQuarterlyVisits(
      quarterlyVisitsData[props.RETAIL_ID]
    );
    const medianQuarterlyVisits = sortAndMapQuarterlyVisits(
      quarterlyVisitsData["Median"]
    );

    // charts
    const has2013 = districtChartData["2013"] !== undefined;
    let retailActiveYear = document
      .querySelectorAll("div.retail-chart-button-wrapper button.active")[0]
      .id.split("-")
      .slice(-1)[0];
    let tenancyActiveYear = document
      .querySelectorAll("div.tenancy-chart-button-wrapper button.active")[0]
      .id.split("-")
      .slice(-1)[0];
    let socialActiveYear = document
      .querySelectorAll("div.social-chart-button-wrapper button.active")[0]
      .id.split("-")
      .slice(-1)[0];

    //handles removing 2013 buttons
    if (!has2013) {
      if (retailActiveYear === "2013") {
        document.getElementById("retail-chart-btn-2022").className =
          "chart-btn active";
      }
      if (tenancyActiveYear === "2013") {
        document.getElementById("tenancy-chart-btn-2022").className =
          "chart-btn active";
      }
      if (!buttonRemoved) {
        const retailButton = document.getElementById("retail-chart-btn-2013");
        const tenancyButton = document.getElementById("tenancy-chart-btn-2013");

        if (retailButton.classList.contains("active")) {
          document.getElementById("retail-chart-btn-2022").className =
            "chart-btn active";
        }

        if (tenancyButton.classList.contains("active")) {
          document.getElementById("tenancy-chart-btn-2022").className =
            "chart-btn active";
        }

        retailButton.remove();
        tenancyButton.remove();
        retailActiveYear = "2022";
        tenancyActiveYear = "2022";

        buttonRemoved = true;
      }
    }

    // handles adding back 2013 buttons
    if (has2013 && buttonRemoved) {
      const retailButton =
        "<button id='retail-chart-btn-2013' class='chart-btn'>2013</button>";
      const retailWrapper = document.getElementById(
        "retail-chart-button-wrapper"
      );
      retailWrapper.insertAdjacentHTML("afterbegin", retailButton);

      const tenancyButton =
        "<button id='tenancy-chart-btn-2013' class='chart-btn'>2013</button>";
      const tenancyWrapper = document.getElementById(
        "tenancy-chart-button-wrapper"
      );
      tenancyWrapper.insertAdjacentHTML("afterbegin", tenancyButton);

      buttonRemoved = false;
    }

    updateRetailChart(districtChartData[retailActiveYear]);
    updateWebAndSocialChart(districtChartData[socialActiveYear]);
    updateBanksChart(districtChartData, has2013);
    updateRetailTenancyChart(districtChartData[tenancyActiveYear]);
    updateSalesTrendsChart(
      districtSalesTrendData,
      regionalSalesTrendData,
      "mvp"
    );
    updateQuarterlyVisitsChart(
      districtQuarterlyVisits,
      props.DISTRICT,
      medianQuarterlyVisits
    );

    document.querySelectorAll("button.chart-btn").forEach((btn) => {
      const type = btn.id.split("-")[0];
      const year = btn.id.split("-").slice(-1)[0];
      if (!has2013 && year === "2013") {
        btn.remove();
        return;
      }

      btn.addEventListener("click", () => handleClick(year, type, btn));
    });

    document
      .getElementById("sales-category-select")
      .addEventListener("change", (event) => {
        updateSalesTrendsChart(
          districtSalesTrendData,
          regionalSalesTrendData,
          event.target.value
        );
      });

    const select = document.getElementById("sales-category-select");
    select.value = "mvp";

    // add typeahead
  };
});

function updateRetailChart(chartData) {
  const retailUsesCategoryFieldMapping = {
    Civic: "civic",
    Cultural: "cultural",
    Office: "office",
    "Active Construction Sites": "construct",
    Residential: "reside",
    Vacant: "vacant",
    Institutional: "institute",
  };

  const retailTypesCategoryFieldMapping = {
    "Food and Beverage": "f_b",
    "General Merchandise, Apparel, Furnishings, and Other": "gafo",
    "Neighborhood Goods and Services": "ng_s",
    Experiential: "exp",
    Hospitality: "hosp",
  };

  const retailCategoryColorMapping = {
    Civic: "#8EC63F",
    Cultural: "#63bfc7",
    "Food and Beverage": "#f29195",
    "General Merchandise, Apparel, Furnishings, and Other": "#eb555c",
    "Neighborhood Goods and Services": "#90565c",
    Office: "#0C8771",
    Residential: "#FBB040",
    Vacant: "#BDD2FF",
    Experiential: "#fad5d6",
    Hospitality: "#bc565c",
    "Active Construction Sites": "#878787",
    Institutional: "#da7b27",
  };

  const populatedUsesSeries = [];
  const populatedUsesSeriesNegatives = [];

  const populatedTypesSeries = [];
  const populatedTypesSeriesNegatives = [];

  function populateChart(fieldMapping, type) {
    for (const [label, fieldName] of Object.entries(fieldMapping)) {
      const fieldData = [];

      const value = chartData[fieldName] * 100;
      fieldData.push(value);
      fieldData.push(100 - value);

      const data = {
        y: value,
        color: retailCategoryColorMapping[label],
      };

      const negativeData = {
        y: 100 - value,
        color: "#E1E1E1",
        dataLabels: {
          enabled: true,
          align: "left",
          format: "{subtract 100 point.y}%",
          style: {
            fontSize: "12px",
          },
          showInLegend: false,
        },
      };

      if (type === "uses") {
        populatedUsesSeries.push(data);
        populatedUsesSeriesNegatives.push(negativeData);
      } else {
        populatedTypesSeries.push(data);
        populatedTypesSeriesNegatives.push(negativeData);
      }
    }
  }

  populateChart(retailUsesCategoryFieldMapping, "uses");
  populateChart(retailTypesCategoryFieldMapping, "types");

  function getRetailChart(
    populatedSeries,
    populatedNegativeSeries,
    fieldMapping,
    type
  ) {
    return {
      chart: {
        type: "bar",
        renderTo: `retail-${type}-chart`,
        plotBackgroundColor: null,
        plotBorderWidth: 0, //null,
        plotShadow: false,
        height: populatedSeries.length * 30,
        fontSize: "1em",
        marginRight: 50,
      },

      xAxis: {
        categories: Object.keys(fieldMapping),
        labels: {
          useHTML: true,
          allowOverlap: true,
          style: {
            fontSize: "12px",
            "min-width": "200px",
            width: 200,
            wordBreak: "normal",
            overflowWrap: "break-word",
            textAlign: "right",
          },
        },
      },
      yAxis: {
        visible: false,
      },
      title: "",
      tooltip: {
        enabled: false,
      },
      legend: {
        enabled: false,
      },
      plotOptions: {
        bar: {
          stacking: "percent",
        },
        series: {
          enableMouseTracking: false,
          groupPadding: 0.05,
          pointPadding: 0.05,
        },
      },
      series: [
        {
          data: populatedNegativeSeries,
        },
        {
          data: populatedSeries,
        },
      ],
    };
  }

  const retailUsesChart = getRetailChart(
    populatedUsesSeries,
    populatedUsesSeriesNegatives,
    retailUsesCategoryFieldMapping,
    "uses"
  );
  const retailTypesChart = getRetailChart(
    populatedTypesSeries,
    populatedTypesSeriesNegatives,
    retailTypesCategoryFieldMapping,
    "types"
  );

  const chart1 = new Highcharts.Chart(retailUsesChart);
  const chart2 = new Highcharts.Chart(retailTypesChart);
}

function updateWebAndSocialChart(districtRow) {
  function getFieldPercentage(fieldName) {
    return districtRow[fieldName] * 100;
  }
  const webAndSocialChart = {
    chart: {
      renderTo: "web-and-social-chart",
      type: "column",
      plotBackgroundColor: null,
      plotBorderWidth: 0, //null,
      plotShadow: false,
      height: 300,
    },
    title: {
      text: "",
    },
    xAxis: {
      categories: ["Web", "Social"],
      accessibility: {
        description: "Web or Social Years",
      },
      labels: {
        style: {
          fontSize: "12px",
        },
      },
      gridLineWidth: 1,
      lineWidth: 0,
    },
    legend: {
      itemStyle: { fontSize: "12px" },
    },
    yAxis: {
      min: 0,
      max: 100,
      labels: {
        format: "{value}%",
        style: {
          fontSize: "12px",
        },
      },
      accessibility: {
        description: "Share of retail with social or website",
      },
      title: "false",
    },
    tooltip: {
      style: {
        fontSize: "12px",
      },
      pointFormat: "<span>{series.name}</span>: <b>{point.y:.0f}%</b> <br/>",
    },
    plotOptions: {
      column: {
        pointPadding: 0.2,
        borderWidth: 0,
      },
      series: {
        dataLabels: {
          format: "<span>{point.y}%</span>",
          style: {
            fontSize: "12px",
          },
          enabled: true,
        },
      },
    },
    series: [
      {
        name: districtRow.district,
        color: "#5bc6cf",
        data: [
          getFieldPercentage("web", districtRow.year),
          getFieldPercentage("social", districtRow.year),
        ],
      },
      {
        name: "Retail District Average",
        color: retailDistrictAverageColor,
        data: [
          getFieldPercentage("web_ave", districtRow.year),
          getFieldPercentage("social_ave", districtRow.year),
        ],
      },
    ],
  };
  var chart = new Highcharts.Chart(webAndSocialChart);
}

function updateBanksChart(chartData, has2013) {
  const banksChart = {
    chart: {
      renderTo: "bank-chart",
      type: "column",
      plotBackgroundColor: null,
      plotBorderWidth: 0, //null,
      plotShadow: false,
      height: 300,
    },
    title: {
      text: "",
    },
    xAxis: {
      categories: has2013 ? ["2013", "2020", "2022"] : ["2020", "2022"],
      crosshair: true,
      accessibility: {
        description: "Years",
      },
      labels: {
        style: {
          fontSize: "12px",
        },
      },
    },
    yAxis: {
      min: 0,
      accessibility: {
        description: "Total bank branches",
      },
      labels: {
        style: {
          fontSize: "12px",
        },
      },
      title: "",
    },
    legend: {
      itemStyle: { fontSize: "12px" },
    },
    tooltip: {
      style: {
        fontSize: "12px",
      },
    },
    plotOptions: {
      column: {
        pointPadding: 0.2,
        borderWidth: 0,
        minPointLength: 3
      },
      series: {
        dataLabels: {
          format: "<span>{point.y}</span>",
          style: {
            fontSize: "12px",
          },
          enabled: true,
        },
      },
    },
    series: [
      {
        color: "#0c877b",
        name: chartData[2020].district,
        data: [
          ...(has2013 ? [chartData[2013].banks] : []),
          chartData[2020].banks,
          chartData[2022].banks,
        ],
      },
      {
        color: retailDistrictAverageColor,
        name: "Retail District Average",
        data: [
          ...(has2013 ? [chartData[2013].banks_ave] : []),
          chartData[2020].banks_ave,
          chartData[2022].banks_ave,
        ],
      },
    ],
  };

  var chart = new Highcharts.Chart(banksChart);
}

function updateRetailTenancyChart(districtRow) {
  const districtName = districtRow.district;

  function getFieldPercentage(fieldName) {
    return districtRow[fieldName] * 100;
  }

  const retailTenancyChart = {
    chart: {
      type: "column",
      renderTo: "tenancy-chart",
      plotBackgroundColor: null,
      plotBorderWidth: 0, //null,
      plotShadow: false,
      height: 300,
      fontSize: "1em",
    },
    title: {
      text: "",
    },
    tooltip: {
      style: {
        fontSize: "12px",
      },
      pointFormat: "<span>{series.name}</span>: <b>{point.y:.0f}%</b> <br/>",
    },
    xAxis: {
      categories: [districtName, "Retail District Average"],
      labels: {
        style: {
          fontSize: "12px",
        },
      },
      gridLineWidth: 1,
      lineWidth: 0,
    },
    yAxis: {
      min: 0,
      max: 100,
      labels: {
        format: "{value}%",
        style: {
          fontSize: "12px",
        },
      },
      title: "false",
      gridLineWidth: 1,
      lineWidth: 0,
    },
    legend: {
      itemStyle: { fontSize: "12px" },
    },
    plotOptions: {
      column: {
        stacking: "percent",
        dataLabels: {
          enabled: true,
          format: "{point.percentage:.0f}%",
          style: {
            fontSize: "12px",
          },
          showInLegend: false,
        },
      },
    },
    series: [
      {
        color: "#fbb240",
        name: "Local",
        data: [
          getFieldPercentage("local", districtRow.year),
          getFieldPercentage("local_ave", districtRow.year),
        ],
      },
      {
        color: "#da7b27",
        name: "Chain",
        data: [
          getFieldPercentage("chain", districtRow.year),
          getFieldPercentage("chain_ave", districtRow.year),
        ],
      },
    ],
  };
  const chart = new Highcharts.Chart(retailTenancyChart);
}

function updateSalesTrendsChart(
  districtSalesTrends,
  reginonalSalesTrends,
  selectedField
) {
  const salesCategoryFieldMapping = {
    total: "Total Sales",
    mvp: "Motor Vehicle Parts & Dealers",
    fhf: "Furniture & Home Furnishing Stores",
    ea: "Electronics & Appliance Stores",
    bmge: "Building Material, Garden Equip. & Supplies",
    fb: "Food & Beverage Stores",
    hpc: "Health & Personal Care Stores",
    cca: "Clothing & Clothing Accessories Stores",
    sghmb: "Sporting Goods, Hobby, Book, & Music Stores",
    gm: "General Merchandise Stores",
    misc: "Miscellaneous Store Retailers",
    fd: "Foodservice & Drinking Places",
  };

  const salesCategories = ["Total"];

  salesCategories.push(salesCategoryFieldMapping[selectedField]);

  const districtName = districtSalesTrends.district;
  const populatedDistrictData = [];
  const populatedRegionalData = [];

  populatedDistrictData.push(Math.round(districtSalesTrends["total"] * 100));
  populatedRegionalData.push(Math.round(reginonalSalesTrends["total"] * 100));

  populatedDistrictData.push(
    Math.round(districtSalesTrends[selectedField] * 100)
  );
  populatedRegionalData.push(
    Math.round(reginonalSalesTrends[selectedField] * 100)
  );

  const salesTrendChart = {
    chart: {
      type: "column",
      renderTo: "sales-trend-chart",
      plotBackgroundColor: null,
      plotBorderWidth: 0, //null,
      plotShadow: false,
      height: 400,
      fontSize: "1em",
    },
    title: {
      text: "",
    },
    tooltip: {
      style: {
        fontSize: "12px",
      },
      pointFormat: "<span>{series.name}</span>: <b>{point.y:.0f}%</b> <br/>",
    },
    // legend: false,
    xAxis: {
      categories: salesCategories,
      labels: {
        style: {
          fontSize: "12px",
        },
      },
      gridLineWidth: 1,
      lineWidth: 0,
    },
    yAxis: {
      plotBands: [
        {
          color: "blue",
          width: 2,
          value: 0,
          zIndex: 4,
        },
      ],
      title: {
        enabled: false,
      },
      labels: {
        format: "{value}%",
        style: {
          fontSize: "12px",
        },
      },
    },
    legend: {
      itemStyle: { fontSize: "12px" },
    },
    plotOptions: {
      series: {
        dataLabels: {
          format: "<span>{point.y}%</span>",
          style: {
            fontSize: "12px",
          },
          enabled: true,
        },
      },
    },
    series: [
      {
        name: districtName,
        data: populatedDistrictData,
        color: "#b9318e",
      },
      {
        name: "Regional Average",
        data: populatedRegionalData,
        color: retailDistrictAverageColor,
      },
    ],
  };
  const chart = new Highcharts.Chart(salesTrendChart);
}

function updateQuarterlyVisitsChart(
  districtQuarterlyVisits,
  districtName,
  medianQuarterlyVisits
) {
  const quarterlyVisitsChart = {
    chart: {
      type: "line",
      renderTo: "quarterly-visits-chart",
      plotBackgroundColor: null,
      plotBorderWidth: 0, //null,
      plotShadow: false,
      height: 400,
      fontSize: "1em",
    },
    title: {
      text: "",
    },
    tooltip: {
      style: {
        fontSize: "12px",
      },
    },
    // legend: false,
    xAxis: {
      categories: [
        "2022 Q1",
        "2022 Q2",
        "2022 Q3",
        "2022 Q4",
        "2023 Q1",
        "2023 Q2",
        "2023 Q3",
        "2023 Q4",
      ],
      labels: {
        style: {
          fontSize: "12px",
        },
      },
      gridLineWidth: 1,
      lineWidth: 0,
    },
    yAxis: {
      title: {
        enabled: false,
      },
      labels: {
        style: {
          fontSize: "12px",
        },
      },
    },
    legend: {
      itemStyle: { fontSize: "12px" },
    },
    series: [
      {
        name: districtName,
        data: districtQuarterlyVisits,
        color: "#b9318e",
      },
      {
        name: "Median",
        data: medianQuarterlyVisits,
        color: "#393a8f",
      },
    ],
  };
  const chart = new Highcharts.Chart(quarterlyVisitsChart);
}

function handleClick(year, type, btn) {
  document
    .querySelectorAll(`div.${type}-chart-button-wrapper button.active`)
    .forEach((active) => {
      active.className = "";
    });
  btn.className = "chart-btn active";

  if (type === "retail") {
    updateRetailChart(districtChartData[year]);
  } else if (type === "tenancy") {
    updateRetailTenancyChart(districtChartData[year]);
  } else {
    updateWebAndSocialChart(districtChartData[year]);
  }
}
