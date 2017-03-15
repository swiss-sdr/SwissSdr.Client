export function routerConfig ($stateProvider, $urlRouterProvider) {
    'ngInject';
    $stateProvider

    .state('main', {
        url: '/',
        templateUrl: 'app/components/main/main.html',
        controller: 'MainController',
        controllerAs: 'main'
    })

    .state('main.login_callback', {
        url: 'auth/callback/:data',
        template: '',
        controller: 'AuthController',
    })

    .state('main.blades', {
        url: ':type/',
        defaultParams: {action: ''},
        templateUrl: 'app/components/blades/blades.html',
        controller: 'BladesController',
        controllerAs: 'blades'
    })

    .state('main.blades.detail', {
        url: ':id/',
        defaultParams: {action: ''},
        templateUrl: 'app/components/blades/blades.html',
        controller: 'BladesController',
        controllerAs: 'blades'
    })

    .state('main.blades.detail.action', {
        url: ':action',
        defaultParams: {action: ''},
        templateUrl: 'app/components/blades/blades.html',
        controller: 'BladesController',
        controllerAs: 'blades'
    })

    $urlRouterProvider.otherwise('/home/');
}
