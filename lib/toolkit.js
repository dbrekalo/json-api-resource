function each(collection, callback) {

    for (var key in collection) {
        hasOwn(collection, key) && callback(collection[key], key);
    }

}

function pick(target, from, keys) {

    keys.forEach(function(key) {
        if (hasOwn(from, key)) {
            target[key] = from[key];
        }
    });

    return target;
}

function isArray(obj) {

    return obj && obj.constructor === Array;

}

function hasOwn(obj, key) {

    return Object.prototype.hasOwnProperty.call(obj, key);

}

function assign(target, from) {

    if (from) {
        for (var key in from) {
            if (hasOwn(from, key) && typeof from[key] !== 'undefined') {
                target[key] = from[key];
            }
        }
    }

    return target;

}

function clientId() {

    clientId.counter = clientId.counter || 1;
    clientId.counter++;

    return 'c' + clientId.counter;

}

module.exports = {
    assign: assign,
    each: each,
    isArray: isArray,
    pick: pick,
    clientId: clientId,
    hasOwn: hasOwn
};
