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
var infowindow;

function initMap() {
	var self = this;
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 40.018200, lng: -75.149771},
		zoom: 10,
		scaleControl: true
	});

	for (var i = 0; i < model.length; i++){
		var latLng = new google.maps.LatLng(model[i].lat, model[i].lng);
		var marker = model[i].marker = new google.maps.Marker({
			position: latLng,
			map: map,
			title: model[i].name
		});	
		model[i].marker.addListener('click', (function(data) {
			return function(model) {
				yelpInfo(data, this);
	//			infowindow.open(map, data.marker);
			};
		})(model[i]));
	}
	var infowindow = new google.maps.InfoWindow();
	ko.applyBindings(new ViewModel());
}

//Yelp API\\
//Assistance from https://discussions.udacity.com/t/how-to-make-ajax-request-to-yelp-api/13699
//And https://discussions.udacity.com/t/yelp-api-oauth-issue/40606/7
var yelpInfo = function (data, marker) {
// If I declare it here, its does not kick back setContent of Undefined...
	var infowindow = new google.maps.InfoWindow();
	
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
		oauth_timestamp: Math.floor(Date.now() / 1000),
		oauth_signature_method: 'HMAC-SHA1',
		oauth_version: '1.0',
		callback: 'cb',
		term: data.name,
		location: data.city,
		limit: 1
	};

	var encodedSignature = oauthSignature.generate('GET', yelp_url, parameters, yelp_keySecret, yelp_tokenSecret);

	parameters.oauth_signature = encodedSignature;

	var settings = {
		url: yelp_url,
		data: parameters,
		cache: true,
		dataType: 'jsonp',
		success: function(results) {
			var contentString = '<div>' +
				'<p align="center">' + results.businesses[0].name + '</p>' +
				'<p> Rating: <img src="' + results.businesses[0].rating_img_url + '"</p>' +
				'<p> Phone: ' + results.businesses[0].phone + '</p>' +
				'<p> Address: ' + results.businesses[0].location.display_address + '</p>' +
				'</div>';
			infowindow.setContent(contentString);
			infowindow.open(map, this.marker);
			//Test to see if content is being passed
			console.log(infowindow);
		},
	};
	// Send AJAX query via jQuery library.
	$.ajax(settings);
};

// Filter
//Assist from http://stackoverflow.com/questions/29557938/removing-map-pin-with-search
var ViewModel = function() {
	var self = this;
	self.filter = ko.observable("");
	self.searchBar = ko.computed( function() {
		var locations = [];
		model.forEach(function(data) {
			if (data.name.toLowerCase().indexOf(self.filter().toLowerCase()) >= 0) {
				locations.push(data);
				data.marker.setVisible(true);
			}else data.marker.setVisible(false);		
		});
		return locations;
	});	
};

//Button to show/hide addresses, credit to http://stackoverflow.com/questions/13652835/button-text-toggle-in-jquery
$("button").click(function(){
	$(".place").toggle();
	$(this).text(function(i, text){
		return text === "Show Addresses" ? "Hide Addresses" : "Show Addresses";
	})
});