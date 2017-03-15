export class PeopleService {
    constructor (Config, $http, SdrService, Toast) {
        'ngInject';

        this.Config = Config;
        this.$http = $http;
        this.SdrService = SdrService;
        this.Toast = Toast;
        this.bladeType = "people";
    }

    getOverview(params = {}) {
        var self = this;
        return this.SdrService.getOverview('people', params);
    }


    delete(object){
        return this.SdrService.delete(object);
    }

    getByObject(object) {
        return this.SdrService.getByObject(object);
    }

    getPermissionsByObject(object) {
        return this.SdrService.getPermissionsByObject(object);
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

    update(object) {
        return this.$http.put(object._links.self.href, object);
    }

    create(object) {
        return this.$http.post(this.Config.apiHost + '/' + this.bladeType, object);
    }

    getForMap(params = {}) {
        return this.SdrService.getForMap('people', params);
     }

    save(object,apiType){
        var url = this.Config.apiHost + object.owner.id + "/" + apiType;
        var changedEntry = object.filesAndUrls[index];
        return this.$http.post(url,changedEntry);
    }

    addAssociation(object, association) {
        return this.$http.post(object._links.self.href + '/associations', association);
    }

    plain () {
        return this.SdrService.plain('people');
    }

    execute(object){
        var self = this;

        /*
        if(angular.isDefined(object._embedded.profileImage) && object._embedded.profileImage){
            if(angular.isDefined(object._embedded.profileImage.fileId)){
                object._embedded.profileImageId = object._embedded.profileImage.fileId;
            }
        }
        */

    }

    prepareObjForEdit(blade) {

    }

    prepareObjForDetail(blade){
        //blade.sdrData.profileDesc =  blade.getDescription(blade.sdrData.profile,blade.Config.getLanguage().code);
    }

    validate(object){
        var errors = [];

        if(!object.firstname || object.firstname.length == 0){
            errors.push("firstname");
        }

        if(!object.lastname || object.lastname.length == 0){
            errors.push("lastname");
        }

        if(angular.isUndefined(object.interestAreas) || object.interestAreas.length == 0){
            errors.push("interestAreas");
        }

        return errors;
    }


    getUrl() {
        return this.SdrService.url;
    }

    updatePermissionsOnObject(object,params){
        return this.SdrService.updatePermissionsOnObject(object,params);
    }

    checkOnClose(originObj,fallBack){
        delete originObj.fallBack;
        delete fallBack.fallBack;

        return angular.equals(originObj,fallBack);
    }

}
