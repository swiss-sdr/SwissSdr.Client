export function CountrySelectDirective() {
    'ngInject';

    let directive = {
        restrict: 'E',
        templateUrl: 'app/components/countrySelect/countrySelect.html',
        controller: CountrySelectController,
        scope: {
            'ngModel': '=',
        },
        controllerAs: 'ctrl',
        bindToController: true
    };

    return directive;
}

class CountrySelectController {

    constructor(Config, $scope, Filter, Search, $http, $rootScope, $translate) {
        'ngInject';

        var self = this;
        this.selected = null;
        //this.ngModel = {};
        this.$scope = $scope;
        this.Filter = Filter;
        this.searchText = "";
        this.selectedItem = null;
        this.$http = $http;
        this.countries = [];
        
        // reload if language changed
        $rootScope.$on('$translateChangeSuccess', function (test) {
            this.loadAll($translate.use());
        });

        this.loadAll($translate.use());
    }

    loadAll(language) {
        var self = this;

        return this.$http.get('app/components/countrySelect/countries/'+ language +'.json',
            {
                cache: true,
                transformResponse: function (data) {
                    return angular.fromJson(data);
                }
            }).then(function(countries) {
                self.countries = $.map(countries.data, function(value, index) {
                    return [{
                        index: index,
                        value: value
                    }];
                });

                self.selectCurrent();
        });
    }

    selectCurrent() {
        if (!this.ngModel)
            return;

        var result = this.searchByIndex(this.ngModel);
        if (result && result.length > 0)
            this.selectedItem = result[0];
    }

    search(input) {
        if (!input)
            return this.countries;

        var query = angular.lowercase(input);

        return this.countries.filter(function(country) {
            return angular.lowercase(country.value).indexOf(query)>-1
        });
    }

    searchByIndex(input) {
        var query = angular.lowercase(input);

        return this.countries.filter(function(country) {
            return angular.lowercase(country.index).indexOf(query)>-1
        });
    }

    reset() {
        this.selectedItem = null;
        this.searchText = null;
    }

    setNgModel(item) {
        if (item)
            this.ngModel = item.index;
        else
            this.ngModel = null;
    }
}
