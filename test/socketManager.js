var assert = require('assert');
var SocketManager = require('../lib/socketManager');

suite('socketManager', function() {
  test('.addSocket', function() {
    var socket1 = {};
    var socket2 = {};

    var sm = new SocketManager();
    sm.addSocket("h1", socket1);
    sm.addSocket("h1", socket2);
    assert.equal(sm.sockets['h1'].length, 2);
  });

  test('.removeSocket', function() {
    var socket1 = {};
    var socket2 = {};

    var sm = new SocketManager();
    sm.addSocket("h1", socket1);
    sm.addSocket("h1", socket2);
    assert.equal(sm.sockets['h1'].length, 2);

    sm.removeSocket("h1", socket2);
    assert.equal(sm.sockets['h1'].length, 1);
    assert.equal(sm.sockets['h1'][0], socket1);
  });

  test('.send', function(done) {
    var socket1 = {
      write: function(data) {
        assert.equal(data, JSON.stringify({aa: 10}));
        done();
      }
    };

    var sm = new SocketManager();
    sm.addSocket("h1", socket1);

    sm.send("h1", {aa: 10});
  });
});