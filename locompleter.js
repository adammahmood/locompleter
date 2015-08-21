
angular.module('locompleter', [])
    .factory('googleMaps', [
        '$window',
        function ($window) {
            return {
                init: function (callback) {
                    // Don't init twice
                    if (!$window.google) {
                        $window.onInit = callback; // Google maps calls `onInit` when loaded

                        var script = document.createElement('script');

                        script.type = 'text/javascript';
                        script.src = 'https://maps.googleapis.com/maps/api/js?libraries=places&sensor=false&callback=onInit';

                        document.body.appendChild(script);
                    } else {
                        callback();
                    }
                }
            };
        }
    ])
    .directive('autocompleteLocation', [
        '$window', 'googleMaps', function ($window, googleMaps) {
            //Usage:
            // <input autocomplete-location type = "text">
            var directive = {
                link: link,
                restrict: 'A',
            };
            return directive;

            function link(scope, element) {
                var autocomplete;

                googleMaps.init(initialize);

                function initialize() {
                    autocomplete = new $window.google.maps.places.Autocomplete(element[0], {});
                    autocomplete.addListener('place_changed', onPlaceChanged);
                };

                function onPlaceChanged() {
                    var placeData = autocomplete.getPlace();
                    var address = getAddress(placeData.address_components);
                    var name;

                    if (angular.isDefined(placeData.name)) {
                        name = placeData.name;
                    }

                    var addressArray = [name,
                        address.town,
                        address.city,
                        address.county,
                        address.postcode];

                    addressArray = addressArray.filter(function (item) {
                        return angular.isDefined(item);
                    });

                    scope.$emit('locationAutocompleted', {
                        latitude: placeData.geometry.location.lat(),
                        longitude: placeData.geometry.location.lng(),
                        address: address,
                        fullAddress: addressArray.join(', '),
                        name : name
                    });
                };

                function getAddress(components) {
                    var address = {};

                    //iterate over components and pull out the address details;
                    components.forEach(function (component) {
                        switch (component.types[0]) {
                            case "street_number":
                                address.streetNumber = component.long_name;
                                break;
                            case "premise":
                                address.streetNumber = component.long_name;
                                break;
                            case "route":
                                address.street = component.long_name;
                                break;
                            case "neighborhood":
                                address.town = component.long_name;
                                break;
                            case "locality":
                                address.city = component.long_name;
                                break;
                            case "postal_town":
                                address.city = component.long_name;
                                break;
                            case "administrative_area_level_2":
                                address.county = component.long_name;
                                break;
                            case "administrative_area_level_1":
                                address.state = component.long_name;
                                break;
                            case "country":
                                address.country = component.long_name;
                                address.countryCode = component.short_name;
                                break;
                            case "postal_code":
                                address.postcode = component.long_name;
                                break;
                            default:
                                break;
                        }
                    });
                    return address;
                }
            }
        }]);
