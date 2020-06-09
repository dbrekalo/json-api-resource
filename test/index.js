var resource = require('../');
var Collection = resource.Collection;
var Model = resource.Model;
var httpMixin = require('../lib/httpMixin');

var assert = require('chai').assert;
var $ = require('jquery');
var apiUrl = window.location.href + '/api/';

// add http capabilities
httpMixin({
    Model: Model,
    Collection: Collection,
    baseUrl: apiUrl,
    http: params => {
        return new Promise((resolve, reject) => {

            params = $.extend({
                dataType: 'json',
                processData: false,
                contentType: 'application/vnd.api+json'
            }, params);

            $.ajax(params).then((data, textStatus, jqXHR) => {
                resolve({data: data});
            }, jqXHR => {
                reject(jqXHR);
            });

        });
    }
});

var FakeServer = require('fake-json-api-server');
var fakeServerConfig = require('./fakeServerConfig');
var fakeServer;

beforeEach(() => {
    fakeServer = new FakeServer(fakeServerConfig);
});

afterEach(() => {
    fakeServer && fakeServer.stop();
});

describe('Creating models and collection from dataset', () => {

    it('Model is properly created from dataset', () => {

        return $.get(apiUrl + 'article/1', data => {

            [
                Model.create(data),
                Model.create(JSON.stringify(data)),
                new Model(data),
                new Model(JSON.stringify(data))
            ].forEach(model => {
                assert.isTrue(model instanceof Model);
                assert.isDefined(model.cid);
                assert.equal(model.getType(), 'article');
                assert.equal(model.getId(), '1');
            });

        });

    });

    it('Model attribute and relation data can be retrieved', () => {

        return $.get(apiUrl + 'article/1', data => {

            var model = Model.create(data);

            assert.equal(model.get('id'), '1');
            assert.equal(model.get('type'), 'article');
            assert.equal(model.get('title'), 'Article title 1');
            assert.equal(model.get('author.id'), '1');
            assert.equal(model.get('author.email'), 'test.user1@gmail.com');

            assert.instanceOf(model.get('author'), Model);
            assert.instanceOf(model.get('tags'), Collection);
            assert.strictEqual(model.get('author'), model.get('author'));

            assert.deepEqual(model.get('tags.id'), ['1', '2', '3']);

            assert.isUndefined(model.get('publisher'));
            assert.isUndefined(model.get('publisher.email'));
            assert.isUndefined(model.get('undefinedRelation.title'));
            assert.isUndefined(model.get('undefinedAttribute'));

        });

    });

    it('Model sets attributes and relationships', () => {

        return $.get(apiUrl + 'article/1', data => {

            var model = Model.create(data);

            model.setAttribute('title', 'New title');
            assert.equal(model.get('title'), 'New title');

            model.setRelationship('tags', new Collection(model.get('tags').slice(0, 2)));
            assert.equal(model.get('tags').length, 2);

            model.setRelationship('tags', [{type: 'tag', id: '1'}]);
            assert.deepEqual(model.get('tags.id'), ['1']);

            model.setId(undefined);
            assert.equal(model.get('id'), undefined);
            assert.isTrue(model.isNew());

        });

    });

    it('Model retrives relation references', () => {

        return $.get(apiUrl + 'article/1', data => {

            var model = new Model(data);

            assert.equal(model.getRelationshipReferences('author'), '1');
            assert.equal(model.getRelationshipReferences('publisher'), undefined);
            assert.equal(model.getRelationshipReferences('comments'), undefined);
            assert.equal(model.getRelationshipReferences('undefinedRelation'), undefined);
            assert.deepEqual(model.getRelationshipReferences('tags'), ['1', '2', '3']);

        });

    });

    it('Collection is properly created from dataset', () => {

        return $.get(apiUrl + 'article', data => {

            [
                Collection.create(data),
                Collection.create(JSON.stringify(data)),
                new Collection(data),
                new Collection(JSON.stringify(data))
            ].forEach(collection => {

                assert.isTrue(collection instanceof Collection);
                assert.isDefined(collection.cid);
                assert.isArray(collection.models);
                assert.isNumber(collection.length);

            });

        });

    });

    it('Collection models can be queried and appended', () => {

        return $.get(apiUrl + 'article', data => {

            var collection = Collection.create(data);
            var collectionLength = collection.length;

            assert.equal(collection.where({id: '1', type: 'article'}).length, 1);
            assert.equal(collection.findWhere({id: '1'}).get('id'), '1');
            assert.isUndefined(collection.findWhere({id: 'unknown'}));

            assert.isArray(collection.get('id'));
            assert.deepEqual(collection.get('id').slice(0, 1), ['1']);
            assert.deepEqual(collection.get(['id']).slice(0, 1), [{id: '1'}]);

            assert.equal(collection.getModel('1').get('id'), '1');
            assert.isUndefined(collection.getModel('unknownId'));
            assert.isUndefined(collection.getModel());

            assert.equal(collection.add(collection.getModel('1')).length, collectionLength);
            assert.equal(collection.add(new Model()).length, collectionLength + 1);

            assert.isArray(collection.toArray());

            ['forEach', 'map', 'filter', 'reduce', 'slice', 'find'].forEach(method => {
                assert.isDefined(collection[method]);
            });

        });

    });

    it('Model and collection classes will report type', () => {

        const ModelType = Model.extend({type: 'tag'});
        const CollectionType = Collection.extend({Model: ModelType});

        assert.equal(ModelType.getType(), 'tag');
        assert.equal(CollectionType.getType(), 'tag');
        assert.isUndefined(Model.getType());
        assert.isUndefined(Collection.getType());

    });

});

describe('Normalizing to schema', () => {

    it('normalizes attributes and relations', () => {

        return $.get(apiUrl + 'article/1', data => {

            assert.deepEqual(Model.create(data).get([
                'id',
                'title',
                ['titleLowercase', model => model.get('title').toLowerCase()],
                ['authorEmail', 'author.email'],
                ['author', ['id']],
                ['tags', ['id', 'title']]
            ]), {
                id: '1',
                title: 'Article title 1',
                titleLowercase: 'article title 1',
                authorEmail: 'test.user1@gmail.com',
                author: {id: '1'},
                tags: [
                    {id: '1', title: 'Tag 1'},
                    {id: '2', title: 'Tag 2'},
                    {id: '3', title: 'Tag 3'},
                ]
            });

        });

    });

    it('throws errors on invalid schema structure', () => {

        return $.get(apiUrl + 'article/1', data => {

            var model = Model.create(data);

            assert.throws(() => {
                model.get([{}]);
            });

            assert.throws(() => {
                model.get(['author']);
            });

            assert.throws(() => {
                model.get([
                    ['title', 42]
                ]);
            });

        });

    });

});

describe('Creating models from server data', () => {

    it('model can be created from api call', () => {

        return Promise.all([
            Model.getFromApi({type: 'article', id: '1'}),
            Model.getFromApi({url: apiUrl + 'article/1'})
        ]).then(models => {
            models.forEach(model => {
                assert.isTrue(model instanceof Model);
                assert.equal(model.getType(), 'article');
                assert.strictEqual(model.get('id'), '1');
            });
        });

    });

    it('extended model can be created from api call', () => {

        return Promise.all([
            Model.extend({type: 'tag'}).getFromApi({id: '1'}),
            Model.extend({type: 'tag'}).getFromApi('1')
        ]).then(models => {
            models.forEach(model => {
                assert.equal(model.getType(), 'tag');
                assert.strictEqual(model.get('id'), '1');
            });
        });

    });

    it('model can fetch changes from server', done => {

        Model.getFromApi({type: 'article', id: '1'}, model => {

            model.setAttribute('title', 'Test');

            model.fetch().then(() => {
                assert.notEqual(model.get('title'), 'Test');
                done();
            });

        });

    });

    it('model can be deleted via api call', done => {

        Collection.getFromApi('article').then(collection => {

            let model = collection.models[0];
            let initCollectionLength = collection.length;

            model.destroy()
                .then(() => Model.getFromApi({type: 'article', id: model.get('id')}))
                .catch(error => {
                    assert.equal(error.status, 404);
                    assert.equal(collection.length, initCollectionLength - 1);
                    done();
                });

        });

    });

    it('fails when api fails', () => {

        return Model.getFromApi({type: 'undefinedResource', id: '1'}).catch(function() {});

    });

});

describe('Saving json api model', function() {

    it('model sets and saves attribute only', (done) => {

        Model.getFromApi({type: 'article', id: '1'}, model => {

            model.setAttribute('title', 'New article title').saveAttribute('title').then(() => {
                assert.equal(model.get('title'), 'New article title');
                done();
            });

        });

    });

    it('model sets and saves attribute in same call', (done) => {

        Model.getFromApi({type: 'article', id: '1'}, model => {

            model.saveAttribute('title', 'New article title').then(function() {
                assert.equal(model.get('title'), 'New article title');
                done();
            });

        });

    });

    it('model saves specific attribute only', (done) => {

        Model.getFromApi({type: 'article', id: '1'}, model => {

            model.setAttribute('title', 'New article title').save({
                attributes: ['title']
            }).then(function() {
                assert.equal(model.get('title'), 'New article title');
                done();
            });

        });

    });

    it('model saves multiple attributes', (done) => {

        Model.getFromApi({type: 'article', id: '1'}, model => {

            model.save({
                attributes: {title: 'New article title', leadTitle: 'New article lead'}
            }).then(model => {
                assert.equal(model.get('title'), 'New article title');
                assert.equal(model.get('leadTitle'), 'New article lead');
                done();
            });

        });

    });

    it('saves hasMany relation', (done) => {

        Model.getFromApi({type: 'article', id: '1'}, model => {

            var newTags = new Collection(model.get('tags').slice(0, 2));

            model.saveRelationship('tags', newTags).then(() => {
                assert.equal(model.get('tags').length, 2);
                done();
            });

        });

    });

    it('saves hasOne relation', (done) => {

        Model.getFromApi({type: 'article', id: '1'}, model => {

            var author = model.get('author');
            var authorId = author.get('id');

            model.saveRelationship('publisher', author).then(() => {
                assert.equal(model.get('publisher.id'), authorId);
                done();
            });

        });

    });

    it('saves multiple relations', (done) => {

        Model.getFromApi({type: 'article', id: '1'}, model => {

            var author = model.get('author');
            var authorId = author.get('id');

            var currentTags = model.get('tags');
            var newTags = new Collection(currentTags.slice(0, 2));

            model.save({
                relationships: {
                    publisher: author,
                    tags: newTags
                }
            }).then(function() {
                assert.equal(model.get('publisher.id'), authorId);
                assert.equal(model.get('tags').length, 2);
                done();
            });

        });

    });

    it('extends and saves new model', (done) => {

        Model.extend({type: 'tag'}).create().save({
            attributes: {title: 'New tag'}
        }).then(model => {
            assert.isDefined(model.get('id'));
            assert.equal(model.get('title'), 'New tag');
            done();
        });

    });

    it('creates and saves new model', (done) => {

        var model = Model.createFromAttributes({title: 'New tag'}).setType('tag');

        model.save().then(function() {
            assert.isDefined(model.get('id'));
            assert.equal(model.get('title'), 'New tag');
            done();
        });

    });

    it('saves files payload', (done) => {

        Model.getFromApi({type: 'article', id: '1'}, model => {

            var handler = function(request) {
                assert.strictEqual(request.requestBody.get('test'), 'somefile.jpg');
                fakeServer.off('request', handler);
                done();
            };

            fakeServer.on('request', handler);

            model.saveFile({test: 'somefile.jpg'});

        });

    });

    it('saves files payload with alternate syntax', (done) => {

        Model.getFromApi({type: 'article', id: '1'}, model => {

            var handler = function(request) {
                assert.strictEqual(request.requestBody.get('test'), 'somefile.jpg');
                fakeServer.off('request', handler);
                done();
            };

            fakeServer.on('request', handler);

            model.saveFile('test', 'somefile.jpg');

        });

    });

    it('saves files payload alongside attributes', (done) => {

        Model.getFromApi({type: 'article', id: '1'}, model => {

            var handler = function(request) {
                assert.strictEqual(request.requestBody.get('test'), 'somefile.jpg');
                fakeServer.off('request', handler);
            };

            fakeServer.on('request', handler);

            model.save({
                attributes: {title: 'New article title'},
                files: {test: 'somefile.jpg'}
            }).then(() => {
                assert.equal(model.get('title'), 'New article title');
                done();
            });

        });

    });

});

describe('Generating model url', function() {

    it('model generates urls properly', function() {

        assert.equal(Model.url({type: 'article'}), apiUrl + 'article');
        assert.equal(Model.url({type: 'article', id: '2'}), apiUrl + 'article/2');
        assert.equal(Model.extend({type: 'article'}).url({id: '2'}), apiUrl + 'article/2');

    });

    it('model generates query strings properly', function() {

        assert.equal(Model.url({
            type: 'article',
            id: '2',
            query: {
                filter: {
                    title: 'test',
                    author: '',
                    published: true
                },
                page: {},
                sort: '-title',
                undefinedKey: undefined,
                nullKey: null,
                include: ['tags', 'tags.id']
            }
        }), apiUrl + 'article/2?filter[title]=test&filter[published]=true&sort=-title&include=tags,tags.id');

        assert.equal(Model.url({
            type: 'article',
            query: 'filter[title]=test'
        }), apiUrl + 'article?filter[title]=test');

    });

});

describe('Creating collections from server data', function() {

    it('collection is created via api call', (done) => {

        Collection.getFromApi('article', function(collection) {

            assert.instanceOf(collection, Collection);
            collection.forEach(articleModel => {
                assert.isDefined(articleModel.get('id'));
                assert.isDefined(articleModel.get('author.id'));
            });
            done();

        });

    });

    it('collection can be indexed for faster query', (done) => {

        Collection.getFromApi({
            type: 'article',
            buildModelMap: true
        }, function(collection) {

            for (var i = 0; i < 300; i++) {
                var id = String(1500 + i);
                var articleModel = collection.getModel(id, 'article');
                assert.instanceOf(articleModel, Model);
                assert.equal(articleModel.getId(), id);
            }

            done();

        });

    });

    it('collection is created via api call with url', (done) => {

        Collection.getFromApi({
            url: apiUrl + 'article?page[offset]=0&page[limit]=4'
        }).then(collection => {

            assert.instanceOf(collection, Collection);
            assert.equal(collection.length, 4);
            done();

        });

    });

    it('collection is created via api call with query params', (done) => {

        Collection.getFromApi({
            type: 'article',
            query: {page: {offset: 0, limit: 4}}
        }).then(collection => {

            assert.instanceOf(collection, Collection);
            assert.equal(collection.length, 4);
            done();

        });

    });

    it('multiple collections created via api call', (done) => {

        Promise.all([
            Collection.getFromApi('article'),
            Collection.getFromApi('tag'),
        ]).then(collections => {
            assert.instanceOf(collections[0], Collection);
            assert.instanceOf(collections[1], Collection);
            done();
        });

    });

    it('collection fails when api fails', (done) => {

        Collection.getFromApi({type: 'undefinedResource'}).catch(function() {
            done();
        });

    });

});
