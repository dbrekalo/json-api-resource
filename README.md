# JSON api resource

[![Build Status](https://travis-ci.org/dbrekalo/json-api-resource.svg?branch=master)](https://travis-ci.org/dbrekalo/json-api-resource)
[![NPM Status](https://img.shields.io/npm/v/json-api-resource.svg)](https://www.npmjs.com/package/json-api-resource)

Query and transform datasets based on JSON API specification.
Lightweight library that runs both in browser and server environment. Weighs less than 3KB.

[Visit documentation site](http://dbrekalo.github.io/json-api-resource/).

Although [JSON api](http://jsonapi.org/) specification provides elegant and standard way of representing resources with JSON -
consuming those datasets oftentimes can be cumbersome.

Nested relation data is especially tricky to transform to format better suited for common templating or state management patterns.
This library provides simple yet powerful query engine to transform JSON api dataset to format of your liking.

By utilizing library model and collection classes you can easily query and manipulate datasets.
Models can be altered and easily synchronized with server (with use of http mixin loaded separately).

---

### Features
* query and alter dataset attribute and relation values
* normalize data to custom schema format
* manipulate and create resources with extend-able model and collection utilities

---

### Features with http mixin enabled
* retrieve JSON api models and collections from server
* persist new, changed and deleted models
* update subset of resource attribute or relation data
* handle file uploads alongside JSON data payload

---

### Basic usage

```bash
// install via npm
npm install json-api-resource --save
```

```js
// require module
var Model = require('json-api-resource').Model;

// create dataset model
const model = new Model(jsonApiData);

// get attribute
model.get('title');

// get attribute from related entity
model.get('author.firstName');
```


## Examples and api

Example JSON api formatted dataset for "article" resource is shown bellow.

```js
const articleData = {
    data: {
        type: 'article',
        id: '1',
        attributes: {
            title: 'Test article',
            body: 'The shortest article. Ever.'
        },
        relationships: {
            author: {data: {id: '42', type: 'user'}},
            publisher: {data: {id: '24', type: 'user'}},
            tags: {data: [
                {id: '1', 'type': 'tag'},
                {id: '2', 'type': 'tag'}
            ]}
        }
    },
    included: [{
        type: 'user',
        id: '42',
        attributes: {
            firstName: 'John',
            lastName: 'Doe',
        },
        relationships: {
            boss: {'data': {'id': '42', 'type': 'user'}},
        }
    }, {
        type: 'tag',
        id: '1',
        attributes: {
            name: 'tag 1'
        }
    }, {
        type: 'tag',
        id: '2',
        attributes: {
            name: 'tag 2'
        }
    }]
};
```

---

### Query and normalize data

Retrive simple data like so:

```js
new Model(articleData).get('title');
// will return 'Test article

Model.create(articleData).get('author.firstName');
// will output 'John'

Model.create(articleData).get(['id', 'title', 'body']);
// will return
{
     id: '1',
     title: 'Test article',
     body: 'The shortest article. Ever.'
}
```

Normalize dataset to more complex schema:

```js
Model.create(articleData).get([
    'id',
    'title',
    ['titleCaps', article => article.get('title').toUpperCase()],
    'body',
    ['author', [
        'firstName',
        'lastName',
        ['boss', [
            'firstName',
            'lastName',
        ]],
    ]],
    ['tags', [
        'id',
        'name'
    ]]
]);

// will return
{
    id: '1',
    title: 'Test article',
    titleCaps: 'TEST ARTICLE',
    body: 'The shortest article. Ever.',
    author: {
        id: '42',
        firstName: 'John',
        lastName: 'Doe',
        boss: {
            firstName: 'John',
            lastName: 'Doe'
        }
    },
    tags: [{
        id: '1',
        name: 'tag 1'
    }, {
        id: '2',
        name: 'tag 2'
    }]
};
```
---

### Working with collections

Collections can be normalized to schema via identical api.
Standard array methods ('forEach', 'map', 'filter', 'reduce', 'slice') are implemented
on all collection objects.

```js
// import collection
var Collection = require('json-api-resource').Collection
var collection = new Collection(articleData);

collection.get('title');
// will return ['Test article']

collection.get(['title']);
// will return [{title: 'Test article'}]

collection.get(['id', 'title', 'body']);
// will return
[{
     id: '1',
     title: 'Test article',
     body: 'The shortest article. Ever.'
}]

collection.map(model => model.get('title'));
// will return ['Test article']

collection.where({title: 'Test article'});
// returns array of models which satisfy query above

collection.findWhere({id: '1'});
// returns first found model

collection.add(articleModel);
// add model to collection

collection.remove(articleModel);
// remove model to collection

```

## HTTP mixin
Http mixin gives your models and collections a way to talk to your server.
Using straightforward api models and collections can be conveniently retrieved from and persisted to server.

Any http library (axios, $.ajax or something else) can be used for server communication.
Example mixin configuration for jQuery is shown bellow:

```js
var Model = require('json-api-resource').Model;
var Collection = require('json-api-resource').Collection;
var httpMixin = require('json-api-resource/lib/httpMixin');

httpMixin({
    Model: Model,
    Collection: Collection,
    baseUrl: '/api/',
    http: params => {
        return new Promise((resolve, reject) => {

            $.ajax($.extend({
                dataType: 'json',
                processData: false,
                contentType: 'application/vnd.api+json'
            }, params)).then((data, textStatus, jqXHR) => {
                resolve({data: data});
            }, jqXHR => {
                reject(jqXHR);
            });

        });
    }
});
```

### Retrieving models
```js
// Using callback api
Model.getFromApi({type: 'article', id: '1'}, function(model) {
    // do something with model instance
});

// Using promises api
Model.getFromApi({type: 'article', id: '1'}).then(function(model) {
    // do something with model instance
});

// other ways
Model.extend({type: 'tag'}).getFromApi('1');
Model.getFromApi({url: '/api/article/1'});
```

---

### Retrieving collections
```js
// Using callback api
Collection.getFromApi('article', function(collection) {
    // do something with collection
});

// Using promises api
Collection.getFromApi('article').then(function(collection) {
    // do something with collection
});
```

## Installation

Library can be used in browser and node server environment.

```js
// install via npm
npm install json-api-resource --save

// if using bundler or node server
var resource = require('json-api-resource');
var Model = resource.Model;
var Collection = resource.Collection;

// or just using browser globals
var resource = window.jsonApiResource;
```
