export function UserSearchDirective() {
    'ngInject';

    let directive = {
        restrict: 'E',
        templateUrl: 'app/components/userSearch/userSearch.html',
        scope: {
            'ngModel': '=',
            'sdrType': '=',
            'sdrLabel': '=',
            'sdrNoresultStart': '='
        },
        controller: UserSearchController,
        controllerAs: 'assocated',
        bindToController: true
    };

    return directive;
}

class UserSearchController {

    constructor(Search, $rootScope, Config, $scope, Filter, User) {
        'ngInject';

        var self = this;
        this.selected = null;
        this.Search = Search;
        //this.ngModel = {};
        this.$scope = $scope;
        this.Filter = Filter;
        this.User = User;
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

        return this.User.getAll({query : input}).then(function(result) {
            return result.data;
        });
    }

    getObject(object) {
        var self = this;
        if (!object) {
            self.ngModel = {};
            return;
        }

        self.ngModel = object;
    }
}
