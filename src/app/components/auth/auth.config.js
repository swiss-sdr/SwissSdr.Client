export function authConfig($httpProvider) {
    'ngInject';

    $httpProvider.interceptors.push("AuthorizationInterceptor");

}
