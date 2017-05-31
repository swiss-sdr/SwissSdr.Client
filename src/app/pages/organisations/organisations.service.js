export class OrganisationsService {
    constructor(Config, $http, SdrService, Files) {
        'ngInject';

        this.Config = Config;
        this.$http = $http;
        this.SdrService = SdrService;
        this.bladeType = "organisations";
        this.Files = Files;

        //this.diff = require('deep-diff').diff;

    }

    getOverview(params = {}) {
        var self = this;
        return this.SdrService.getOverview('organisations',params);
    }

    update(object) {
        return this.SdrService.update(object);
    }

    delete(object) {
        return this.SdrService.delete(object);
    }

    getByObject(object) {
        return this.SdrService.getByObject(object);
    }

    getPermissionsByObject(object) {
        return this.SdrService.getPermissionsByObject(object);
    }

    getForMap(params = {}){
        return this.SdrService.getForMap('organisations',params);
    }

    putEntries(object){
        var url = this.Config.apiHost + object.owner.id + "/" + object.apiType;
        var entries = { Items : object.filesAndUrls };
        return this.$http.put(url,entries);
    }

    putEntriesAssociations(object){
        var url = this.Config.apiHost + object.owner.id + "/" + object.apiType;

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

    plain () {
        return this.SdrService.plain('organisations');
    }

    execute(object){
        var self = this;

        if(object._embedded){
            if(angular.isDefined(object._embedded.profileImage) && object._embedded.profileImage){
                if(angular.isDefined(object._embedded.profileImage.fileId)){
                    object._embedded.profileImageId = object._embedded.profileImage.fileId;
                }
            }

            if(object.id){
                if(object._embedded.images){
                    if(angular.isDefined(object._embedded.images.items)) {
                        self.Files.saveImages(object).then(function (data) {
                            object._embedded.images = data.data;
                        });
                    }
                }
            }
        }
    }

    prepareObjForEdit(blade) {

    }

    prepareObjForDetail(blade){
        //blade.sdrData.profileDesc =  blade.getDescription(blade.sdrData.profile,blade.Config.getLanguage().code);


        if(blade.sdrData._embedded.jobs){
            angular.forEach(blade.sdrData._embedded.jobs.items,function(value,key){
                blade.sdrData._embedded.jobs.items[key].contentDesc =  blade.getDescription(blade.sdrData._embedded.jobs.items[key].content,blade.Config.getLanguage().code);
            });
        }
    }

    validate(object){
        var errors = [];

        if(!angular.isDefined(object.name) || Object.keys(object.name).length == 0){
            errors.push("name");
        }

        if(!angular.isDefined(object.description) || Object.keys(object.description).length == 0){
            errors.push("description");
        }

        /*
        if(object.type.length == 0){
            errors.push("type");
        }

        if(object.isicClassification.length == 0){
            errors.push("isicClassification");
        }
        */

        return errors;
    }

    create(object) {
        return this.$http.post(this.Config.apiHost + '/' + this.bladeType, object);
    }


    getUrl() {
        return this.SdrService.url;
    }

    updatePermissionsOnObject(object,params){
        return this.SdrService.updatePermissionsOnObject(object,params);
    }

    checkOnClose(originObj,fallBack){

        delete originObj.fallBack;
        //delete originObj.rootOrganisation;
        delete fallBack.fallBack;

        //console.log(this.diff(originObj,fallBack));

        return angular.equals(originObj,fallBack);
    }

}
