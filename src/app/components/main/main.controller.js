export class MainController {
    constructor(Auth, $state, Helpers, User, $filter, $rootScope) {
        'ngInject';

        var self = this;

        this.loaded = false;

        this.Helpers = Helpers;

        document.title = $filter('translate')('title');
        $rootScope.$on('$translateChangeSuccess', function () {
            document.title = $filter('translate')('title');
        });

        angular.element('.initial-loading').hide();

        Auth.get().then(function(auth) {
            if (auth == null)
                return;

            User.get().then(function (user) {
                self.loaded = true;

                self.me = user;
            });
        });
    }

}
