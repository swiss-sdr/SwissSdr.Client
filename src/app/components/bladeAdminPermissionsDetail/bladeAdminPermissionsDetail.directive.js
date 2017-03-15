export function BladeAdminPermissionsDetailDirective() {
    'ngInject';

    let directive = {
        restrict: 'E',
        templateUrl: 'app/components/bladeAdminPermissionsDetail/bladeAdminPermissionsDetail.html',
        scope: {
            sdrMeta: '=',
            sdrData: '='
        },
        controller: BladeAdminPermissionsDetailController,
        controllerAs: 'blade',
        bindToController: true
    };

    return directive;
}

class BladeAdminPermissionsDetailController {
    constructor($log, Blades, Helpers, User, $http, Toast, Upload, Files, $filter) {
        'ngInject';

        var self = this;
        this.Blades = Blades;
        this.Helpers = Helpers;
        this.$log = $log;
        this.User = User;
        this.$http = $http;
        this.Toast = Toast;
        this.Upload = Upload;
        this.Files = Files;
        this.$filter = $filter;

        this.editForm = {};

        this.users = [];

        this.loading = true;
        this.objects = [];
        this.loading = false;

        this.claimsCreateEntityOfType = [
            {
                "type": "CreateEntityOfType",
                "value": "person"
            },
            {
                "type": "CreateEntityOfType",
                "value": "project"
            },
            {
                "type": "CreateEntityOfType",
                "value": "event"
            },
            {
                "type": "CreateEntityOfType",
                "value": "organisation"
            },
            {
                "type": "CreateEntityOfType",
                "value": "topic"
            }
        ];

        this.claimsAdmins = [
            {
                "type": "AdministerUsers",
                "value": "true"
            },
            {
                "type": "BypassObjectPermissions",
                "value": "true"
            }
        ];

        self.prepareData();

    }

    prepareData(){
        var self = this;

        angular.forEach(self.claimsCreateEntityOfType, function(claim){
            angular.forEach(self.sdrData.claims, function(item){
                claim.issuer = item.issuer;
                if(claim.type == item.type && claim.value == item.value){
                    claim.checked = true;
                }
            })
        });

        angular.forEach(self.claimsAdmins, function(claim){
            angular.forEach(self.sdrData.claims, function(item){
                claim.issuer = item.issuer;
                if(claim.type == item.type){
                    claim.checked = true;
                }
            })
        });
    }

    refreshPermissions(item,claims) {
        var self = this;

        self.sdrData.claims = [];

        angular.forEach(self.claimsCreateEntityOfType, function(claim){
            if(claim.checked)
                self.sdrData.claims.push(claim);
        });

        angular.forEach(self.claimsAdmins, function(claim){
            if(claim.checked)
                self.sdrData.claims.push(claim);
        });

    }

    save(){
        var self = this;

        self.User.update(self.sdrData).then(function(data){
            self.Toast.success(self.$filter('translate')('saved'));
        }, function errorCallback(data){
            self.Toast.error(self.$filter('translate')('notsaved'));
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
        self.sdrData.profileImageId = tmpProfilePicInfos.id;

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
}
