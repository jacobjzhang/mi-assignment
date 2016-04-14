/**
 *	This is my submission for Movable Ink's Solutions Engineering coding challenge.
 *	Components were separated and commented in the most logical and readable way. 
 *
 *	@author Jacob J. Zhang
 *	@date April 14, 2016
 *
 */

///////////////////

(function(){

	/**
	 * This function is used to get the parameters from the URL. Exceptions are made for
	 * empty parameters, trailing &s, and special or encoded characters.
	 */
 	
	var params = (function getParams() {
		var params = {};
		var query = window.location.search.substr(1).split("&");
		for (var i = 0, max = query.length; i < max; i++)
		{
			// Check for trailing "&"s or empty parameters
		    if (query[i] === "")
		        continue;

		    // Split key and value
		    var param = query[i].split("=");

		    // Assign the key-value pairs to the global getParams object for use
		    // decodeURIComponent is used for encoded characters
		   	params[decodeURIComponent(param[0])] = decodeURIComponent(param[1] || "");
		}
		return params;
	})();


	/**
	 * These functions are used to grab the JSON data and parse it.
	 */

 	// API call to grab the geography information
 	function fetchGeoInfo() {
		var address =
			// "https://jsonp.nodejitsu.com/?url=" + 
			"http://api.wunderground.com/api/e0d2b72c995eb908/geolookup/q/" + 	// Optional cors proxy
			params.zip_code + ".json";
	
 		return $.ajax({
		  url : address,
		  dataType : "jsonp"
		});
 	}

 	// API call to grab the forecast information
 	function fetchForeCastInfo(city) {
 		var address =
			// "https://jsonp.nodejitsu.com/?url=" + 
			"http://api.wunderground.com/api/e0d2b72c995eb908/forecast10day/q/" + 	// Optional cors proxy
			params.zip_code + ".json";

 		return $.ajax({
		  url : address,
		  dataType : "jsonp"
		});
 	}


	/**
	 * Helper functions.
	 * getUpcomingDays() determines which 3 forecasts to grab for display.
	 * isToday() determines if it's today.
	 * dateFormat() standardizes dates by forcing a 0 if necesary.
	 */

	function getUpcomingDays(data, firstDay) {
		var dates = data.map(function(e) { return dateFormat(e.date.month + "/" + e.date.day + "/" + e.date.year) });
		var index = dates.indexOf(firstDay);
		return data.slice(index, index+3);
	}

	function isToday(date) {
		var today = new Date();
		return date.month.toString().substr(-1) == today.getMonth()+1 
				&& date.day == today.getDate();
	};

	function dateFormat(date) {
		var splitDate = date.toString().split("/");
		for (var i = 0; i < 2; i++) {
			if (splitDate[i].length < 2) { splitDate[i] = "0" + splitDate[i] };
		};
		return splitDate.join("/");
	}

	/**
	 * Functions to generate the visual weather dashboard using jQuery.
	 */

	 // Get the header title
	function renderHeader(c) { 
		return "Weather Forecast for " + c; 
	}

	// Create the report body with icon, conditions, temperatures for each report.
	function renderForecastBody(day) {
		var icon = 'http://icons.wxug.com/i/c/g/' + day.icon + '.gif';
		var report = $('<div/>', {'class':'reportSingle'})
		   .append($('<div/>', {
		   		'class':'reportHeader',
		   		'text': isToday(day.date) ? "Today" : day.date.weekday + ":"
		   		}))
		   .append($('<div/>', {'class':'reportBody'})
		   		.html($("<img/>")
		   			.attr({'class':'tempIcon','src':icon}))
		   		.append($('<div/>', {'class':'temperature'})
		   			.html(day.conditions + "<br /><strong>" + day.high.fahrenheit + "&deg;</strong> / " + day.low.fahrenheit + "&deg; F")
		   		)
		   	);

		return $('<div>').append(report).html(); 
	};

 	// Sorting the data out and passing it to the renderFC function
	function formatData(geoCityData, forecastData) {
		var location = geoCityData[0].location;
				var forecasts = forecastData[0].forecast.simpleforecast.forecastday;
		     	
		     	// Concatenate city-state for full city name
		     	var cityName = location.city + ", " + location.state;

				  return {
				  	'city' : cityName,
				  	'threeFC' : getUpcomingDays(forecasts, dateFormat(params.date))
				  }
	}

	// Creating the containers
	function renderFC(data) {
		return $('<div class="container"/>')
				.append(
					$('<div class="headerRow"/>')
						.append($('<h1/>')
							.text(renderHeader(data.city))
						)
				)
				.append(
					$('<div class="forecastRow" />')
						.append(data.threeFC.map(day => renderForecastBody(day)).join(""))		// Create a report for each day
				);
	};

	 // Waiting for both ajax calls to load before rendering
	jQuery(document).ready(function($) {
		$.when(fetchGeoInfo(), fetchForeCastInfo()).then(function(geoCityData, forecastData) {
			var data = formatData(geoCityData, forecastData);
			$("body").append(renderFC(data));
		})
	});

}());