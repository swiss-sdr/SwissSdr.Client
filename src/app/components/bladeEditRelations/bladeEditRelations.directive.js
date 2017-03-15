export function BladeEditRelationsDirective() {
    'ngInject';

    let directive = {
        restrict: 'E',
        templateUrl: 'app/components/bladeEditRelations/bladeEditRelations.html',
        scope: {
            sdrMeta: '=',
            sdrData: '='
        },
        controller: BladeEditRelationsController,
        controllerAs: 'blade',
        bindToController: true
    };

    return directive;
}

class BladeEditRelationsController {
    constructor(Helpers, Blades, Config, $scope, $rootScope, Toast, $filter) {
        'ngInject';

        var self = this;
        this.Blades = Blades;
        this.Config = Config;
        this.Helpers = Helpers;
        this.Toast = Toast;
        this.$filter = $filter;

        this.originatorEv;

        this.editForm = {};

        this.errors = [];

        this.sdrMeta.Controller  = this;

        this.loading = true;

        this.entityType = $rootScope.entityType;

        Helpers.scrollToRight();

        this.patternUrls = new RegExp("^((http|https|ftp):\/\/)");

        this.addThis = {};

        for(var i = 0;i< this.sdrData.associations.length;i++){
            if(this.sdrData.associations[i].targetType == 'person' && this.sdrData.associations[i].associationType == 'entity'){
                this.sdrData.associations[i].target.name = { de :this.sdrData.associations[i].target.firstname + " " + this.sdrData.associations[i].target.lastname};
            }
        }


        self.sdrData.associations.sort(self.compare);
    }

    removeFromElements(index) {
        this.sdrData.associations.splice(index, 1);
        this.editForm.$pristine = false;
    }

    add(object) {
        var self = this;

        if(angular.isDefined(object.id)) {

            var target = {};

            if(angular.isDefined(object.name)){
                target = {
                    name : object.name,
                    description : angular.isDefined(object.description) ?  object.description : {de : ""}
                }
            } else {
                target = {
                    firstname : object.firstname,
                    lastname: object.lastname,
                }
            }

            var obj = {
                targetId: object.id,
                targetType: this.Helpers.typeByObject(object),
                associationDescription: "",
                associationType: "entity",
                sourceType: self.entityType, //"person",
                image: object.image,
                name: angular.isDefined(object.name) ?  object.name : {de : object.firstname + " " + object.lastname}, //object.name
                description: object.description,
                target : target,
                title: angular.isDefined(object.name) ?  object.name : {de : object.firstname + " " + object.lastname} //object.name
            };



            self.sdrData.associations.unshift(obj);

            //self.sdrData.associations.sort(self.compare);

            this.addThis = {};
        }
    }

    compare(a,b){

        var types = [];
        types['topic'] = 1;
        types['project']= 2;
        types['organisation']=3;
        types['event']=4;
        types['person']=5;

        if(types[a.targetType] < types[b.targetType]){
            return -1;
        }
        if(types[a.targetType] > types[b.targetType]){
            return 1;
        }
        return 0;
    }

    addStub(type) {
        var self = this;


        this.addingType = '';

        var obj = {
            target: {
                name: {},
                description: {},
            },
            url: "",
            targetType: type,
            sourceType: self.entityType, //"person",
            associationDescription: "",
            associationType: "stub",
            added: true
        };

        self.sdrData.associations.push(obj);
    }

    save() {
        var self = this;
        if (angular.isArray(this.sdrData.associations)) {


            this.errors = self.validateExtended(self.sdrData);

            if (this.errors.length > 0) {
                self.Toast.error(self.$filter('translate')('requiredfields'));
                return;
            }

            //var items = { items : self.sdrData.associations};

            self.sdrMeta.Service.putEntriesAssociations(self.sdrData).then(function (data) {

                for (var i = 0; i < data.data.items.length; i++) {
                    if (data.data.items[i].targetType == 'person' && data.data.items[i].associationType == 'entity') {
                        data.data.items[i].target.name = {de: data.data.items[i].target.firstname + " " + data.data.items[i].target.lastname};
                    }
                }
                self.sdrData.associations = data.data.items;
                self.Toast.success(self.$filter('translate')('saved'));
            }, function errorCallback(data) {
                self.Toast.error(self.$filter('translate')('errors.default'));
            });
        }
    }

    getSDRLabel(ugcs)
    {
        var self = this;
        var label = '';
        ugcs.forEach(function (ugc) {
            if (label != '')
                label += ' / ';

            label += self.$filter('translate')(ugc);
        });

        return label;
    }

    destroy()
    {
    }

    getOptions(assocated)
    {
        var self = this;
        //return this.Config.getAssocatedFunctions('person', assocated);
        return this.Config.getAssocatedFunctions(self.entityType, assocated);
    }

    openStubMenu($mdOpenMenu, ev)
    {
        this.originatorEv = ev;
        $mdOpenMenu(ev);
    }

    updateUrl(obj)
    {
        var self = this;
        var tmpUrl = angular.isDefined(obj.value) ? obj.value : obj.url;
        tmpUrl = tmpUrl.replace(/[\s]/g, '');
        if (!self.patternUrls.test(tmpUrl)) {
            tmpUrl = "http://" + tmpUrl;
        }
        angular.isDefined(obj.value) ? obj.value = tmpUrl : obj.url = tmpUrl;
        //obj.value = tmpUrl;
        return obj;
    }

    hasError(name)
    {
        return (this.errors.indexOf(name) !== -1);
    }

    validateExtended(object)
    {
        var self = this;
        var errors = [];

        angular.forEach(self.sdrData.associations, function (tmpObj, key) {

            if (tmpObj.associationDescription.length == 0) {
                errors.push("associationDescription_" + key);
            }
        });

        return errors;
    }


}
