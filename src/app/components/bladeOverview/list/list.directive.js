export function BladeOverviewListDirective() {
    'ngInject';

    let directive = {
        restrict: 'E',
        templateUrl: 'app/components/bladeOverview/list/list.html',
        controller: BladeOverviewListController,
        controllerAs: 'bladeList',
        bindToController: true
    };

    return directive;
}

class BladeOverviewListController {
    constructor() {
        'ngInject';

    }
}
