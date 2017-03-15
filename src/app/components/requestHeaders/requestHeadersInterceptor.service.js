export function RequestHeadersInterceptor(localStorageService, $q, $injector) {
    'ngInject';

    this.localStorageService = localStorageService;
    this.$q = $q;
    this.$injector = $injector;

    var self = this;

    var request = function (requestSuccess) {

        requestSuccess.headers = requestSuccess.headers || {};

        var Config = self.$injector.get('Config');
        requestSuccess.headers['Accept-Language'] = Config.getLanguage().code;

        return requestSuccess || self.$q.when(requestSuccess);
    };

    var responseError = function(responseFailure) {

        if (responseFailure.status !== undefined && !responseFailure.config.url.includes('undefined')) {
            var Toast = self.$injector.get("Toast");
            Toast.error(responseFailure.status + ': ' + responseFailure.statusText);
        }

        return self.$q.reject(responseFailure);

    };

    return {
        request: request,
        responseError: responseError
    }
}
