//Model\\ 
var model = [{
	name: "Ontario Street Market",
	address: "2235 E Ontario St",
	city: "Philadelphia, PA 19134",
	lat: "39.993176",
	lng: "-75.103212"
},
{
	name: "Classic Game Junkie",
	address: "111 S Easton Rd",
	city: "Glenside, PA 19038",
	lat: "40.199199",
	lng: "-75.153543",
	business_id: "classic-game-junkie-glenside"
},
{
	name: "Brave New Worlds Comics",
	address: "55 N. 2nd Street",
	city: "Philadelphia, PA 19106",
	lat: "39.951431",
	lng: "-75.143038"
},
{
	name: "Atomic City Comics",
	address: "638 South St",
	city: "Philadelphia, PA 19147",
	lat: "39.942272",
	lng: "-75.153540"
},
{
	name: "The Barcade",
	address: "1114 Frankford Ave",
	city: "Philadelphia, PA 19125",
	lat: "39.967563",
	lng: "-75.134624"
}];

//Setup the Google map.
var map;

function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 40.018200, lng: -75.149771},
		zoom: 10,
		scaleControl: true
  	});
};

//Setup info window
var infowindow;

//ViewModel\\
var viewModel = function() {
	var that = this;
	infowindow = new google.maps.InfoWindow();
	var locations = [];
	locations: ko.observableArray(locations)
	query: ko.observable('')
//Uses knockout to filter locations, source: http://opensoul.org/2011/06/23/live-search-with-knockoutjs/
	search: function search(value) {
		viewModel.locations.removeAll();
		for(var x in locations) {
			if (locations[x].name.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
				viewModel.locations.push(locations[x]);
			}
		}
	}
	this.setlocations = function () {
//Loop through model to create locations
		model.forEach(function(data){		
			var marker = new google.maps.Marker({
				map: map,
				position: new google.maps.LatLng(data.lat, data.lng),
				title: data.name,
//Animated map marker
				animation: google.maps.Animation.DROP
			});
			locations.push(marker);
//Call to Yelp API for marker info
			google.maps.event.addListener(marker, 'click', function() {
				yelpInfo(data, map);
			})
		});
	};
	
initMap();
this.setlocations();   
};

//Activate knockout.js on pageload
$(document).ready(function(){
	ko.applyBindings(new viewModel());
});

//Run search filter
viewModel.query.subscribe(viewModel.search);

//Button to show/hide addresses, credit to http://stackoverflow.com/questions/13652835/button-text-toggle-in-jquery
$("button").click(function(){
	$("debug").toggle();
	$(this).text(function(i, text){
		return text === "Show Addresses" ? "Hide Addresses" : "Show Addresses";
	})
});

//Yelp API\\
//Assistance from https://discussions.udacity.com/t/how-to-make-ajax-request-to-yelp-api/13699
var yelpInfo = function (data, map) {
	function nonce_generate() {
		return (Math.floor(Math.random() * 1e12).toString());
	};
		
	var yelp_url = 'http://api.yelp.com/v2/search/';
	
	var yelp_key = 	"upqxNdLlA7BNxrqG3nXNrg";
	var yelp_keySecret = "h2_e_PN_drVfD2gaid5ZBALFg1Q";
	var yelp_token = "Jb3f2kRRSOFsVeyRXipnNuRA9Mj6m5MV";
	var yelp_tokenSecret = "rvlSk00ju7C8P5U9PnOaFM7rKNA";
		
	var parameters = {
		oauth_consumer_key: yelp_key,
		oauth_token: yelp_token,
		oauth_nonce: nonce_generate(),
		oauth_timestamp: Math.floor(Date.now()/1000),
		oauth_signature_method: 'HMAC-SHA1',
		oauth_version: '1.0',
		callback: 'cb',
		term: data.name,
		location: data.city,
		limit: 1
	};
		
	var encodedSignature = oauthSignature.generate('GET',yelp_url, parameters, yelp_keySecret, yelp_tokenSecret);
    	
    parameters.oauth_signature = encodedSignature;	
    	
	var settings = {
  		url: yelp_url,
      	data: parameters,
		cache: true,
    	dataType: 'jsonp',
	    success: function(results) {
			var contentString = '<div>' +
                '<h1>' + results.businesses[0].name + '</h1>' +
                '<h3> Rating: <img src="' + results.businesses[0].rating_img_url + '"</h3>' +
            	'<h3> Phone: ' + results.businesses[0].phone + '</h3>' +
        		'<h3> Address: ' + results.businesses[0].location.display_address + '</h3>' +
                '</div>';
            infowindow.setContent(contentString);
            infowindow.open(map, data.marker);
    	    },
	        fail: function() {
			console.log('Yelp API failed to load.');
    	    }
	    };
// Send AJAX query via jQuery library.
    		$.ajax(settings);
};