export function typeByObject(Helpers) {
    'ngInject';
    // Enable log

    return function(object) {
        return Helpers.typeByObject(object, true);
    }
}
