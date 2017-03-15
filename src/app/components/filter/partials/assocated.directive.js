export function FilterAssocatedDirective() {
    'ngInject';

    let directive = {
        restrict: 'E',
        templateUrl: 'app/components/filter/partials/assocated.html',
        scope: {
            'ngModel': '=',
            'sdrType': '=',
            'sdrLabel': '=',
            'sdrNoresultStart': '='
        },
        controller: FilterAssocatedController,
        controllerAs: 'assocated',
        bindToController: true
    };

    return directive;
}

class FilterAssocatedController {

    constructor(Search, $rootScope, Config, $scope, Filter) {
        'ngInject';

        var self = this;
        this.selected = null;
        this.Search = Search;
        //this.ngModel = {};
        this.$scope = $scope;
        this.Filter = Filter;
        this.$rootScope = $rootScope;
        this.allowedTargetTypes = Config.getPossibleTargetTypes($rootScope.entityType);
        this.searchText = "";

        this.Filter.registerResetListener(function() {
            self.searchText = '';
        });
    }

    search(input) {
        var self = this;
        if (!input) {
            return;
        }

        var types = [];
        types = self.allowedTargetTypes;
        if(types.length == 0){
            types = self.sdrType;
        }

        return this.Search.get({
            query: input,
            types: types
        }).then(function(result) {
            return result.data;
        });
    }

    reset() {
        this.selectedItem = null;

        this.searchText = null;
    }

    getObject(object) {
        var self = this;
        if (!object) {
            self.ngModel = {};
            return;
        }

        self.ngModel = object._embedded.data;
    }
}
