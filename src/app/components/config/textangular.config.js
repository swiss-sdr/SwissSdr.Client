export function textAngularConfig($provide) {
    'ngInject';

    $provide.decorator('taTools', ['$delegate', function(taTools){

        // there is no quote icon in old font-awesome so we change to text as follows
        delete taTools.quote.iconclass;
        taTools.quote.buttontext = 'quote';

        return taTools;
    }]);

    $provide.decorator('taOptions', ['$delegate', function(taOptions){
        // $delegate is the taOptions we are decorating
        // here we override the default toolbars and classes specified in taOptions.
        taOptions.defaultTagAttributes.a.target = '_blank';
        return taOptions; // whatever you return will be the taOptions
    }]);
}
