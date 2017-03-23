export function BladeDetailDirective() {
    'ngInject';

    let directive = {
        restrict: 'E',
        templateUrl: 'app/components/bladeDetail/bladeDetail.html',
        scope: {
            sdrMeta: '=',
            sdrData: '='
        },
        controller: BladeDetailController,
        controllerAs: 'blade',
        bindToController: true
    };

    return directive;
}

class BladeDetailController {
    constructor(Helpers, Blades, $scope, Config, $location, Events, Projects, Topics, Organisations, People, $http, $state, $stateParams, $filter, $mdDialog) {
        'ngInject';

        var self = this;
        this.Blades = Blades;

        this.disableButton = false;

        this.Config = Config;
        this.$location = $location;
        this.Organisations = Organisations;
        this.Events = Events;
        this.Projects = Projects;
        this.Topics = Topics;
        this.People = People;
        this.$http = $http;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$filter = $filter;
        this.$mdDialog = $mdDialog;


        this.lastDate = null;

        this.associationsByType = {};

        this.sdrMeta.Controller  = this;

        this.loading = true;
        Helpers.scrollToRight();

        this.languages = Config.getLanguages();


        if(this.sdrMeta.Service === undefined){

            if(this.sdrData.id.startsWith("people")){
                this.sdrMeta.Service = People;
            } else if(this.sdrData.id.startsWith("events")){
                this.sdrMeta.Service = Events;
            } else if(this.sdrData.id.startsWith("organisations")){
                this.sdrMeta.Service = Organisations;
            } else if(this.sdrData.id.startsWith("topics")){
                this.sdrMeta.Service = Topics;
            } else {
                this.sdrMeta.Service = Projects;
            }
        }

        if (this.sdrMeta.Service.bladeType == 'events') {
            this.sdrMeta.Service.onUpdated(function () {
                // cheap workarround
                setTimeout(function () {
                    self.sdrData = self.sdrMeta.Service.setSortedSessions(self.sdrData);
                }, 1000);
            });
        }


        this.sdrMeta.Service.getByObject(this.sdrData).then(function (object) {

            self.sdrData = object.data;

            if(angular.isUndefined(self.sdrData._embedded)){
                self.sdrData._embedded = {};
            }

            self.loading = false;

            // open extended blade if there are associated datas
            if (self.sdrData.associatedEntities && self.sdrData.associatedEntities.length > 0) {
                self.extended = self.Blades.add(self.Blades.Type.Extended, self.sdrMeta.Service, self.sdrData);
            }

            self.sdrMeta.Service.prepareObjForDetail(self);
            self.sdrData.fallBack = angular.copy(self.sdrData);


            // set state
            var redirectType = self.sdrData.id.split("/")[0];
            var redirectID = self.sdrData.id.split("/")[1];

            if (self.sdrMeta.firstOfType)
                self.$state.transitionTo('main.blades.detail', {id: redirectID}, {
                    location: true,
                    inherit: true,
                    notify: false
                });



            if(self.sdrData._embedded.associations){
                if(self.sdrData._embedded.associations.items.length > 0){
                    self.sdrData._embedded.associations.items.map(function(obj){ if (obj.targetType in self.associationsByType){} else {self.associationsByType[obj.targetType] = [];} self.associationsByType[obj.targetType].push(obj)});
                    angular.forEach(self.associationsByType, function(value,key){
                       self.associationsByType[key] = self.associationsByType[key].sort(function(a,b){
                           if(a.targetType == 'person' && b.targetType == 'person'){
                               return a.target.lastname > b.target.lastname ? 1 : a.target.lastname < b.target.lastname ? -1 : 0;
                           } else {
                               return self.$filter('sdrlang')(a.target.name) > self.$filter('sdrlang')(b.target.name) ? 1 : self.$filter('sdrlang')(a.target.name) < self.$filter('sdrlang')(b.target.name) ? -1 : 0;
                           }
                      }) ;
                    });
                }
            }

            return self.sdrData;
        }).then(function(data){

            self.sdrData.unSdgList = [];
            self.unSdgObjects = [];

            self.$http.get(self.Config.apiHost + "topics",{params:{Type : "unSdg"}}).then(function(data){
                self.unSdgObjects = data.data._embedded.items;
                angular.forEach(self.sdrData.unSdgIds, function(value,key){

                    angular.forEach(self.unSdgObjects, function(value2,key2){

                        if(self.sdrData.unSdgIds[key] == self.unSdgObjects[key2].id){
                            self.sdrData.unSdgList.push(value2);
                        }
                    });
                });
            });

            self.sdrData.unTopicList = [];
            self.unTopicObjects = [];

            self.$http.get(self.Config.apiHost + "topics",{params:{Type : "unTopics" , take: 1000}}).then(function(data){
                self.unTopicObjects = data.data._embedded.items;
                angular.forEach(self.sdrData.unTopicIds , function(value,key){

                    angular.forEach(self.unTopicObjects, function(value2,key2){

                        if(self.sdrData.unTopicIds[key] == self.unTopicObjects[key2].id){
                            self.sdrData.unTopicList.push(value2);
                        }
                    });
                });
            });

        });

        $scope.$on("$destroy", function handler() {
            self.destroy();
        });



        $scope.$watch(function(){
            return self.Config.currentLanguage;
        },function(language){
            self.sdrMeta.Service.prepareObjForDetail(self);
        });


        // adds bladeCore variables to this
        // angular.extend(this, this.bladeObj);
    }

    openEdit() {
        var self = this;

        if(self.$location.path().indexOf(self.sdrData.id) != -1){

            self.Blades.removeAllAfterIndex(self.sdrMeta._bladeId);

            if (this.sdrData._embedded.associations)
                angular.forEach(this.sdrData._embedded.associations.items, function (value, key) {
                    var item = self.sdrData._embedded.associations.items[key];
                    if (item.targetType == "person") {
                        item.name = {de: item.target.firstname + " " + item.target.lastname};
                        self.sdrData._embedded.associations.items[key] = item;
                    }
                });

            this.Blades.addEdit(this.sdrMeta.Service, this.sdrData);

        } else {

            var confirm = self.$mdDialog.confirm()
                .title(self.$filter('translate')('leaveWithoutSavingTitle'))
                .textContent(self.$filter('translate')('warnOpenEdit'))
                .ariaLabel(self.$filter('translate')('warnOpenEdit'))
                .ok(self.$filter('translate')('open'))
                .cancel(self.$filter('translate')('cancel'));

            self.$mdDialog.show(confirm).then(function() {
                self.$location.path('/' + self.sdrData.id + '/edit');
            }, function() {
            });
        }
    }

    openPermission() {
        this.disableButton = true;
        this.Blades.addPermission(this.sdrMeta.Service, this.sdrData, this);
    }

    destroy() {
        if (this.destroyed)
            return;

        // set state
        if (this.sdrMeta.firstOfType)
            this.$state.transitionTo('main.blades.detail', {id: ''}, {
                location: true,
                inherit: true,
                notify: false
            });

        this.destroyed = true;

        var self = this;

        if (angular.isDefined(self.extended)) {
            self.extended.remove();
        }
    }

    changeProfileDescription(){
        var self = this;
        var newLang = self.selectedLanguage;
        self.sdrData.profileDesc = self.getDescription(self.sdrData.profile,newLang);
    }

    getDescription(langObj,newLangCode){
        var self = this;

        if (angular.isUndefined(langObj) || langObj == null)
            return '';

        var fallbackCode = self.Config.getFallbackLanguage().code;

        if (angular.isDefined(langObj[newLangCode]))
            return langObj[newLangCode];

        if (angular.isDefined(langObj[fallbackCode]))
            return langObj[fallbackCode];

        if(angular.isDefined(langObj[Object.keys(langObj)[0]]))
            return langObj[Object.keys(langObj)[0]];

        return '';
    }

    getContent(langObj,newLangCode){
        var self = this;

        if (angular.isUndefined(langObj) || langObj == null)
            return '';

        var fallbackCode = self.Config.getFallbackLanguage().code;

        if (angular.isDefined(langObj[newLangCode]))
            return langObj[newLangCode].data;

        if (angular.isDefined(langObj[fallbackCode]))
            return langObj[fallbackCode].data;

        if(angular.isDefined(langObj[Object.keys(langObj)[0]]))
            return langObj[Object.keys(langObj)[0]].data;

        return '';
    }



    openObjects(object) {
        var self = this;

        if(object.id) {

            var redirectType = object.id.split("/")[0];
            var redirectID = object.id.split("/")[1];

            let service = null;

            switch (redirectType) {
                case 'organisations':
                    service = this.Organisations;
                    break;
                case 'events':
                    service = this.Events;
                    break;
                case 'projects':
                    service = this.Projects;
                    break;
                case 'people':
                    service = this.People;
                    break;
                case 'topics':
                    service = this.Topics;
                    break;
            }

            self.Blades.removeAllAfterIndex(self.sdrMeta._bladeId);

            self.$http.get(self.Config.apiHost + object.id).then(function(data){
                return data.data;
            }).then(function(tmpObject){
                self.Blades.add(
                    self.Blades.Type.Detail,
                    service,
                    tmpObject
                );
            });
        }
    }

    isNewDate(date) {
        var result = (this.isLastDate == date);

        this.isLastDate = date;

        return result;
    }

    openExtendedAssociations(values) {
        var self = this;

        self.Blades.removeAllAfterIndex(self.sdrMeta._bladeId);

        self.Blades.add(
            self.Blades.Type.ExtendedAssociations,
            this.sdrMeta.Service,
            {
                associations: values,
                title: self.$filter('translate')('relation')
            }
        )

        /*
        this.Blades.addExtendedAssociations(
            this.sdrMeta.Service,
            {
                associations: this.sdrData._embedded.associations.items,
                title: self.$filter('translate')('relation')
            }
        );
         */
    }

    compareDate(date1, date2) {
        var moment1 = moment(date1.value);
        var moment2 = moment(date2.value);

        return moment1.isAfter(moment2);
    }

    checkContactInfos(){

        if(this.sdrData.contactInfo){
            return this.sdrData.contactInfo.urls.length > 0 || this.sdrData.contactInfo.emails.length > 0 ||this.sdrData.contactInfo.phoneNumbers.length > 0 ||this.sdrData.contactInfo.addresses.length > 0;
        }

        return false;
     }
}
