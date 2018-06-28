'use strict';

var spawn = require('child_process').spawn,
    exec = require('child_process').exec,
    os = require('os'),
    fs = require('fs');

function isWindows () {
    return os.platform().indexOf('win') === 0;
}

module.exports = function (grunt) {

    function waitFor (predicate, callback) {
        if (predicate()) {
            callback();
        }
        else {
            setTimeout(function () { waitFor(predicate, callback); }, 100);
        }
    }

    function whenFullyInitialized (pidfile, callback) {
        // It's important to call this BEFORE spawning in case a pidfile was left over
        if (fs.existsSync(pidfile)) {
            fs.unlinkSync(pidfile);
        }
        waitFor(function () { return fs.existsSync(pidfile); }, callback);
    }

    function pidfileFor (args) {
        var pidfileIndex = args.indexOf('--pidfile');
        return pidfileIndex >= 0 && pidfileIndex < args.length - 1 ? args[pidfileIndex + 1] : 'mb.pid';
    }

    function start (mbPath, args, done) {
        var command = mbPath,
            mb;

        if (isWindows() && command !== 'mb') {
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

        // Note: It isn't until mountebank v1.4.3 that delays writing the pidfile until full initialization
        // You may have to add delays on earlier versions, especially if you use --configfile
        whenFullyInitialized(pidfileFor(args), done);

        grunt.log.writeln(command + ' ' + args.join(' '));
        mb = spawn(command, args);
        mb.on('error', function (error) {
            grunt.fail.warn(error);
        });
        mb.stderr.on('data', function (data) {
            grunt.log.error(data.toString('utf8'));
        });
    }

    function stop (mbPath, args, done) {
        var command = mbPath + ' ' + args.join(' ');

        if (isWindows() && mbPath.indexOf('.cmd') < 0) {
            command = 'node ' + command;
        }
        grunt.log.writeln(command);
        exec(command, function (error, stdout, stderr) {
            if (error) { grunt.fail.warn(error); }
            if (stdout) { grunt.log.writeln(stdout); }
            if (stderr) { grunt.log.error(stderr); }
            done();
        });
    }

    grunt.registerMultiTask('mb', 'start or stop mountebank', function () {
        var done = this.async(),
            command = this.target || 'restart',
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
