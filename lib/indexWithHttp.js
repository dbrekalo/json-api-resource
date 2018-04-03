var Model = require('./model');
var Collection = require('./collection');
var modelMixin = require('./modelHttpMixin');
var collectionMixin = require('./collectionHttpMixin');

Collection.prototype.Model = Model;

module.exports = {
    Model: modelMixin(Model),
    Collection: collectionMixin(Collection)
};
