'use strict';

var assert = require('assert'),
    exec = require('child_process').exec;

describe('A misconfigured target', function () {
    it('should return a non-zero exit code if misconfigured', function (done) {
        exec('node_modules/.bin/grunt testFail', function (error) {
            assert(error, 'Did not fail build when misconfigured');
            done();
        });
    });
});
