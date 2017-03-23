export function BladeEditDirective() {
    'ngInject';

    let directive = {
        restrict: 'E',
        templateUrl: 'app/components/bladeEdit/bladeEdit.html',
        scope: {
            sdrMeta: '=',
            sdrData: '='
        },
        controller: BladeEditController,
        controllerAs: 'blade',
        bindToController: true
    };

    return directive;
}

class BladeEditController {
    constructor(Helpers, Blades, Tags, $filter, Files, Upload, Search, $rootScope, Toast, Config, $http, $mdDialog, $state, $stateParams, $timeout, $q, $location) {
        'ngInject';

        var self = this;
        this.Blades = Blades;
        this.TagsService = Tags;
        this.SearchService = Search;
        this.specificBladeSearchURL = $rootScope.specificBladeSearchURL;
        this.Config = Config;
        this.$filter = $filter;
        this.$http = $http;
        this.$mdDialog = $mdDialog;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$timeout = $timeout;
        this.$q = $q;
        this.$location = $location;

        this.Upload = Upload;
        this.Toast = Toast;

        this.umlauts = {"ä":"ae", "ü":"ue", "ö":"oe", "ß":"ss" };

        this.fallBackData = {};

        this.selectedTags = [];

        this.showUpload = false;

        this.editForm = {};

        this.sdrMeta.Controller  = this;

        this.disableSave = false;
        this.loading = true;
        this.Files = Files;

        this.defaultPic = '/assets/images/bg-svg.svg';

        this.profilePic = {};

        this.searchTagText = "";

        this.searchIsicClassificationText = "";
        this.isicClassifications = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U'];

        this.searchSdgsText="";
        this.sdgsNumbers = ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17'];

        this.searchParentProjectText="";

        this.organisationTypes = ['university', 'faculty', 'researchTeam', 'independentResearchInstitute', 'company', 'association', 'foundation','publicSector','NGO'];
        this.errors = [];

        Helpers.scrollToRight();

        // prepare
        this.sdrMeta.Service.prepareObjForEdit(this);

        self.sdrData.fallBack = {
            fallBack: {}
        };

        self.sdrData.fallBack = angular.copy(self.sdrData);

        // load Tags
        this.TagsService.get().then(function(result) {
            self.tags = result.data;
        });

        this.sdrData.unSdgList = [];
        this.unSdgObjects = [];

        this.sdrData.unTopicList = [];
        this.unTopicObjects = [];
        this.searchTopicText = "";


        this.$http.get(self.Config.apiHost + "topics",{params:{Type : "unSdg", sort: 'name'}}).then(function(data){
            self.unSdgObjects = data.data._embedded.items;
            angular.forEach(self.sdrData.unSdgIds, function(value,key){

                angular.forEach(self.unSdgObjects, function(value2,key2){

                    if(self.sdrData.unSdgIds[key] == self.unSdgObjects[key2].id){
                        self.sdrData.unSdgList.push(value2);
                    }
                });
            });
        });

        this.$http.get(self.Config.apiHost + "topics",{params:{Type : "unTopic", sort: 'name'}}).then(function(data){
            self.unTopicObjects = data.data._embedded.items;
            angular.forEach(self.sdrData.unTopicIds , function(value,key){

                angular.forEach(self.unTopicObjects, function(value2,key2){

                    if(self.sdrData.unTopicIds[key] == self.unTopicObjects[key2].id){
                        self.sdrData.unTopicList.push(value2);
                    }
                });
            });
        });

        this.isicClassificationsObjects = [];

        angular.forEach(self.isicClassifications, function(value){
            var transValue = self.$filter('translate')('isic_'+value);
            var obj = {
                key : value,
                value : transValue
            }
            self.isicClassificationsObjects.push(obj);
        });


        if(angular.isDefined(this.sdrData.begin) && this.sdrData.begin !== null){
            this.sdrData.begin = new Date(this.sdrData.begin);
        }

        if(angular.isDefined(this.sdrData.end) && this.sdrData.end !== null){
            this.sdrData.end = new Date(this.sdrData.end);
        }

        this.$state.transitionTo('main.blades.detail.action', {action: 'edit'}, {
            location: true,
            inherit: true,
            notify: false
        });
    }


    openExtendedPublications() {
        var self = this;

        if(!angular.isDefined(this.sdrData._embedded.publications)){
            this.sdrData._embedded.publications = {};
            this.sdrData._embedded.publications.items = [];
        }


        this.Blades.addEditPublications(
            this.sdrMeta.Service,
            {
                owner: this.sdrData,
                filesAndUrls: this.sdrData._embedded.publications.items,
                title: self.$filter('translate')('fields.publications'),
                apiType: 'publications',
                addable: ['file', 'url'],
                bladeEditController: this
            }
        );
    }

    openExtendedLibrary() {
        var self = this;


        if(!angular.isDefined(this.sdrData._embedded.library)){
            this.sdrData._embedded.library = {};
            this.sdrData._embedded.library.items = [];
        }


        this.Blades.addEditLibary(
            this.sdrMeta.Service,
            {
                owner: this.sdrData,
                filesAndUrls: this.sdrData._embedded.library.items,
                title: self.$filter('translate')('fields.library'),
                apiType: 'library',
                addable: ['file', 'url'],
                bladeEditController: this
            }
        );
    }

    openEditSession(index, object = {}){

        if(!object.id){
            object.name = {};
            object.content = {};
        }


        this.Blades.addEditSessions(
            this.sdrMeta.Service,
            {
                owner: this.sdrData,
                session: angular.copy(object),
                index: index,
                bladeEditController: this
            }
        );
    }

    removeEventSession(index){
        var self = this;
        var entry = self.sdrData._embedded.sessions.items.splice(index, 1)[0];
        self.sdrMeta.Service.deleteEventSession(entry).then((data) => {
            self.Toast.success(self.$filter('translate')('deleted'));
        }, (error) => {
            self.Toast.error(self.$filter('translate')('errors.default'));
        });
    }

    openExtendedEventSessions() {
        var self = this;

        if(!angular.isDefined(this.sdrData._embedded.sessions)){
            this.sdrData._embedded.sessions = {};
            this.sdrData._embedded.sessions.items = [];
        }

        this.Blades.addEditEventSessions(
            this.sdrMeta.Service,
            {
                owner: this.sdrData,
                sessions: this.sdrData._embedded.sessions.items,
                title: self.$filter('translate')('fields.sessions'),
                apiType: 'sessions',
                addable: []
            }
        );
    }

    openExtendedJobs() {
        var self = this;

        if(!angular.isDefined(this.sdrData._embedded.jobs)){
            this.sdrData._embedded.jobs = {};
            this.sdrData._embedded.jobs.items = [];
        }

        this.Blades.addEditJobs(
            this.sdrMeta.Service,
            {
                owner: this.sdrData,
                filesAndUrls: this.sdrData._embedded.jobs.items,
                title: self.$filter('translate')('jobs'),
                apiType: 'jobs',
                addable: ['url'],
                bladeEditController: this
            }
        );
    }

    openExtendedContacts() {
        var self = this;

        if(!self.sdrData.contactInfo){
            self.sdrData.contactInfo = {};
            self.sdrData.contactInfo.addresses = [];
            self.sdrData.contactInfo.emails = [];
            self.sdrData.contactInfo.phoneNumbers = [];
            self.sdrData.contactInfo.urls = [];
        }

        this.Blades.addEditContacts(
            this.sdrMeta.Service,
            {
                owner: this.sdrData,
                addresses: this.sdrData.contactInfo.addresses,
                emails: this.sdrData.contactInfo.emails,
                phoneNumbers: this.sdrData.contactInfo.phoneNumbers,
                urls: this.sdrData.contactInfo.urls,
                title: self.$filter('translate')('contact'),
                addable: ['address', 'email', 'phoneNumber', 'contactLink'],
                bladeEditController: this
            }
        );
    }

    openExtendedRelations() {
        var self = this;

        if(!angular.isDefined(this.sdrData._embedded.associations)){
            this.sdrData._embedded.associations = {};
            this.sdrData._embedded.associations.items = [];
        }

        angular.forEach(this.sdrData._embedded.associations.items, function(value,key){
           var item =  self.sdrData._embedded.associations.items[key];

            if(item.targetType == "person" && item.targetId){
                item.name = {de : item.target.firstname + " " + item.target.lastname };
               // self.sdrData._embedded.associations.items[key] = item;
            }
        });

        this.Blades.addEditRelations(
            this.sdrMeta.Service,
            {
                owner: this.sdrData,
                title : self.$filter('translate')('related'),
                apiType: 'associations',
                associations: this.sdrData._embedded.associations.items,
                bladeEditController: this
            }
        );
    }


    fillDefaultBegin() {
        if (this.sdrData.begin == null) {
            this.sdrData.begin = new Date();
        }
    }

    fillDefaultEnd() {
        if (this.sdrData.end == null) {
            this.sdrData.end = new Date();
        }
    }

    /**
     * Return the proper object when the append is called.
     */
    transformChip(chip) {
        // If it is an object, it's already a known chip
        if (angular.isObject(chip)) {
            return chip.name;
        } else {
            return this.toTitleCase(chip);
        }
    }

    toTitleCase(str) {
        return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    }

    transformChipIsic(chip) {
        // If it is an object, it's already a known chip
        if (angular.isObject(chip)) {
            return chip.key;
        }
    }


    queryTags(query) {
        var self = this;

        var results = query ? this.tags.filter(this.createFilterFor(query)) : [];

        return results;
    }

    querySdgs(query) {
        var self = this;

        if(query.length < 2){
            return self.unSdgObjects;
        }

        var results = query ? this.unSdgObjects.filter(this.createFilterForSdg(query)) : [];
        return results;
    }


    queryTopic(query) {
        var self = this;

        if(query.length < 2){
            return self.unTopicObjects;
        }

        //var results = query ? this.sdgsNumbers.filter(this.createFilterForSdg(query)) : [];
        var results = query ? this.unTopicObjects.filter(this.createFilterForTopic(query)) : [];
        return results;
    }


    addSDG(item){
        var self = this;
        if(angular.isDefined(item)){
            if(self.sdrData.unSdgIds.indexOf(item.id) == -1) {
                self.sdrData.unSdgIds.push(item.id);
                self.searchSdgsText="";

                angular.forEach(self.unSdgObjects, function (value, key) {

                    if (item.id == self.unSdgObjects[key].id) {
                        self.sdrData.unSdgList.push(value);
                    }
                });
            }
        }
    }


    addTopic(item){
        var self = this;
        if(angular.isDefined(item)){
            if(self.sdrData.unTopicIds.indexOf(item.id) == -1) {
                self.sdrData.unTopicIds.push(item.id);
                self.searchTopicText="";

                angular.forEach(self.unTopicObjects, function (value, key) {

                    if (item.id == self.unTopicObjects[key].id) {
                        self.sdrData.unTopicList.push(value);
                    }
                });
            }
        }
    }

    removeFromSDGElements(index){
        var self = this;
        var entry = self.sdrData.unSdgIds.splice(index, 1)[0];
        var entry = self.sdrData.unSdgList.splice(index, 1)[0];
    }

    removeFromUnTopicElements(index){
        var self = this;
        var entry = self.sdrData.unTopicIds.splice(index, 1)[0];
        var entry = self.sdrData.unTopicList.splice(index, 1)[0];
    }

    queryIsicClassification(query) {

        var self = this;
        var results = query ? this.isicClassificationsObjects.filter(this.createFilterForIsicClassification(query)) : this.isicClassificationsObjects.filter(this.createFilterForIsicClassification(''));
        return results;
    }

    createFilterForIsicClassification(query) {
        var self = this;
        //var tags = self.isicClassifications;
        var tags = self.isicClassificationsObjects;
        var lowercaseQuery = angular.lowercase(query);

        return function filterFn(tags) {
            return (angular.lowercase(tags.value).indexOf(lowercaseQuery) === 0);
        };
    }

    createFilterForSdg(query) {
        var self = this;
        var sdgs = self.unSdgObjects;
        var lowercaseQuery = angular.lowercase(query);

        return function filterFn(sdgs) {
            return (angular.lowercase(self.$filter('sdrlang')(sdgs.name)).indexOf(lowercaseQuery) !== -1);
        };
    }

    createFilterForTopic(query) {
        var self = this;
        var topics = self.UnTopicObjects;
        var lowercaseQuery = angular.lowercase(query);

        return function filterFn(topics) {
            return (angular.lowercase(self.$filter('sdrlang')(topics.name)).indexOf(lowercaseQuery) !== -1);
        };
    }


    createFilterFor(query) {
        var self = this;
        var lowercaseQuery = angular.lowercase(query);

        return function filterFn(tags) {
            return (tags._lowername.indexOf(lowercaseQuery) === 0);
        };
    }

    save() {

        var self = this;

        var images = [];

        self.disableSave = true;

        self.sdrData.fallBack = {
            fallBack: {}
        };

        self.sdrData.fallBack = angular.copy(self.sdrData);

        this.errors = self.sdrMeta.Service.validate(self.sdrData);

        if(this.errors.length > 0) {
            self.disableSave = false;
            self.Toast.error(self.$filter('translate')('requiredfields'));
            return;
        }

        if( angular.isDefined(self.sdrData._embedded) &&
            angular.isDefined(self.sdrData._embedded.images)  &&
            angular.isDefined(self.sdrData._embedded.images.items)) {
                images = self.sdrData._embedded.images.items;
        }

        self.sdrMeta.Service.execute(self.sdrData);

        if (angular.isUndefined(this.sdrData.create) || this.sdrData.create == false)
            this.sdrMeta.Service.update(self.sdrData).then(function () {
                self.Toast.success(self.$filter('translate')('saved'));
                self.disableSave = false;

                self.sdrMeta.Service.prepareObjForEdit(self);
            });
        else
            this.sdrMeta.Service.create(self.sdrData).then(function (result) {
                self.Toast.success(self.$filter('translate')('saved'));
                self.sdrData = result.data;
                self.sdrData.create = false;
                self.disableSave = false;

                return self.sdrData;
            }).then(function (sdrData){

                self.sdrMeta.Service.prepareObjForEdit(self);

                if(images.length > 0){
                    if(angular.isUndefined(sdrData._embedded))
                        sdrData._embedded = {};

                    sdrData._embedded.images = {};
                    sdrData._embedded.images.items = [];
                    sdrData._embedded.images.items = images;

                    self.Files.saveImages(sdrData).then(function (data) {
                        sdrData._embedded.images = data.data;
                    });
                }
            });
    }

    hasError(name) {
        return (this.errors.indexOf(name) !== -1);
    }

    delete() {
        var self = this;

        var confirm = self.$mdDialog.confirm()
            .title(self.$filter('translate')('suredeleting'))
            .textContent('')
            .ariaLabel(self.$filter('translate')('delete'))
            .ok(self.$filter('translate')('delete'))
            .cancel(self.$filter('translate')('cancel'));

        self.$mdDialog.show(confirm).then(function() {

            var redirectType = self.sdrData.id.split("/")[0];

            self.sdrMeta.Service.delete(self.sdrData).then(function (result) {
                self.$location.path('/' + redirectType + '/');
                document.location.reload(true);
            });
        }, function() {
        });
    }

    replaceUmlauts(s) {
        var self = this;
        return s.replace(/[äöüß]/g, function($0) { return self.umlauts[$0] })
    }

    uploadPictures(files, errFiles, callback){
        var self = this;
        if(files.length > 0){
            self.showUpload = true;
            angular.forEach(files, function(file) {
                self.Files.create().then(function (data) {
                    var tmpData = data.data;

                    var fileNameUpdated = self.replaceUmlauts(file.name);

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
                                "name": {"de": fileNameUpdated},
                                "description": {"de": fileNameUpdated}
                            };

                            self.Files.postFile(tmpData._links.self.href, obj).then(function (data) {
                                self.showUpload = false;
                                callback(data,self);

                            });
                        }, function (resp) {
                            self.showUpload = false;
                        }, function (evt) {
                            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                            self.uploadPercentage = progressPercentage;
                        });
                    }
                });
            });
        }
    }

    destroy() {

        this.$state.transitionTo('main.blades.detail.action', {action: ''}, {
            location: true,
            inherit: true,
            notify: false
        });

        var self = this;
        if (angular.isDefined(self.sdrData.fallBack)) {
            self.Blades.blades[1].data = self.sdrData.fallBack;
            self.Blades.blades[1].data.fallBack = angular.copy(self.sdrData.fallBack);
        }
    }

    setProfilePicture(data, self){

        self.$timeout(function(){
            var tmpProfilePicInfos = data.data;

            self.sdrData.profileImageId = tmpProfilePicInfos.id;
            self.sdrData._embedded.profileImage = {};

            self.sdrData._embedded.profileImage.urls = tmpProfilePicInfos.urls;
            self.disableSave = false;
            self.editForm.$pristine = false;
            //self.save();
        }, 1000);
    }

    removeProfilePicture(){
        var self = this;
        self.sdrData.profileImageId = null;
        self.sdrData._embedded.profileImageId = null;
        self.sdrData._embedded.profileImage = null;

        var blades = self.Blades.get();


        if(self.sdrData.id){
            var elem = blades[0].meta.Controller.objects.find(obj => obj.id === self.sdrData.id);
            elem.thumbnailUrl = null;
        }

        self.sdrData._embedded.profileImage = null;

        self.save();
    }

    addImage(data,self){
        if(angular.isUndefined(self.sdrData._embedded))
            self.sdrData._embedded = {};


        if(!angular.isDefined(self.sdrData._embedded.images)){
            self.sdrData._embedded.images = {};
            self.sdrData._embedded.images.items = [];
        }

        self.$timeout(function() {
            self.sdrData._embedded.images.items.push(data.data);

            self.disableSave = false;
            self.editForm.$pristine = false;

        }, 500);
    }

    removeFromElements(index,obj) {
        var self = this;
        var entry = obj.splice(index, 1)[0];
        self.disableSave = false;
        self.editForm.$pristine = false;
        //this.sdrMeta.Service.delete(entry);
    }

    searchOrganisations(input){
        var self = this;
        if (!input) {
            return;
        }

        return this.SearchService.get({
            take: 10,
            //q: input,
            types: "organisation"
        },this.specificBladeSearchURL + "?query=" + input).then(function(result) {
            return result.data;
        });
    }

    setRootOrganisation(item){
        var self = this;
        self.sdrData.rootOrganisationId = item.id;
        self.sdrData.rootOrganisation = item;
    }

    searchProjects(input){
        var self = this;
        if (!input) {
            return;
        }

        return this.SearchService.get({
            take: 10,
            //q: input,
            types: "project"
        },this.specificBladeSearchURL + "?query=" + input).then(function(result) {
            return result.data.filter(obj => obj.id.indexOf(self.sdrData.id) == -1);
        });
    }

    setParentProject(item){

        var self = this;

        if (!item) {
            return;
        }

        self.sdrData.parentProjectId = item.id;
        self.sdrData.parentProject = item;
    }

    addPartnerProject(item){
        var self = this;

        if(!angular.isDefined(self.sdrData._embedded.partnerProjects))
            self.sdrData._embedded.partnerProjects = [];


        if(item) {
            self.sdrData._embedded.partnerProjects.push(item);
            self.searchParentProjectText="";

        }
    }

    getDescription(langObj,newLangCode){
        var self = this;

        if (!angular.isDefined(langObj))
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

    openEditImage(index,image){
        var self = this;

        this.Blades.addEditImage(
            this.sdrMeta.Service,
            {
                object: image,
                images: this.sdrData._embedded.images.items,
                index: index
            }
        );
    }


    modifyHtml(html){
        html = html.replace(/<\/?[^>]+(>|$)/g, "");
        return html;
    }

    compareDate(date1, date2) {
        var moment1 = moment(date1.value);
        var moment2 = moment(date2.value);

        return moment1.isAfter(moment2);
    }
}
