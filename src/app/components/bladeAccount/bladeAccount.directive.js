export function BladeAccountDirective() {
    'ngInject';

    let directive = {
        restrict: 'E',
        templateUrl: 'app/components/bladeAccount/bladeAccount.html',
        scope: {
            sdrData: '=',
            sdrMeta: '='
        },
        controller: BladeAccountController,
        controllerAs: 'blade',
        bindToController: true
    };

    return directive;
}

class BladeAccountController {
    constructor($log, Blades, User, Files, Config, Toast, $http, Upload, $window, $rootScope, $filter, $mdDialog, Auth) {
        'ngInject';

        this.Blades = Blades;
        this.$http = $http;
        this.Toast = Toast;
        this.Files = Files;
        this.Upload = Upload;
        this.User = User;
        this.Config = Config;
        this.$window = $window;
        this.$rootScope = $rootScope;
        this.$filter = $filter;
        this.Auth = Auth;

        this.accountData = {};
        this.defaultPic = '/assets/images/bg-svg.svg';
        this.loadingImage = false;
        this.$mdDialog = $mdDialog;

        this.loadData();
    }

    loadData(){
        var self = this;

        self.$http.get(self.Config.apiHost + 'users/me',{cache:false}).then(function (user) {
            self.accountData = user.data;
        }, function errorCallback(user){

            self.Toast.error(self.$filter('translate')('errors.default'));
        });
    }

    save() {
        var self = this;
        self.User.update(self.accountData).then(function (data) {
            self.Toast.success('Account aktualisiert');
            self.accountData = data.data;
            return data;
        }).then(function (data){
            self.$window.location.reload();
        });
    }

    uploadPictures(files, errFiles, callback){
        this.loadingImage = true;
        var self = this;
        if(files.length > 0){
            angular.forEach(files, function(file) {
                self.Files.create().then(function (data) {
                    var tmpData = data.data;

                    var fileReader = new FileReader();
                    fileReader.readAsArrayBuffer(file);
                    fileReader.onload = function(e) {
                        self.Upload.http({
                            method: "PUT",
                            url: tmpData.uploadUrl + tmpData.sasToken,
                            headers : {
                                'x-ms-blob-content-type': file.type,
                                'x-ms-blob-type': 'BlockBlob'},
                            data: e.target.result
                        }).then(function(response) {

                            var obj = {
                                "name": {"de": file.name},
                                "description": {"de": file.name}
                            };

                            self.Files.postFile(tmpData._links.self.href, obj).then(function (data) {
                                callback(data,self);
                            });
                        });
                    }
                });
            });
        }
    }

    setProfilePicture(data, self){
        var tmpProfilePicInfos = data.data;
        self.accountData.profileImageId = tmpProfilePicInfos.id;
        if (typeof(self.accountData._embedded) === "undefined") {
            self.accountData._embedded = {};
        }
        self.accountData._embedded.profileImage = {};
        self.accountData._embedded.profileImage.fileId = tmpProfilePicInfos.id;
        self.accountData._embedded.profileImage.url  = tmpProfilePicInfos.url;

        self.loadingImage = false;
    }

    removeProfilePicture(){
        var self = this;
        self.accountData._embedded.profileImage = {};
        self.accountData._embedded.profileImage.url = '/assets/images/bg-svg.svg';
        self.accountData.profileImageId = "";
    }

    delete(){
        var self = this;

        var confirm = self.$mdDialog.confirm()
            .title(self.$filter('translate')('suredeletingOwnUser'))
            .textContent('')
            .ariaLabel(self.$filter('translate')('delete'))
            .ok(self.$filter('translate')('delete'))
            .cancel(self.$filter('translate')('cancel'));

        self.$mdDialog.show(confirm).then(function() {

            self.Toast.info(self.$filter('translate')('deleting'));
            self.$http.delete(self.Config.apiHost + 'users/me').then(function (data){
                self.Toast.success(self.$filter('translate')('deleted'));
                self.Auth.logout();
            });
        }, function() {

        });
    }
}
