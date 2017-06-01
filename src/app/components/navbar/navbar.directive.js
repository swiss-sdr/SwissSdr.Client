export function NavbarDirective() {
  'ngInject';

  let directive = {
    restrict: 'E',
    templateUrl: 'app/components/navbar/navbar.html',
    scope: {
        creationDate: '='
    },
    controller: NavbarController,
    controllerAs: 'navbar',
    bindToController: true
  };

  return directive;
}

class NavbarController {
    constructor(Auth, $state, Helpers, Config, User, $rootScope, $translate, $http) {
        'ngInject';

        this.Auth = Auth;
        this.Helpers = Helpers;
        this.Config = Config;
        this.User = User;
        this.$rootScope = $rootScope;
        this.$translate = $translate;
        this.$http = $http;

        this.selectedLangKey = this.Config.getLanguage().code;

        var self = this;

        Auth.get().then(function (user) {
            if (user == null)
                return;

            self.me = user;

            var arrNames = self.me.profile.name.split(" ");
            self.me.profile.nameShortCut = arrNames[0].substring(0, 1) + arrNames[1].substring(0, 1);

            self.$http.get(self.Config.apiHost + 'users/me',{cache:false}).then(function (user) {
               if(user.data._embedded)
                   self.me.profile.profileImage = user.data._embedded.profileImage.url;
            });



            return user.profile.sub;
        }).then(function(userId){

            if (angular.isUndefined(userId))
                return;

            self.User.get().then(function(data){
                var claims = data.data.claims;

                angular.forEach(claims, function(claim){
                    if(claim.type == "AdministerUsers"){
                        self.$rootScope.isAdmin = true;
                    }
                })
            })
        });
    }

    login() {
        this.Auth.login();
    }

    logout() {
        this.Auth.logout();
    }

    typeByObject(object) {
        return this.Helpers.typeByObject(object, true);
    }

    switchLanguage(newLangKey){
        var self = this;
        var newLanguage = self.Config.getLanguages()[self.Config.getEditLanguageIndex(newLangKey)];
        self.Config.changeLanguage(newLanguage);
        self.selectedLangKey = newLangKey;
    }

    isLanguage(langCode) {

        return (this.$translate.use() == langCode)
    }
}
