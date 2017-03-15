export function FilterPlaceDirective() {
    'ngInject';

    let directive = {
        restrict: 'E',
        templateUrl: 'app/components/filter/partials/place.html',
        scope: {
            'ngModel': '='
        },
        controller: FilterPlaceController,
        controllerAs: 'place',
        bindToController: true
    };

    return directive;
}

class FilterPlaceController {

    constructor($q,Filter) {
        'ngInject';

        var self = this;
        this.$q = $q;
        this.autocompleteService = new google.maps.places.AutocompleteService();
        this.Filter = Filter;

        // pff bad google
        var map = new google.maps.Map(document.createElement('div'));

        this.placeService = new google.maps.places.PlacesService(map);
        this.ngModel = {};
        this.searchText="";


        this.Filter.registerResetListener(function() {
            self.searchText="";
        });
    }

    getResults(address) {
        var deferred = this.$q.defer();

        this.autocompleteService.getPlacePredictions({
            input: address,
            componentRestrictions: {country: "ch"}
        }, function(data) {
            deferred.resolve(data);
        });
        return deferred.promise;
    }

    getDetails(place) {
        var deferred = this.$q.defer();

        this.placeService.getDetails({
            'placeId': place.place_id
        }, function(details) {
            deferred.resolve(details);
        });
        return deferred.promise;
    }

    search(input) {
        if (!input) {
            return;
        }
        return this.getResults(input).then(function(places) {
            return places;
        });
    }

    getPlace(place) {
        var self = this;
        if (!place) {
            self.ngModel = {};
            return;
        }
        this.getDetails(place).then(function(details) {
            self.ngModel = {
                'name': place.description,
                'latitude': details.geometry.location.lat(),
                'longitude': details.geometry.location.lng(),
            };
        });
    }
}
