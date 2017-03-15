export function MultilanguageInputDirective() {
    'ngInject';

    let directive = {
        restrict: 'EA',
        templateUrl: 'app/components/multilanguageInput/multilanguageInput.html',
        transclude: true,
        scope: {
            sdrModel: '=',
            showRichTextTabs: '='
        },
        controller: MultilanguageInputController,
        link: function($scope, element, attrs, controller) {

            angular.element(element).bind('mousedown', function(){
                $scope.showTabs = true;
            });

            angular.element(element).bind('mouseleave', function(){
                $scope.showTabs = false;
            });
        }
    };

    return directive;
}

class MultilanguageInputController {
    constructor(Helpers, Config, $scope, $transclude, $timeout, textAngularManager, $element) {
        'ngInject';

        this.Config = Config;
        this.$scope = $scope;
        this.langVar = {};
        this.visible = false;
        this.textAngularManager = textAngularManager;
        this.$element = $element;

        if(this.$element.attr('sdr-model').endsWith(".content")){

        }

        var self = this;

        var initContent = false;

        $scope.multiLangContent = "";

        $scope.languages = Config.getLanguages();
        $scope.currentEditLanguage = self.lastEditLanguage = Config.getEditLanguageIndex(Config.getLanguage());

        //self.lastEditLanguage = Config.getEditLanguageIndex($scope.currentEditLanguage);

        $scope.$watch(function () {
            return $scope.sdrModel
        }, function (tmpModel) {

            if (!initContent) {
                if(angular.isDefined(tmpModel) && tmpModel != null) {
                    var langKey = self.Config.getEditLanguage().code;
                    $scope.multiLangContent = (angular.isDefined(tmpModel[langKey]) ? tmpModel[langKey] : "");
                    initContent = true;
                }
            }
        });


        $scope.$watch(function () {
            return $scope.multiLangContent
        }, function (multiLangContent) {


            if(angular.isDefined(multiLangContent.data)){
                multiLangContent.data =  multiLangContent.data.replace(/<!--StartFragment-->/g,"");
                multiLangContent.data =  multiLangContent.data.replace(/<!--EndFragment-->/g,"");
                multiLangContent.data =  multiLangContent.data.replace(/<\/?span[^>]*>/g,"");
                multiLangContent.data =  multiLangContent.data.replace(/style="[^"]*"/g,"");
            }

            if (angular.isNumber(self.lastEditLanguage)) {
                var lastLangKey = $scope.languages[self.lastEditLanguage].code;


                if (angular.isDefined($scope.sdrModel) && $scope.sdrModel != null) {
                    if (!angular.isDefined($scope.sdrModel[lastLangKey])) {
                        $scope.sdrModel[lastLangKey] = "";//{};
                    }
                    $scope.sdrModel[lastLangKey] = multiLangContent;

                    if(multiLangContent === ""){
                        delete $scope.sdrModel[lastLangKey];
                    }
                }
            }
            self.lastEditLanguage = self.$scope.currentEditLanguage;
//self.lastEditLanguage = (Config.getEditLanguageIndex(self.$scope.currentEditLanguage) >= 0 ? Config.getEditLanguageIndex(self.$scope.currentEditLanguage) : self.lastEditLanguage);

        },true);


        $scope.$watch(function () {
            return $scope.currentEditLanguage
        }, function (currentEditLanguage) {


            $timeout(function (){
                if(angular.isNumber(currentEditLanguage)) {
                    var langKey = $scope.languages[currentEditLanguage].code;

                    if(angular.isDefined($scope.sdrModel) && $scope.sdrModel != null) {
                        if (!angular.isDefined($scope.sdrModel[langKey])) {
                            //$scope.sdrModel[langKey] = "";//{};
                            $scope.multiLangContent = "";
                        } else {
                            $scope.multiLangContent = $scope.sdrModel[langKey];
                        }
                    }

                    self.lastEditLanguage = currentEditLanguage;
                }
            },50);

        });


        $scope.$watch(function () {
            return $scope.sdrLanguage
        }, function (sdrLanguage) {
            self.langVar = sdrLanguage;
            $scope.value = self.getCorrectValue();
        });


        /*$transclude(function() {

         });*/

        $scope.setEditLanguage = function (language) {
            $scope.value = self.getCorrectValue();
        };

    }

    showTabs(object){
    }


    getCorrectValue() {

        if (!angular.isDefined(this.langVar)) {
            return '';
        }

        if (angular.isDefined(this.langVar[this.Config.getEditLanguage()]))
            return value[this.Config.getEditLanguage()];

        return '';
    }
}
