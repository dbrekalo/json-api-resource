var typeFactory = require('type-factory');
var Collection = require('./collection');
var toolkit = require('./toolkit');
var assign = toolkit.assign;
var isArray = toolkit.isArray;
var each = toolkit.each;
var clientId = toolkit.clientId;

var Model = typeFactory({

    type: undefined,
    state: undefined,
    sourceCollection: undefined,
    includedCollection: undefined,

    constructor: function(data, options) {

        this.cid = clientId();
        this.syncWithData(data, options);

    },

    syncWithData: function(data, options) {

        options = assign({assignIncludes: true}, options);

        this.state = {
            meta: {},
            data: {
                type: this.type || undefined,
                id: undefined,
                attributes: {},
                relationships: {}
            },
        };

        if (data) {

            data = typeof data === 'string' ? JSON.parse(data) : data;
            assign(this.state.data, data.data);
            assign(this.state.meta, data.meta);

        }

        if (options.assignIncludes) {

            new Collection([this].concat(
                (data && data.included || []).map(function(itemData) {
                    return new Model({data: itemData}, {assignIncludes: false});
                })
            ), {
                isIncluded: true
            });

        }

        if (this.state.data.type) {
            this.type = this.state.data.type;
        }

        return this;

    },

    setType: function(type) {

        this.type = type;
        this.state.data.type = type;
        return this;

    },

    get: function(key) {

        return key === 'id'
            ? this.getId()
            : key === 'type'
                ? this.getType()
                : typeof key === 'string'
                    ? this.getProperty(key)
                    : this.normalize(key)

        ;

    },

    getProperty: function(key) {

        var queryTree = typeof key === 'string' ? key.split('.') : key;
        var currentQuery = queryTree[0];
        var result;

        if (this.state.data.relationships[currentQuery]) {

            result = this.getRelation(currentQuery);

            if (typeof result !== 'undefined') {

                if (queryTree.length === 2 && result instanceof Collection) {
                    return result.getProperty(queryTree[1]);
                } else if (queryTree.length > 1) {
                    queryTree.shift();
                    return result.getProperty(queryTree);
                }

            }

        } else {

            result = currentQuery === 'id'
                ? this.getId()
                : currentQuery === 'type'
                    ? this.getType()
                    : this.getAttribute(currentQuery)
            ;

        }

        return result;

    },

    getId: function() {

        return this.state.data.id;

    },

    getAttribute: function(key) {

        return this.state.data.attributes[key];

    },

    getType: function() {

        return this.state.data.type;

    },

    getRelation: function(name) {

        var relation = this.state.data.relationships[name];
        var relationData = relation && relation.data;
        var self = this;

        if (!relationData) {

            return undefined;

        } else if (isArray(relationData)) {

            return new Collection(relationData.map(function(item) {
                return self.includedCollection.getModel(item.id, item.type);
            }).filter(function(item) {
                return item;
            }));

        } else {

            return this.includedCollection.getModel(
                relationData.id, relationData.type
            );

        }

    },

    getRelationshipReferences: function(relationName) {

        var relation = this.state.data.relationships[relationName];

        if (relation) {

            var relationData = relation.data;

            if (isArray(relationData)) {
                return relationData.length ? relationData.map(function(item) {
                    return item.id;
                }) : undefined;
            } else {
                return relationData && relationData.id ? relationData.id : undefined;
            }

        } else {

            return undefined;

        }

    },

    normalize: function(schema) {

        var result = {};
        var model = this;
        var error = function(message) {
            throw new Error(message);
        };

        schema.forEach(function(entry) {

            var key, query, value;

            if (typeof entry === 'string') {
                key = query = entry;
            } else if (isArray(entry)) {
                key = entry[0];
                query = entry[1];
            } else {
                error('Invalid schema structure');
            }

            if (typeof query === 'string') {
                value = model.getProperty(query);
            } else if (typeof query === 'function') {
                value = query(model);
            } else if (isArray(query)) {

                var relatedEntity = model.getProperty(key);

                if (relatedEntity instanceof Collection || relatedEntity instanceof Model) {
                    value = relatedEntity.normalize(query);
                }

            } else {
                error('Invalid schema structure');
            }

            if (value instanceof Model || value instanceof Collection) {
                error('Data not properly normalized for key: ' + key);
            }

            result[key] = value;

        });

        return result;

    },

    setAttribute: function(name, value) {

        var attributes = this.state.data.attributes;

        if (arguments.length === 2) {
            attributes[name] = value;
        } else {
            assign(attributes, name);
        }

        return this;

    },

    setId: function(id) {

        this.state.data.id = id;
        return this;

    },

    setRelationship: function(relationName, relationData) {

        var self = this;
        var relationships = this.state.data.relationships;
        var input = {};

        if (typeof relationName === 'string') {
            input[relationName] = relationData;
        } else {
            input = relationName;
        }

        each(input, function(data, name) {

            var refs;

            if (data instanceof Model) {

                refs = {type: data.getType(), id: data.getProperty('id')};
                self.includedCollection.add(data);

            } else if (data instanceof Collection) {

                refs = data.map(function(model) {
                    return {type: model.getType(), id: model.getProperty('id')};
                });

                self.includedCollection.add(data.models);

            } else {

                refs = data;

            }

            relationships[name] = {data: refs};

        });

        return this;

    },

    isNew: function() {

        return typeof this.state.data.id === 'undefined';

    }

}, {

    create: function(data, options) {

        var Model = this;
        return new Model(data, options);

    },

    createFromAttributes: function(attributes, options) {

        return this.create({data: {attributes: attributes}}, options);

    },

    getType: function() {

        return this.prototype.type;

    }

});

module.exports = Model;
