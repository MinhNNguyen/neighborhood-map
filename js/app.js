//--- Adding CORS anywhere that adds CORS headers to the proxied request ---
//---Possible API key is going to be used including Foursquare API---

var YELP_RESTAURANT_REQUEST = 'https://cors-anywhere.herokuapp.com/' +
  'https://api.yelp.com/v3/businesses/' +
  'search?term=food&latitude=37.7749&longitude=-122.4194&radius=60' +
  '00&sort_by=review_count&limit=10';
var YELP_LANDMARK_REQUEST = 'https://cors-anywhere.herokuapp.com/' +
  'https://api.yelp.com/v3/busi' +
  'nesses/search?term=Sightseeing&latitude=37.7749&longitude=-122.' +
  '4194&radius=6000&sort_by=review_count&limit=10';
var YELP_MUSEUS_REQUEST = 'https://cors-anywhere.herokuapp.com/' +
  'https://api.yelp.com/v3/busi' +
  'nesses/search?term=Museums&latitude=37.7749&longitude=-122.' + 
  '4194&radius=6000&sort_by=review_count&limit=10';
var YELP_HOTELS_REQUEST = 'https://cors-anywhere.herokuapp.com/' +
  'https://api.yelp.com/v3/busi' +
  'nesses/search?term=hotels&latitude=37.7749&longitude=-122.' + 
  '4194&radius=6000&sort_by=review_count&limit=10';
var YELP_AUTHORIZATION_STRING = 'Bearer ivVR946m7PcXxffeRGdPeaw3SJ' +
  'ecp0BhamNsTVLcjhBT2Dlv_hQwSIgNuxF6a_AcDg8UP0aUsSWfPZbzgvbYYoExs' +
  'V2YYKWnr5k_oskgluhetXjRs5eHbZnd-Pp-W3Yx';


//---Construction of icon URLs to be used for marker icon---

var iconBase = 'img/';
var icons = {
  restaurant: {
    icon: iconBase + 'restaurant.png'
  },
  landmark: {
    icon: iconBase + 'landmark.png'
  },
  hotel: {
    icon: iconBase + 'hotel.png'
  },
  museum: {
    icon: iconBase + 'museum.png'
  }
}

//---Definition of Model---

var Location = function(data, category) {
  this.name = ko.observable(data.name);
  this.lat = ko.observable(data.coordinates.latitude);
  this.long = ko.observable(data.coordinates.longitude);
  this.review_count = ko.observable(data.review_count);
  this.rating = ko.observable(data.rating);
  this.category = ko.observable(category);
  this.visible = ko.observable(true);
  this.marker = ko.observable(null);

}

//---View Model that defines how the user interact with elements in
//---the interface and data stored in the database---

var ViewModel =  function() {

  var self = this;
  var largeInfowindow = new google.maps.InfoWindow();
  this.googleMap = createMap({ lat: 37.7749295, lng: -122.4194155 });
  this.locationList = ko.observableArray([]);
  var geocoder = new google.maps.Geocoder();
  var show_restaurant = true;
  var show_landmark = true;
  var show_museum = true;
  var show_hotel = true;
  var search_word = '';
  var viewport_width = $(window).width();
  this.currentLocation = ko.observable();

  // Icon that is going to be used for marker on the map

  var restaurant_icon = {
    url: icons.restaurant.icon, // url
    scaledSize: viewport_width > 1000 ? new google.maps.Size(25, 25)
      : new google.maps.Size(50, 50), // scaled size
    origin: new google.maps.Point(0,0), // origin
    anchor: new google.maps.Point(0, 0) // ancho
  }

  var landmark_icon = {
    url: icons.landmark.icon, // url
    scaledSize: viewport_width > 1000 ? new google.maps.Size(25, 25)
      : new google.maps.Size(50, 50), // scaled size
    origin: new google.maps.Point(0,0), // origin
    anchor: new google.maps.Point(0, 0) // anchor
  }

  var hotel_icon = {
    url: icons.hotel.icon, // url
    scaledSize: viewport_width > 1000 ? new google.maps.Size(25, 25)
      : new google.maps.Size(50, 50), // scaled size
    origin: new google.maps.Point(0,0), // origin
    anchor: new google.maps.Point(0, 0) // anchor
  }

  var museum_icon = {
    url: icons.museum.icon, // url
    scaledSize: viewport_width > 1000 ? new google.maps.Size(25, 25)
      : new google.maps.Size(50, 50), // scaled size
    origin: new google.maps.Point(0,0), // origin
    anchor: new google.maps.Point(0, 0) // anchor
  }

  // Event listeners to button on the navigation bar

  // document.getElementById('relocate').addEventListener('click', 
  //   function() {
  //   geocodeAddress(geocoder);
  // });

  document.getElementById('toggle-restaurant').addEventListener(
    'click', function() {
    show_restaurant = !show_restaurant;
    updateList();
    renderMarker();
  });

  document.getElementById('toggle-landmark').addEventListener(
    'click', function() {
    show_landmark = !show_landmark;
    updateList();
    renderMarker();
  });

  document.getElementById('toggle-hotel').addEventListener(
    'click', function() {
    show_hotel = !show_hotel;
    updateList();
    renderMarker();
  });

  document.getElementById('toggle-museum').addEventListener(
    'click', function() {
    show_museum= !show_museum;
    updateList();
    renderMarker();
  });

  document.getElementById('search').addEventListener('click', 
    function() {
      search_word = $('#keyword').val();
      updateList();
      renderMarker();
  });

  document.getElementById('clear-search').addEventListener('click', 
    function() {
      search_word = "";
      show_museum = true;
      show_landmark = true;
      show_hotel = true;
      show_restaurant = true;
      $('#keyword').val('');
      updateList();
      renderMarker();
  });


  // Helper function to update the visible items appearing on the 
  // list
  function updateList() {
    ko.utils.arrayForEach(self.locationList(), function(place) {
      if ( (place.category() == 'Restaurant' && show_restaurant) ||
        (place.category() == 'Landmark' && show_landmark) ||
        (place.category() == 'Hotel' && show_hotel) ||
        (place.category() == 'Museum' && show_museum) ) {
        if ( search_word == "" || place.name().match(search_word)) {
          place.visible(true);
        }
        else {
          place.visible(false);
        }
      }
      else {
        place.visible(false);
      }
    });
  }


  // Helper function to hide and show the marker on the map according
  // to the location showing on the left list
  function renderMarker() {
    ko.utils.arrayForEach(self.locationList(), function(place) {
      if ( place.visible() ) {
        place.marker().setVisible(true);
      }
      else {
        place.marker().setVisible(false);
      }
    });
  };

  // The asynchronous call to Yelp Fusion API to extract the
  // information of the most popular locations in the area. The data
  // being received will be stored in the model objects and populate
  // the list of locations and their respective markers

  $.ajax({
    url: YELP_RESTAURANT_REQUEST,
    beforeSend: function(xhr) {
      xhr.setRequestHeader('Authorization',YELP_AUTHORIZATION_STRING)
    },
    type: 'GET',
    success: function(result) {
      
      var dataFromServer = ko.toJS(result.businesses);
      ko.utils.arrayMap(dataFromServer, function(place) {
        
        var newPlace = new Location(place,'Restaurant');

        // Creating the marker object based on the info of location
        var marker = new google.maps.Marker({
          map: self.googleMap,
          position: { lat: place.coordinates.latitude, 
            lng: place.coordinates.longitude},
          animation: google.maps.Animation.DROP,
          title: place.name,
          phone: place.display_phone,
          rating: place.rating,
          review_count: place.review_count,
          icon: restaurant_icon,
          visible: true
        });

        // Add event listener to the marker object
        marker.addListener('click', function() {
          ko.utils.arrayForEach(self.locationList(), function(place) 
          {
            if (place.marker().getAnimation() != null) {
              place.marker().setAnimation(null);
            }
          });
          marker.setAnimation(google.maps.Animation.BOUNCE);
          populateInfoWindow(this, largeInfowindow);
      
        });

        newPlace.marker(marker);
        self.locationList.push(newPlace);

      });

      // Sort the location list on alphabetical order
      self.locationList.sort(function(left, right) {
        return left.name() == right.name() ? 0 : 
        (left.name() < right.name() ? -1 : 1);
      });

    },
    error: function(error) {
      console.log('Error');
    }
  });

  $.ajax({
    url: YELP_LANDMARK_REQUEST,
    beforeSend: function(xhr) {
      xhr.setRequestHeader('Authorization',YELP_AUTHORIZATION_STRING)
    },
    type: 'GET',
    success: function(result) {
      
      var dataFromServer = ko.toJS(result.businesses);
      ko.utils.arrayMap(dataFromServer, function(place) {
        
        var newPlace = new Location(place,'Landmark');

        // Creating the marker object based on the info of location
        var marker = new google.maps.Marker({
          map: self.googleMap,
          position: { lat: place.coordinates.latitude, 
            lng: place.coordinates.longitude},
          animation: google.maps.Animation.DROP,
          title: place.name,
          phone: place.display_phone,
          rating: place.rating,
          review_count: place.review_count,
          icon: landmark_icon,
          visible: true
        });

        // Add event listener to the marker object
        marker.addListener('click', function() {
          ko.utils.arrayForEach(self.locationList(), function(place) 
          {
            if (place.marker().getAnimation() != null) {
              place.marker().setAnimation(null);
            }
          });
          marker.setAnimation(google.maps.Animation.BOUNCE);
          populateInfoWindow(this, largeInfowindow);
      
        });

        newPlace.marker(marker);
        self.locationList.push(newPlace);

      });

      // Sort the location list on alphabetical order
      self.locationList.sort(function(left, right) {
        return left.name() == right.name() ? 0 : 
        (left.name() < right.name() ? -1 : 1);
      });

    },
    error: function(error) {
      console.log('Error');
    }
  });

  $.ajax({
    url: YELP_HOTELS_REQUEST,
    beforeSend: function(xhr) {
      xhr.setRequestHeader('Authorization',YELP_AUTHORIZATION_STRING)
    },
    type: 'GET',
    success: function(result) {
      
      var dataFromServer = ko.toJS(result.businesses);
      ko.utils.arrayMap(dataFromServer, function(place) {
        
        var newPlace = new Location(place,'Hotel');

        // Creating the marker object based on the info of location
        var marker = new google.maps.Marker({
          map: self.googleMap,
          position: { lat: place.coordinates.latitude, 
            lng: place.coordinates.longitude},
          animation: google.maps.Animation.DROP,
          title: place.name,
          phone: place.display_phone,
          rating: place.rating,
          review_count: place.review_count,
          icon: hotel_icon,
          visible: true
        });

        // Add event listener to the marker object
        marker.addListener('click', function() {
          ko.utils.arrayForEach(self.locationList(), function(place) 
          {
            if (place.marker().getAnimation() != null) {
              place.marker().setAnimation(null);
            }
          });
          marker.setAnimation(google.maps.Animation.BOUNCE);
          populateInfoWindow(this, largeInfowindow);
      
        });

        newPlace.marker(marker);
        self.locationList.push(newPlace);

      });

      // Sort the location list on alphabetical order
      self.locationList.sort(function(left, right) {
        return left.name() == right.name() ? 0 : 
        (left.name() < right.name() ? -1 : 1);
      });

    },
    error: function(error) {
      console.log('Error');
    }
  });

  $.ajax({
    url: YELP_MUSEUS_REQUEST,
    beforeSend: function(xhr) {
      xhr.setRequestHeader('Authorization',YELP_AUTHORIZATION_STRING)
    },
    type: 'GET',
    success: function(result) {
      
      var dataFromServer = ko.toJS(result.businesses);
      ko.utils.arrayMap(dataFromServer, function(place) {
        
        var newPlace = new Location(place,'Museum');

        // Creating the marker object based on the info of location
        var marker = new google.maps.Marker({
          map: self.googleMap,
          position: { lat: place.coordinates.latitude, 
            lng: place.coordinates.longitude},
          animation: google.maps.Animation.DROP,
          title: place.name,
          phone: place.display_phone,
          rating: place.rating,
          review_count: place.review_count,
          icon: museum_icon,
          visible: true
        });

        // Add event listener to the marker object
        marker.addListener('click', function() {
          ko.utils.arrayForEach(self.locationList(), function(place) 
          {
            if (place.marker().getAnimation() != null) {
              place.marker().setAnimation(null);
            }
          });
          marker.setAnimation(google.maps.Animation.BOUNCE);
          populateInfoWindow(this, largeInfowindow);
      
        });

        newPlace.marker(marker);
        self.locationList.push(newPlace);

      });

      // Sort the location list on alphabetical order
      self.locationList.sort(function(left, right) {
        return left.name() == right.name() ? 0 : 
        (left.name() < right.name() ? -1 : 1);
      });

    },
    error: function(error) {
      console.log('Error');
    }
  });

  // Return the map being created using Google API
  function createMap(latLng) {
    return new google.maps.Map(document.getElementById('map'), {
      center: latLng,
      zoom: viewport_width > 1000 ? 13 : 15,
      gmarkers: [],
    });
  }

/**
  function geocodeAddress(geocoder) {
    var address = document.getElementById('address').value;
    geocoder.geocode({'address': address}, function(results, status)
    {
      if (status === google.maps.GeocoderStatus.OK) {
        self.googleMap.setCenter(results[0].geometry.location);
        document.getElementById('firstComponent').innerHTML =
        'The Formatted Address is: ' + results[0].formatted_address;
        document.getElementById('secondComponent').innerHTML =
        'The Location is: ' + results[0].geometry.location;
      } else {
        alert('Geocode was not successful for the following reason: '
         + status);
      }
    });
  }
*/

  // This function populates the infowindow when the marker is 
  // clicked. We'll only allow one infowindow which will open at the
  // marker that is clicked, and populate basedon that markers
  // position.

  function populateInfoWindow(marker, infowindow) {

    // Check to make sure the infowindow is not already
    // opened on this marker.

    if (infowindow.marker != marker) {

      // Clear the infowindow content to give the streetview
      // time to load.

      infowindow.setContent('');
      infowindow.marker = marker;

      // Make sure the marker property is cleared if the infowindow
      // is closed.

      infowindow.addListener('closeclick', function() {
        infowindow.marker = null;
      });
      var streetViewService = new google.maps.StreetViewService();
      var radius = 50;
      
      // In case the status is OK, which means the pano was found,
      // compute the position of the streetview image, then calculate
      // the heading, then get a panorama from that and set the
      // options.

      function getStreetView(data, status) {
        if (status == google.maps.StreetViewStatus.OK) {
          var nearStreetViewLocation = data.location.latLng;
          var heading = google.maps.geometry.spherical.
          computeHeading(nearStreetViewLocation, marker.position);
            infowindow.setContent('<div id="window-content"><h2>' + 
              marker.title + '</h2><p>Phone: ' + marker.phone + 
             '</p><p>Yelp Rating: ' + marker.rating +
             '</p><p>Yelp Review Count: ' + marker.review_count +
             '</p></div><div id="pano"></div>');
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

      // Use streetview service to get the closest streetview image
      // within 50 meters of the markers position

      streetViewService.getPanoramaByLocation(marker.position,
       radius, getStreetView);

      // Open the infowindow on the correct marker.

      infowindow.open(map, marker);
    }
  }

  // The function to help refocus into the location being clicked
  // on the list
  this.refocus = function() {
    self.currentLocation(this);
    ko.utils.arrayForEach(self.locationList(), function(place) {
      if (place.marker().getAnimation() != null) {
        place.marker().setAnimation(null);
      }
    });
    this.marker().setAnimation(google.maps.Animation.BOUNCE);
    populateInfoWindow(this.marker(), largeInfowindow);
  }

}

// Initiate the whole map and bind the view model with the view
var initMap = function() {
  ko.applyBindings(new ViewModel());
}

var googleError = function() {
  console.log('Error when loading Google map');
}
