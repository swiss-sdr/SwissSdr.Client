export function BladeMyObjectsDirective() {
    'ngInject';

    let directive = {
        restrict: 'E',
        templateUrl: 'app/components/bladeMyObjects/bladeMyObjects.html',
        scope: {
            bladeObj: '='
        },
        controller: BladeMyObjectsController,
        controllerAs: 'blade',
        bindToController: true
    };

    return directive;
}

class BladeMyObjectsController {
    constructor($log, Blades, Helpers, User, Search, People, Organisations, Projects, Topics, Events,$http,$rootScope,SdrService,Toast, $filter, $mdDialog) {
        'ngInject';

        this.Blades = Blades;
        this.Helpers = Helpers;
        this.Search = Search;
        this.$log = $log;
        this.User = User;
        this.$http = $http;
        this.$rootScope = $rootScope;
        this.SdrService = SdrService;
        this.Toast = Toast;
        this.$filter = $filter;
        this.$mdDialog = $mdDialog;

        // UGC Services
        this.Services = {
            'organisation': Organisations,
            'person': People,
            'project': Projects,
            'topic': Topics,
            'event': Events
        };



        this.permissions = [];

        this.loading = true;
        this.objects = [];
        this.loading = false;

        this.loadData();
    }

    loadData() {
        let self = this;

        if (this.loading)
            return;

        this.loading = true;

        self.User.getPermissions().then(function (permissions) {
            self.permissions = permissions.data._embedded;
        });
    }

    openEdit(i,index) {
        var self = this;

        setTimeout(function () {
            self.Blades.removeChildrensOnMyObjects();
        }, 0);

        self.loadObjectyByUrl(i._embedded.user._links.self.href).then(function(objData){
            return objData.data;
        }).then(function(objData){
            self.permissions.items[index].data = objData;
            setTimeout(function () {
                let blade = self.Blades.add(
                    self.Blades.Type.Edit,
                    self.Services[i.type],
                    objData
                );
            }, 1);
        });
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
            self.permissions.items.splice(index, 1);
            self.SdrService.delete(object).then(function (data){
                self.Toast.success(self.$filter('translate')('deleted'));
            });
        }, function() {

        });
    }

    openPermissions(i,index){
        var self = this;

        setTimeout(function () {
            self.Blades.removeChildrensOnMyObjects();
            self.Blades.addPermission(self.Services[i.type], i._embedded.user, this);
        }, 0);


        /*
        setTimeout(function () {
            let blade = self.Blades.add(
                self.Blades.Type.Permission,
                self.Services[i.type],
                i._embedded.user
            );
        }, 1);
        */
    }

}
