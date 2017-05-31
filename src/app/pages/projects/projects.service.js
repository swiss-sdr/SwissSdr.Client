export class ProjectsService {
    constructor (Config, $http, SdrService, Files, $translate) {
        'ngInject';

        this.Config = Config;
        this.$http = $http;
        this.SdrService = SdrService;
        this.bladeType = "projects";
        this.Files = Files;

        //this.diff = require('deep-diff').diff;
    }

    getUrl() {
        return this.SdrService.url;
    }

    getOverview(params = {}) {
        var self = this;
        return this.SdrService.getOverview('projects', params);
    }

    create(object) {
        this.deleteNotUsedDefaultContent(object.content.basic);
        return this.$http.post(this.Config.apiHost + '/' + this.bladeType, object);
    }


    update(object) {
        this.deleteNotUsedDefaultContent(object.content.basic);
        return this.SdrService.update(object);
    }

    delete(object){
        return this.SdrService.delete(object);
    }

    getByObject(object) {
        return this.SdrService.getByObject(object);
    }


    getForMap(params = {}) {
        return this.SdrService.getForMap('projects',params);
    }

    putEntries(object){
        var url = this.Config.apiHost + object.owner.id + "/" + object.apiType;
        var entries = { Items : object.filesAndUrls };
        return this.$http.put(url,entries);
    }

    putEntriesAssociations(object){
        var url = this.Config.apiHost + object.owner.id + "/" + object.apiType;

        var entries = [];
        for(var i = 0;i<object.associations.length;i++){
            if(object.associations[i].associationType == 'stub'){
                var obj = {
                    targetType: object.associations[i].targetType,
                    associationDescription : object.associations[i].associationDescription,
                    associationType : object.associations[i].associationType,
                    sourceType : object.associations[i].sourceType,
                    name : object.associations[i].target.name,
                    description : object.associations[i].target.description,
                    url : object.associations[i].url,
                    target : object.associations[i].target

                };
                object.associations[i] = obj;
            }
        }

        return this.$http.put(url,{ Items : object.associations });
    }

    plain() {
        var plainProject = this.SdrService.plain('projects');
        plainProject.content.basic = this.getDefaultContent({});

        return plainProject;
    }

    getDefaultContent(contentBasicPresets) {
        var self = this;

        this.Config.getLanguages().forEach(function(language) {

            if (angular.isDefined(contentBasicPresets[language.code]) && angular.isDefined(contentBasicPresets[language.code].data))
                if (contentBasicPresets[language.code].data.length > 0)
                    return;

            contentBasicPresets[language.code] = {data: self.Config.getDefaultContent(language.code)};

        });

        return contentBasicPresets;
    }

    deleteNotUsedDefaultContent(contentBasic) {
        var self = this;
        this.Config.getLanguages().forEach(function(language) {
            if (angular.isDefined(contentBasic[language.code]) && angular.isDefined(contentBasic[language.code].data)) {
                if (self.Config.getDefaultContent(language.code) == contentBasic[language.code].data) {
                    contentBasic[language.code].data = '';
                }
            }
        });

        return contentBasic;
    }

    getPermissionsByObject(object) {
        return this.SdrService.getPermissionsByObject(object);
    }

    execute(object){
        var self = this;

        if(object.id) {
            if(object._embedded) {
                if (object._embedded.images) {
                    if (angular.isDefined(object._embedded.images.items)) {
                        self.Files.saveImages(object).then(function (data) {
                            object._embedded.images = data.data;
                        });
                    }
                }
            }
        }

        if(object.parentProject){
            object.parentProjectId = object.parentProject.id;
        }

        if(object._embedded.partnerProjects){
            var arrIds = [];

            angular.forEach(object._embedded.partnerProjects, function(value,key){
                arrIds.push(value.id);
            });

            object.partnerProjectIds = arrIds;
        }

    }

    prepareObjForEdit(blade) {
        blade.sdrData.content.basic = this.getDefaultContent(blade.sdrData.content.basic);
    }

    prepareObjForDetail(blade){

        if (blade.sdrData.content && blade.sdrData.content.basic) {
            blade.sdrData.contentBasic = blade.getDescription(blade.sdrData.content.basic, blade.Config.getLanguage().code);
        } else {
            blade.sdrData.contentBasic = '';
        }

        if (blade.sdrData.content && blade.sdrData.content.basic) {
            blade.sdrData.contentExtended = blade.getDescription(blade.sdrData.content.extended,blade.Config.getLanguage().code);
        } else {
            blade.sdrData.contentExtended = '';
        }




        if (angular.isUndefined(blade.sdrData._embedded.jobs))
            blade.sdrData._embedded.jobs = {
                items: []
            };

        angular.forEach(blade.sdrData._embedded.jobs.items,function(value,key){
            blade.sdrData._embedded.jobs.items[key].contentDesc =  blade.getDescription(blade.sdrData._embedded.jobs.items[key].content,blade.Config.getLanguage().code);
        });
    }

    validate(object){
        var errors = [];

        if(!angular.isDefined(object.name) || Object.keys(object.name).length == 0){
            errors.push("name");
        }

        if(!angular.isDefined(object.laySummary) || Object.keys(object.laySummary).length == 0){
            errors.push("laySummary");
        }

        if(!angular.isDefined(object.description) || Object.keys(object.description).length == 0){
            errors.push("description");
        }

        if(!angular.isDefined(object.phase) || object.phase.length == 0){
            errors.push("phase");
        }

        if(!angular.isDefined(object.tags) || object.tags.length == 0){
            errors.push("tags");
        }

        if(!angular.isDefined(object.unTopicIds) || object.unTopicIds.length == 0){
            errors.push("unTopicIds");
        }

        return errors;
    }

    updatePermissionsOnObject(object,params){
        return this.SdrService.updatePermissionsOnObject(object,params);
    }

    checkOnClose(originObj,fallBack){
        if('parentProject' in originObj._embedded)
            fallBack._embedded.parentProject = null;

        delete originObj.fallBack;
        delete originObj.unSdgList;
        delete originObj.unTopicList;

        delete fallBack.fallBack;
        delete fallBack.unSdgList;
        delete fallBack.unTopicList;

        angular.forEach(originObj.disciplines, function(disc){
            delete disc.$$mdSelectId;
            delete disc.active;
            delete disc.$$hashKey;
        });

        angular.forEach(fallBack.disciplines, function(disc){
            delete disc.$$mdSelectId;
            delete disc.name;
            delete disc.subgroup;
        });

        //var deep = DeepDiff.noConflict();


        //console.warn(deep.diff(originObj, fallBack));

        //console.log(this.diff(originObj,fallBack));

        return angular.equals(originObj,fallBack);
    }
}
