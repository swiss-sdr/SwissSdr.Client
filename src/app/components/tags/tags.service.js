export class TagsService {
    constructor (Config, $http, $filter) {
        'ngInject';

        var self = this;

        this.Config = Config;
        this.$http = $http;
        this.$filter = $filter;

        this.type = 'tags';

        this.url = Config.apiHost + this.type;
    }

    get() {
        var self = this;

        var promise = this.$http.get(this.url,
            {
                cache: true,
                transformResponse: function (data) {

                    if (data.length == 0)
                        return [];

                    var tags = angular.fromJson(data).items;
                    var dTags = [];

                    angular.forEach(tags, function (tag) {
                        var tagValue = self.$filter('sdrlang')(tag.tags);
                        dTags.push({
                            name: tagValue,
                            _lowername: tagValue.toLowerCase()
                        });
                    });

                    return dTags;
                }
            });

        return promise;
    }

    search(input){

        if(!input)
            return;

        var self = this;

        var promise = this.$http.get(this.url,
            {
                params: {q:input},
                cache: true,
                transformResponse: function (data) {

                    if (data.length == 0)
                        return [];

                    var tags = angular.fromJson(data).items;
                    var dTags = [];

                    angular.forEach(tags, function (tag) {
                        var tagValue = self.$filter('sdrlang')(tag.tags);
                        dTags.push({
                            name: tagValue,
                            _lowername: tagValue.toLowerCase()
                        });
                    });

                    return dTags;
                }
            });

        return promise;
    }

}
