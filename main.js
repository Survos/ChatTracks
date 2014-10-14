var defLat = 34.0983425, defLng = -118.3267434;
var defaultLatLng = new google.maps.LatLng(defLat, defLng);  // Default to Hollywood, CA when no geolocation support
var email = "", interval = 1;
var watch_id = null;    // ID of the geolocation
var tracking_data = []; // Array containing GPS position objects

var map = null;
var markers = [];

var startLat = defLat, startLng = defLng;
var endLat = defLat, endLng = defLng;

$(document).ready(function(){
  //window.localStorage.setItem(track_id, JSON.stringify(tracking_data));
  email = window.localStorage.getItem("email");
  interval = window.localStorage.getItem("interval");
  if(email == null || email == "") {
  	window.location.href = "#setting";
  }else{
  	$("#email").val(email);
  }
  if(interval > 0)
  	$("#slider-step").val(interval).slider("refresh");

  var myOptions = {
    zoom: 7,
    center: latlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP
	};
  map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
});

$(document).on("pageinit", "#map", function(e, data){ 
	 //max_height();
	 winH = $(window).height();
	 $("#map .ui-content").height(winH - 100);
	 
	 if ( navigator.geolocation ) {
        function success(pos) {
            // Location found, show map with these coordinates
            drawMap(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
            startLat = pos.coords.latitude;
            startLng = pos.coords.longitude;
            $("#start_lat").html(pos.coords.latitude);
            $("#start_lng").html(pos.coords.longitude);
        }
        function fail(error) {
             drawMap(defaultLatLng);  // Failed to find location, show default map
		     $("#start_lat").html(defaultLatLng.k);
             $("#start_lng").html(defaultLatLng.A);
            switch(error.code)
	        {
	            case error.PERMISSION_DENIED: 
	            	console.log("user did not share geolocation data");
					break;
	            case error.POSITION_UNAVAILABLE: 
	            	console.log("could not detect current position");
					break;
	            case error.TIMEOUT: 
	            	console.log("retrieving position time out");
					break;
	            default: 
	            	console.log("unknown error");
					break;
	        }
        }
        // Find the users current position.  Cache the location for 5 minutes, timeout after 6 seconds
        navigator.geolocation.getCurrentPosition(success, fail, {maximumAge: 500000, enableHighAccuracy:true, timeout: 6000});
    } else {
        drawMap(defaultLatLng);  // No geolocation support, show default map
    }

});

function goTrack() {
	if($('#track').hasClass('start') == true) {//Start Track
		$('#track').prev('span').find('span.ui-btn-text').text("Stop"); 
		$('#track').addClass('stop');
		$('#track').removeClass('start');
		startTrack();
	}else{
		$('#track').prev('span').find('span.ui-btn-text').text("Go"); 
		$('#track').addClass('start');
		$('#track').removeClass('stop');
		stopTrack();
	}
}

function startTrack() {
	$("#start_lat").html(startLat);
    $("#start_lng").html(startLng);
	reDrawMap();

	frequency = interval * 60 * 1000;
	// Start tracking the User
    watch_id = navigator.geolocation.watchPosition(
     
	    // Success
	    function(pos){
	    	endLat = pos.coords.latitude;
	    	endLng = pos.coords.longitude;
	    	$("#end_lat").html(endLat);
    		$("#end_lng").html(endLng);
	    	drawMap(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
	        tracking_data.push(pos);
	    },
	     
	    // Error
	    function(error){
	        console.log(error);
	    },     
    	// Settings
    	{ frequency: frequency, enableHighAccuracy: true }
    );
}

function stopTrack() {
	startLat = endLat;
	startLng = endLng;
	$("#end_lat").html(endLat);
	$("#end_lng").html(endLng);
	// Stop tracking the user
  navigator.geolocation.clearWatch(watch_id);
   
  // Save the tracking data
  window.localStorage.setItem("track_id", JSON.stringify(tracking_data));
 
  // Reset watch_id and tracking_data 
  var watch_id = null;
  var tracking_data = null;
}

function drawMap(latlng) {
  var myOptions = {
    zoom: 7,
    center: latlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP
	};
  map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
   
   startPos = new google.maps.LatLng(startLat, startLng);
    // Add an overlay to the map of current lat/lng
    var marker = new google.maps.Marker({
        position: startPos,
        map: map,
        title: "Greetings!"
    });
    markers.push(marker);

    endPos = new google.maps.LatLng(endLat, endLng);
     // Add an overlay to the map of current lat/lng
    marker = new google.maps.Marker({
        position: endPos,
        map: map,
        title: "Greetings!"
    });
    markers.push(marker);
}

function reDrawMap() {
 
   deleteMarkers();
   
   startPos = new google.maps.LatLng(startLat, startLng);
    // Add an overlay to the map of current lat/lng
    var marker = new google.maps.Marker({
        position: startPos,
        map: map,
        title: "Greetings!"
    });
    markers.push(marker);
}

// Sets the map on all markers in the array.
function setAllMap(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
  setAllMap(null);
}

// Shows any markers currently in the array.
function showMarkers() {
  setAllMap(map);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
  clearMarkers();
  markers = [];
}

function max_height() {
    var header = $.mobile.activePage.find("div[data-role='header']:visible");
    var footer = $.mobile.activePage.find("div[data-role='footer']:visible");
    var content = $.mobile.activePage.find("div[data-role='content']:visible:visible");
    var viewport_height = $(window).height();
    
    var content_height = viewport_height - header.outerHeight() - footer.outerHeight();
    if((content.outerHeight() - header.outerHeight() - footer.outerHeight()) <= viewport_height) {
        content_height -= (content.outerHeight() - content.height());
    } 
    $.mobile.activePage.find('[data-role="content"]').height(content_height);
}


function onSave() {
	email = $("#email").val();
	interval = $("#slider-step").val();
	if(validateEmail(email) == true)
		window.localStorage.setItem("email", email);

	window.localStorage.setItem("interval", interval);
}

function validateEmail($email) {
  var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
  if( !emailReg.test( $email ) ) {
    return false;
  } else {
    return true;
  }
}


