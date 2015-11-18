'use strict';

var spawn = require('child_process').spawn,
    exec = require('child_process').exec,
    fs = require('fs'),
    os = require('os');

function isWindows () {
    return os.platform().indexOf('win') === 0;
}

module.exports = function (grunt) {

    function start (mbPath, args, done) {
        var command = mbPath,
            mb;

        if (!fs.existsSync(mbPath)) {
            grunt.fail.warn('No such file: ' + mbPath);
        }

        if (isWindows()) {
            args.unshift(mbPath);

            if (mbPath.indexOf('.cmd') >= 0) {
                // Accommodate the self-contained Windows zip files that ship with mountebank
                args.unshift('/c');
                command = 'cmd';
            }
            else {
                command = 'node';
            }
        }

        grunt.log.writeln(command + ' ' + args.join(' '));
        mb = spawn(command, args);

        mb.on('error', function (error) {
            throw error;
        });
        mb.stderr.on('data', function (data) {
            grunt.log.error(data.toString('utf8'));
        });
        mb.stdout.on('data', function (data) {
            // Looking for "mountebank va.b.c (node vx.y.z) now taking orders..."
            if (data.toString('utf8').indexOf('now taking orders') > 0) {
                done();
            }
        });
    }

    function stop (mbPath, args, done) {
        var command = mbPath + ' ' + args.join(' ');
        if (isWindows() && mbPath.indexOf('.cmd') < 0) {
            command = 'node ' + command;
        }
        exec(command, done);
    }

    grunt.registerMultiTask('mb', 'start or stop mountebank', function () {
        var done = this.async(),
            command = this.target || 'start',
            args = [command].concat(this.data),
            options = this.options({
                path: 'mb',
                pathEnvironmentVariable: ''
            }),
            mbPath = process.env[options.pathEnvironmentVariable] || options.path;

        if (command === 'start' || command === 'restart') {
            start(mbPath, args, done);
        }
        else if (command === 'stop') {
            stop(mbPath, args, done);
        }
        else {
            grunt.fail.warn('Unrecognized mb target.  Valid targets are start, stop, and restart');
        }
    });
};
