export class BladesController {
    constructor (Blades, $rootScope, $scope, Auth, $state, SdrService, People, Organisations, Events, Config, Topics, Projects, $filter) {
        'ngInject';

        this.$rootScope = $rootScope;
        this.$state = $state;
        this.Blades = Blades;
        this.SdrService = SdrService;
        this.Auth = Auth;
        this.$scope = $scope; // do we need this???
        this.ugc = false;
        this.Config = Config;
        this.$filter = $filter;

        // Types:
        this.Organisations = Organisations;
        this.Events = Events;
        this.Topics = Topics;
        this.Projects = Projects;
        this.People = People;

        Blades.reset();


        switch (this.$state.params.type) {
            case 'topics':
                this.setTopicsRoot();
                break;
            case 'projects':
                this.setProjectsRoot();
                break;
            case 'people':
                this.setPeopleRoot();
                break;
            case 'organisations':
                this.setOrganisationsRoot();
                break;
            case 'events':
                this.setEventsRoot();
                break;
            case 'home':
                this.home();
                break;
            case 'account':
                Blades.add(Blades.Type.Account);
                break;
            case 'permissions':
                Blades.add(Blades.Type.AdminPermissions);
                break;
            case 'myobjects':
                Blades.add(Blades.Type.MyObjects);
                break;
            case 'admin':
                Blades.add(Blades.Type.Admin);
                break;
        }

        // reset blades
        if (this.ugc) {
            Blades.add(Blades.Type.Overview, this.Service);
            this.loadByParameter();
        }

        this.currentBlades = Blades.get();

        // reactive
        let self = this;
        Blades.registerObserverCallback(function() {
            self.currentBlades = Blades.get();

            if(!self.$scope.$$phase) {
                self.$scope.$apply();
            }

        });
    }

    loadByParameter() {
        if (this.$state.params.id > 0) {
            let blade = this.Blades.add(
                this.Blades.Type.Detail,
                this.Service,
                {
                    _links: {
                        self: {
                            href: this.Config.apiHost +  this.$state.params.type + '/' + this.$state.params.id,
                        }
                    }
                }
            );
        }
    }

    home() {
        let self = this;

        this.Blades.add(this.Blades.Type.Home);
        // this.Blades.add(this.Blades.Type.Stream);

        this.Auth.get().then(function (user) {
            if(user === null)
                self.Blades.add(self.Blades.Type.Login);
        });


        self.$rootScope.sdrType = "Home";
        self.$rootScope.specificBladeSearchURL ="search";

    }

    setPeopleRoot() {
        this.ugc = true;
        this.Service = this.People;

        this.$rootScope.entityType = "person";
        this.$rootScope.sdrType = "Person";
        this.$rootScope.specificBladeSearchURL ="people";
    }

    setOrganisationsRoot() {
        this.ugc = true;
        this.Service = this.Organisations;

        this.$rootScope.entityType = "organisation";
        this.$rootScope.sdrType = "Organisation";
        this.$rootScope.specificBladeSearchURL = "organisations";
    }


    setEventsRoot() {
        this.ugc = true;
        this.Service = this.Events;

        this.$rootScope.entityType = "event";
        this.$rootScope.sdrType = "Event";
        this.$rootScope.specificBladeSearchURL = 'events';
    }

    setProjectsRoot() {
        this.ugc = true;
        this.Service = this.Projects;

        this.$rootScope.entityType = "project";
        this.$rootScope.sdrType = "Project";
        this.$rootScope.specificBladeSearchURL ="projects";
    }

    setTopicsRoot() {
        this.ugc = true;
        this.Service = this.Topics;

        this.$rootScope.entityType = "topic";
        this.$rootScope.sdrType = "Topic";
        this.$rootScope.specificBladeSearchURL = 'topics';
    }

}
