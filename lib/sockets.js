
var helpers = require('./helpers');

module.exports= function(app, db, env){
  env.sockets.on('connection', function(conn) {
    var hash;
    var apiToken;

    // add and remove connections
    conn.on('data', function(data) {
      data = JSON.parse(data);
      if(data.command=='init') {

        hash = helpers.urlToHash(data.url);
        apiToken = data.apiToken;

        // @todo - Validation
        env.socketManager.addSocket(hash, conn);
        var payload = {command:"init", status:"ok"};
        conn.write(JSON.stringify(payload));
      }
    });

    conn.on('close', function() {
      env.socketManager.removeSocket(hash , apiToken );
    });
  });
}