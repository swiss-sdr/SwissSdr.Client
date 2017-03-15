export function BladeLoginDirective() {
    'ngInject';

    let directive = {
        restrict: 'E',
        templateUrl: 'app/components/bladeLogin/bladeLogin.html',
        scope: {
            sdrMeta: '=',
            sdrData: '='
        },
        controller: BladeLoginController,
        controllerAs: 'blade',
        bindToController: true
    };

    return directive;
}

class BladeLoginController {
    constructor(Helpers, Auth, Toast) {
        'ngInject';

        this.Auth = Auth;
        this.Toast = Toast;

        let self = this;
        this.objects = {};

        this.sdrMeta.Controller  = this;

        Auth.get().then(function (user) {
            self.me = user;
        });

    }



    login() {
        this.Auth.login();
    }

    destroy() {}
}
