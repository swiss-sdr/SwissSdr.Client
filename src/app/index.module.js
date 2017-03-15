/* global moment:false */

import { config } from './index.config';
import { authConfig } from './components/auth/auth.config.js';
import { requestHeadersConfig } from './components/requestHeaders/requestHeaders.config.js';
import { routerConfig } from './index.route';
import { themeConfig } from './index.theme';
import { textAngularConfig } from '../app/components/config/textangular.config.js';
import { runBlock } from './index.run';
import { ConfigService } from '../app/components/config/config.service';
import { AuthService } from '../app/components/auth/auth.service';
import { MainController } from '../app/components/main/main.controller';
import { NavbarDirective } from '../app/components/navbar/navbar.directive';
import { FilterDirective } from '../app/components/filter/filter.directive';
import { FileUrlListDirective } from '../app/components/fileUrlList/fileUrlList.directive';

// Blades
import { BladesService } from '../app/components/blades/blades.service';
import { BladesController } from '../app/components/blades/blades.controller';
import { BladeOverviewDirective } from  '../app/components/bladeOverview/bladeOverview.directive';
import { BladeAdminDirective } from '../app/components/bladeAdmin/bladeAdmin.directive';
import { BladeMyObjectsDirective } from '../app/components/bladeMyObjects/bladeMyObjects.directive';
import { BladeAccountDirective } from '../app/components/bladeAccount/bladeAccount.directive';
import { BladeStreamDirective } from '../app/components/bladeStream/bladeStream.directive';
import { BladeLoginDirective } from '../app/components/bladeLogin/bladeLogin.directive';
import { BladeExtendedDirective } from  '../app/components/bladeExtended/bladeExtended.directive';
import { BladeDetailDirective } from  '../app/components/bladeDetail/bladeDetail.directive'
import { BladeEditDirective } from '../app/components/bladeEdit/bladeEdit.directive';
import { BladePermissionDirective } from '../app/components/bladePermission/bladePermission.directive';
import { BladeEditExtendedDirective } from '../app/components/bladeEditExtended/bladeEditExtended.directive';
import { BladeEditRelationsDirective } from '../app/components/bladeEditRelations/bladeEditRelations.directive';
import { BladeOverviewListDirective } from  '../app/components/bladeOverview/list/list.directive';
import { BladeHomeDirective } from '../app/components/bladeHome/bladeHome.directive';
import { BladeOverviewGridDirective } from  '../app/components/bladeOverview/grid/grid.directive';
import { BladeOverviewMapDirective } from  '../app/components/bladeOverview/map/map.directive';
import { BladeExtendedGridDirective } from  '../app/components/bladeExtended/partials/grid.directive';
import { BladeOverviewHeaderDirective } from '../app/components/overviewHeader/overviewHeader.directive';
import { BladeEditJobsDirective } from '../app/components/bladeEditJobs/bladeEditJobs.directive';
import { BladeEditSessionsDirective } from './components/bladeEditSessions/bladeEditSessions.directive';
import { BladeAdminPermissionsDirective } from './components/bladeAdminPermissions/bladeAdminPermissions.directive';
import { BladeAdminPermissionsDetailDirective } from './components/bladeAdminPermissionsDetail/bladeAdminPermissionsDetail.directive';
import { BladeEditImageDirective } from './components/bladeEditImage/bladeEditImage.directive';
import { BladeExtendedAssociationsDirective } from './components/bladeExtendedAssociations/bladeExtendedAssociations.directive';

// swisssdr main
import { SdrService } from './pages/sdr/sdr.service';

// Tags
import { TagsService } from '../app/components/tags/tags.service';
import { FilesService } from '../app/components/files/files.service';

// User
import { UserService } from '../app/components/user/user.service';

// People
import { PeopleService } from './pages/people/people.service';

// Project
import { ProjectsService } from './pages/projects/projects.service';

// Organisation
import { OrganisationsService } from './pages/organisations/organisations.service';

// Event
import { EventsService } from './pages/events/events.service';

// Topic
import { TopicsService } from './pages/topics/topics.service';

// Misc
import { AuthorizationInterceptor } from '../app/components/auth/authInterceptor.service';
import { RequestHeadersInterceptor } from './components/requestHeaders/requestHeadersInterceptor.service';
import { ToastService } from '../app/components/toast/toast.service';
import { SearchService } from '../app/components/search/search.service';
import { HelpersService } from '../app/components/helpers/helpers.service';
import { FilterService } from '../app/components/filter/filter.service';
import { MultilanguageInputDirective } from '../app/components/multilanguageInput/multilanguageInput.directive';
import { CountrySelectDirective } from '../app/components/countrySelect/countrySelect.directive';
import { DisciplinesDirective } from '../app/components/disciplines/disciplines.directive';
import { FilterPlaceDirective } from '../app/components/filter/partials/place.directive';
import { FilterAssocatedDirective } from '../app/components/filter/partials/assocated.directive';
import { FilterAssocatedFunctionDirective } from '../app/components/filter/partials/assocatedFunction.directive';
import { UserSearchDirective } from '../app/components/userSearch/userSearch.directive';
import { sdrlang } from '../app/components/helpers/sdrlang.filter';
import { typeByObject } from '../app/components/helpers/typeByObject.filter';

angular.module('swisssdr', ['ngAnimate', 'ngCookies', 'ngResource', 'ui.mask', 'ngTouch', 'ngSanitize', 'angular-repeat-n', 'ngMessages', 'ngAria', 'restangular', 'LocalStorageModule', 'ngSanitize', 'textAngular', 'toastr', 'ui.router', 'infinite-scroll', 'leaflet-directive', 'ngMaterial', 'pascalprecht.translate', 'ngFileUpload'])

    .constant('moment', moment)
    .config(config)
    .config(routerConfig)
    .config(themeConfig)
    .config(textAngularConfig)

    .config(function($mdDateLocaleProvider) {
        $mdDateLocaleProvider.formatDate = function (date) {
            return date ? moment(date).format('DD.MM.YYYY') : '';
        };

        $mdDateLocaleProvider.parseDate = function (dateString) {
            var m = moment(dateString, 'DD.MM.YYYY', true);
            return m.isValid() ? m.toDate() : new Date(NaN);
        };
    })

    .config(['$urlRouterProvider', function ($urlRouterProvider) {
        $urlRouterProvider.deferIntercept();
    }])
    .run(['$rootScope', '$urlRouter', '$location', '$state', '$http', function ($rootScope, $urlRouter, $location, $state, $http) {

        $http.defaults.headers.common['Accept'] = 'application/hal+json, text/plain, */*';

        $rootScope.$on('$locationChangeStart', function(event, currRoute, prevRoute){
            $rootScope.showLoader = true;
        });

        $rootScope.$on('$locationChangeSuccess', function(e, newUrl, oldUrl) {
            $rootScope.showLoader = false;
        });
        $urlRouter.listen();
    }])

    .run(runBlock)

    .service('Config', ConfigService)

    //  Auth
    .service('Auth', AuthService)
    .service('AuthorizationInterceptor', AuthorizationInterceptor)
    .config(authConfig)


    // Request
    .service('RequestHeadersInterceptor',RequestHeadersInterceptor)
    .config(requestHeadersConfig)

    .controller('MainController', MainController)
    .controller('BladesController', BladesController)

    .directive('navbar', NavbarDirective)

    // Blades
    .directive('bladeOverview', BladeOverviewDirective)
    .directive('bladeStream', BladeStreamDirective)
    .directive('bladeLogin', BladeLoginDirective)
    .directive('bladeHome', BladeHomeDirective)
    .directive('bladeAdmin', BladeAdminDirective)
    .directive('bladeMyobjects', BladeMyObjectsDirective)
    .directive('bladeAccount', BladeAccountDirective)
    .directive('bladeExtended', BladeExtendedDirective)
    .directive('bladeDetail', BladeDetailDirective)
    .directive('bladeOverviewList', BladeOverviewListDirective)
    .directive('bladeOverviewGrid', BladeOverviewGridDirective)
    .directive('bladeOverviewMap', BladeOverviewMapDirective)
    .directive('bladeExtendedGrid', BladeExtendedGridDirective)
    .directive('bladeEdit', BladeEditDirective)
    .directive('bladePermission', BladePermissionDirective)
    .directive('bladeEditExtended', BladeEditExtendedDirective)
    .directive('bladeEditRelations', BladeEditRelationsDirective)
    .directive('bladeEditJobs', BladeEditJobsDirective)
    .directive('bladeEditSessions', BladeEditSessionsDirective)
    .directive('bladeAdminPermissions', BladeAdminPermissionsDirective)
    .directive('bladeAdminPermissionsDetail', BladeAdminPermissionsDetailDirective)
    .directive('bladeEditImage', BladeEditImageDirective)
    .directive('bladeExtendedAssociations', BladeExtendedAssociationsDirective)
    .directive('overviewHeader', BladeOverviewHeaderDirective)
    .directive('filter', FilterDirective)
    .directive('countrySelect', CountrySelectDirective)
    .directive('disciplines', DisciplinesDirective)
    .service('Blades', BladesService)

    // swisssdr main
    .service('SdrService', SdrService)

    // Home

    // .service('Home', HomeService)

    // Tags
    .service('Tags', TagsService)
    .service('Files', FilesService)

    // Users
    .service('User', UserService)

    // People
    .service('People', PeopleService)

    // Projects
    .service('Projects', ProjectsService)

    // Organisations
    .service('Organisations', OrganisationsService)

    // Events
    .service('Events', EventsService)

    // Topics
    .service('Topics', TopicsService)

    // Misc
    .service('Search', SearchService)
    .service('Toast', ToastService)
    .service('Helpers', HelpersService)
    .service('Filter', FilterService)
    .directive('multilanguageInput', MultilanguageInputDirective)
    .directive('fileUrlList', FileUrlListDirective)
    .directive('filterPlace', FilterPlaceDirective)
    .directive('filterAssocated', FilterAssocatedDirective)
    .directive('filterAssocatedFunction', FilterAssocatedFunctionDirective)
    .directive('userSearch', UserSearchDirective)
    .filter('sdrlang', sdrlang)
    .filter('typeByObject', typeByObject);
