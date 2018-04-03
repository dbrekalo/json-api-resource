var toolkit = require('./toolkit');
var assign = toolkit.assign;

var staticMethods = {

    url: function(params) {

        return this.prototype.Model.url(params);

    },

    getFromApi: function(options, callback) {

        var Collection = this;

        if (typeof options === 'string') {
            options = {type: options};
        }

        return Collection.http({
            method: 'GET',
            url: options.url || Collection.url(options),
            contentType: 'application/vnd.api+json'
        }).then(function(response) {

            var collection = new Collection(response.data, options);
            callback && callback(collection);

            return collection;

        });

    }

};

module.exports = function(Collection) {

    assign(Collection, staticMethods);
    return Collection;

};
