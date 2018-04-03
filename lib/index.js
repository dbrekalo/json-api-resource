var Model = require('./model');
var Collection = require('./collection');

Collection.prototype.Model = Model;

module.exports = {
    Model: Model,
    Collection: Collection
};
