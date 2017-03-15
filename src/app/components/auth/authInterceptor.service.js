export function AuthorizationInterceptor($q, Auth) {
    'ngInject';

    this.$q = $q;

    var self = this;

    var blobStoreUrl = "https://swisssdr.blob.core.windows.net";

    var request = function (requestSuccess) {

        var apiUrl = 'swisssdr-api.azurewebsites.net';
        if (window.location.hostname == 'swisssdr.novu.io' || window.location.hostname == 'swisssdr-development.azurewebsites.net')
            apiUrl = 'swisssdr-api-development.azurewebsites.net';

        apiUrl = "https://" + apiUrl;
        requestSuccess.headers = requestSuccess.headers || {};

        var deferred = $q.defer();

        Auth.get().then(function(user) {
            //if (user != null && !requestSuccess.url.startsWith(blobStoreUrl)) {
            if (user != null && requestSuccess.url.startsWith(apiUrl)) {
                requestSuccess.headers.Authorization = 'Bearer ' + user.access_token;
                requestSuccess.headers.Accept = "application/hal+json";
            }

            deferred.resolve(requestSuccess);
        }, function() {
            deferred.resolve(requestSuccess);
        });
        return deferred.promise;
    };

    var responseError = function(responseFailure) {
        if (responseFailure.status === 403) {
            window.location = window.location.origin + "#/home";
            window.href = "forbidden";

        } else if (responseFailure.status === 401) {
        }

        return self.$q.reject(responseFailure);
    };

    return {
        request: request,
        responseError: responseError
    }
}
