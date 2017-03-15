export class EventsService {
    constructor(Config, $http, SdrService, Files) {
        'ngInject';

        this.Config = Config;
        this.$http = $http;
        this.SdrService = SdrService;
        this.bladeType = "events";
        this.Files = Files;

        this.onUpdatedObservers = [];
    }

    onUpdated(callback) {
        this.onUpdatedObservers.push(callback);
    }

    notifyUpdatedObservers() {
        angular.forEach(this.onUpdatedObservers, function (callback) {
            callback();
        });
    }

    getOverview(params = {}) {
        var self = this;
        return this.SdrService.getOverview('events', params);
    }

    update(object) {
        this.notifyUpdatedObservers();
        return this.SdrService.update(object);
    }

    create(object) {
        this.notifyUpdatedObservers();
        return this.$http.post(this.Config.apiHost + '/' + this.bladeType, object);
    }

    delete(object) {
        this.notifyUpdatedObservers();
        return this.SdrService.delete(object);
    }

    getByObject(object) {
        return this.SdrService.getByObject(object);
    }

    getPermissionsByObject(object) {
        return this.SdrService.getPermissionsByObject(object);
    }

    getForMap(params = {}) {
        return this.SdrService.getForMap('events',params);
    }

    putEntries(object){
        var url = this.Config.apiHost + object.owner.id + "/" + object.apiType;
        var entries = { Items : object.filesAndUrls };
        return this.$http.put(url,entries);
    }

    putEntriesEventSessions(object){
        var url = this.Config.apiHost + object.owner.id + "/" + object.apiType;
        var entries = { Items : object.sessions };
        return this.$http.put(url,entries);
    }

    plain () {
        return this.SdrService.plain('events');
    }

    execute(object){
        var self = this;

        if(object._embedded.images){
            if(angular.isDefined(object._embedded.images.items)) {
                self.Files.saveImages(object).then(function (data) {
                    object._embedded.images = data.data;
                });
            }
        }
    }

    prepareObjForEdit(blade) {
        this.setSortedSessions(blade.sdrData);
    }

    save(object,apiType){
        this.notifyUpdatedObservers();
        var url = this.Config.apiHost + object.owner.id + "/" + apiType;
        var changedEntry = object.filesAndUrls[index];
        return this.$http.post(url,changedEntry);
    }

    saveEventSession(object){
        this.notifyUpdatedObservers();
        return this.$http.post(object._links.self.href, object);
    }

    updateEventSession(object){
        this.notifyUpdatedObservers();
        return this.$http.put(object._links.self.href, object);
    }

    deleteEventSession(object){
        this.notifyUpdatedObservers();
        return this.$http.delete(object._links.self.href);
    }


    prepareObjForDetail(blade){
        //blade.sdrData.contentDesc =  blade.getDescription(blade.sdrData.content,blade.Config.getLanguage().code);
        //blade.sdrData.descriptionDesc =  blade.getDescription(blade.sdrData.description,blade.Config.getLanguage().code);

        this.setSortedSessions(blade.sdrData);

        blade.sdrData.tmpTimeBegin = blade.sdrData.begin;
        blade.sdrData.tmpTimeEnd = blade.sdrData.end;
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

    validate(object){
        var errors = [];

        if(!angular.isDefined(object.name) || Object.keys(object.name).length == 0){
            errors.push("name");
        }

        if(!object.begin){
            errors.push("begin");
        }

        if(!object.end){
            errors.push("end");
        }

        if(!angular.isDefined(object.description) || Object.keys(object.description).length == 0){
            errors.push("description");
        }

        if(object.tags.length == 0){
            errors.push("tags");
        }

        return errors;
    }


    getUrl() {
        return this.SdrService.url;
    }

    setSortedSessions(object) {
        var sessions = {};

        if(angular.isDefined(object._embedded.sessions) && object._embedded.sessions.items.length > 0) {
            angular.forEach(object._embedded.sessions.items, function(session) {

                var date = moment(session.begin).format("DD.MM.YYYY");

                if(sessions[date] === undefined) {
                    sessions[date] = [];
                }

                sessions[date].push(session);
            });
        }

        object.sortedSessions = sessions;
        return object;
    }

    checkOnClose(originObj,fallBack){

        var noDateChanges = true;

        delete originObj.fallBack;

        delete fallBack.fallBack;

        //var deep = DeepDiff.noConflict();

        if(fallBack.begin !== null){
            fallBack.begin = moment(fallBack.begin).toDate();
        }

        if(fallBack.end !== null){
            fallBack.end = moment(fallBack.end).toDate();
        }

        //console.warn(deep.diff(originObj, fallBack));


        return angular.equals(originObj,fallBack);
    }
}
