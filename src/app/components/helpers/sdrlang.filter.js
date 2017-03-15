export function sdrlang(Config) {
    'ngInject';
    // Enable log

    return function(langObj) {
        if (angular.isUndefined(langObj) || langObj == null)
            return '';

        var langCode = Config.getLanguage().code;
        var fallbackCode = Config.getFallbackLanguage().code

        if (angular.isDefined(langObj[langCode]))
            return langObj[langCode];

        if (angular.isDefined(langObj[fallbackCode]))
            return langObj[fallbackCode];

        if(angular.isDefined(langObj[Object.keys(langObj)[0]]))
            return langObj[Object.keys(langObj)[0]];

        return '';
    }
}
