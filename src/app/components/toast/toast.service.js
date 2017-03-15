export class ToastService {
    constructor ($mdToast) {
        'ngInject';

        this.$mdToast = $mdToast;

        this.oldOne = null;

    }

    error(message) {
        this.custom(message, 'error');
    }

    default(message) {
        this.custom(message, 'default');
    }

    success(message) {
        this.custom(message, 'success');
    }


    custom(message, className) {

        var self = this;


        this.toast = this.$mdToast.simple()
            .content(message)
            .action('OK')
            // .highlightAction(true)
            .toastClass('sdr-toast-' + className)
            .hideDelay(5000)
            .position('top right');

        this.$mdToast.hide(this.oldOne).then(function() {
            self.$mdToast.show(self.toast);
        });

        this.oldOne = this.toast;

    }

    info(message){

        var self = this;

        this.toast = this.$mdToast.simple()
            .content(message)
            // .highlightAction(true)
            .toastClass('sdr-toast-default')
            .hideDelay(0)
            .position('top right');

        this.$mdToast.hide(this.oldOne).then(function() {
            self.$mdToast.show(self.toast);
        });


        this.oldOne = this.toast;
    }
}
