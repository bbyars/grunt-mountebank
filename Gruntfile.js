'use strict';

var fs = require('fs'),
    thisPackage = require('./package.json'),
    version = process.env.MB_GRUNT_VERSION || thisPackage.version;

module.exports = function (grunt) {

    grunt.loadTasks('tasks');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-eslint');

    grunt.initConfig({
        mochaTest: {
            options: { reporter: 'spec' },
            start: { src: ['test/startTest.js'] },
            stop: { src: ['test/stopTest.js'] },
            fail: { src: ['test/failTest.js'] }
        },
        eslint: {
            target: [
                'Gruntfile.js',
                'tasks/**/*.js',
                'test/**/*.js'
            ]
        },
        mb: {
            options: {
                path: 'node_modules/.bin/mb',
                pathEnvironmentVariable: 'MB_EXECUTABLE'
            },
            start: ['--port', 7777, '--allowInjection', '--mock', '--debug', '--pidfile', 'mb-grunt.pid'],
            restart: ['--port', 7777, '--allowInjection', '--mock', '--debug', '--pidfile', 'mb-grunt.pid'],
            stop: ['--pidfile', 'mb-grunt.pid']
        }
    });

    grunt.registerTask('version', 'Set the version number', function () {
        var newPackage = require('./package.json');

        newPackage.version = version;
        console.log('Using version ' + version);
        fs.writeFileSync('./package.json', JSON.stringify(newPackage, null, 2) + '\n');
    });

    grunt.registerTask('testFail', 'Verify a failed mb target fails the build', function () {
        process.env.MB_EXECUTABLE = 'invalid-path';
        grunt.task.run('mb:restart');
        // Verify non-0 exit code manually
    });

    grunt.registerTask('changePath', 'Change the mb path using an environment variable', function () {
        process.env.MB_EXECUTABLE = 'node_modules/mountebank/bin/mb';
    });

    grunt.registerTask('test', ['try', 'mb:restart', 'mochaTest:start', 'finally',
                                'mb:stop', 'checkForErrors', 'mochaTest:stop', 'mochaTest:fail']);

    // Can't run as part of same build because grunt won't run the same task twice
    grunt.registerTask('test:dynamicPath', ['changePath', 'test']);

    grunt.registerTask('default', ['version', 'test']);
};
