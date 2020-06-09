var typeFactory = require('type-factory');
var toolkit = require('./toolkit');
var isArray = toolkit.isArray;
var clientId = toolkit.clientId;
var hasOwn = toolkit.hasOwn;

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

        if (this.modelMap && id && type) {
            return this.modelMap[id + '@' + type];
        }

        var validId = typeof id !== 'undefined';

        var models = this.models.filter(function(model) {
            var idCondition = validId ? id === model.getId() : true;
            var typeCondition = type ? type === model.getType() : true;

            return validId || type ? (idCondition && typeCondition) : false;
        });

        return models.length ? models[0] : undefined;

    },

    where: function(params) {

        return this.models.filter(function(model) {

            var found = true;

            for (var key in params) {
                if (hasOwn(params, key)) {
                    found = params[key] === model.get(key);
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

            self.updateModelMap('add', model);

        });

        this.length = this.models.length;

        return this;

    },

    updateModelMap: function(action, model) {

        if (this.modelMap) {
            var id = model.getId();
            var type = model.getType();
            if (id && type) {
                var key = id + '@' + type;
                if (action === 'add') {
                    this.modelMap[key] = model;
                } else if (action === 'remove') {
                    delete this.modelMap[key];
                }
            }
        }

        return this;

    },

    has: function(model) {

        return Boolean(this.getModel(model.getProperty('id'), model.getType()));

    },

    remove: function(model) {

        this.models = this.models.filter(function(collectionModel) {
            return collectionModel !== model;
        });
        this.updateModelMap('remove', model);
        this.length = this.models.length;

        return this;

    },

    syncWithData: function(inputData, options) {

        var CollectionModel = options && options.Model || this.Model;
        var GenericModel = Collection.prototype.Model;
        var self = this;

        options = options || {};

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

                new Collection(this.models.concat(includedModels), {
                    isIncluded: true,
                    sourceCollection: self
                });

                this.meta = inputData.meta || {};

            }

        }

        this.models = this.models || [];
        this.length = this.models.length;
        this.meta = this.meta || {};

        if (options.isIncluded) {
            this.modelMap = {};
            this.models.forEach(function(model) {
                self.updateModelMap('add', model);
                model.includedCollection = self;
                if (options.sourceCollection) {
                    model.sourceCollection = options.sourceCollection;
                }
            });
        } else if (options.buildModelMap) {
            this.buildModelMap();
        }

        return this;

    },

    buildModelMap: function() {

        var self = this;

        this.modelMap = {};

        this.models.forEach(function(model) {
            self.updateModelMap('add', model);
        });
        return this;

    },

    normalize: function(schema) {

        return this.map(function(model) {
            return model.normalize(schema);
        });

    },

    toArray: function() {

        return this.models;

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

['forEach', 'map', 'filter', 'reduce', 'slice', 'find', 'sort'].forEach(function(functionName) {
    Collection.prototype[functionName] = function() {
        return this.models[functionName].apply(this.models, arguments);
    };
});

module.exports = Collection;
