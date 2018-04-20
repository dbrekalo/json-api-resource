var typeFactory = require('./typeFactory');
var toolkit = require('./toolkit');
var isArray = toolkit.isArray;
var clientId = toolkit.clientId;

var Collection = typeFactory({

    constructor: function(data, options) {

        this.cid = clientId();
        this.syncWithData(data, options);

    },

    get: function(key) {

        return typeof key === 'string' ? this.getProperty(key) : this.normalize(key);

    },

    getProperty: function(key) {

        return this.map(function(model) {
            return model.get(key);
        });

    },

    getModel: function(id, type) {

        var models = this.models.filter(function(model) {

            var validId = typeof id !== 'undefined';
            var idCondition = validId ? id === model.getProperty('id') : true;
            var typeCondition = type ? type === model.getType() : true;

            return validId || type ? (idCondition && typeCondition) : false;

        });

        return models.length ? models[0] : undefined;

    },

    where: function(params) {

        return this.models.filter(function(model) {

            var found = true;

            for (var key in params) {
                if (params.hasOwnProperty(key)) {
                    found = params[key] === (key === 'type' ? model.getType() : model.getProperty(key));
                    if (!found) {
                        break;
                    }
                }
            }

            return found;

        });

    },

    findWhere: function(params) {

        var models = this.where(params);
        return models.length ? models[0] : undefined;

    },

    add: function(models) {

        var self = this;

        (isArray(models) ? models: [models]).forEach(function(model) {

            if (!self.has(model)) {
                self.models.push(model);
            }

        });

        this.length = this.models.length;

        return this;

    },

    has: function(model) {

        return Boolean(this.getModel(model.getProperty('id'), model.getType()));

    },

    remove: function(model) {

        this.models = this.models.filter(function(collectionModel) {
            return collectionModel !== model;
        });

        this.length = this.models.length;

        return this;

    },

    syncWithData: function(inputData, options) {

        var CollectionModel = options && options.Model || this.Model;
        var GenericModel = Collection.prototype.Model;
        var self = this;

        if (inputData) {

            if (typeof inputData === 'string') {
                inputData = JSON.parse(inputData);
            }

            if (isArray(inputData)) {

                this.models = inputData;

            } else {

                this.models = inputData.data.map(function(itemData) {
                    return new CollectionModel({data: itemData}, {assignIncludes: false});
                });

                var includedModels = (inputData.included || []).map(function(itemData) {
                    return new GenericModel({data: itemData}, {assignIncludes: false});
                });

                var includedCollection = new Collection(this.models.concat(includedModels));

                includedCollection.models.forEach(function(model) {
                    model.sourceCollection = self;
                    model.includedCollection = includedCollection;
                });

                this.meta = inputData.meta || {};

            }

        }

        this.models = this.models || [];
        this.length = this.models.length;
        this.meta = this.meta || {};

        return this;

    },

    normalize: function(schema) {

        return this.map(function(model) {
            return model.normalize(schema);
        });

    }

}, {

    create: function(apiData, options) {

        var Collection = this;
        return new Collection(apiData, options);

    },

    getType: function() {

        return this.prototype.Model.getType();

    }

});

['forEach', 'map', 'filter', 'reduce', 'slice'].forEach(function(functionName) {
    Collection.prototype[functionName] = function() {
        return this.models[functionName].apply(this.models, arguments);
    };
});

module.exports = Collection;
