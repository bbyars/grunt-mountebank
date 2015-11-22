'use strict';

var assert = require('assert'),
    request = require('request');

describe('The start target', function () {
    it('should correctly start mountebank', function (done) {
        request('http://localhost:7777/', function (error, response, body) {
            if (error) {
                assert.fail(error);
            }
            assert.strictEqual(200, response.statusCode, body);
            done();
        });
    });
});
