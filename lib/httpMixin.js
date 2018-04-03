var modelMixin = require('./modelHttpMixin');
var collectionMixin = require('./collectionHttpMixin');

module.exports = function(params) {

    var Model = params.Model;
    var Collection = params.Collection;

    modelMixin(Model);
    collectionMixin(Collection);

    Model.http = Collection.http = params.http;

    if (params.baseUrl) {
        Model.baseUrl = params.baseUrl;
    }

};
