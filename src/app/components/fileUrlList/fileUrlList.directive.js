export function FileUrlListDirective() {
    'ngInject';

    let directive = {
        restrict: 'E',
        templateUrl: 'app/components/fileUrlList/fileUrlList.html',
        controller: FileUrlListController,
        scope: {
            items: '='
        },
        controllerAs: 'ful',
        bindToController: true
    };

    return directive;
}

class FileUrlListController {
    constructor() {
        'ngInject';
    }
}
