export function FilterDirective() {
  'ngInject';

  let directive = {
    restrict: 'E',
    templateUrl: 'app/components/filter/filter.html',
    controller: FilterController,
    controllerAs: 'filter',
    bindToController: true
  };

  return directive;
}

class FilterController {

    constructor(Config, Tags, Filter, $rootScope, $scope, $timeout) {
        'ngInject';

        var self = this;

        this.$scope = $scope;
        this.$rootScope = $rootScope;
        this.$timeout = $timeout;
        this.selectedTags = [];
        this.selectedTag = null;
        this.searchTag = null;
        this.Filter = Filter;
        this.Config = Config;
        this.isReset = false;

        this.languages = Config.getLanguages();
        this.TagsService = Tags;

        this.phase = ['planned', 'active','finished'];

        this.tagList = [];

        this.sdrType = angular.lowercase($rootScope.sdrType);

        this.TagsService.get().then(function(result) {
            self.tags = result.data;
            self.tagList = result.data;
        });

        $scope.$watch(function () {
            return self.searchTag;
        }, function (searchTag) {
            self.queryTags(searchTag);
        });

        $rootScope.$on('$translateChangeSuccess', function () {
            $timeout(function() {
                var mdSelects = document.querySelector('md-select');
                var ngModelCtrl = angular.element(mdSelects).controller('ngModel');

                if (angular.isDefined(ngModelCtrl))
                    ngModelCtrl.$render();
            });
        });

    }

    execute(empty = false) {
        var self = this;
        var assocateds = [];

        // remove selectedAssocatedDescription if nolonger a assocated entity is select
        if (angular.isDefined(this.selectedAssocatedOrganisation) && angular.isDefined(this.selectedAssocatedOrganisation.id)) {
            assocateds.push(this.selectedAssocatedOrganisation.id);
        }

        if (angular.isDefined(this.selectedAssocatedProject) && angular.isDefined(this.selectedAssocatedProject.id)) {
            assocateds.push(this.selectedAssocatedProject.id);
        }

        let params = {};
        if(self.sdrType == 'person') {
            params = {
                InterestAreas: this.selectedTags.map(function (tag) {
                    return tag.name;
                }),
                Languages: this.selectedLanguages(),
                AssociatedEntities: assocateds,
                AssociationDescription: this.selectedAssocatedFunction.name,
            };
        }

        if(self.sdrType == 'event') {
            params = {
                Tags: this.selectedTags.map(function (tag) {
                    return tag.name;
                }),
                Languages: this.selectedLanguages(),
                AssociatedEntities: assocateds
            };

            if(angular.isDefined(this.from)){
                params.Begin = self.from;
            }
            if(angular.isDefined(this.until)){
                params.End = self.until;
            }
        }

        if(self.sdrType == 'organisation') {
            params = {
                Tags: this.selectedTags.map(function (tag) {
                    return tag.name;
                }),
                AssociatedEntities: assocateds,
                HasJobs : self.jobs,
                Type: self.type
            };
        }

        if(self.sdrType == 'project') {
            params = {
                Tags: this.selectedTags.map(function (tag) {
                    return tag.name;
                }),
                AssociatedEntities: assocateds,
                HasJobs : self.jobs,
                Phases : self.phase
            };

            if(angular.isDefined(this.from)){
                params.Begin = self.from;
            }
            if(angular.isDefined(this.until)){
                params.End = self.until;
            }
        }

        if(self.sdrType == 'topic') {
            params = {
                Tags: this.selectedTags.map(function (tag) {
                    return tag.name;
                }),
                Sdg: self.Sdg
            };
        }

        if(angular.isDefined(this.selectedPlace)) {
            if (angular.isDefined(this.selectedPlace.latitude))
                params.Coordinates = this.selectedPlace.latitude + ',' + this.selectedPlace.longitude
        }

        if (empty)
            this.Filter.setParameters(
                {}
            );
        else
            this.Filter.setParameters(
                params
            );

        this.Filter.notify();
    }

    queryTags(query){
        var self = this;

        if(!query)
            return;

        self.TagsService.search(query).then(function(result){
            self.tagList = result.data;
        });
    }

    createFilterFor(query) {
        var self = this;
        var lowercaseQuery = angular.lowercase(query);

        return function filterFn(tags) {
            return (tags._lowername.indexOf(lowercaseQuery) === 0);
        };
    }

    /**
     * Return the proper object when the append is called.
     */
    transformChip(chip) {
        // If it is an object, it's already a known chip
        if (angular.isObject(chip)) {
            return chip;
        }

        // Otherwise, create a new one
        return { name: chip, type: 'new' }
    }

    /**
     * Helper method to get the selected languages
     */
    selectedLanguages() {
        let selectedLanguages = [];
        angular.forEach(this.languages, function(language) {
            if (language.selected)
                selectedLanguages.push(language.code);
        });

        return selectedLanguages;
    };

    isEmpty (obj) {
        if (!angular.isObject(obj))
            return false;

        return (Object.keys(obj).length == 0);
    }

    reset(){
        var self = this;
        self.selectedTags = [];
        self.phase = ['planned', 'active','finished'];
        self.from = undefined;
        self.until = undefined;
        self.selectedAssocatedOrganisation = {};
        self.selectedAssocatedProject = {};
        self.selectedAssocatedFunction = {};
        self.languages = self.Config.getLanguages();
        self.jobs = false;
        self.selectedPlace = {};

        self.Filter.notifyReset();

        self.execute(true);
    }

}
