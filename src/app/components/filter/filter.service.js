export class FilterService {
    constructor ($log) {
        'ngInject';

        this.count = 1;
        this.observers = [];
        this.resetObservers = [];
        this.filterParameters = {};
    }

    reset() {
    }

    setParameters(filterParameters) {
        this.filterParameters = filterParameters;
    }

    getParameters() {
        return this.filterParameters;
    }

    notify() {
        let filter = this;

        angular.forEach(this.observers, function (callback) {
            callback(filter.filterParameters);
        });
    }

    registerListener(callback) {
        this.observers.push(callback);
    }

    registerResetListener(callback) {
        this.resetObservers.push(callback);
    }

    notifyReset() {
        let filter = this;

        angular.forEach(this.resetObservers, function (callback) {
            callback();
        });
    }
}
