//---Possible API key is going to be used including Foursquare API---

var FOURSQUARE_CLIENTID = 
  'ZCIMYWQFHOGENPXBAK2UVALQZVTFWSMEY4YPTFHZRJ55DO4E';
var FOURSQUARE_CLIENTSECRET = 
  'JWVIRUNRFJH3QAZJF3UHUOYI1J4W1AH0IR54DVI5IK3JEAOE';
var YELP_RESTAURANT_REQUEST = 'https://api.yelp.com/v3/businesses/' +
  'search?term=food&latitude=37.7749&longitude=-122.4194&radius=60' +
  '00&sort_by=review_count';
var YELP_POINT_OF_INTEREST_REQUEST = 'https://api.yelp.com/v3/busi' +
  'nesses/search?term=Sightseeing&latitude=37.7749&longitude=-122.' + 
  '4194&radius=6000&sort_by=review_count';
var YELP_AUTHORIZATION_STRING = 'Bearer ivVR946m7PcXxffeRGdPeaw3SJ' + 
  'ecp0BhamNsTVLcjhBT2Dlv_hQwSIgNuxF6a_AcDg8UP0aUsSWfPZbzgvbYYoExs' + 
  'V2YYKWnr5k_oskgluhetXjRs5eHbZnd-Pp-W3Yx';

//---Construction of icon URLs to be used for marker icon---

var iconBase = 'img/';
var icons = {
  restaurant: {
    icon: iconBase + 'food.png'
  },
  sightseeing: {
    icon: iconBase + 'sightseeing.png'
  }
}

//---Definition of Model---

var Location = function(data, category) {
  this.name = ko.observable(data.name);
  this.lat = ko.observable(data.coordinates.latitude);
  this.long = ko.observable(data.coordinates.longitude);
  this.category = ko.observable(category);
}

// View Model to process the interaction between view and model
var ViewModel =  function() {
  var self = this;
  var largeInfowindow = new google.maps.InfoWindow();
  const restaurant_request = 'https://api.yelp.com/v3/businesses/search?term=food&latitude=37.7749&longitude=-122.4194&radius=6000&sort_by=review_count';
  const sightseeing_request = 'https://api.yelp.com/v3/businesses/search?term=Sightseeing&latitude=37.7749&longitude=-122.4194&radius=6000&sort_by=review_count';

  this.googleMap = createMap({ lat: 37.7749295, lng: -122.4194155 });
  this.restaurantList = [];
  this.sightseeingList = [];
  this.locations  = ko.observableArray([]);
  var geocoder = new google.maps.Geocoder();

  
  document.getElementById('submit').addEventListener('click', function() {
    geocodeAddress(geocoder);
  });

  $.ajax({
    url: restaurant_request,
    beforeSend: function(xhr) {
      xhr.setRequestHeader('Authorization','Bearer ivVR946m7PcXxffeRGdPeaw3SJecp0BhamNsTVLcjhBT2Dlv_hQwSIgNuxF6a_AcDg8UP0aUsSWfPZbzgvbYYoExsV2YYKWnr5k_oskgluhetXjRs5eHbZnd-Pp-W3Yx')
    },
    type: 'GET',
    success: function(result) {

      result.businesses.forEach(function(place){
        self.restaurantList.push(place);
        self.locations.push( new Location(place, 'Restaurant') );
        var dataFromServer = ko.utils.parseJson(place);
      });
      var dataFromServer = ko.toJS(result.businesses);
      console.log(dataFromServer);
      self.mappedData = ko.utils.arrayMap(dataFromServer, function(place) {
        return new Location(place, 'Restaurant');
      });


      ko.utils.arrayForEach(self.mappedData, function(item) {
        console.log(item.category());
        console.log(item.name());
        console.log(item.lat());
        console.log(item.long());
      });

      var restaurant_icon = {
        url: icons.restaurant.icon, // url
        scaledSize: new google.maps.Size(25, 25), // scaled size
        origin: new google.maps.Point(0,0), // origin
        anchor: new google.maps.Point(0, 0) // ancho
      }

      self.restaurantList.forEach(function(place){
        var marker = new google.maps.Marker({
          map: self.googleMap,
          position: { lat: place.coordinates.latitude, lng: place.coordinates.longitude},
          animation: google.maps.Animation.DROP,
          title: place.name,
          icon: restaurant_icon
        });

        marker.addListener('click', function() {
          populateInfoWindow(this, largeInfowindow);
        });
      });

    },
    error: function(error) {
      console.log('Error');
    }
  });

  $.ajax({
    url: sightseeing_request,
    beforeSend: function(xhr) {
      xhr.setRequestHeader('Authorization','Bearer ivVR946m7PcXxffeRGdPeaw3SJecp0BhamNsTVLcjhBT2Dlv_hQwSIgNuxF6a_AcDg8UP0aUsSWfPZbzgvbYYoExsV2YYKWnr5k_oskgluhetXjRs5eHbZnd-Pp-W3Yx')
    },
    type: 'GET',
    success: function(result) {

      result.businesses.forEach(function(place){
        self.sightseeingList.push(place);
      });

      var sightseeing_icon = {
        url: icons.sightseeing.icon, // url
        scaledSize: new google.maps.Size(25, 25), // scaled size
        origin: new google.maps.Point(0,0), // origin
        anchor: new google.maps.Point(0, 0) // ancho
      }

      self.sightseeingList.forEach(function(place){
        var marker = new google.maps.Marker({
          map: self.googleMap,
          position: { lat: place.coordinates.latitude, lng: place.coordinates.longitude},
          animation: google.maps.Animation.DROP,
          title: place.name,
          icon: sightseeing_icon
        });

        marker.addListener('click', function() {
          populateInfoWindow(this, largeInfowindow);
        });

      });

    },
    error: function(error) {
      console.log('Error');
    }
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

  // This function populates the infowindow when the marker is clicked. We'll only allow
  // one infowindow which will open at the marker that is clicked, and populate based
  // on that markers position.
  function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
      // Clear the infowindow content to give the streetview time to load.
      infowindow.setContent('');
      infowindow.marker = marker;
      // Make sure the marker property is cleared if the infowindow is closed.
      infowindow.addListener('closeclick', function() {
        infowindow.marker = null;
      });
      var streetViewService = new google.maps.StreetViewService();
      var radius = 50;
      
      // In case the status is OK, which means the pano was found, compute the
      // position of the streetview image, then calculate the heading, then get a
      // panorama from that and set the options
      function getStreetView(data, status) {
        if (status == google.maps.StreetViewStatus.OK) {
          var nearStreetViewLocation = data.location.latLng;
          var heading = google.maps.geometry.spherical.computeHeading(
            nearStreetViewLocation, marker.position);
            infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
            var panoramaOptions = {
              position: nearStreetViewLocation,
              pov: {
                heading: heading,
                pitch: 30
              }
            };
          var panorama = new google.maps.StreetViewPanorama(
            document.getElementById('pano'), panoramaOptions);
        } else {
          infowindow.setContent('<div>' + marker.title + '</div>' +
            '<div>No Street View Found</div>');
        }
      }

      // Use streetview service to get the closest streetview image within
      // 50 meters of the markers position
      streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
      // Open the infowindow on the correct marker.
      infowindow.open(map, marker);
    }
  }

}

var initMap = function() {
  ko.applyBindings(new ViewModel());


}