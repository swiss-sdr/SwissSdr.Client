export function requestHeadersConfig($httpProvider) {
    'ngInject';

    $httpProvider.interceptors.push("RequestHeadersInterceptor");

}
