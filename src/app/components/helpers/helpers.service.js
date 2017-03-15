export class HelpersService {
    constructor() {
        'ngInject';

    }

    typeByObject(object, plural = false) {
        let type = object.id;

        if (angular.isUndefined(type))
            return null;

        type = type.substr(0, type.indexOf('/'));

        if (plural)
            return type;

        if (type == 'organisations')
            return 'organisation';

        if (type == 'people')
            return 'person';

        if (type == 'projects')
            return 'project';

        if (type == 'topics')
            return 'topic';

        if (type == 'events')
            return 'event';

        return null;
    }

    scrollToRight() {
        angular.element("body").scrollRight = 0;
    }

}
