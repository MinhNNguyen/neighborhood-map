var locations = [
  {title: 'Park Ave Penthouse', location: {lat: 40.7713024, lng: -73.9632393}},
  {title: 'Chelsea Loft', location: {lat: 40.7444883, lng: -73.9949465}},
  {title: 'Union Square Open Floor Plan', location: {lat: 40.7347062, lng: -73.9895759}},
  {title: 'East Village Hip Studio', location: {lat: 40.7281777, lng: -73.984377}},
  {title: 'TriBeCa Artsy Bachelor Pad', location: {lat: 40.7195264, lng: -74.0089934}},
  {title: 'Chinatown Homey Space', location: {lat: 40.7180628, lng: -73.9961237}}
];

// Location Model to store the data of the location
var Location = function(data) {
  this.name = ko.observable(data.name);
  this.latLng = ko.observable(data.latLng);
  this.marker = null;
}

// View Model to process the interaction between view and model
var ViewModel =  function() {
  var self = this;

  this.googleMap = createMap({ lat: 37.7749295, lng: -122.4194155 });
  this.locationList = [];
  var geocoder = new google.maps.Geocoder();
  
  document.getElementById('submit').addEventListener('click', function() {
    geocodeAddress(geocoder);
  });

  locations.forEach(function(place){
    var markerInfo = new google.maps.Marker({
      map: self.googleMap,
      position: place.location,
      animation: google.maps.Animation.DROP,
      title: place.title
    });
  });

  function createMap(latLng) {
    return new google.maps.Map(document.getElementById('map'), {
      center: latLng,
      zoom: 13
    });
  }

  function geocodeAddress(geocoder) {
    var address = document.getElementById('address').value;
    geocoder.geocode({'address': address}, function(results, status) {
      if (status === google.maps.GeocoderStatus.OK) {
        self.googleMap.setCenter(results[0].geometry.location);
        document.getElementById('firstComponent').innerHTML="The Formatted Address is: " + results[0].formatted_address; // PUT STUFF HERE
        document.getElementById('secondComponent').innerHTML="The Location is: " + results[0].geometry.location;
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
  }

}

var initMap = function() {
  ko.applyBindings(new ViewModel());


}


// init(){

//     var locationList = [
//        { name: 'New York', latLng: { lat: 40.786998, lng: -73.975664 } },
//        { name: 'San Francisco', latLng: { lat: 37.763061, lng: -122.431935 } },
//        { name: 'Los Angeles', latLng: { lat: 34.079078, lng: -118.242818 } }
//     ];
//     var googleMap = createMap();
//     ko.applyBindings(new koViewModel(googleMap,locationList));

//    });

// var koViewModel = function(map,locationList) {
//   var self = this;

//   self.googleMap = map;

//   self.allPlaces = [];
//     locationList.forEach(function(place) {
//       self.allPlaces.push(new Place(place));
//   });

//   self.allPlaces.forEach(function(place) {
//     var markerOptions = {
//       map: self.googleMap,
//       position: place.latLng,
//       animation: google.maps.Animation.DROP,
//     };

//     place.marker = new google.maps.Marker(markerOptions);
//   });

//   self.visiblePlaces = ko.observableArray();

//   self.allPlaces.forEach(function(place) {
//     self.visiblePlaces.push(place);
//   });

//   self.userInput = ko.observable('');

//   self.filterMarkers = function() {
//     var searchInput = self.userInput().toLowerCase();

//     self.visiblePlaces.removeAll();

//     self.allPlaces.forEach(function(place) {
//       place.marker.setMap(null);

//       if (place.name.toLowerCase().indexOf(searchInput) !== -1) {
//         self.visiblePlaces.push(place);
//       }
//     });

//     self.visiblePlaces().forEach(function(place) {
//       place.marker.setMap(self.googleMap);
//     });
//   };

//   function Place(dataObj) {
//     this.name = dataObj.name;
//     this.latLng = dataObj.latLng;
//     this.marker = null;
//   }
  
// };






// google.maps.event.addDomListener(window, 'load', function(){

//     var locationList = [
//        { name: 'New York', latLng: { lat: 40.786998, lng: -73.975664 } },
//        { name: 'San Francisco', latLng: { lat: 37.763061, lng: -122.431935 } },
//        { name: 'Los Angeles', latLng: { lat: 34.079078, lng: -118.242818 } }
//     ];
//     var googleMap = createMap();
//     ko.applyBindings(new koViewModel(googleMap,locationList));

// });