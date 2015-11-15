'use strict';

var fs = require('fs-extra'),
    thisPackage = require('./package.json'),
    version = process.env.MB_GRUNT_VERSION || thisPackage.version;

module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        mochaTest: {
            options: {
                reporter: 'spec'
            },
            start: {
                src: ['test/startTest.js']
            },
            stop: {
                src: ['test/stopTest.js']
            }
        },
        jshint: {
            all: [
                'Gruntfile.js',
                'tasks/**/*.js',
                'test/**/*.js'
            ],
            options: {
                node: true,
                globals: {
                    describe: false,
                    it: false,
                    before: false,
                    beforeEach: false,
                    after: false,
                    afterEach: false
                },
                newcap: false,
                camelcase: true,
                curly: true,
                eqeqeq: true,
                latedef: true,
                undef: true,
                unused: true,
                trailing: true,
                maxparams: 4,
                maxdepth: 3,
                maxcomplexity: 6
            }
        },
        mb: {
            options: {
                path: 'node_modules/.bin/mb'
            },
            start: ['--port', 2525, '--allowInjection', '--mock', '--debug', '--pidfile', 'mb-grunt.pid'],
            restart: ['--port', 2525, '--allowInjection', '--mock', '--debug', '--pidfile', 'mb-grunt.pid'],
            stop: ['--pidfile', 'mb-grunt.pid']
        }
    });

    grunt.loadTasks('tasks');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('version', 'Set the version number', function () {
        var newPackage = require('./package.json');

        newPackage.version = version;
        console.log('Using version ' + version);
        fs.writeFileSync('./package.json', JSON.stringify(newPackage, null, 2) + '\n');
    });

    grunt.registerTask('test', ['try', 'mb:start', 'mochaTest:start', 'finally',
                                'mb:stop', 'checkForErrors', 'mochaTest:stop']);
    grunt.registerTask('default', ['jshint', 'version', 'test']);
};
