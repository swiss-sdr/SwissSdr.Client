export function BladeExtendedAssociationsDirective() {
    'ngInject';

    let directive = {
        restrict: 'E',
        templateUrl: 'app/components/bladeExtendedAssociations/bladeExtendedAssociations.html',
        scope: {
            sdrMeta: '=',
            sdrData: '='
        },
        controller: BladeExtendedAssociationsController,
        controllerAs: 'blade',
        bindToController: true
    };

    return directive;
}

class BladeExtendedAssociationsController {
    constructor(Helpers, Blades, $location, $http, Config, Organisations, Events, Projects, People) {
        'ngInject';

        var self = this;
        this.$location = $location;
        this.$http = $http;
        this.Blades = Blades;
        this.Config = Config;

        this.Organisations = Organisations;
        this.Events = Events;
        this.Projects = Projects;
        this.People = People;

        this.sdrMeta.Controller  = this;

        Helpers.scrollToRight();
    }

    /*
    openObjects(object) {
        var self = this;

        if(object.id) {

            var redirectType = object.id.split("/")[0];
            var redirectID = object.id.split("/")[1];

           // self.$location.path(object.id);
            self.$location.path('/' + object.id + '/edit');
        }
    }
    */

    openObjects(object) {
        var self = this;

        if(object.id) {

            var redirectType = object.id.split("/")[0];
            var redirectID = object.id.split("/")[1];

            let service = null;

            switch (redirectType) {
                case 'organisations':
                    service = this.Organisations;
                    break;
                case 'events':
                    service = this.Events;
                    break;
                case 'projects':
                    service = this.Projects;
                    break;
                case 'people':
                    service = this.People;
                    break;
            }

            self.Blades.removeAllAfterIndex(self.sdrMeta._bladeId);

            self.$http.get(self.Config.apiHost + object.id).then(function(data){
                return data.data;
            }).then(function(tmpObject){
                self.Blades.add(
                    self.Blades.Type.Detail,
                    service,
                    tmpObject
                );
            });
        }
    }

    destroy() {
    }
}
