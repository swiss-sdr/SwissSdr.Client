export function BladeEditJobsDirective() {
    'ngInject';

    let directive = {
        restrict: 'E',
        templateUrl: 'app/components/bladeEditJobs/bladeEditJobs.html',
        scope: {
            sdrMeta: '=',
            sdrData: '='
        },
        controller: BladeEditJobsController,
        controllerAs: 'blade',
        bindToController: true
    };

    return directive;
}

class BladeEditJobsController {
    constructor(Helpers, Blades, Files, $scope, $q , $timeout, Config, $rootScope, Toast, $filter) {
        'ngInject';

        var self = this;
        this.Blades = Blades;
        this.Files = Files;
        this.$q = $q;
        this.$timeout = $timeout;
        this.$rootScope = $rootScope;
        this.Config = Config;
        this.$scope = $scope;
        this.Toast = Toast;
        this.entityType = $rootScope.entityType;
        this.$filter = $filter;

        this.editForm = {};

        this.sdrMeta.Controller  = this;

        this.loading = true;
        this.errors = [];

        this.patternUrls = new RegExp("^((http|https|ftp):\/\/)");

        Helpers.scrollToRight();
    }

    updateUrl(obj){
        var self = this;
        var tmpUrl = obj.url;
        tmpUrl = tmpUrl.replace(/[\s]/g, '');
        if(!self.patternUrls.test(tmpUrl)) {
            tmpUrl = "http://" + tmpUrl;
        }
        obj.url = tmpUrl;
        return obj;
    }

    findDiff(original, edited){
        var diff = {}
        for(var key in original){
            if(original[key] !== edited[key])
                diff[key] = edited[key];
        }
        return diff;
    }

    isAddable(name) {
        if (!angular.isArray(this.sdrData.addable))
            return false;

        return (this.sdrData.addable.indexOf(name) > -1);
    }

    removeFromElements(index,obj) {
        var entry = obj.splice(index, 1)[0];
        //this.Service.delete(entry);
    }

    addLink() {
        var self = this;

        var link = {
            type: 'url',
            name: {},
            content: {}
        }


        this.sdrData.filesAndUrls.push(link);
    }

    save() {
        var self = this;

        this.errors = self.validateExtended(self.sdrData);

        if(this.errors.length > 0){
            self.Toast.error(self.$filter('translate')('requiredfields'));
            return;
        }

        self.sdrData.owner.jobs = self.sdrData.filesAndUrls;

        self.sdrMeta.Service.putEntries(self.sdrData).then(function(data){
            self.Toast.success(self.$filter('translate')('saved'))
        }, function errorCallback(data){
            self.Toast.error(self.$filter('translate')('errors.default'));
        });


        if(!angular.isDefined(this.sdrData.filesAndUrls) && angular.isDefined(this.sdrData.owner)){
            this.sdrMeta.bladeEditController.save();
        }
    }

    destroy() {
    }

    getOptions(assocated) {
        var self = this;
        //return this.Config.getAssocatedFunctions('person', assocated);
        return this.Config.getAssocatedFunctions(self.entityType , assocated);
    }

    validateExtended(object){
        var self = this;
        var errors = [];

        angular.forEach(object.filesAndUrls, function(tmpObj, key) {

            if(!angular.isDefined(tmpObj.name) || Object.keys(tmpObj.name).length == 0){
                errors.push("name_"+key);
            }

            var noContent = false;
            angular.forEach(Object.keys(tmpObj.content), function(value, key) {

                if(!tmpObj.content[value].data || /^\s*$/.test(tmpObj.content[value].data)){
                    noContent = true;
                }
            });

            if(noContent){
                errors.push("content_"+key);
            }

            if(angular.isUndefined(tmpObj.function)){
                errors.push("function_"+key);
            }

        });

        return errors;
    }

    hasError(name) {
        var self = this;

        return (self.errors.indexOf(name) !== -1);
    }
}
