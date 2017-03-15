export class AuthService {
    constructor ($window) {
        'ngInject';

        var self = this;

        this.$window = $window;

        this.userManager = new Oidc.UserManager({
            authority: "https://accounts.swiss-sdr.ch",
            client_id: "56c38386-b84a-4b8c-8f1b-5ac37f31903a",
            // popupWindowFeatures: "location=no,toolbar=no,width=800,height=800,left=100,top=100",
            redirect_uri: window.location.origin + "/app/authRedirectUri.html",
            silent_redirect_uri: window.location.origin + "/app/authSilentRedirectUri.html",
            post_logout_redirect_uri: window.location.origin + "/app/authPostLogoutRedirectUri.html",
            automaticSilentRenew: true,
            response_type: "id_token token",
            scope: "openid profile swisssdr-api"
        });

        this.signinResponse = this.userManager.signinSilent()
            .then(function (user) {}, function (error) {
                // console.error(error);
            });

        this.userManager.events.addUserSignedOut(function () {
            self.$window.location.reload();
        });

        // Oidc.Log.logger = console;

    }

    login() {
        var self = this;

        // this.signinResponse =  this.userManager.signinPopup()
        this.signinResponse =  this.userManager.signinRedirect()
            .then(function (user) {
                // self.$window.location.reload();
            }, function (error) {
                // console.error(error);
            });

        return this.signinResponse;
    }

    logout() {
        var self = this;

        this.userManager.signoutRedirect();
    }

    get() {
        return this.userManager.getUser();
        return this.getUser();
    }
}
