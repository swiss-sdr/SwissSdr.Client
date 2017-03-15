export function DisciplinesDirective() {
    'ngInject';

    let directive = {
        restrict: 'E',
        templateUrl: 'app/components/disciplines/disciplines.html',
        controller: DisciplinesController,
        scope: {
            'ngModel': '=',
        },
        controllerAs: 'ctrl',
        bindToController: true
    };

    return directive;
}

class DisciplinesController {

    constructor($scope, Filter, $translate, $element, Config) {
        'ngInject';

        var self = this;
        var tempSelected = null;
        this.$scope = $scope;
        this.Filter = Filter;

        this.selectedItems = [];

        this.disciplines = [];

        angular.copy(Config.getDisciplines(),this.disciplines);

        angular.forEach(self.disciplines, function(disc){

            angular.forEach(self.ngModel, function(tmpItem){

                angular.forEach(disc.items, function(tmpDisc){

                    if(tmpDisc.discipline === tmpItem.discipline){
                        tmpDisc.active = true;
                    }
                });

            });

        });
    }

    syncLists(){
        var self = this;
        self.ngModel = self.selectedItems;
    }
}
