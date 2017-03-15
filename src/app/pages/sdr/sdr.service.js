export class SdrService {
    constructor (Config, $http, Toast, $filter) {
        'ngInject';

        this.Config = Config;
        this.$http = $http;
        this.Toast = Toast;
        this.$filter = $filter;

        this.activeType = 'projects';
    }

    // type
    getOverview(type, params = {}) {
        var self = this;

        var promise = this.$http.get(this.Config.apiHost + type,
            {
                params: params,
                cache: false,
                transformResponse: function (data) {
                    if (data.length == 0)
                        return [];

                    var collection = angular.fromJson(data)._embedded.items;

                    if (angular.isUndefined(collection))
                        return [];

                    return collection;
                }
            });

        return promise;
    }


    update(object) {
        var self = this;
        self.Toast.info(self.$filter('translate')('saving'));
        return this.$http.put(object._links.self.href, object);
    }

    delete(object) {
        return this.$http.delete(object._links.self.href);
    }

    // type
    plain(type) {
        var entityTemplates = this.Config.getEntityTemplates();

        if (this.Config.getEntityTemplates() != null) {
            var newObject = entityTemplates[type];

            newObject.create = true;

            return newObject;
        }

        this.Toast.error('Internal Error: 1547');
    }

    getPermissionsByObject(object) {
        var self = this;

        var promise = this.$http.get(object._links.self.href + '/permissions',
            {
                // cache: true,
                transformResponse: function (data) {
                    return angular.fromJson(data);
                }
            });

        return promise;

    }

    getByObject(object) {
        var self = this;

        var promise = this.$http.get(object._links.self.href,
            {
                // cache: true,
                transformResponse: function (data) {
                    return angular.fromJson(data);
                }
            });

        return promise;
    }

    getForMap(type, params = {}) {
        params.take = 2000;
        params.skip = 0;

        return this.getOverview(type, params);
    }

    updatePermissionsOnObject(object,params){
        var self = this;

        return this.$http.put(object._links.self.href + '/permissions',params);
    }
}
