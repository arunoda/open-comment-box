var helpers = require('../helpers');
var uuid = require('uuid');

function ClientModel(db) {
  var usersCollection = db.collection('users');

  this.getUser = function(type, typeId, name, avatar, profileLink, callback) {
    var query = {type: type, typeId: typeId};
    var userData = {name: name, avatar: avatar, link: profileLink};
    usersCollection.update(query, {$set: userData}, {upsert: true}, function(err) {
      if(err) {
        callback(err);
      } else {
        usersCollection.findOne(query, {fields: {_id: 1, name: 1, avatar: 1, link: 1}}, callback);
      }
    });
  };

  this.getToken = function(userId, callback) {
    var token;
    var tokenExpiryTime = 1000 * 3600 * 24 * 10; //10 days
    usersCollection.findOne({_id: userId}, function(err, user) {
      if(err) {
        callback(err);
      } else if(user) {
        if(user.token && user.tokenExpireAt.getTime() > Date.now()) {
          callback(null, user.token);
        } else {
          user.token = uuid.v4();
          user.tokenExpireAt = new Date(Date.now() + tokenExpiryTime);
          usersCollection.save(user, afterUserSaved);
          token = user.token;
        }
      } else {
        console.warn('user cannot be null', {_id: userId});
      }

      function afterUserSaved(err) {
        if(err) {
          callback(err);
        } else {
          callback(null, token);
        }
      }
    });
  };
}

module.exports = function(db) {
  return new ClientModel(db);
};

module.exports.model = ClientModel;