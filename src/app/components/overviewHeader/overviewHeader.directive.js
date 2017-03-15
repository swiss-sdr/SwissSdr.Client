export function BladeOverviewHeaderDirective() {
    'ngInject';

    let directive = {
        restrict: 'E',
        templateUrl: 'app/components/overviewHeader/overviewHeader.html',
        scope: {
            //'sdrType': '=',
            'sdrService': '=',
            'sdrParent':'='
        },
        controller: BladeOverviewHeaderController,
        controllerAs: 'assocated',
        bindToController: true
    };

    return directive;
}

class BladeOverviewHeaderController {
    constructor(Search, Blades,$rootScope, Auth, User, $scope, $filter, $location) {
        'ngInject';

        let self = this;

        this.selected = null;
        this.Search = Search;
        this.Blades = Blades;
        this.Auth = Auth;
        this.ngModel = {};
        this.sdrType = $rootScope.sdrType;
        this.specificBladeSearchURL = $rootScope.specificBladeSearchURL;
        this.$scope = $scope;
        this.$filter = $filter;

        this.form = {};

        this.$location = $location;

        this.loading = true;

        if(this.specificBladeSearchURL === undefined)
            this.specificBladeSearchURL = "search";



        if (angular.isUndefined(this.sdrType))
            this.sdrLabel = $filter('translate')('searchAllObjects');
        else
            this.sdrLabel = $filter('translate')('searchIn' + this.sdrType);

        Auth.get().then(function (auth) {
            if (auth == null)
                return;

            User.get().then(function (user) {
                self.me = user;
                self.loading = false;
            });
        })

        $scope.$watch(function () {
            return $scope.searchText
        }, function (searchText) {

            $rootScope.searchTextOverview = searchText;

            if(angular.isDefined(searchText) && !self.form.$pristine) {
                if (searchText.length == 0) {

                    self.sdrParent.allDataLoaded = false;

                    self.Search.get({
                        take: 10,
                        //q: input,
                        types: self.sdrType
                    }, self.specificBladeSearchURL).then(function (result) {

                        if (self.sdrType == "Person") {
                            result.data = self.prepareDataForPeople(result.data);
                        }
                        self.sdrParent.objects = result.data;
                    });
                } else {
                    self.sdrParent.allDataLoaded = true;
                }
            }

        });

    }

    login() {
        this.Auth.login();
    }

    search(input) {
        var self = this;

        if (!input) {
            return;
        }

        var searchObj = {};

        if(this.sdrType == 'Home'){
            searchObj = {
                take: 10
            };
        } else {
            searchObj = {
                take: 10,
                //q: input,
                types: this.sdrType
            };
        }

        return this.Search.get(searchObj,this.specificBladeSearchURL + "?query=" + input).then(function (result) {

            if(self.sdrType == "Person"){
                result.data = self.prepareDataForPeople(result.data);
            }
            self.sdrParent.objects = result.data;

            return result.data;
        });
    }

    prepareDataForPeople(data){
        var newData = []
        angular.forEach(data, function(value,key) {
            value.name = {de : value.firstname + " " + value.lastname};
            newData.push(value);
        });

        return newData;
    }

    getObject(object) {
        var self = this;
        if (!object) {
            self.ngModel = {};
            return;
        }

        self.ngModel = object;


        if(self.$location.path().indexOf("home") !== -1){
            self.$location.path('/' + object._embedded.data.id + '/');
        } else {
            self.open(object);
        }
    }

    open(object) {
        var self = this;

        setTimeout(function () {
            self.Blades.removeChildrens();
        }, 0);

        setTimeout(function () {
            let blade = self.Blades.add(
                self.Blades.Type.Detail,
                self.sdrService,
                object
            );
        }, 1);
    }
}
