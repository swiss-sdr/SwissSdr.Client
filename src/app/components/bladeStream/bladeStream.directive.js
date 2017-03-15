export function BladeStreamDirective() {
    'ngInject';

    let directive = {
        restrict: 'E',
        templateUrl: 'app/components/bladeStream/bladeStream.html',
        scope: {
            bladeObj: '='
        },
        controller: BladeStreamController,
        controllerAs: 'blade',
        bindToController: true
    };

    return directive;
}

class BladeStreamController {
    constructor(Helpers) {
        'ngInject';

        let self = this;
        this.objects = {};

        this.bladeObj.Controller  = this;

        // adds bladeCore variables to this
        angular.extend(this, this.bladeObj);
    }

    destroy() {}
}
