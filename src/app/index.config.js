export function config($logProvider, toastrConfig, $translateProvider, localStorageServiceProvider, $httpProvider) {
    'ngInject';
    // Enable log
    $logProvider.debugEnabled(true);

    // Set options third-party lib
    toastrConfig.allowHtml = true;
    toastrConfig.timeOut = 3000;
    toastrConfig.positionClass = 'toast-top-left';
    toastrConfig.preventDuplicates = true;
    toastrConfig.progressBar = true;


    // storage
    localStorageServiceProvider
        .setPrefix('swisssdr');

    // language
    $translateProvider.useStaticFilesLoader({
        prefix: '../app/lang/',
        suffix: '.json'
    });

    $translateProvider.useLocalStorage();

    //$translateProvider.useSanitizeValueStrategy('escape');
    $translateProvider.useSanitizeValueStrategy(null);
    $translateProvider.preferredLanguage('de');
}
