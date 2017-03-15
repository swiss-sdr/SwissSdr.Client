export function BladeEditExtendedDirective() {
    'ngInject';

    let directive = {
        restrict: 'E',
        templateUrl: 'app/components/bladeEditExtended/bladeEditExtended.html',
        scope: {
            sdrMeta: '=',
            sdrData: '='
        },
        controller: BladeEditExtendedController,
        controllerAs: 'blade',
        bindToController: true
    };

    return directive;
}

class BladeEditExtendedController {
    constructor(Helpers, Blades, Files, $scope, $q , $timeout, Upload, Toast, $filter) {
        'ngInject';

        var self = this;
        this.Blades = Blades;
        this.Files = Files;
        this.$q = $q;
        this.$timeout = $timeout;
        this.$scope = $scope;
        this.Toast = Toast;
        this.$filter = $filter;

        this.Upload = Upload;

        this.editForm = {};

        this.sdrMeta.Controller  = this;

        this.loading = true;

        this.errors = [];

        this.patternUrls = new RegExp("^((http|https|ftp):\/\/)");

        this.uploadPercentage = 0;

        Helpers.scrollToRight();
    }

    findDiff(original, edited){
        var diff = {}
        for(var key in original){
            if(original[key] !== edited[key])
                diff[key] = edited[key];
        }
        return diff;
    }

    updateUrl(obj){
        var self = this;
        var tmpUrl = angular.isDefined(obj.value) ? obj.value : obj.url;
        tmpUrl = tmpUrl.replace(/[\s]/g, '');
        if(!self.patternUrls.test(tmpUrl)) {
            tmpUrl = "http://" + tmpUrl;
        }
        angular.isDefined(obj.value) ? obj.value = tmpUrl : obj.url = tmpUrl;
        //obj.value = tmpUrl;
        return obj;
    }

    isAddable(name) {
        if (!angular.isArray(this.sdrData.addable))
            return false;

        return (this.sdrData.addable.indexOf(name) > -1);
    }

    removeFromElements(index,obj) {
        this.editForm.$pristine = false;
        this.sdrData.bladeEditController.editForm.$pristine = false;
        var entry = obj.splice(index, 1)[0];
        //this.Service.delete(entry);
    }

    addFile() {

        var self = this;
        var newFile = this.sdrData.filesAndUrls.push({
            type: 'file',
            file : null,
            name:{},
            description:{}
        });

        this.Files.create().then(function (data) {
            var tmpData = data.data;
            self.sdrData.filesAndUrls[self.sdrData.filesAndUrls.length - 1].fileUploadInfos = tmpData;
            self.sdrData.filesAndUrls[self.sdrData.filesAndUrls.length - 1]._links = tmpData._links;
        });
    }

    addLink() {
        var self = this;

        var link = {
            type: 'url',
            name: {},
            description: {}
        };

        this.sdrData.filesAndUrls.push(link);
    }

    addEMail(){
        this.sdrData.emails.push({
            type: 'email'
        });
    }

    addAddress(){
        this.sdrData.addresses.push({
            //type: 'address'
            affiliation:'work',
            addressLines:[""]
        });
    }

    addPhonenumber(){
        this.sdrData.phoneNumbers.push({
            affiliation:'work'

        });
    }

    addContactLink(){
        this.sdrData.urls.push({
            type: 'social'
        });
    }

    addAddressLine(addressLines) {
        if (!angular.isArray(addressLines))
            addressLines = [];

        addressLines.push("");
    }

    postFile(url,obj,i){
        var self = this;

        var d = self.$q.defer();
        var promisePostFile = self.Files.postFile(url, obj).then(function(data){
            var elem = data.data;
            elem.type = "file";
            elem.fileId = data.data.id;
            self.sdrData.filesAndUrls[i] = elem;
            d.resolve(data);
        });

        return d.promise;
    }

    uploadFiles(file, errFiles,index){

        var self = this;
        if (file) {


            var fileNode = self.sdrData.filesAndUrls[index];
            self.sdrData.filesAndUrls[index].showUpload = true;

            var fileReader = new FileReader();
            fileReader.readAsArrayBuffer(file);
            fileReader.onload = function(e) {
                self.Upload.http({
                    method: "PUT",
                    url: fileNode.fileUploadInfos.uploadUrl + fileNode.fileUploadInfos.sasToken,
                    headers : {
                        'x-ms-blob-content-type': file.type,
                        'x-ms-blob-type': 'BlockBlob'},
                    data: e.target.result
                }).then(function(response) {

                    var obj = {
                        "name": fileNode.name,
                        "description": fileNode.description
                    };

                    self.Files.postFile(fileNode._links.self.href, obj).then(function (data) {
                        self.sdrData.filesAndUrls[index].showUpload = false;
                        var elem = data.data;
                        elem.type = "file";
                        elem.fileId = data.data.id;
                        self.sdrData.filesAndUrls[index] = elem;
                    });
                }, function (resp) {
                }, function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    self.sdrData.filesAndUrls[index].uploadPercentage = progressPercentage;
                });
            }

        }
    }


    disableButton(elem){
        if(Object.keys(elem.name).length === 0 || Object.keys(elem.description).length === 0)
           return true;

        return false;
    }

    save() {
        var self = this;

        this.errors = self.validateExtended(self.sdrData);

        if(this.errors.length > 0){
            self.Toast.error(self.$filter('translate')('requiredfields'));
            return;
        }

        this.sdrData.bladeEditController.editForm.$pristine = false;

        if(self.sdrData.apiType) {

            self.sdrMeta.Service.putEntries(self.sdrData).then(function (data) {
                self.Toast.success(self.$filter('translate')('saved'));
            }, function errorCallback(data) {
                self.Toast.error(self.$filter('translate')('errors.default'));
            });
        } else {
            self.Toast.success(self.$filter('translate')('saved'));
        }

        self.$timeout(function () {}, 500);

        if(!angular.isDefined(this.sdrData.filesAndUrls) && angular.isDefined(this.sdrData.owner)){
            this.sdrData.bladeEditController.save();
        }

    }

    destroy() {
    }

    validateExtended(object){
        var self = this;
        var errors = [];


        // Contact

        if(!object.apiType){

            angular.forEach(object.emails, function(value, key) {

                if(!angular.isDefined(value.value)){
                    errors.push("email_"+key);
                } else {
                    if(!self.validateEmail(value.value)){
                        errors.push("no_valid_email_"+key);
                    }
                }
            });

            angular.forEach(object.urls, function(value, key) {
                if(!angular.isDefined(value.value)){
                    errors.push("url_"+key);
                }
            });


            angular.forEach(object.phoneNumbers, function(value, key) {
                if(!angular.isDefined(value.value)){
                    errors.push("phone_"+key);
                }
            });

        } else {

            // Publications and Libary
            angular.forEach(object.filesAndUrls, function(value, key) {

                if(value.type == 'url'){
                    if(Object.keys(value.name).length == 0){
                        errors.push("urlName_"+key);
                    }

                    if(!angular.isDefined(value.url) || value.url.length == 0){
                        errors.push("url_"+key);
                    }
                }

                if(value.type == 'file'){
                    if(Object.keys(value.name).length == 0){
                        errors.push("fileName_"+key);
                    }
                }
            });
        }

        return errors;
    }

    hasError(name) {
        return (this.errors.indexOf(name) !== -1);
    }

    validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
}
