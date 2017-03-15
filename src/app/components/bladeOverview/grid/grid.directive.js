export function BladeOverviewGridDirective() {
    'ngInject';

    let directive = {
        restrict: 'E',
        templateUrl: 'app/components/bladeOverview/grid/grid.html',
        controller: BladeOverviewGridController,
        controllerAs: 'bladeGrid',
        bindToController: true
    };

    return directive;
}

class BladeOverviewGridController {
    constructor() {
        'ngInject';

    }
}