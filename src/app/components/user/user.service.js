export class UserService {
    constructor(Config, $http, SdrService, Toast, Files) {
        'ngInject';

        var self = this;

        this.Config = Config;
        this.Toast = Toast;
        this.$http = $http;
        this.SdrService = SdrService;


        this.url = this.Config.apiHost + 'users';

        this.me = {
            guest: true
        }

        /*
        this.requestMe().then(function(me) {
            self.me = me.data;
            self.me.guest = false;

            self.Toast.success('Willkommen ' + self.me.fullname + '!');
        });*/

        this.loading = true;

        /*this.get().then(function(me) {
            self.me = me.data;

            console.debug('firsttime');
            console.debug(me);

            self.loading = false;

            self.Toast.success('Willkommen ' + self.me.fullname + '!');
        })*/

    }

    get() {
        return this.$http.get(this.url + '/me',
            {
                cache: false,
            });
    }

    getAll(params = {}) {
        var promise = this.$http.get(this.url,
            {
                params: params,
                cache: true,
                transformResponse: function (data) {

                    var searchResult = angular.fromJson(data)._embedded.items;

                    if (angular.isUndefined(searchResult))
                        return [];

                    return searchResult;
                }
            });


        return promise;

    }

    getById(id){
        return this.$http.get(this.Config.apiHost + '/' + id,
            {
                cache: false,
            });
    }

    getPermissions() {
        var promise = this.$http.get(this.url + '/me/permissions',
            {
                cache: false,
            }
        );

        return promise;
    }

    update(object) {
        return this.SdrService.update(object);
    }

    delete(object) {
        return this.SdrService.delete(object);
    }
}
