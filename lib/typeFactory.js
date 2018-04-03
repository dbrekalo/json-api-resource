var assign = require('./toolkit').assign;

function factory(parentType, prototypeProperties, staticProperties) {

    var generatedType = prototypeProperties.hasOwnProperty('constructor')
        ? prototypeProperties.constructor
        : function() {

            if (parentType) {
                parentType.apply(this, arguments);
            }

        }
    ;

    if (parentType) {

        var Surrogate = function() { this.constructor = generatedType; };
        Surrogate.prototype = parentType.prototype;
        generatedType.prototype = new Surrogate();

        assign(generatedType, parentType);
    }

    staticProperties && assign(generatedType, staticProperties);
    prototypeProperties && assign(generatedType.prototype, prototypeProperties);

    return generatedType;

}

module.exports = function(prototypeProperties, staticProperties) {

    var createdType = factory(null, prototypeProperties, staticProperties);

    createdType.extend = function(prototypeProperties, staticProperties) {

        return factory(this, prototypeProperties, staticProperties);

    };

    return createdType;

};
