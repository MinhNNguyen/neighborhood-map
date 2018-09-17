//---Possible API key is going to be used including Foursquare API---
//---Possible Hotels and museus added to the list

var FOURSQUARE_CLIENTID = 
  'ZCIMYWQFHOGENPXBAK2UVALQZVTFWSMEY4YPTFHZRJ55DO4E';
var FOURSQUARE_CLIENTSECRET = 
  'JWVIRUNRFJH3QAZJF3UHUOYI1J4W1AH0IR54DVI5IK3JEAOE';
var YELP_RESTAURANT_REQUEST = 'https://api.yelp.com/v3/businesses/' +
  'search?term=food&latitude=37.7749&longitude=-122.4194&radius=60' +
  '00&sort_by=review_count&limit=10';
var YELP_LANDMARK_REQUEST = 'https://api.yelp.com/v3/busi' +
  'nesses/search?term=Sightseeing&latitude=37.7749&longitude=-122.' + 
  '4194&radius=6000&sort_by=review_count&limit=10';
var YELP_MUSEUS_REQUEST = 'https://api.yelp.com/v3/busi' +
  'nesses/search?term=Museums&latitude=37.7749&longitude=-122.' + 
  '4194&radius=6000&sort_by=review_count&limit=10';
var YELP_HOTELS_REQUEST = 'https://api.yelp.com/v3/busi' +
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
  this.currentLocation = ko.observable();

  // Icon that is going to be used for marker on the map

  var restaurant_icon = {
    url: icons.restaurant.icon, // url
    scaledSize: new google.maps.Size(25, 25), // scaled size
    origin: new google.maps.Point(0,0), // origin
    anchor: new google.maps.Point(0, 0) // ancho
  }

  var landmark_icon = {
    url: icons.landmark.icon, // url
    scaledSize: new google.maps.Size(25, 25), // scaled size
    origin: new google.maps.Point(0,0), // origin
    anchor: new google.maps.Point(0, 0) // anchor
  }

  var hotel_icon = {
    url: icons.hotel.icon, // url
    scaledSize: new google.maps.Size(25, 25), // scaled size
    origin: new google.maps.Point(0,0), // origin
    anchor: new google.maps.Point(0, 0) // anchor
  }

  var museum_icon = {
    url: icons.museum.icon, // url
    scaledSize: new google.maps.Size(25, 25), // scaled size
    origin: new google.maps.Point(0,0), // origin
    anchor: new google.maps.Point(0, 0) // anchor
  }

  // Event listeners to button on the navigation bar

  document.getElementById('relocate').addEventListener('click', 
    function() {
    geocodeAddress(geocoder);
  });

  document.getElementById('toggle-restaurant').addEventListener('click', 
    function() {
    show_restaurant = !show_restaurant;
    updateList();
    renderMarker();
  });

  document.getElementById('toggle-landmark').addEventListener('click', 
    function() {
    show_landmark = !show_landmark;
    updateList();
    renderMarker();
  });

  document.getElementById('toggle-hotel').addEventListener('click', 
    function() {
    show_hotel = !show_hotel;
    updateList();
    renderMarker();
  });

  document.getElementById('toggle-museum').addEventListener('click', 
    function() {
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
  // information of the most popular location in the area. The data
  // being received will be stored in the model objects and populate
  // onto the map as markers

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

        var marker = new google.maps.Marker({
          map: self.googleMap,
          position: { lat: place.coordinates.latitude, 
            lng: place.coordinates.longitude},
          animation: google.maps.Animation.DROP,
          title: place.name,
          icon: restaurant_icon,
          visible: true
        });

        marker.addListener('click', function() {
          ko.utils.arrayForEach(self.locationList(), function(place) {
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

        var marker = new google.maps.Marker({
          map: self.googleMap,
          position: { lat: place.coordinates.latitude, 
            lng: place.coordinates.longitude},
          animation: google.maps.Animation.DROP,
          title: place.name,
          icon: landmark_icon,
          visible: true
        });

        marker.addListener('click', function() {
          ko.utils.arrayForEach(self.locationList(), function(place) {
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

        var marker = new google.maps.Marker({
          map: self.googleMap,
          position: { lat: place.coordinates.latitude, 
            lng: place.coordinates.longitude},
          animation: google.maps.Animation.DROP,
          title: place.name,
          icon: museum_icon,
          visible: true
        });

        marker.addListener('click', function() {
          ko.utils.arrayForEach(self.locationList(), function(place) {
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

        var marker = new google.maps.Marker({
          map: self.googleMap,
          position: { lat: place.coordinates.latitude, 
            lng: place.coordinates.longitude},
          animation: google.maps.Animation.DROP,
          title: place.name,
          icon: hotel_icon,
          visible: true
        });

        marker.addListener('click', function() {
          ko.utils.arrayForEach(self.locationList(), function(place) {
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

    },
    error: function(error) {
      console.log('Error');
    }
  });

  this.tableData = ko.computed(function() {
    var data = ko.unwrap(self.restaurantList);
    var res = ko.observableArray();

    for ( var i in data) {
      res.push({ name: data[i].name});
    }

    return res;
  }, this)

  function createMap(latLng) {
    return new google.maps.Map(document.getElementById('map'), {
      center: latLng,
      zoom: 13,
      gmarkers: [],
    });
  }

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
            infowindow.setContent('<div>' + marker.title +
             '</div><div id="pano"></div>');
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

var initMap = function() {
  ko.applyBindings(new ViewModel());
}