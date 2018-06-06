export function BladeAdminPermissionsDirective() {
    'ngInject';

    let directive = {
        restrict: 'E',
        templateUrl: 'app/components/bladeAdminPermissions/bladeAdminPermissions.html',
        scope: {
            sdrMeta: '=',
            sdrData: '='
        },
        controller: BladeAdminPermissionsController,
        controllerAs: 'blade',
        bindToController: true
    };

    return directive;
}

class BladeAdminPermissionsController {
    constructor($log, Blades, Helpers, User, $http, $rootScope, $mdDialog, $filter, Toast, People) {
        'ngInject';

        this.Blades = Blades;
        this.Helpers = Helpers;
        this.$log = $log;
        this.User = User;
        this.$http = $http;
        this.$rootScope = $rootScope;
        this.$mdDialog = $mdDialog;
        this.$filter = $filter;
        this.Toast = Toast;
        this.People = People;

        this.users = [];
        this.listUsers = [];
        this.loading = false;
        this.allLoading = false;
        this.allLoaded = false;

        this.filterValue = '';
        this.fitlerParams = {
            take: 30,
        };

        this.search = this.debounce(()=>{
            if(this.filterValue) {
                this.loadSearchData();
            } else {
                this.$rootScope.$apply(()=>{
                    this.users = this.listUsers;
                });
            }
        }, 250);

        this.loadData();
    }

    loadData() {
        if (this.allLoading || this.allLoaded || this.filterValue) {
            return;
        }

        this.allLoading = true;

        angular.extend(this.fitlerParams, {
            skip: this.listUsers.length
        });

        this.User.getAll(this.fitlerParams)
            .then((data) => {
                this.listUsers = this.listUsers.concat(data.data);
                this.users = this.listUsers;
                this.allLoaded = data.data.length === 0;
            })
            .catch((err)=> {
                console.error(err);
            })
            .then(()=>{
                this.allLoading = false;
            });
    }

    loadSearchData() {
        this.loading = true;

        this.User.getAll({take:100, query:this.filterValue})
            .then((data)=>{
                this.users = data.data;
            })
            .catch((err)=>{
                console.error(err);
            })
            .then(()=>{
                this.loading = false;
            })
    }

    openEdit(i,index) {
        var self = this;

        setTimeout(function () {
            self.Blades.removeChildrensOnAdminPermissions();
        }, 0);

        self.User.getById(i.id).then(function(data){
            return data.data;
        }).then(function(objData){
            setTimeout(function () {
                let blade = self.Blades.add(
                    self.Blades.Type.AdminPermissionsDetail,
                    null,
                    objData
                );
            }, 1);
        })
    }

    typeByObject(object) {
        return this.Helpers.typeByObject(object, true);
    }

    loadObjectyByUrl(url) {
        var self = this;
        var promise = self.$http.get(url,
            {
                cache: false,
            }
        );
        return promise;
    }

    debounce(func, wait, immediate) {
        let timeout;
        return function() {
            let context = this, args = arguments;
            let later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            let callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

    delete(object,index){
        var self = this;

        var confirm = self.$mdDialog.confirm()
            .title(self.$filter('translate')('suredeleting'))
            .textContent('')
            .ariaLabel(self.$filter('translate')('delete'))
            .ok(self.$filter('translate')('delete'))
            .cancel(self.$filter('translate')('cancel'));

        self.$mdDialog.show(confirm).then(function() {

            self.Toast.info(self.$filter('translate')('deleting'));
            self.users.splice(index, 1);
            self.People.delete(object).then(function (data){
                self.Toast.success(self.$filter('translate')('deleted'));
            });
        }, function() {

        });
    }

}
