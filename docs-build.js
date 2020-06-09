var attire = require('attire');

attire.buildDemo({
    file: 'README.md',
    dest: 'index.html',
    title: 'JSON api resource',
    description: 'Query, transform and persist datasets based on JSON API specification.',
    canonicalUrl: 'http://dbrekalo.github.io/json-api-resource/',
    githubUrl: 'https://github.com/dbrekalo/json-api-resource',
    userRepositories: {
        user: 'dbrekalo',
        onlyWithPages: true
    },
    author: {
        caption: 'Damir Brekalo',
        url: 'https://github.com/dbrekalo',
        image: 'https://s.gravatar.com/avatar/32754a476fb3db1c5a1f9ad80c65d89d?s=80',
        email: 'dbrekalo@gmail.com',
        github: 'https://github.com/dbrekalo',
        twitter: 'https://twitter.com/dbrekalo'
    },
    afterParse: function($) {
        $('p').first().remove();
        $('a').first().parent().remove();
    },
    inlineCss: true,
});
