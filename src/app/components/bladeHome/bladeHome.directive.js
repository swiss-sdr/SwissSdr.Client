export function BladeHomeDirective() {
    'ngInject';

    let directive = {
        restrict: 'E',
        templateUrl: 'app/components/bladeHome/bladeHome.html',
        scope: {
            sdrMeta: '=',
            sdrData: '='
        },
        controller: BladeHomeController,
        controllerAs: 'blade',
        bindToController: true
    };

    return directive;
}

class BladeHomeController {
    constructor($log, Blades, Config, Helpers, Filter, Topics, Search, Projects, $location) {
        'ngInject';

        this.Blades = Blades;
        this.Helpers = Helpers;
        this.Search = Search;
        this.$log = $log;
        this.Projects = Projects;
        this.$location = $location;

        this.Topics = Topics;

        this.loading = true;
        this.ovObjects = [];
        this.loading = false;

        this.loadOverview();
    }

    loadOverview() {
        let self = this;

        self.loading = true;

        self.Topics.getOverview({ take: 4, sort: 'random', type: 'unsdg' })
            .then(function (objects) {

                self.ovObjects = objects.data;

                self.ovObjects.forEach(function(object) {

                    self.Search.get({
                        take: 4,
                        sort: 'random',
                        types: ['project'],
                        related: object.id,
                    }).then(function (result) {
                        object.relatedObjects = result.data;
                        self.loading = false;
                    });
                });

            });
    }

    typeByObject(object) {
        return this.Helpers.typeByObject(object, true);
    }

    open(object) {
        var self = this;

        if(object.id) {
            self.$location.path('/' + object.id + '/');
        }
    }

}

