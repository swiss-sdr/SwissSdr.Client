export function BladeAdminDirective() {
    'ngInject';

    let directive = {
        restrict: 'E',
        templateUrl: 'app/components/bladeAdmin/bladeAdmin.html',
        scope: {
            bladeObj: '='
        },
        controller: BladeAdminController,
        controllerAs: 'blade',
        bindToController: true
    };

    return directive;
}

class BladeAdminController {
    constructor($log, Blades, Helpers, Topics, Search) {
        'ngInject';

        this.Blades = Blades;
        this.Helpers = Helpers;
        this.Search = Search;
        this.$log = $log;


        this.Topics = Topics;

        this.loading = true;
        this.objects = [];
        this.loading = false;

        this.loadData();
    }

    loadData() {
        let self = this;

        if (this.loading)
            return;

        this.loading = true;

        self.Topics.getOverview({ take: 2 })
            .then(angular.bind(this, function (objects) {
                this.objects = this.objects.concat(objects.data);
                this.loading = false;


                this.objects.forEach(function(object) {

                    self.Search.get({
                        take: 10,
                        q: 'content',
                    }).then(function (result) {
                        object.relatedObjects = result;
                    });
                });

            }));
    }

    typeByObject(object) {
        return this.Helpers.typeByObject(object, true);
    }

}
