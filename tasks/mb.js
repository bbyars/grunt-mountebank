'use strict';

var spawn = require('child_process').spawn,
    exec = require('child_process').exec,
    os = require('os');

function isWindows () {
    return os.platform().indexOf('win') === 0;
}

module.exports = function (grunt) {

    function start (mbPath, args, done) {
        var mb;

        if (isWindows) {
            args.unshift(mbPath);

            if (mbPath.indexOf('.cmd') >= 0) {
                args.unshift('/c');
                mb = spawn('cmd', args);
            }
            else {
                mb = spawn('node', args);
            }
        }
        else {
            mb = spawn(mbPath, args);
        }

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
        if (isWindows && mbPath.indexOf('.cmd') < 0) {
            command = 'node ' + command;
        }
        exec(command, done);
    }

    grunt.registerMultiTask('mb', 'start or stop mountebank', function () {
        var done = this.async(),
            command = this.target || 'start',
            args = [command].concat(this.data),
            options = this.options({
                path: 'mb'
            });

        if (command === 'start' || command === 'restart') {
            start(options.path, args, done);
        }
        else if (command === 'stop') {
            stop(options.path, args, done);
        }
        else {
            grunt.log.error('Unrecognized mb target.  Valid targets are start, stop, and restart');
        }
    });
};
