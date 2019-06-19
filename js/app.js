
// ===================== MATERIALIZE PARALLAX =======================
$(document).ready(function () {
    $('.parallax').parallax();
    $('select').formSelect();
    $('.collapsible').collapsible();
});

// $(document).ready(function(){
//     $('select').formSelect();
// });

var address = ""
var directionsService;
var directionsDisplay;
var travelModes = "";


// ================= YELP API CODE =========================

$('#submitbtn').click((event) => {
    event.preventDefault();
    var search = $("#locationInput").val().trim();
    console.log($("select").val());
    travelModes = $("select").val();
    
    if (search !== "") {
        $("#yelpResultsHead").empty();
        $("#yelpResultsBody").empty();


        console.log(search);
        var settings = {
            "async": true,
            "crossDomain": true,
            "url": `https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?term=dogs+allowed&categories=restaurants,bars&open_now=true&sort_by=distance&location=${search}`,
            "method": "GET",
            "headers": {
                "authorization": "Bearer ihVP2hKWKW9WzVdT4qSWFpCwEapkAgAVJaACZR9ff15HOCB5bk6Wdw9ZGS3fQhKgZ18sZ9Mm-62ph17r7u9fsPibzKI2u5AbdIBwQ0dmRNNBG7Rkz7N9USEoxPYDXXYx",
                "cache-control": "no-cache",
                "postman-token": "3f23d8c3-ce48-a224-50c0-14b9094948fc"
            }
        }

        $.ajax(settings).done(function (response) {
            console.log(response);

            let results = response.businesses;
            // Create div to hold all search results
            let resultsDiv = document.createElement('div');
            $(resultsDiv).addClass('searchResults');
            $('main').append(resultsDiv);
            // Add instructions message
            // let message = document.createElement('p');
            // message.innerText = 'Tap to show/hide details.';
            // $('header').append(message);

            var newHeader = $("<tr>").append(
                $("<th>").text("Restaurant Name:").css("font-weight", "Bold"),
                $("<th>").text("Rating:").css("font-weight", "Bold"),
                $("<th>").text("Price:").css("font-weight", "Bold"),
                $("<th>").text("Type:").css("font-weight", "Bold"),
                $("<th>").text("Address:").css("font-weight", "Bold"),
                $("<th>").text("Phone:").css("font-weight", "Bold"),
                $("<th>").text("Image:").css("font-weight", "Bold"),
            )
            $("#yelpResultsHead").append(newHeader);

            for (var i = 0; i < response.businesses.length; i++) {
                var businessName = response.businesses[i].name;
                var businessRating = response.businesses[i].rating;
                var businessPrice = response.businesses[i].price;
                var businessType = response.businesses[i].categories[0].title;
                var businessAddress = response.businesses[i].location.address1;
                var businessPhone = response.businesses[i].display_phone;
                var businessImg = response.businesses[i].image_url;

                var newRow = $("<tr class='newrow'>").append(
                    $("<td>").text(businessName),
                    $("<td>").text(businessRating),
                    $("<td>").text(businessPrice),
                    $("<td>").text(businessType),
                    $("<td class='address'>").text(businessAddress),
                    $("<td>").text(businessPhone),
                    $("<td>").html("<img class='yelpImg' src=" + businessImg + ">"),
                )
                newRow.attr("data", response.businesses[i].location.address1)
                $("#yelp").attr('target', '_blank')
                $("#yelpResultsBody").append(newRow);
            }
            $("#yelpResultsBody").on("click", ".newrow", function () {
                console.log($(this).attr("data"));
                address = ($(this).attr("data"));
                console.log(address)
                var onChangeHandler = function () {
                    calculateAndDisplayRoute(directionsService, directionsDisplay);

                };

                onChangeHandler();
            })
        })
    }
    $("#locationInput").val("");
})



// ================================ MAPS API CODE =====================================
var myPosition;

// $("option").on("click", function(){
//     // travelModes = $(this).val();
//     // console.log($(this).val());
//     console.log($("select").val());
//     travelModes = $("select").val();
// })

function initMap() {
    directionsService = new google.maps.DirectionsService;
    directionsDisplay = new google.maps.DirectionsRenderer({
        draggable: false,
        panel: document.getElementById("directions")

    });
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 10,
        center: { lat: 39.7392, lng: -104.9903 }
    });

    var geocoder = new google.maps.Geocoder;
    var infoWindow = new google.maps.InfoWindow;
    directionsDisplay.setMap(map);

    infoWindow = new google.maps.InfoWindow;

    // Try HTML5 geolocation.
    if (navigator.geolocation) {

        navigator.geolocation.getCurrentPosition(function (position) {
            position = {
                lat: position.coords.latitude,
                lng: position.coords.longitude

            };
            myPosition = position
            console.log(position.lat);
            console.log(position.lng);
            infoWindow.setPosition(position);
            infoWindow.setContent("We're watching you.");
            infoWindow.open(map);
            map.setCenter(position);

            console.log(position);

            // var onChangeHandler = function () {
            //     calculateAndDisplayRoute(directionsService, directionsDisplay);
            // };

            // // geocodeLatLng(geocoder, map, infoWindow);
            // onChangeHandler();
        }, function () {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }

    function handleLocationError(browserHasGeolocation, infoWindow, position) {
        infoWindow.setPosition(position);
        infoWindow.setContent(browserHasGeolocation ?
            'Error: The Geolocation service failed.' :
            'Error: Your browser doesn\'t support geolocation.');
        infoWindow.open(map);
    }


}

// console.log("standalone lat: ", myPosition.lat);
// console.log("stnadalone lng: ", myPosition.lng);

function calculateAndDisplayRoute(directionsService, directionsDisplay) {
    console.log("Address:" + address)
    console.log(myPosition.lat, myPosition.lng)
    directionsService.route({
        origin: { lat: myPosition.lat, lng: myPosition.lng },
        destination: address,
        travelMode: travelModes
    }, function (response, status) {
        if (status === 'OK') {
            directionsDisplay.setDirections(response);
        } else {
            window.alert('Directions request failed due to ' + status);
        }
        computeTotalDistance(directionsDisplay.getDirections());
    })
}

function computeTotalDistance(result) {
    var total = 0;
    var myroute = result.routes[0];
    for (var i = 0; i < myroute.legs.length; i++) {
      total += myroute.legs[i].distance.value;
    }
    total = Math.round(total / 1609);
    $("#distance").text("Total distance: " + total + "mi");
  }
