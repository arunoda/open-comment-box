var helpers = require('../helpers');
var ObjectID = require('mongodb').ObjectID;

function ClientModel(db) {
  var commentsCollection = db.collection('comments');
  var usersCollection = db.collection('users');
  var domainsCollection = db.collection('domains');

  this.getInitData = function(url, callback) {
    var comments;
    commentsCollection.find({url: url}).toArray(function(err, _comments) {
      if(err) {
        callback(err);
      } else {
        comments = _comments;
        var userIdMap = {};
        comments.forEach(function(comment) {
          if(comment.userId && !(userIdMap[comment.userId])) {
            userIdMap[comment.userId] = true;
          }
        });

        //create _id list with converting into ObjectId
        var userIdsList = Object.keys(userIdMap).map(function(id) {
          return ObjectID.createFromHexString(id);
        });

        var query = {_id: {$in: userIdsList}};
        usersCollection.find(query, {_id: 1, name: 1, avatar: 1, link: 1}).toArray(afterUsersFound);
      }
    });

    function afterUsersFound(err, users) {
      if(err) {
        callback(err); 
      } else {
        var userMap = {};
        users.forEach(function(user) {
          userMap[user._id.toString()] = user;
        });

        callback(null, {comments: comments, users: userMap});
      }
    }
  };

  this.addComment = function(url, userId, parentId, message, htmlMessage, callback) {
    var domain = helpers.urlToDomain(url);
    commentsCollection.insert({
      appId: null,
      domain: domain,
      url: url,
      urlHash: helpers.urlToHash(url),
      userId: (userId)? userId.toString(): null, //not in objectId mode
      message: htmlMessage,
      markdown: message,
      createdAt: new Date(),
      updatedAt: new Date(),
      votes: 0,
      parentId: parentId,
      approved: true
    }, afterAddComment);

    function afterAddComment(err, insertResult){
      console.log()
      if(err){
        callback(err);
      } else {
        domainsCollection.update( {name:domain},
                            {$set:{name:domain}},{upsert:true}, function(err){
          if(err){
            callback(err);
          }else{
            callback(null, insertResult);
          }
        });
      }
    }

  };

  this.deleteComment = function(id, callback) {
    var query = {
      _id: ObjectID.createFromHexString(id)
    };

    commentsCollection.remove(query, callback);
  };

  this.getComment = function(id, callback) {
    var comment;
    commentsCollection.findOne({_id: id}, function(err, _comment) {
      if(err) {
        callback(err);
      } else {
        comment = _comment;
        if(comment.userId) {
          //get the url
          var query = {_id: ObjectID.createFromHexString(comment.userId)};
          usersCollection.findOne(query, afterUsersFound);
        } else {
          callback(null, comment);
        }
      }
    });

    function afterUsersFound(err, user) {
      if(err) {
        callback(err);
      } else {
        comment.user = user;
        callback(null, comment);
      }
    }
  };
}
module.exports = function(db) {
  return new ClientModel(db);
};
module.exports.model = ClientModel;