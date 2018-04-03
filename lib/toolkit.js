function each(collection, callback) {

    for (var key in collection) {
        collection.hasOwnProperty(key) && callback(collection[key], key);
    }

}

function pick(target, from, keys) {

    keys.forEach(function(key) {
        if (from.hasOwnProperty(key)) {
            target[key] = from[key];
        }
    });

    return target;
}

function isArray(obj) {

    return obj && obj.constructor === Array;

}

function assign(target, from) {

    if (from) {
        for (var key in from) {
            if (from.hasOwnProperty(key) && typeof from[key] !== 'undefined') {
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
    clientId: clientId
};
