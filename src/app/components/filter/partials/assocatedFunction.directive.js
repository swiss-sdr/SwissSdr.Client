export function FilterAssocatedFunctionDirective() {
    'ngInject';

    let directive = {
        restrict: 'E',
        templateUrl: 'app/components/filter/partials/assocatedFunction.html',
        scope: {
            'ngModel': '=',
            'sdrAssocated': '=',
            'sdrAssocatedSecond': '='
        },
        controller: FilterAssocatedFunctionController,
        controllerAs: 'assocatedFunction',
        bindToController: true
    };

    return directive;
}

class FilterAssocatedFunctionController {

    constructor(Config, $scope, Filter, $rootScope) {
        'ngInject';

        this.selected = null;
        this.$rootScope = $rootScope;
        this.Config = Config;
        this.ngModel = {};
        this.Filter = Filter;

        let self = this;

        self.getCurrentOptions();

        $scope.$watch(function () {
            return (self.sdrAssocated)
        }, function () {
            self.getCurrentOptions();
        });

        $scope.$watch(function () {
            return (self.sdrAssocatedSecond)
        }, function () {
            self.getCurrentOptions();
        });


        this.Filter.registerResetListener(function() {
        });
    }

    getCurrentOptions() {
        var self = this;

        this.options = [];

        if (angular.isDefined(this.sdrAssocated) && Object.keys(this.sdrAssocated).length > 0) {
            //this.options = this.Config.getAssocatedFunctions('person', this.sdrAssocated);
            this.options = this.Config.getAssocatedFunctions(self.$rootScope.entityType, this.sdrAssocated);
        }

        if (angular.isDefined(this.sdrAssocatedSecond) &&  Object.keys(this.sdrAssocatedSecond).length > 0) {
            angular.merge(
                this.options,
                this.Config.getAssocatedFunctions(self.$rootScope.entityType, this.sdrAssocatedSecond)
                //this.Config.getAssocatedFunctions('person', this.sdrAssocatedSecond)
            );
        }

        if (this.options.length == 0) {
            this.options = this.Config.getAssocatedFunctions(self.$rootScope.entityType);
            //this.options = this.Config.getAssocatedFunctions('person');
        }
    }
}
