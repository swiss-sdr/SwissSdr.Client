export function BladeExtendedDirective() {
    'ngInject';

    let directive = {
        restrict: 'E',
        templateUrl: 'app/components/bladeExtended/bladeExtended.html',
        scope: {
            bladeObj: '='
        },
        controller: BladeExtendedController,
        controllerAs: 'blade',
        bindToController: true
    };

    return directive;
}

class BladeExtendedController {
    constructor(Helpers) {
        'ngInject';

        let self = this;
        this.objects = {};

        this.bladeObj.Controller  = this;

        angular.forEach(this.bladeObj.element.associatedEntities, function (associated) {
            let typeOfObject = Helpers.typeByObject(associated.reference, true);

            if (angular.isUndefined(self.objects[typeOfObject]))
                self.objects[typeOfObject] = [];

            self.objects[typeOfObject].push(associated.reference);
        });

        // adds bladeCore variables to this
        angular.extend(this, this.bladeObj);
    }

    destroy() {
        if (this.destroyed)
            return;

        this.destroyed = true;
    }
}
