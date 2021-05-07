    var retail;
    var geojson;

  $('#aboutModal').modal('show');

  mapboxgl.accessToken = 'pk.eyJ1IjoiY3J2YW5wb2xsYXJkIiwiYSI6ImNqMHdvdnd5MTAwMWEycXBocm4zbXVjZm8ifQ.3zjbFccILu6mL7cOTtp40A';

  // This adds the map
    var map = new mapboxgl.Map({
        container: 'map', 
        style: 'mapbox://styles/mapbox/light-v9', 
        center: [ -75.24,40.023], 
        bearing: 0, // Rotate Philly ~9° off of north, thanks Billy Penn.
        zoom: 8,
        attributionControl: false
    });
    // Add zoom and rotation controls to the map.
    map.addControl(new mapboxgl.NavigationControl(),['top-right']);
    map.addControl(new mapboxgl.AttributionControl(),'bottom-right');

    // Zoom to Extent
    document.getElementById('zoomtoregion').addEventListener('click', function () {
        map.flyTo({
            center: [ -75.24,40.023], 
                zoom: 8,
                bearing:0,
                pitch:0,
                speed: 0.5
        });
    });

  //  map.on('click', function (e) {
     //   alert("hello");
    //    $('#info').html('');
    //    $('#carousel-example-generic').html('');
   // });

map.on('load', function () {

        map.addLayer({
            "id": "county",
            "type": "line",
            "source": {
                type: 'vector',
                url: 'https://tiles.dvrpc.org/data/dvrpc-municipal.json'
            },
            "source-layer": "county",
            "layout": {},
            "paint": {
                'line-width': 2,
                'line-color': '#5d5d5d'
            },
            "filter": [
                    "==",
                    "dvrpc",
                    "Yes"
            ]
        });

         map.addLayer({
            "id": "retail",
            "type": "symbol",
            "source": {
                "type": "geojson",
                "data": retail
            }
        });

        retail.features.forEach(function(marker) {
            var el = document.createElement('div');
            el.className = 'marker1';
            el.style.backgroundImage = 'assets/img/Retail_Blue.png';

            var popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false
            });

            el.addEventListener('mouseenter',function(){
            var coordinates = marker.geometry.coordinates.slice();
            popup.setLngLat(coordinates)
            .setHTML('<h4>'+ marker.properties.District+'</h4><p style="border-bottom: 8px solid #42708A;"</p>')
            .addTo(map);
            })

            el.addEventListener('mouseleave',function(){
            popup.remove();
            })

            el.addEventListener('click', function() {
            //  window.alert(marker.properties.name);
            //   console.log(marker.properties);
            if (marker.properties.bio1 === undefined){ var BIO1 = ' '  ;}
            else { var BIO1 = '<hr class="hr1"><B>Description:</B> '+ marker.properties.bio1;}
            if (marker.properties.bio2 === undefined){ var BIO2 = ' '  ;}
            else { var BIO2 = '&nbsp;'+ marker.properties.bio2;}
            if (marker.properties.bio3 === undefined){ var BIO3 = ' '  ;}
            else { var BIO3 = '&nbsp;'+ marker.properties.bio3;}
            if (marker.properties.bio4 === undefined){ var BIO4 = ' '  ;}
            else { var BIO4 = '&nbsp;'+ marker.properties.bio4;}

           var info ="<H4>"+ marker.properties.name + "</h4>";

           var content = '<B>Contact Name:</B> '+ marker.properties.cname
               // +'<br><B>Title:</B> '+ marker.properties.ctitle
                +'<br><B>Phone:</B> '+ marker.properties.cphone
               // +'<br><B>Email:</B> '+ marker.properties.cemail
                + BIO1
                + BIO2
                + BIO3
                + BIO4
            ;

            if (marker.properties.photo1 === undefined){ var PHOTO1= " "  ;}
            else { var PHOTO1 = "<div class='carousel-inner'>"+"<div class='item active'><img src='"+ (marker.properties.photo1) +"' alt='property photo'></div>";}
            if (marker.properties.photo2 !== undefined){ PHOTO1 += "<div class='item'><img src='"+ (marker.properties.photo2) + "' alt='property photo'></div>";}
            if (marker.properties.photo3 !== undefined){ PHOTO1 += "<div class='item'><img src='"+ (marker.properties.photo3) + "' alt='property photo'></div>";}
            if (marker.properties.photo4 !== undefined){ PHOTO1 += "<div class='item'><img src='"+ (marker.properties.photo4) + "' alt='property photo'></div>";}
            if (marker.properties.photo1 !== undefined){ PHOTO1 += "</div>";}
            if (marker.properties.photo2 !== undefined){ PHOTO1 += " <a class='left carousel-control' href='#carousel-example-generic' data-slide='prev'>"+"<span class='glyphicon glyphicon-chevron-left'></span>"
            +" </a>"+" <a class='right carousel-control' href='#carousel-example-generic' data-slide='next'>"+
            "<span class='glyphicon glyphicon-chevron-right'></span>"+"</a>" ;}
            //      if (props.Photo_Cred===undefined){ var Photo_Cred = " "  ;}
            //      else { var Photo_Cred = "<div class='labelfieldsource'>"+ (props.Photo_Cred) +  "</div>";}
            var  content2 = PHOTO1
                     //   + Photo_Cred
           
            document.getElementById('resultsheader').innerHTML = info;
            document.getElementById('resultsheader').className = 'rhEL';   
            document.getElementById('info').innerHTML = content;
            document.getElementById('carousel-example-generic').innerHTML = content2;
            $('.carousel').carousel('pause');

            map.flyTo({
            center: marker.geometry.coordinates,
            pitch: 20,
            speed: 0.5,
            zoom: 12
                });
            });

            new mapboxgl.Marker(el)
                .setLngLat(marker.geometry.coordinates)
                .addTo(map);
        });

    });
  


