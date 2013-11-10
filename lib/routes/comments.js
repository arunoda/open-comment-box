var urlModule = require('url');
var helpers = require('../helpers');
var marked = require('marked');

//configure markdowm
marked.setOptions({
  sanitize: true,
  tables: false,
  breaks: true
});

module.exports = function(app, db, env) {
  var clientModel = env.models.client;
  var adminModel = env.models.admin;

  app.get('/comments', function(req, res) {
    res.send('These are the comments');
  });

  app.get('/comments/create', function(req, res) {
    var queryParams = urlModule.parse(req.url, true).query;
    var message = queryParams.message;
    var parentId = queryParams.parentId;
    var apiToken = queryParams.apiToken;
    var userId = queryParams.userId;
    var userToken = queryParams.userToken;
    var url = queryParams.url;
    var htmlMessage = marked(message);

    //TODO: valicate apiToken and the userToken(or if supported for anonymous)

    var commentId;

    if(url) {
      clientModel.addComment(url, userId, parentId, message, htmlMessage, afterAdded);
    } else {
      res.send(400, 'do not allow direct requests');
    }

    function afterAdded(err, comments) {
      if(err) {
        console.error('error adding comment', {error: err.message, url: url});
        res.jsonp({error: 'internal-error'});
      } else {
        var commentId = comments[0]._id;
        res.jsonp({_id: commentId});
        //send to the socket
        clientModel.getComment(commentId, afterCommentFetched);
      }
    }

    function afterCommentFetched(err, comment) {
      if(err) {
        console.error('error while getting the comment:', {err: err.message, _id: commentId});
      } else {
        var urlHash = helpers.urlToHash(url);
        env.socketManager.commentsAdded(urlHash, [comment]);
      }
    }
  });

  app.get('/comments/delete', function(req, res) {

    var queryParams = urlModule.parse(req.url, true).query;
    var apiToken = queryParams.apiToken;
    var commentId = queryParams.id;
    var url = queryParams.url;

    //todo: validate api tokens

    clientModel.deleteComment(commentId, function(err) {
      if(err) {
        console.error('error deleting comment', {id: commentId, error: err.message});
        res.jsonp({error: 'internal-error'});
      } else {
        res.jsonp({_id: commentId});
        var urlHash = helpers.urlToHash(url);
        env.socketManager.commentsDeleted(urlHash, [commentId]);
      }
    });
  });

  //jsonp comments allowing client to get the comment via jsonp
  app.get('/comments/init', function(req, res) {
    var queryParams = urlModule.parse(req.url, true).query;
    var apiToken = queryParams.apiToken;
    var commentId = queryParams.id;
    var url = queryParams.url;

    //TODO: validate apiToken

    if(url) {
      clientModel.getInitData(url, function(err, data) {
        if(err) {
          console.error('error when getting inital comments', {apiToken: apiToken, url: url, error: err.message});
          res.jsonp({error: 'internal-error'});
        } else {
          res.jsonp(data);
        }
      });
    } else {
      res.send(400, 'do not allow direct requests');
    }
  });


  app.post('/comments/update',function(req , res){

    var action = req.body.action;
    var commentId = req.body.commentId;

    if (action=='delete' && commentId ) {
      adminModel.deleteComment(commentId, afterDeleted);
    }

    function afterDeleted(err, removedCount) {
      if(err) {
        console.error('error deleting comment', {error: err.message, url: url});
        res.json({error: 'internal-error'});
      } else {
        res.json({removedCount:removedCount});
      }
    }

    if (action=='approve' && commentId ) {
      adminModel.approveComment(commentId, afterUpdated);
    }

    if (action=='reject' && commentId ) {
      adminModel.rejectComment(commentId, afterUpdated);
    }

    function afterUpdated(err , updatedCount){
      if(err) {
        console.error('error updating comment', {error: err.message, url: url});
        res.json({error: 'internal-error'});
      } else {
        res.json({updatedCount:updatedCount});
      }
    }
  });
}