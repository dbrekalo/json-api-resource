var toolkit = require('./toolkit');
var assign = toolkit.assign;

var staticMethods = {

    url: function(params) {

        return this.prototype.Model.url(params);

    },

    getFromApi: function(params, callback) {

        var Collection = this;

        params = params || {};

        if (typeof params === 'string') {
            params = {type: params};
        }

        return Collection.http({
            method: 'GET',
            url: params.url || Collection.url(params),
            contentType: 'application/vnd.api+json'
        }).then(function(response) {

            var collection = new Collection(response.data, params);
            callback && callback(collection);

            return collection;

        });

    }

};

module.exports = function(Collection) {

    assign(Collection, staticMethods);
    return Collection;

};
