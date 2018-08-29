var toolkit = require('./toolkit');
var assign = toolkit.assign;
var isArray = toolkit.isArray;
var each = toolkit.each;
var pick = toolkit.pick;

var instanceMethods = {

    url: function() {

        return this.constructor.url({type: this.getType(), id: this.get('id')});

    },

    saveAttribute: function(name, value) {

        if (arguments.length === 2) {
            this.setAttribute(name, value);
        }

        return this.save({attributes: [name]});

    },

    saveRelationship: function(relationName, relationData) {

        relationData && this.setRelationship(relationName, relationData);

        return this.save({relationships: [relationName]});

    },

    saveFile: function(name, file) {

        var filesData = {};

        if (typeof file !== 'undefined') {
            filesData[name] = file;
        } else {
            filesData = name;
        }

        return this.save({files: filesData});

    },

    save: function(data) {

        var model = this;
        var Model = this.constructor;
        var dataToSync = {};

        var httpParams = {
            method: this.isNew() ? 'POST' : 'PUT',
            url: this.url()
        };

        data = data || {
            attributes: Object.keys(this.state.data.attributes),
            relationships: Object.keys(this.state.data.relationships),
        };

        pick(dataToSync, this.state.data, ['type', 'id']);

        if (data.attributes) {
            if (!isArray(data.attributes)) {
                this.setAttribute(data.attributes);
                data.attributes = Object.keys(data.attributes);
            }
            assign(dataToSync, {
                attributes: pick({}, this.state.data.attributes, data.attributes)
            });
        }

        if (data.relationships) {
            if (!isArray(data.relationships)) {
                this.setRelationship(data.relationships);
                data.relationships = Object.keys(data.relationships);
            }
            assign(dataToSync, {
                relationships: pick({}, this.state.data.relationships, data.relationships)
            });
        }

        if (data.files) {

            var FormData = Model.getFormDataType();
            var formData = new FormData();

            formData.append('data', JSON.stringify(dataToSync));

            each(data.files, function(file, fileName) {
                formData.append(fileName, file);
            });

            assign(httpParams, {
                method: 'POST',
                data: formData
            });

        } else {

            assign(httpParams, {
                data: JSON.stringify({data: dataToSync})
            });

        }

        return Model.http(httpParams).then(function(response) {
            return model.syncWithData(response.data);
        });

    },

    fetch: function(params) {

        var model = this;
        var Model = this.constructor;

        return Model.http({
            method: 'GET',
            url: params && params.url || this.url()
        }).then(function(response) {

            model.syncWithData(response.data);
            return model;

        });

    },

    destroy: function() {

        var model = this;
        var Model = this.constructor;

        return Model.http({
            method: 'DELETE',
            url: this.url()
        }).then(function(response) {

            model.sourceCollection && model.sourceCollection.remove(model);
            model.includedCollection && model.includedCollection.remove(model);
            return model;

        });

    }
};

var staticMethods = {

    baseUrl: '/',

    url: function(params) {

        var Model = this;

        params = assign({
            type: Model.prototype.type,
        }, params);

        return Model.appendQueryString([
            Model.baseUrl,
            Model.getTypeUrlSegment(params.type),
            params.id ? '/' + params.id : ''
        ].join(''), params.query);

    },

    appendQueryString: function(url, queryParams) {

        var queryParts = [];
        var queryString = '';

        var iterator = function(params, prefix) {

            each(params || {}, function(value, key) {

                var namespace = prefix ? (prefix + '[' + key + ']') : key;

                if (isArray(value)) {
                    queryParts.push([namespace, value.join(',')]);
                } else if (value === Object(value)) {
                    iterator(value, namespace);
                } else {
                    queryParts.push([namespace, value]);
                }

            });

        };

        if (queryParams === Object(queryParams)) {

            iterator(queryParams);

            queryString = queryParts.filter(function(pair) {

                return pair[1] === undefined || pair[1] === null ? false : pair[1].toString().length > 0;

            }).map(function(pair) {

                return pair.join('=');

            }).join('&');

        } else if (typeof queryParams === 'string') {
            queryString = queryParams;
        }

        return url + (queryString ? '?' + queryString : '');

    },

    getTypeUrlSegment: function(type) {

        return type;

    },

    getFormDataType: function() {

        return FormData;

    },

    getFromApi: function(params, callback) {

        var Model = this;

        return Model.http({
            method: 'GET',
            url: params && params.url
                ? params.url
                : Model.url(typeof params === 'string' ? {id: params} : params)
        }).then(function(response) {

            var model = new Model(response.data);
            callback && callback(model);

            return model;

        });

    }
};

module.exports = function(Model) {

    assign(Model.prototype, instanceMethods);
    assign(Model, staticMethods);
    return Model;

};
