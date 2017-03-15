export function BladeExtendedGridDirective() {
    'ngInject';

    let directive = {
        restrict: 'E',
        templateUrl: 'app/components/bladeExtended/partials/grid.html',
        scope: {
            'sdrObjects': '=',
        },
        controller: BladeExtendedGridController,
        controllerAs: 'bladeExtendedGrid',
        bindToController: true
    };

    return directive;
}

class BladeExtendedGridController {
    constructor(Helpers) {
        'ngInject';

        this.Helpers = Helpers;
    }

    typeByObject(object) {
        return this.Helpers.typeByObject(object, true);
    }
}