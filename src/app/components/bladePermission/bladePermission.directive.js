export function BladePermissionDirective() {
    'ngInject';

    let directive = {
        restrict: 'E',
        templateUrl: 'app/components/bladePermission/bladePermission.html',
        scope: {
            sdrMeta: '=',
            sdrData: '='
        },
        controller: BladePermissionController,
        controllerAs: 'blade',
        bindToController: true
    };

    return directive;
}

class BladePermissionController {
    constructor(Helpers, Blades, Toast, Config, User, $filter) {
        'ngInject';

        this.permissionTypes = ['impersonate', 'moderateComments', 'editContent', 'fullControl'];

        this.sdrMeta.Controller  = this;

        var self = this;
        this.Blades = Blades;
        this.User = User;
        this.$filter = $filter;

        this.adding = false;

        this.disableSave = true;
        this.editForm = {};

        this.permissions = {};
        this.arrUsers = [];
        this.Toast = Toast;
        //this.permissions.items = [];

        Helpers.scrollToRight();

        this.sdrMeta.Service.getPermissionsByObject(this.sdrData).then(function (object) {
            self.permissions = object.data;

            angular.forEach(self.permissions._embedded.items, function(item) {
                item.temp = {};

                angular.forEach(item.permissions, function(permission) {
                    item.temp[permission] = true;
                });

                self.arrUsers.push(item._embedded.user.id);

            });




            //object.userId
        });

    }

    refreshPermissions(item) {
        item.permissions = [];
        angular.forEach(item.temp, function(value, key) {
             if (value) {
                 item.permissions.push(key);
             }
        });
    }

    destroy() {
        if (this.destroyed)
            return;

        this.destroyed = true;
    }

    add(object){
        var self = this;

        this.adding = false;
        this.disableSave = false;

        if(angular.isDefined(object.id)) {

            if(self.arrUsers.indexOf(object.id) !== -1){
                return;
            }

            var tmpPerms = {};

            angular.forEach(self.permissionTypes, function(permission) {
                tmpPerms[permission] = false;
            });

            var obj = {
                "userId" : object.id,
                "temp" : tmpPerms
            }

            obj._embedded ={};
            obj._embedded.user = object;

            if(angular.isUndefined(self.permissions._embedded.items))
                self.permissions._embedded.items = [];

            self.permissions._embedded.items.push(obj);
            self.arrUsers.push(object.id);
        }
    }

    removeFromElements(index){
        var self = this;
        self.permissions._embedded.items.splice(index, 1);
        self.arrUsers.splice(index, 1);
        this.disableSave = false;
    }

    save(){
        var self = this;

        self.Toast.info(self.$filter('translate')('saving'));

        var items = [];
        self.arrUsers = [];

        angular.forEach(self.permissions._embedded.items, function(item) {
            items.push({"userId":item.userId, "permissions":item.permissions});
        });


        self.sdrMeta.Service.updatePermissionsOnObject(self.sdrData,{"items":items}).then(function (data){
            self.permissions = data.data;

            angular.forEach(self.permissions._embedded.items, function(item) {
                item.temp = {};

                angular.forEach(item.permissions, function(permission) {
                    item.temp[permission] = true;
                });

                self.arrUsers.push(item._embedded.user.id);
            });
            self.Toast.success(self.$filter('translate')('saved'));
        }, function errorCallback(data){
            self.Toast.error(self.$filter('translate')('errors.default'));
        });

    }

}

