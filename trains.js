goog.require('goog.array');
goog.require('goog.dom.query');

var map;
var trains = {}
var trolleys = {}
var markers = {}
var newTrains;
var tolleyLines = [10,11,13,15,34,36,101,102]
var intervalID;
function initialize() {
    var styleArray = [{
        featureType: "all",
        stylers: [
          { saturation: -25 }
        ]
    }];
    var mapOptions = {
      center: new google.maps.LatLng(39.9522, -75.1642),
      zoom: 11,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: styleArray
    };
    map = new google.maps.Map(document.getElementById("map_canvas"),
        mapOptions);

    detectBrowser()

    var railLayer = new google.maps.KmlLayer('http://www3.septa.org/hackathon/TrainView/regionalrail.kml');
    railLayer.setMap(map);
    intervalID = window.setInterval(drawTrains, 3000);
}

function detectBrowser() {
    var useragent = navigator.userAgent;
    var mapdiv = document.getElementById("map_canvas");

    if (useragent.indexOf('iPhone') != -1 || useragent.indexOf('Android') != -1 ) {
        mapdiv.style.width = '100%';
        mapdiv.style.height = '100%';
    }
}

function Train(data) {
    this.lat = data.lat;
    this.lon = data.lon;
    this.id = data.trainno;
    this.dest = data.dest;
    this.late = data.late;
    this.source = data.SOURCE;
    this.markerImage = 'tanksmall.png';
    this.markerImageLate = 'tanksmallred.png';
    this.title = "Dest: " + this.dest + " LATE: " + this.late;
}

Train.prototype.updateTrain = function(data) {
    this.lat = data.lat;
    this.lon = data.lon;
    this.dest = data.dest;
    this.late = data.late;
    this.source = data.SOURCE;
};

function Trolley(data) {
    this.lat = data.lat;
    this.lon = data.lon;
    this.id = data.VehicleId;
    this.dest = data.dest;
    this.late = data.late;
    this.source = data.SOURCE;
    this.markerImage = 'tanksmall.png';
    this.markerImageLate = 'tanksmallred.png';
    this.title = "Dest: " + this.dest + " LATE: " + this.late;
}


function drawTrains() {
    getTrainData();
    // getTrolleyData();

    goog.array.forEach(newTrains, function (t) {
        tnum = t.trainno || t.VehicleId
        oldTrain = trains[t.trainno];
        if (oldTrain) {
            // delete trains[t.trainno];
            if (oldTrain.lat != t.lat ||
                oldTrain.lon != t.lon ||
                oldTrain.late != t.late) {

                console.log('update');
                trains[t.trainno].updateTrain(t);
                updateMarker(t.trainno);
            }
        } else {
            trains[t.trainno] = new Train(t);
            addMarker(t.trainno);
        }
    });
}

function removeMarker(marker) {
    marker.setMap(null);
}

function updateMarker(tnum) {
    removeMarker(trains[tnum].marker);
    addMarker(tnum);
}

function addMarker(tnum) {
    var myLatlng = new google.maps.LatLng(trains[tnum].lat, trains[tnum].lon);
    var marker = new google.maps.Marker({
        position: myLatlng,
        title: trains[tnum].title,
        icon: trains[tnum].late ?
            trains[tnum].markerImageLate : trains[tnum].markerImage
    });
    trains[tnum].marker = marker;
    // To add the marker to the map, call setMap();
    marker.setMap(map);
}


/***************
 * Septa API stuff
 ***************/

function storeTrains(content) {
    newTrains = []
    newTrains = content;

    // Remove script nodes when we're done with them.
    var nodes = goog.dom.query('script.train-data');
    if (nodes[0]) {
        document.body.removeChild(nodes[0]);
    }
}

function storeTrolleys(content) {
    newTrains = []
    newTrains = content;

    // Remove script nodes when we're done with them.
    var nodes = goog.dom.query('script.trolley-data');
    if (nodes[0]) {
        document.body.removeChild(nodes[0]);
    }
}

function getTrolleyData() {
    goog.array.forEach(tolleyLines, function(line) {
        getTransitData('http://www3.septa.org/hackathon/TransitView/' + line + '?callback=storeTrolleys', 'trolley-node');
    });
}

function getTrainData() {
    getTransitData('http://www3.septa.org/hackathon/TrainView/?callback=storeTrains', 'train-node');
}

function getTransitData(url, className) {
    // create script element
    var script = document.createElement('script');
    // assing src with callback name
    script.src = url;
    script.classList.add(className);
    // insert script to document and load content
    document.body.appendChild(script);
}
