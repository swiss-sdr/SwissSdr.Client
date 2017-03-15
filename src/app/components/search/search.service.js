export class SearchService {
    constructor (Config, $http) {
        'ngInject';

        this.Config = Config;
        this.$http = $http;

        this.type = 'search';
        this.url = Config.apiHost + this.type;
    }


    get(params = {}, url) {

        var tmpUrl = "";

        if(!angular.isDefined(url)){
            tmpUrl = this.url;
        } else {
            tmpUrl = this.Config.apiHost + url;
        }

        var promise = this.$http.get(tmpUrl,
            {
                params: params,
                cache: true,
                transformResponse: function (data) {

                    var searchResult = [];

                    if(data === null)
                        return [];

                    if (angular.isDefined(url)){
                        searchResult = angular.fromJson(data)._embedded.items;
                    } else {
                        searchResult = angular.fromJson(data)._embedded.items;
                    }


                    if (angular.isUndefined(searchResult))
                        return [];

                    return searchResult;
                }
            });

        return promise;
    }
}
