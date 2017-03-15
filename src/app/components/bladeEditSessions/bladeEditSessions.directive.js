export function BladeEditSessionsDirective() {
    'ngInject';

    let directive = {
        restrict: 'E',
        templateUrl: 'app/components/bladeEditSessions/bladeEditSessions.html',
        scope: {
            sdrMeta: '=',
            sdrData: '='
        },
        controller: BladeEditSessionsController,
        controllerAs: 'blade',
        bindToController: true
    };

    return directive;
}

class BladeEditSessionsController {
    constructor(Helpers, Blades, Search, $scope, $timeout, $rootScope, Toast,$filter) {
        'ngInject';

        var self = this;
        this.$timeout = $timeout;
        this.Blades = Blades;
        this.$scope = $scope;
        this.SearchService = Search;
        this.Toast = Toast;
        this.$filter = $filter;

        this.specificBladeSearchURL = $rootScope.specificBladeSearchURL;

        this.sdrMeta.Controller  = this;

        this.loading = true;
        this.errors = [];

        Helpers.scrollToRight();


        if(!angular.isDefined(this.sdrData.owner._embedded.sessions)){
            this.sdrData.owner._embedded.sessions = {};
            this.sdrData.owner._embedded.sessions.items = [];
        }


        // fill begin and end if exsts
        this.initDateFormats();
    }

    save() {
        var self = this;

        this.errors = self.validateEventSession();

        if(this.errors.length > 0){
            self.Toast.error(self.$filter('translate')('requiredfields'));
            return;
        }

        var checkDate = Date.parse(self.sdrData.session.beginDate)
        if(isNaN(checkDate)){
            self.Toast.error(self.$filter('translate')('invalidDateField'));
            return;
        }

        self.updateDateFormats();

        if(!self.sdrData.session.id){
            var object = self.sdrData.session;

            object._links = {};
            object._links.self = {};
            object._links.self.href = self.sdrData.owner._links.self.href + "/sessions";

            self.sdrMeta.Service.saveEventSession(object).then(function(data){
                self.sdrData.owner._embedded.sessions.items.push(data.data);

                self.Toast.success(self.$filter('translate')('saved'));
                self.sdrMeta.remove();
            });

        } else {
            self.sdrMeta.Service.updateEventSession(self.sdrData.session).then(function(data){
                self.sdrData.owner._embedded.sessions.items[self.sdrData.index] = data.data;

                self.Toast.success(self.$filter('translate')('saved'));
                self.sdrMeta.remove();
            });


        }

    }

    searchSpeaker(input){
        var self = this;
        if (!input) {
            return;
        }

        return this.SearchService.get({
            take: 10,
            //q: input,
            types: "person"
        },"people?query=" + input).then(function(result) {
            var res = result.data;

            angular.forEach(res , function(value,key){
               res[key].display = res[key].firstname + " " + res[key].lastname;
            });

            return res;
        });
    }

    setSpeaker(item, idx){
        var self = this;

        if(item) {
            //self.bladeObj.element.sessions[idx].speakerIds.push(item.id);
            self.sdrData.session.speakers.push(item);
        }
    }

    updateDateFormats(){
        if (this.sdrData.session === undefined)
            return;

        this.sdrData.session.begin = this.getISOString(this.sdrData.session.beginTime, this.sdrData.session.beginDate);
        this.sdrData.session.end = this.getISOString(this.sdrData.session.endTime, this.sdrData.session.beginDate);

    }

    initDateFormats() {
        if (this.sdrData.session == undefined)
            return;

        if (this.sdrData.session.begin !== undefined) {
            var dateTimeBegin = moment(this.sdrData.session.begin);

            this.sdrData.session.beginTime = dateTimeBegin.format('HHmm');;
            this.sdrData.session.beginDate = dateTimeBegin.toDate();
        }

        if (this.sdrData.session.end !== undefined) {
            var dateTimeEnd = moment(this.sdrData.session.end);

            this.sdrData.session.endTime = dateTimeEnd.format('HHmm');;
        }
    }


    getISOString(strTime, strDate) {
        if (strTime === undefined) return;
        if (strDate === undefined) return;


        var hour = strTime.substr(0, 2);
        var minutes = strTime.substr(2, 3);


        var date = moment(strDate)
            .set({ hour: parseInt(hour, 10), minute: parseInt(minutes, 10) });

        return date.toDate().toISOString();
    }

    destroy() {
    }

    validateEventSession(){
        var self = this;

        var errors = [];


        if(!angular.isDefined(self.sdrData.session.name) || Object.keys(self.sdrData.session.name).length == 0){
            errors.push("name");
        }

        if(!angular.isDefined(self.sdrData.session.beginTime)){
            errors.push("beginTime");
        }

        if(!angular.isDefined(self.sdrData.session.endTime)){
            errors.push("endTime");
        }


        return errors;
    }

    hasError(name) {
        return (this.errors.indexOf(name) !== -1);
    }
}

