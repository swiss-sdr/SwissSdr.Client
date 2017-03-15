export function BladeEditImageDirective() {
    'ngInject';

    let directive = {
        restrict: 'E',
        templateUrl: 'app/components/bladeEditImage/bladeEditImage.html',
        scope: {
            sdrMeta: '=',
            sdrData: '='
        },
        controller: BladeEditImageController,
        controllerAs: 'blade',
        bindToController: true
    };

    return directive;
}

class BladeEditImageController {
    constructor(Helpers, Blades, Config, Toast, $http, $filter) {
        'ngInject';

        var self = this;
        this.Blades = Blades;
        this.Toast = Toast;
        this.$http = $http;
        this.Config = Config;
        this.$filter = $filter;

        this.sdrMeta.Controller = this;

        this.loading = true;

        this.errors = [];

        Helpers.scrollToRight();
    }

    save() {
        var self = this;

        self.Toast.info(self.$filter('translate')('saving'));

        this.$http.put(this.Config.apiHost + '/' + self.sdrData.object.fileId, self.sdrData.object).then(function (data) {
            self.Toast.success(self.$filter('translate')('saved'));
            var result = data.data;
            self.sdrData.images[self.sdrData.index] = result;
        });
    }

    destroy() {
    }
}
