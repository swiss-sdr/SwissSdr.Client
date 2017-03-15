export class TopicsService {
    constructor(Config, $http, SdrService, Files) {
        'ngInject';

        this.Config = Config;
        this.$http = $http;
        this.SdrService = SdrService;
        this.bladeType = "topics";
        this.Files = Files;
    }

    getOverview(params = {}) {
        var self = this;
        return this.SdrService.getOverview('topics', params);
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

    getForMap(params = {}) {
        return this.SdrService.getForMap(params);
    }

    create(object) {
        return this.$http.post(this.Config.apiHost + '/' + this.bladeType, object);
    }

    putEntries(object){
        var url = this.Config.apiHost + object.owner.id + "/" + object.apiType;
        var entries = { Items : object.filesAndUrls };
        return this.$http.put(url,entries);
    }

    plain () {
        return this.SdrService.plain('topics');
    }

    execute(object) {
        var self = this;

        if(object._embedded.images){
            setTimeout(function() {
                if(angular.isDefined(object._embedded.images.items)) {
                    self.Files.saveImages(object).then(function (data) {
                        object._embedded.images = data.data;
                    });
                }
            }, 300);
        }
    }

    prepareObjForDetail(blade){
        //blade.sdrData.descriptionDesc =  blade.getDescription(blade.sdrData.description,blade.Config.getLanguage().code);
        //blade.sdrData.shortDescriptionDesc =  blade.getDescription(blade.sdrData.shortDescription,blade.Config.getLanguage().code);
        //blade.sdrData.contentDesc =  blade.getDescription(blade.sdrData.content,blade.Config.getLanguage().code);
    }

    prepareObjForEdit(blade) {

    }

    validate(object){
        var errors = [];

        if(!angular.isDefined(object.name) || Object.keys(object.name).length == 0){
            errors.push("name");
        }

        if(object.tags.length == 0){
            errors.push("tags");
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
