/**
 * Created by karachungen on 6/20/14.
 */

var map;

function displayMap(container, options, callback) {


	initialize(container, options, callback);


}

function initialize(container, options, callback) {

	getHtmlLocation(options, function (options) {

		options.center = new google.maps.LatLng(options.lat, options.lng);
		map = new google.maps.Map(document.getElementById(container),
			options);

		if (callback && typeof callback === "function") {
			callback();
		}
	})


}


function addMarker(options) {

	return showMarker(options);

}

function showMarker(options) {


	var dragMarker = new google.maps.Marker(options);

	map.setCenter(dragMarker.position);
	dragMarker.setMap(map);
	return dragMarker;


}

function handleNoGeolocation(errorFlag) {
	if (errorFlag) {
		var content = 'Error: The Geolocation service failed.';
	} else {
		var content = 'Error: Your browser doesn\'t support geolocation.';
	}

	alert(content);
}

function listenMarkerPosition(marker, calback) {
	google.maps.event.addListener(marker, 'dragend', function (evt) {

		position = {
			latitude: evt.latLng.lat(),
			longitude: evt.latLng.lng()
		}

		calback(position);

	});
}


function getHtmlLocation(defaultOptions, callback) {


	if (navigator.geolocation) {
		browserSupportFlag = true;
		navigator.geolocation.getCurrentPosition(function (position) {
			callback(position);
			callback({
				result: "success",
				lat: position.coords.latitude,
				lng: position.coords.longitude,
				zoom: defaultOptions.zoom
			});
		}, function () {

			callback({
				result: "error",
				type: "failed_to_get",
				lat: defaultOptions.lat,
				lng: defaultOptions.lng,
				zoom: defaultOptions.zoom
			});
		});
	}
	// Browser doesn't support Geolocation
	else {
		callback({
			result: "error",
			type: "not_supported",
			lat: defaultOptions.lat,
			lng: defaultOptions.lng,
			zoom: defaultOptions.zoom

		});
	}

}