var helpers = require('../helpers');
var ObjectID = require('mongodb').ObjectID;
var moment = require('moment');
function AdminModel(db) {
  var commentsCollection = db.collection('comments');
  var usersCollection = db.collection('users');
  var domainsCollection = db.collection('domains');


  this.deleteComment = function (commentId, callback){
    commentsCollection.findOne({"_id":ObjectID.createFromHexString(commentId)},function(err,result){
      if(result && (result.domain != 'meteorhacks.2013.nodeknockout.com')){
        commentsCollection.remove({"_id": ObjectID.createFromHexString(commentId)}, callback);
      }
    });
    
  };

  this.approveComment = function (commentId , callback){
    commentsCollection.findOne({"_id":ObjectID.createFromHexString(commentId)},function(err,result){
      if(result && (result.domain != 'meteorhacks.2013.nodeknockout.com')){
        commentsCollection.update({"_id": ObjectID.createFromHexString(commentId)}, {$set:{approved:true}}, callback);
      }
    });
  };
  this.rejectComment = function (commentId , callback){
    commentsCollection.findOne({"_id":ObjectID.createFromHexString(commentId)},function(err,result){
      if(result && (result.domain != 'meteorhacks.2013.nodeknockout.com')){
        commentsCollection.update({"_id": ObjectID.createFromHexString(commentId)}, {$set:{approved:false}}, callback);
      }
    });
  };
  this.getComments = function(domain, skip, limit, callback) {
    var comments;
    if(domain){
      commentsCollection.find({domain:domain}).sort({createdAt:-1}).skip(skip).limit(limit).toArray(function(err, _comments) {
        if(err) {
          callback(err);
        } else {
          comments = _comments;
          var userIdMap = {};
          comments.forEach(function(comment) {
            comment.createdAt = moment(comment.createdAt).format("MMMMM Do, YYYY h:mm A");
            if(comment.userId && !(userIdMap[comment.userId])) {
              userIdMap[comment.userId] = true;
            }
          });
          //create _id list with converting into ObjectId
          var userIdsList = Object.keys(userIdMap).map(function(id) {
            return ObjectID.createFromHexString(id);
          });

          var query = {_id: {$in: userIdsList}};
          usersCollection.find(query, {_id: 1, name: 1, avatar: 1}).toArray(afterUsersFound);
        }
      });
    }else{
      commentsCollection.find({}).sort({createdAt:-1}).skip(skip).limit(limit).toArray(function(err, _comments) {
        if(err) {
          callback(err);
        } else {
          comments = _comments;
          var userIdMap = {};

          comments.forEach(function(comment) {
             comment.createdAt = moment(comment.createdAt).format("MMMMM Do, YYYY h:mm A");
            if(comment.userId && !(userIdMap[comment.userId])) {
              userIdMap[comment.userId] = true;
            }
          });
          //create _id list with converting into ObjectId
          var userIdsList = Object.keys(userIdMap).map(function(id) {
            return ObjectID.createFromHexString(id);
          });

          var query = {_id: {$in: userIdsList}};
          usersCollection.find(query, {_id: 1, name: 1, avatar: 1}).toArray(afterUsersFound);
        }
      });
    }


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

  this.getDomains = function (callback) {

    domainsCollection.find().toArray(function(err, results) {
      if(err){
        callback(err)
      }else{
        callback(null,results)
      }
    });   
  };

}
module.exports = function(db) {
  return new AdminModel(db);
};
module.exports.model = AdminModel;