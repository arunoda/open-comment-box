'use strict';

var Comment = {};

Comment.elCommentsWrapper = null;
Comment.elUnreadComments = null;
Comment.elNewCommentForm = null;
Comment.elNewCommentText = null;
Comment.elNewCommentSubmit = null;
Comment.elNewCommentReply = null;

Comment.comments = [];
Comment.replyId = null;
Comment.unreadCount = 0;

Comment.getCommentById = function (commentId) {
  console.log('[ ] Comment.getCommentById()', commentId);
  for (var idx = Comment.comments.length; idx-->0;)
    if (Comment.comments[idx] && Comment.comments[idx]._id === commentId)
      return Comment.comments[idx];
};

Comment.validate = function () {
  console.log('[ ] Comment.validate()');
  var message = Comment.elNewCommentText.value.trim();
  return message.length > 0;
}

Comment.create = function () {
  console.log('[ ] Comment.create()');
  if (!Comment.validate()) return;
  var message = Comment.elNewCommentText.value.trim();
  Comment.elNewCommentText.value = '';
  var url =
      Channel.BASE_URL
    + '/comments/create?callback=console.log'
    + '&apiToken=' + encodeURIComponent(Channel.API_TOKEN)
    + '&userId=' + encodeURIComponent(User.getId())
    + '&userToken=' + encodeURIComponent(User.getToken())
    + '&message=' + encodeURIComponent(message)
    + '&url=' + encodeURIComponent(Channel.DOC_URL);
  if (Comment.replyId)
    url += '&parentId=' + Comment.replyId;
  Comment.replyId = null;
  Comment.elNewCommentReply.innerHTML = '';
  Comment.elNewCommentReply.classList.remove('visible');
  Comment.elNewCommentText.style.height = '46px';
  Channel.jsonp(url);
};

Comment.handleNewComment = function (element, idx) {
  element.classList.add('new-comment');
  setTimeout(function(element){element.classList.remove('new-comment');}, 2000, element);
  Comment.comments[idx].isNewComment = false;
  if (User.user._id == Comment.comments[idx].userId) {
    var offset = element.offsetTop;
    var msg = JSON.stringify({ action: 'OCB::scrollToComment', offset: offset });
    parent.postMessage(msg, '*');
  }
}

Comment.scrollToHashComment = function () {
  console.log('[ ] Comment.scrollToComment()');
  var element = document.getElementById(Channel.REF_COMMENT);
  if(!element) return;
  var offset = element.offsetTop;
  var msg = JSON.stringify({ action: 'OCB::scrollToComment', offset: offset });
  parent.postMessage(msg, '*');
  Channel.REF_COMMENT = null;
}

Comment.render = function () {
  console.log('[ ] Comment.render()');
  var comments = JSON.parse(JSON.stringify(Comment.comments));
  var elements = document.getElementsByClassName('comment');
  for (var idx=elements.length; idx-->0;)
    elements[idx].parentNode.removeChild(elements[idx]);
  var stop_infinite_loop_counter = 3;
  while(Object.keys(comments).length > 0 && stop_infinite_loop_counter--> 0) for(var idx in comments) {
    var comment = comments[idx];
    if(!comment) continue;
    var element = document.createElement('div');
    element.classList.add('comment');
    element.id = 'comment_' + comment._id;
    element.dataset.commentId = comment._id;
    var user = User.users[comment.userId] || {
        name: 'Anonymous'
      , link: '#'
      , avatar: 'http://meteorhacks.2013.nodeknockout.com/images/user.png'
    };
    var timeago = moment(comment.createdAt).fromNow();
    var html =
        '<h3 class="username">'+ user.name +' - '+ timeago +'</h3>'
      + '<a target="_blank" class="avatar" href="'+ user.link +'"><img class="avatar" src="'+ user.avatar +'"></a>'
      + '<div class="comment_message">'+ comment.message +'</div>'
      + '<p class="links">'
      + '<button class="replyTo" onclick="Comment.reply(\'' + comment._id + '\')">Reply</button>'
      + '<button class="share" onclick="Comment.share(\'' + comment._id + '\')">Share</button>'
    if ( User.user && User.user._id == comment.userId )
      html +=
        '<button class="delete" onclick="Comment.delete(\'' + comment._id + '\')">Delete</button>'
    html +=
        '</p>'
      + '<div class="comment_replies"></div>';
    element.innerHTML = html
    if (document.getElementById('comment_'+comment._id)) return;
    if (comment.parentId == null) {
      Comment.elCommentsWrapper.appendChild(element);
      comment.isNewComment && Comment.handleNewComment(element, idx);
      delete comments[idx];
    } else if (document.getElementById('comment_'+comment.parentId)) {
      document.getElementById('comment_'+comment.parentId).getElementsByClassName('comment_replies')[0].appendChild(element);
      comment.isNewComment && Comment.handleNewComment(element, idx);
      delete comments[idx];
    }
  }
  Comment.scrollToHashComment();
};

Comment.reply = function (commentId) {
  console.log('[ ] Comment.reply()', commentId);
  Comment.replyId = commentId;
  var comment = Comment.getCommentById(commentId);
  var user = User.users[comment.userId];
  var username = user ? user.name : 'Anonymous';
  Comment.elNewCommentReply.innerHTML = '@' + username + ' "' + comment.message.slice(0,15) + '..."';
  Comment.elNewCommentReply.classList.add('visible');
  Comment.elNewCommentText.focus();
};

Comment.share = function (commentId) {
  console.log('[ ] Comment.share()', commentId);
  var element = document.getElementById('comment_' + commentId);
  if(!element) return;
  var offset = element.offsetTop;
  var msg = JSON.stringify({ action: 'OCB::scrollToComment', offset: offset });
  parent.postMessage(msg, '*');
  msg = JSON.stringify({ action: 'OCB::updateHash', hash: 'comment_' + commentId });
  parent.postMessage(msg, '*');
}

Comment.delete = function (commentId) {
  console.log('[ ] Comment.delete()', commentId);
  if(!confirm('Delete Comment?')) return;
  var url =
      Channel.BASE_URL
    + '/comments/delete'
    + '?callback=console.log'
    + '&apiToken=' + Channel.API_TOKEN
    + '&id=' + commentId
    + '&url=' + encodeURIComponent(Channel.DOC_URL);
  Channel.jsonp(url);
  for (var idx = Comment.comments.length; idx-->0;) if (Comment.comments[idx] && Comment.comments[idx]._id === commentId)
    delete Comment.comments[idx];
  Comment.render();
}

Comment.onNewComment = function (data) {
  console.log('[ ] Comment.onNewComment()', data);
  for(var idx=data.length; idx-->0;)
    Comment.comments.push(data[idx]);
  Comment.render();
};

Comment.showUnread = function () {
  Comment.elUnreadComments.classList.add('visible');
  Comment.elUnreadComments.innerHTML = Comment.unreadCount + ' New Comments';
}

Comment.hideUnread = function () {
  Comment.unreadCount = 0;
  Comment.elUnreadComments.classList.remove('visible');
}

document.addEventListener('DOMContentLoaded', function (e) {
  Comment.elCommentsWrapper = document.getElementById('commentsWrap');
  Comment.elUnreadComments = document.getElementById('unreadComments');
  Comment.elNewCommentForm = document.getElementById('messageWrap');
  Comment.elNewCommentText = document.getElementById('message');
  Comment.elNewCommentSubmit = document.getElementById('messageSubmit');
  Comment.elNewCommentReply = document.getElementById('replyTo');
  Comment.elNewCommentSubmit.onclick = Comment.create;
  Comment.elUnreadComments.onclick = Comment.hideUnread;
  Comment.elUnreadComments.onmouseover = Comment.hideUnread;
});
