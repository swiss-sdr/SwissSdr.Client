export class BladesService {
    constructor($log, $mdDialog, $filter) {
        'ngInject';

        this.$log = $log;
        this.$mdDialog = $mdDialog;
        this.$filter = $filter;

        this.count = 1;
        this.observers = [];
        this.blades = [];
        this.editBladesTypes = [];

        this.Type = {
            Overview: 'overview',
            Detail: 'detail',
            Extended: 'extended',
            Edit: 'edit',
            EditExtended: 'edit-extended',
            EditRelations: 'edit-relations',
            EditJobs: 'edit-jobs',
            EditLibary : 'edit-libary',
            EditContacts : 'edit-contacts',
            EditPublications : 'edit-publications',
            EditSessions: 'edit-sessions',
            EditImage: 'edit-image',
            Home: 'home',
            Stream: 'stream',
            Login: 'login',
            Admin: 'admin',
            MyObjects: 'myobjects',
            Account: 'account',
            Content: 'content',
            Permission: 'permission',
            AdminPermissions: 'admin-permissions',
            AdminPermissionsDetail: 'admin-permissions-detail',
            ExtendedAssociations: 'extended-associations'
        };

        this.notifyObservers();
    }

    reset() {
        this.blades = [];
        this.editBladesTypes = [];
    }

    createBlade(blade) {
        let self = this;

        var bladeExists = false;

        blade.meta.firstOfType = true;

        for(var i=0;i<self.editBladesTypes.length;i++){
            var tmpBlade = self.editBladesTypes[i];

            // Check if the type is equal
            if(tmpBlade.type === blade.meta.type){
                blade.meta.firstOfType = false;
            }

        }

        if(!bladeExists) {

            blade._bladeId = self.count;
            blade.meta._bladeId = self.count;
            blade.meta.remove = function () {

                // only on editblade
                if(blade.meta.type === 'edit'){


                    var tmpData = blade.data;

                    //if(angular.isDefined(tmpData.create)){
                    if(tmpData.create){
                        var confirm = self.$mdDialog.confirm()
                            .title(self.$filter('translate')('leaveWithoutSavingTitle'))
                            .textContent(self.$filter('translate')('leaveWithoutSavingContent'))
                            .ariaLabel(self.$filter('translate')('leaveWithoutSavingTitle'))
                            .ok(self.$filter('translate')('close'))
                            .cancel(self.$filter('translate')('cancel'));

                        self.$mdDialog.show(confirm).then(function() {
                            self.remove(blade);
                        }, function() {
                        });
                    } else {
                        //}


                        var noDateChanged = true;

                        if (angular.isDefined(blade.data.fallBack)) {

                            //var copyObj = angular.copy(blade.data);

                            var fallBack = blade.data;
                            fallBack.fallBack = blade.data.fallBack;

                            if(!blade.meta.Service.checkOnClose(angular.copy(blade.data),blade.data.fallBack)){

                                var confirm = self.$mdDialog.confirm()
                                    .title(self.$filter('translate')('leaveWithoutSavingTitle'))
                                    .textContent(self.$filter('translate')('leaveWithoutSavingContent'))
                                    .ariaLabel(self.$filter('translate')('leaveWithoutSavingTitle'))
                                    .ok(self.$filter('translate')('save'))
                                    .cancel(self.$filter('translate')('nosave'));

                                self.$mdDialog.show(confirm).then(function () {
                                    blade.meta.Controller.save();
                                }, function () {
                                    // update data from detailblade.is always number 1 in array
                                    self.blades[1].data = fallBack;
                                }).then(function () {
                                    self.remove(blade);
                                });
                            } else {
                                self.remove(blade);
                            }



                            /*
                            fallBack.fallBack = blade.data.fallBack;
                            fallBack.sdgList = blade.data.sdgList;

                            if (tmpData.id !== null) {
                                if (tmpData.id.startsWith('project') || tmpData.id.startsWith('event')) {
                                    if(tmpData.end !== null){
                                        if (fallBack.end !== tmpData.end._i){
                                            noDateChanged = false;
                                        }
                                    }
                                    if(tmpData.begin !== null){
                                        if (fallBack.begin !== tmpData.begin._i){
                                            noDateChanged = false;
                                        }
                                    }
                                }
                            }

                            if (!angular.equals(tmpData, fallBack) || (!noDateChanged && (tmpData.id.startsWith('project') || tmpData.id.startsWith('event')))) {

                                var confirm = self.$mdDialog.confirm()
                                    .title(self.$filter('translate')('leaveWithoutSavingTitle'))
                                    .textContent(self.$filter('translate')('leaveWithoutSavingContent'))
                                    .ariaLabel(self.$filter('translate')('leaveWithoutSavingTitle'))
                                    .ok(self.$filter('translate')('save'))
                                    .cancel(self.$filter('translate')('nosave'));

                                self.$mdDialog.show(confirm).then(function () {
                                    blade.meta.Controller.save();
                                }, function () {
                                    // update data from detailblade.is always number 1 in array
                                    self.blades[1].data = fallBack;
                                }).then(function () {
                                    self.remove(blade);
                                });
                            } else {
                                self.remove(blade);
                            }
                            */

                        } else {
                            self.remove(blade);
                        }
                    }


                } else {

                    if(blade.meta.type == "permission"){
                        blade.meta.obj.disableButton = false;
                    }

                    self.remove(blade);
                }


                self.$log.debug('[sdr] [removed blade ' + this.type + ']: ' + this._bladeId);

            };

            var bladeObj = {};
            bladeObj._bladeId = blade._bladeId;
            bladeObj.type = blade.meta.type;

            self.editBladesTypes.push(bladeObj);

            self.count++;

            self.blades.push(blade);

            if (bladeObj.type != 'login' && bladeObj.type != 'home')
                setTimeout(function () {
                    $('blades').scrollLeft(100000);
                });

            this.notifyObservers();

            return blade;
        }
    }

    add(type, Service, element = null) {
        if (type == this.Type.Overview)
            return this.addOverview(Service);

        if (type == this.Type.Stream)
            return this.addStream();

        if (type == this.Type.Login)
            return this.addLogin();

        if (type == this.Type.Admin)
            return this.addAdmin();

        if (type == this.Type.MyObjects)
            return this.addMyObjects();

        if (type == this.Type.Account)
            return this.addAccount();

        if (type == this.Type.Content)
            return this.addContent();

        if (type == this.Type.Permission)
            return this.addPermission();

        if (type == this.Type.AdminPermissions)
            return this.addAdminPermissions();

        if (type == this.Type.AdminPermissionsDetail)
            return this.addAdminPermissionsDetail(element);

        if (type == this.Type.Home)
            return this.addHome();

        if (type == this.Type.Detail)
            return this.addDetail(Service, element);

        if (type == this.Type.Extended)
            return this.addExtended(Service, element);

        if (type == this.Type.Edit)
            return this.addEdit(Service, element);

        if (type == this.Type.EditExtended)
            return this.addEditExtended(Service, element);

        if (type == this.Type.EditLibary)
            return this.addEditLibary(Service, element);

        if (type == this.Type.EditContacts)
            return this.addEditContacts(Service, element);

        if (type == this.Type.EditPublications)
            return this.addEditPublications(Service, element);

        if (type == this.Type.EditRelations)
            return this.addEditRelations(Service, element);

        if  (type == this.Type.EditJobs)
            return this.addEditJobs(Service,element);

        if  (type == this.Type.EditSessions)
            return this.addEditSessions(Service,element);

        if  (type == this.Type.ExtendedAssociations)
            return this.addExtendedAssociations(Service,element);


    }

    addAdmin() {
        let admin = this.createBlade({
            meta: {
                type: this.Type.Admin
            }
        });

        return admin;
    }

    addMyObjects() {
        let myobjects = this.createBlade({
            meta: {
                type: this.Type.MyObjects
            }
        });

        return myobjects;
    }

    addAccount() {
        let account = this.createBlade({
            meta: {
                type: this.Type.Account
            }
        });

        return account;
    }

    addContent() {
        let content = this.createBlade({
            meta: {
                type: this.Type.Content
            }
        });

        return content;
    }

    addAdminPermissions(Service, element) {
        return this.createBlade({
            data: element,
            meta: {
                Service: Service,
                type: this.Type.AdminPermissions,
            }
        });
    }

    addAdminPermissionsDetail(element) {
        return this.createBlade({
            data: element,
            meta: {
                type: this.Type.AdminPermissionsDetail,
            }
        });
    }


    addPermission(Service, element, obj) {
        return this.createBlade({
            data: element,
            meta: {
                Service: Service,
                type: this.Type.Permission,
                obj: obj
            }
        });
    }

    addHome() {
        let home = this.createBlade({
            meta: {
                type: this.Type.Home,
            }
        });

        return home;
    }

    addStream() {
        let stream = this.createBlade({
            meta: {
                type: this.Type.Stream
            }
        });

        return stream;
    }

    addLogin() {
        let login = this.createBlade({
            meta: {
                type: this.Type.Login
            }
        });

        return login;
    }


    addOverview(Service) {
        let overview = this.createBlade({
            data: undefined,
            meta: {
                Service: Service,
                type: this.Type.Overview
            }
        });

        return overview;
    }

    addDetail(Service, element) {

        if(angular.isUndefined(element._embedded)){
            element._embedded = {};
        }

        let detail = this.createBlade({
            data: element,
            meta: {
                Service: Service,
                type: this.Type.Detail,
            }
        });

        return detail;
    }

    addExtended(Service, element, destroyCallback) {
        return this.createBlade({
            data: element,
            meta: {
                Service: Service,
                type: this.Type.Extended
            }
        });
    }

    addEdit(Service, element) {
        return this.createBlade({
            data: element,
            meta: {
                Service: Service,
                type: this.Type.Edit,
            }
        });
    }

    addEditLibary(Service, element) {
        return this.createBlade({
            data: element,
            meta: {
                Service: Service,
                type: this.Type.EditLibary
            }
        });
    }

    addEditPublications(Service, element) {
        return this.createBlade({
            data: element,
            meta: {
                Service: Service,
                type: this.Type.EditPublications
            }
        });
    }

    addEditContacts(Service, element) {
        return this.createBlade({
            data: element,
            meta: {
                Service: Service,
                type: this.Type.EditContacts
            }
        });
    }



    addEditExtended(Service, element) {
        return this.createBlade({
            data: element,
            meta: {
                Service: Service,
                type: this.Type.EditExtended
            }
        });
    }

    addEditRelations(Service, element) {
        return this.createBlade({
            data: element,
            meta: {
                Service: Service,
                type: this.Type.EditRelations
            }
        });
    }

    addEditJobs(Service, element) {
        return this.createBlade({
            data: element,
            meta: {
                Service: Service,
                type: this.Type.EditJobs
            }
        });
    }

    addEditSessions(Service, element) {
        return this.createBlade({
            data: element,
            meta: {
                Service: Service,
                type: this.Type.EditSessions
            }
        });
    }

    addEditImage(Service, element) {
        return this.createBlade({
            data: element,
            meta: {
                Service: Service,
                type: this.Type.EditImage
            }
        });
    }

    addExtendedAssociations(Service, element) {
        return this.createBlade({
            data: element,
            meta: {
                Service: Service,
                type: this.Type.ExtendedAssociations
            }
        });
    }

    scrollToLastElement() {
        var vp = document.getElementsByTagName("blades");
    }

    remove(blade) {
        console.log(blade);

        let self = this;

        var bladeId = blade._bladeId;

        var i = 0;
        var endpoint = 0;
        for (var i = 0; i < this.blades.length; i++) {
            if (this.blades[i]._bladeId == bladeId) {
                endpoint = i;
            }
        }

        var i = endpoint;
        var removeLength = 0;

        if(blade.meta.type.indexOf("edit-") != -1){
            this.blades[i].meta.Controller.destroy();
            removeLength = 1;
        } else {
            while(i<this.blades.length){

                if (this.blades[i].meta.Controller && typeof this.blades[i].meta.Controller.destroy === 'function')
                    this.blades[i].meta.Controller.destroy();

                i++;
            }
            removeLength = this.blades.length -1;
        }

        self.blades.splice(endpoint, removeLength);
        self.editBladesTypes.splice(endpoint, removeLength);

        if(blade.meta.type == "overview"){
            self.blades.splice(endpoint, 1);
            self.editBladesTypes.splice(endpoint, 1);
        }

        this.$log.warn("animation: remove" + bladeId);

        this.notifyObservers();

        return bladeId;
    }

    removeChildrens() {
        angular.forEach(this.blades, function (blade) {
            if (blade.meta.type != 'overview')
                blade.meta.remove();
        });
    }

    removeAll() {
        for(var i = this.blades.length -1;i > -1;i--){
            this.blades[i].meta.remove();
        }
    }

    removeChildrensOnMyObjects() {
        angular.forEach(this.blades, function (blade) {
            if (blade.meta.type != 'myobjects')
                blade.meta.remove();
        });
    }

    removeChildrensOnAdminPermissions() {
        angular.forEach(this.blades, function (blade) {
            if (blade.meta.type != 'admin-permissions')
                blade.meta.remove();
        });
    }

    removeChildrensOnHome() {
        angular.forEach(this.blades, function (blade) {
            if (blade.meta.type != 'home')
                blade.meta.remove();
        });
    }
    removeAllAfterIndex(bladeId){
        angular.forEach(this.blades, function (blade) {
            if (bladeId < blade._bladeId)
                blade.meta.remove();
        });
    }

    get() {
        return this.blades
    }

    notifyObservers() {
        angular.forEach(this.observers, function (callback) {
            callback();
        });
    }

    registerObserverCallback(callback) {
        this.observers.push(callback);
    }

    removeBladeByType(bladeType){
        var self = this;

        var i = 0;
        var blade = {};
        for(i;i<self.editBladesTypes.length;i++){
            var tmpBlade = self.editBladesTypes[i];

            if(tmpBlade.type === bladeType){
                self.blades[i].meta.remove();
            }
        }
    }
}
