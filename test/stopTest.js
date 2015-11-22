'use strict';

var assert = require('assert'),
    request = require('request');

describe('The stop target', function () {
    it('should correctly start mountebank', function (done) {
        request('http://localhost:7777/', function (error) {
            if (!error || error.code !== 'ECONNREFUSED') {
                assert.fail('Did not stop correctly');
            }
            done();
        });
    });
});
