var _ = require('underscore');

module.exports = {
    baseApiUrl: window.location.href + '/api/',
    storageKey: undefined,
    resources: {
        article: {
            validationRules: {
                title: {
                    rule: function(title) {
                        return title.length > 0;
                    },
                    message: 'Please enter title.'
                }
            },
            data: function(random) {

                return _.chain(_.range(1, 2000)).map(function(index) {
                    return {
                        type: 'article',
                        id: String(index),
                        attributes: {
                            title: 'Article title ' + index,
                            leadTitle: 'Article lead title ' + index,
                            published: random.boolean()
                        },
                        relationships: {
                            author: {data: {id: '1', type: 'user'}},
                            publisher: {data: null},
                            relatedArticles: {
                                data: [
                                    {id: String(index), type: 'article'}
                                ]
                            },
                            tags: {
                                data: [
                                    {id: String((index - 1) % 20 + 1), type: 'tag'},
                                    {id: String((index - 1) % 20 + 2), type: 'tag'},
                                    {id: String((index - 1) % 20 + 3), type: 'tag'}
                                ]
                            }
                        }
                    };
                }).value();

            }
        },
        tag: {
            data: _.chain(_.range(1, 25)).map(function(index) {
                return {
                    type: 'tag',
                    id: String(index),
                    attributes: {
                        title: 'Tag ' + index
                    }
                };
            }).value()
        },
        user: {
            data: function(random) {

                return _.chain(_.range(1, 5)).map(function(index) {
                    return {
                        type: 'user',
                        id: String(index),
                        attributes: {
                            email: 'test.user' + index + '@gmail.com'
                        },
                        relationships: {
                            boss: {data: {id: random.id(1, 5), type: 'user'}}
                        }
                    };
                }).value();

            }
        }
    }
};
