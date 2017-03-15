export class ConfigService {
    constructor ($log, $translate, $http, Helpers, Toast, $filter) {
        'ngInject';

        var self = this;

        this.Toast = Toast;
        this.$translate = $translate;
        this.$http = $http;
        this.$filter = $filter;

        this.currentLanguage = {
            name: "Deutsch",
            code: "de"
        };

        this.currentEditLanguage = {
            name: "Deutsch",
            code: "de"
        }

        this.fallbackLanguage = {
            name: "iv (dev)",
            code: "iv"
        };

        // swisssdr-api-dev.azurewebsites.net i

        this.apiHost = 'https://swisssdr-api.azurewebsites.net/v1/';

        if (window.location.hostname == 'swisssdr.novu.io')
            this.apiHost = 'https://swisssdr-api-development.azurewebsites.net/v1/';

        this.Helpers = Helpers;

        this.associationDescriptionDefinitions = null;
        this.entityTemplates = null;
        this.disciplines = null;

        this.url = this.apiHost + 'appsettings';

        this.getAppSettings().then(function(res) {
            self.associationDescriptionDefinitions = res.data.associationDescriptionDefinitions;
            self.entityTemplates = res.data.entityTemplates;
            self.disciplines = res.data.disciplineDefinitions;
        });
    }

    getDefaultContent(langCode = null) {
        var values = {
            de: "<h2>Projektidee</h2><p></p><h2>Fokus/Forschungsfragen</h2><p></p><h2>Forschungsziele</h2><p></p><h2>Innovative Aspekte</h2><p></p><h2>Resultate</h2><p>Klären Sie hier: Wie fördert das Forschungsprojekt Nachhaltige Entwicklung?</p>",
            en: "<h2>Main idea of the project</h2><p></p><h2>Focus and research questions</h2><p></p><h2>Research objectives</h2><p></p><h2>Innovative aspects</h2><p></p><h2>Results</h2><p>Clarify here: How does the research project foster sustainable development?</p>",
            fr: "<h2>Main idea of the project</h2><p></p><h2>Focus and research questions</h2><p></p><h2>Research objectives</h2><p></p><h2>Innovative aspects</h2><p></p><h2>Results</h2><p>Clarify here: How does the research project foster sustainable development?</p>",
            it: "<h2>Idea principale del progetto</h2><p></p><h2>Focus e temi della ricerca</h2><p></p><h2>Obiettivi della ricerca</h2><p></p><h2>Aspetti innovativi</h2><p></p><h2>Results</h2><p>Chiarire qui: In che modo il progetto promuove lo sviluppo sostenibile?</p>",
        };

        if (langCode == null)
            return values;

        return values[langCode];
    }

    getAppSettings() {
        var self = this;
        var promise = this.$http.get(this.url,
            {
                cache: true,
                transformResponse: function (data) {
                    if (data.length == 0) {
                        self.Toast.error(self.$filter('translate')('nodata'));

                        return [];
                    }

                    return angular.fromJson(data);
                }
            });

        return promise;
    }

    getLanguage() {
        return this.currentLanguage;
    }

    getEditLanguage() {
        return this.currentEditLanguage;
    }

    setEditLanguage(language) {
        this.currentEditLanguage = language;
    }

    getFallbackLanguage() {
        return this.fallbackLanguage;
    }

    getLanguages() {
        var self = this;
        return [
            {
                name: self.$filter('translate')('german'),
                code: 'de'
            },
            {
                name: self.$filter('translate')('french'),
                code: 'fr'
            },
            {
                name: self.$filter('translate')('italian'),
                code: 'it'
            },
            {
                name: self.$filter('translate')('english'),
                code: 'en'
            },
            {
                name: 'iv (dev)',
                code: 'iv'
            }
        ];
    }

    changeLanguage(langKey) {
        var self = this;
        self.currentLanguage = langKey;
        self.$translate.use(langKey.code);
    }

    getAssocatedFunctions(entity1, entity2) {
        //console.log(entity1);
        //console.log(entity2);

         if (angular.isObject(entity1))
             entity1 = this.Helpers.typeByObject(entity1);

        if (angular.isObject(entity2))
            entity2 = this.Helpers.typeByObject(entity2);

        let result = [];
        angular.forEach(this.associationDescriptionDefinitions, function (definition) {
            angular.forEach(definition.allowedEntityAssociations, function (entities) {
                //if (entities.source == entity1 && entities.target == entity2 ||
                //    entities.source == entity2 && entities.target == entity1) {

                if (entities.source == entity1 && entities.target == entity2) {
                    result.splice(entities.index,0,definition);
                    //result.push(definition);
                }

                if (entity2 == null && (entities.source == entity1 || entities.target == entity1))
                    result.splice(entities.index,0,definition);
                    //result.push(definition);
            });
        });

        return result.filter(function(elem,index,self){
            return index == self.indexOf(elem);
        });
    }


    getEditLanguageIndex(language){
        var index = -1;
        var keepGoing = true;

        var tmpLang = (angular.isDefined(language) ? language : this.getFallbackLanguage());

        if(angular.isDefined(language.code)){
            language = language.code;
        }

        angular.forEach(this.getLanguages(), function(obj) {
            if(keepGoing) {
                if (obj.code === language) {
                    keepGoing = false;
                }
                index++;
            }
        });


        return index;
    }

    getDisciplines() {
        return this.disciplines;
    }

    getEntityTemplates() {
        return this.entityTemplates;
    }

    getPossibleTargetTypes(entityType) {
        var self = this;

        if (self.associationDescriptionDefinitions == null)
            return [];

        var targetTypes = [].concat.apply([], self.associationDescriptionDefinitions
            .map(
                function(d) {
                    return d.allowedEntityAssociations
                        .filter(
                            function(x) {
                                return x.item1 == entityType;
                            }
                        ).map(
                            function(x) {
                                return x.item2;
                            }
                        );
                }
            ).filter(
                function(x) {
                    return x.length > 0;
                }
            )
        ).filter(function(elem,index,self){
            return index == self.indexOf(elem);
        });

        return targetTypes;
    }
}
