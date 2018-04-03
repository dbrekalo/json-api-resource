var attire = require('attire');

module.exports = function(grunt) {

    grunt.initConfig({

        eslint: {
            options: {
                configFile: '.eslintrc.js'
            },
            target: ['lib/**/*.js', 'Gruntfile.js']
        },

        watch: {
            readme: {
                expand: true,
                files: ['README.md'],
                tasks: ['buildDemo'],
                options: {
                    spawn: false
                }
            },
            jsFiles: {
                expand: true,
                files: ['lib/**/*.js'],
                tasks: ['eslint'],
                options: {
                    spawn: false
                }
            }
        },

        bump: {
            options: {
                files: ['package.json', 'package-lock.json'],
                commitFiles: ['package.json', 'package-lock.json'],
                tagName: '%VERSION%',
                push: false
            }
        }

    });

    grunt.registerTask('buildDemo', function() {

        var done = this.async();

        attire.buildDemo({
            file: 'README.md',
            dest: 'index.html',
            title: 'JSON api resource',
            description: 'Backbone Model and Collection extensions for working with json:api formatted datasets and server responses.',
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
        }).then(function() {
            done();
            grunt.log.ok(['Demo builded']);
        });

    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('default', ['build']);
    grunt.registerTask('build', ['eslint', 'buildDemo']);

};
