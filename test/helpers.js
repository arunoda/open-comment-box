var assert = require('assert');
var helpers = require('../lib/helpers');

suite('Helpers', function() {
  test('.urlToHash', function() {
    var hash1 = helpers.urlToHash('http://google.com/aaa');
    var hash2 = helpers.urlToHash('http://google.com/aaa');

    assert.ok(hash1.length > 0);
    assert.equal(hash1, hash2);
  });

  test('.urlToDomain', function() {
    var domain = helpers.urlToDomain('http://google.com/aa/ssdsd');
    assert.equal(domain, 'google.com');
  });
});