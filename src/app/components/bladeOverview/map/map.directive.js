export function BladeOverviewMapDirective() {
    'ngInject';

    let directive = {
        restrict: 'E',
        templateUrl: 'app/components/bladeOverview/map/map.html',
        scope: {
            'sdrService': '='
        },
        controller: BladeOverviewMapController,
        controllerAs: 'bladeMap',
        bindToController: true
    };


    return directive;
}

class BladeOverviewMapController {
    constructor($scope, Filter, Helpers, Blades, $filter) {
        'ngInject';

        this.$scope = $scope;
        this.Filter = Filter;
        this.Helpers = Helpers;
        this.Blades = Blades;
        this.$filter = $filter;

        this.filterParams = {};
        this.objects = [];
        this.filterParams = Filter.getParameters();

        this.loadData();

        let self = this;

        Filter.registerListener(function(params) {
            self.objects = [];
            self.filterParams = params;

            self.loadData();
        });

        $scope.$on('leafletDirectiveMarker.click', function(event, marker) {
            marker.model.event();
        });

        this.initializeMap();
    }

    initializeMap() {
        angular.extend(this, {
            center: {
                lat: 46.801646,
                lng: 8.2910081,
                zoom: 7
            },
            markers: {},
            layers: {
                baselayers: {
                    mapbox_light: {
                        name: 'swisssdr Default',
                        url: '//api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
                        type: 'xyz',
                        layerOptions: {
                            apikey: 'pk.eyJ1Ijoic3dpc3NzZHIiLCJhIjoiY2luY3pmd3JsMDA1eXdybHlmbHppOGI1ZSJ9.5-sBelUG5RY6QTndl4X6OQ',
                            mapid: 'mapbox.satellite'
                        }
                    }
                },
                overlays: {
                    people: {
                        name: "people",
                        type: "markercluster",
                        visible: true
                    },
                    projects: {
                        name: "projects",
                        type: "markercluster",
                        visible: true
                    },
                    events: {
                        name: "events",
                        type: "markercluster",
                        visible: true
                    },
                    organisations: {
                        name: "organisations",
                        type: "markercluster",
                        visible: true
                    }
                }
            }
        });
    }

    open(object) {
        var self = this;

        setTimeout(function () {
            self.Blades.removeChildrens();
        }, 0);

        setTimeout(function () {
            let blade = self.Blades.add(
                self.Blades.Type.Detail,
                self.sdrService,
                object
            );
        }, 1);
    }

    loadData() {
        let self = this;

        if (this.loading)
            return;

        this.loading = true;

        this.sdrService.getForMap(self.filterParams).then(
            angular.bind(this, function (objects) {
                this.objects = objects.data;
                this.loading = false;

                let markers = [];
                angular.forEach(this.objects, function(object) {
                    //angular.forEach(object.coordinates, function(coordinates) {
                    if(Object.keys(object.coordinates).length > 0) {
                        if (angular.isUndefined(object.coordinates.Longitude))
                            return;

                        let objectName = object.id.replace('/', '');

                        markers[objectName] = {
                            layer: self.Helpers.typeByObject(object, true),
                            lat: object.coordinates.Latitude,
                            lng: object.coordinates.Longitude,
                            label: {
                                message: !objectName.startsWith("people") ? self.$filter('sdrlang')(object.name) : object.firstname + " " + object.lastname,
                                options: {
                                    noHide: true
                                }
                            },
                            event: function () {
                                self.open(object);
                            }
                        }

                    }
                        //});
                    return true;
                });

                this.markers = markers;
        }));
    }
}
