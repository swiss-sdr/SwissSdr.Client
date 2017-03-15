export function BladeOverviewDirective() {
    'ngInject';

    let directive = {
        restrict: 'E',
        templateUrl: 'app/components/bladeOverview/bladeOverview.html',
        scope: {
            sdrMeta: '=',
            sdrData: '='
        },
        controller: BladeOverviewController,
        controllerAs: 'blade',
        bindToController: true
    };

    return directive;
}

class BladeOverviewController {
    constructor($log, Blades, Config, Helpers, Filter,$rootScope, User, Auth) {
        'ngInject';

        this.Blades = Blades;
        this.Helpers = Helpers;
        this.$log = $log;

        this.childBlades = [];
        this.$rootScope = $rootScope;

        this.sdrMeta.Controller  = this;

        this.showMap = this.$rootScope.entityType !== "topic" ? true : false;

        this.entityType = this.$rootScope.entityType;

        this.allDataLoaded = false;
        this.objects = [];
        this.loading = false;

        this.take = 10;

        this.filterParams = {};
        this.sortBy = '';
        this.canAdd = false;

        this.alreadyLoaded = false;

        let self = this;


        Auth.get().then(function(auth) {
            if (auth == null)
                return;

            User.get().then(function (user) {
                self.me = user;

                let claims = user.data.claims.filter(function (claim) {
                    return (claim.value == $rootScope.entityType && claim.type == 'CreateEntityOfType')
                });


                if (claims.length > 0)
                    self.canAdd = true;
            });
        });

        Filter.registerListener(function(params) {
            self.objects = [];
            self.allDataLoaded = false;
            self.filterParams = params;

            self.loadData();
        });
    }

    sort(type,param = {}) {
        let self = this;

        this.alreadyLoaded = false;
        this.objects = [];
        this.allDataLoaded = false;

        if(self.$rootScope.entityType == "topic"){
            this.sortBy = type;
            angular.extend(self.filterParams, {
                Type: type,
                sort: type == 'unSdg' ? 'default' : (type == 'unTopic' ? 'name' : 'random')
            });

        } else {
            this.sortBy = type;
            delete self.filterParams.sort;
            delete self.filterParams.Type;
            delete self.filterParams.SdgsOnly;
        }

        if(self.$rootScope.entityType === 'event' && type === 'default'){
            angular.extend(self.filterParams, {
                begin: moment().format("YYYY-MM-DD")
            });
        } else {
            delete self.filterParams.begin;
        }


        //if(param !== 'init'){
            this.loadData();
        //}

    }

    isSort(type) {
        return (this.sortBy == type);
    }

    loadData() {

        /*
        if(this.alreadyLoaded)
            return;
        */

        if (this.allDataLoaded)
            return;

        let self = this;

        if (this.loading)
            return;

        this.loading = true;

        if(self.$rootScope.entityType == "topic"){
            angular.extend(self.filterParams, {
                skip: self.objects.length,
                take: self.take,
            });

        } else {
            angular.extend(self.filterParams, {
                skip: self.objects.length,
                take: self.take,
                sort: self.sortBy
            });

        }

        self.sdrMeta.Service.getOverview(self.filterParams).success((result) => {

            if (result.length == 0)
                self.allDataLoaded = true;

            self.objects = self.objects.concat(result);
            self.loading = false;
            self.alreadyLoaded = true;
        });
    }

    add() {
        var self = this;

        var sdrData = angular.copy(self.sdrMeta.Service.plain());
        sdrData._embedded = {};

        setTimeout(function () {
            self.Blades.removeChildrens();
        }, 0);

        setTimeout(function () {
            let blade = self.Blades.add(
                self.Blades.Type.Edit,
                self.sdrMeta.Service,
                sdrData
            );
        }, 1);
    }

    open(object) {
        var self = this;

        setTimeout(function () {
            self.Blades.removeChildrens();
        }, 0);

        setTimeout(function () {
            let blade = self.Blades.add(
                self.Blades.Type.Detail,
                self.sdrMeta.Service,
                object
            );
        }, 1);
    }

    closeChildren() {
        angular.forEach(this.childBlades, function(blade) {
            blade.sdrMeta.remove();
        });
    }

    setView(view) {
        this.view = view;
        this.allDataLoaded = false;
        if(angular.isDefined(this.$rootScope.searchTextOverview)) {
            if (this.$rootScope.searchTextOverview.length > 0) {
                this.allDataLoaded = true;
            }
        }
    }

    isView(view) {
        var self = this;

        if (this.view == view)
            return true;

        if(!this.view && (self.$rootScope.entityType == "topic" || self.$rootScope.entityType == "person")&& view == 'grid') {
            this.view = view;
            return true;
        }

        if (!this.view && view == 'list')
            return true;

        return false;
    }

    typeByObject(object) {
        return this.Helpers.typeByObject(object, true);
    }

    destroy() {
        if (this.destroyed)
            return;

        this.destroyed = true;

        self = this;

        if (angular.isDefined(self.extended)) {
            self.extended.remove();
        }
    }
}
