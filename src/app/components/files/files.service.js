export class FilesService {
    constructor (Config, $http) {
        'ngInject';

        var self = this;

        this.Config = Config;
        this.$http = $http;

        this.type = 'files';

        this.url = Config.apiHost + this.type;
    }

    get() {
        self = this;

        var promise = this.$http.get(this.url,
            {
                cache: true,
                transformResponse: function (data) {
                    return angular.fromJson(data);
                }
            }
        );

        return promise;
    }

    create() {
        return this.$http.post(this.url + "/uploads");
    }

    generateFileUploadUrl(){
        var promise =  this.$http.post(this.url + "/uploads");
        return promise;
    }

    postFile(fileUrl,descObj){
        var promise = this.$http.post(fileUrl,descObj);
        return promise;
    }

    saveImages(object){
        var self = this;
        var url = self.Config.apiHost + object.id + "/images";
        var imageIds = [];

        angular.forEach(object._embedded.images.items, function(value,key){
            imageIds.push((!value.id) ? value.fileId : value.id);
        });

        var items = { fileIds : imageIds };

        return self.$http.put(url,items);
    }

}
