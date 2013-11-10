/*
  Usage
  -----

  var socketManager = new SocketManager();
  socketManager.addSocket(<urlHash>, socket);
  socketManager.removeSocket(<urlHash>, socket);
  
  var comments = {inserted: [], updated: []};
  socketManager.sendComments(hash, comments);

  var users = {"id1": {}, "id2": {}};
  socketManager.sendUsers(hash, users);
*/

var SocketManager = function() {
  this.sockets = {};
};

SocketManager.prototype.addSocket = function(hash, socket) {
  this._ensureHash(hash);
  this.sockets[hash].push(socket);
};

SocketManager.prototype.removeSocket = function(hash, socket) {
  this._ensureHash(hash);
  var index = this.sockets[hash].indexOf(socket);
  if(index >= 0) {
    this.sockets[hash].splice(index, 1);
  }
};

SocketManager.prototype.commentsAdded = function(hash, comments) {
  this.send(hash, {event: 'commentsAdded', data: comments});
};

SocketManager.prototype.commentsDeleted = function(hash, idList) {
  this.send(hash, {event: 'commentsDeleted', data: idList});
};

SocketManager.prototype.send = function(hash, jsonData) {
  this._ensureHash(hash);
  var sockets = this.sockets[hash];
  for(var lc=0; lc<sockets.length; lc++) {
    sockets[lc].write(JSON.stringify(jsonData));
  }
};

SocketManager.prototype._ensureHash = function(hash) {
  if(!this.sockets[hash]) {
    this.sockets[hash] = [];
  }
};

module.exports = SocketManager;
