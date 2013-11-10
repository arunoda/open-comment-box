
'use strict';

var Channel = {};

// JSONP
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Channel.jsonp = function (url) {
  console.log('[ ] Channel.jsonp()', url);
  var script = document.createElement('script');
  script.src = url;
  document.head.appendChild(script);
};

Channel.onData = function (data) {
  console.log('[ ] Channel.onData()', data);
  Comment.comments = data.comments;
  User.users = data.users || {};
  // @FIXME Remove Dummy User
  User.users['527ea4071e8bbc5bb6476835'] = { _id: '527ea4071e8bbc5bb6476835', name: 'Thanish' };
  Comment.render();
};

document.addEventListener('DOMContentLoaded', function (e) {
  Channel.jsonp('http://localhost:8000/comments/init?callback=Channel.onData&apiToken=' + Channel.API_TOKEN);
});

// SOCKJS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Channel.SOCK_URL = 'http://localhost:8000/rt';
Channel.API_TOKEN = '123456';
Channel.sock = new SockJS(Channel.SOCK_URL);

Channel.sockRoutes = {
  'commentsAdded' : function (data) {
    for (var idx=data.length; idx-->0;)
      Comment.comments.push(data[idx]);
    Comment.render();
  }
};

Channel.sock.onopen = function (e) {
  console.log('[ ] Channel.sock.onopen()');
  Channel.sock.send(JSON.stringify({
    command: 'init'
    ,apiToken: Channel.API_TOKEN
    ,url: document.URL
  }));
};

Channel.sock.onclose = function (e) {
  console.log('[ ] Channel.sock.onclose()');
};

Channel.sock.onmessage = function (e) {
  console.log('[ ] Channel.sock.onmessage()');
  var data = JSON.parse(e.data);
  Channel.sockRoutes[data.event] && Channel.sockRoutes[data.event](data.data);
};
'use strict';

var Comment = {};

Comment.elCommentsWrapper = null;
Comment.elNewCommentForm = null;
Comment.elNewCommentText = null;
Comment.elNewCommentSubmit = null;
Comment.elNewCommentReply = null;

Comment.comments = [];
Comment.replyId = null;

Comment.getCommentById = function (commentId) {
  console.log('[ ] Comment.getCommentById()', commentId);
  for (var idx = Comment.comments.length; idx-->0;)
    if (Comment.comments[idx]._id === commentId)
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
      'http://localhost:8000/comments/create?callback=console.log'
    + '&apiToken=' + encodeURIComponent(Channel.API_TOKEN)
    + '&userId=' + encodeURIComponent(User.getId())
    + '&userToken=' + encodeURIComponent(User.getToken())
    + '&message=' + encodeURIComponent(message);
  if (Comment.replyId)
    url += '&parentId=' + Comment.replyId;
  Comment.replyId = null;
  Comment.elNewCommentReply.innerHTML = '';
  Comment.elNewCommentReply.classList.remove('visible');
  Channel.jsonp(url);
};

Comment.render = function () {
  console.log('[ ] Comment.render()');
  var comments = JSON.parse(JSON.stringify(Comment.comments));
  var elements = document.getElementsByClassName('comment');
  for (var idx=elements.length; idx-->0;)
    elements[idx].parentNode.removeChild(elements[idx]);
  while(Object.keys(comments).length > 0) for(var idx in comments) {
    var comment = comments[idx];
    var element = document.createElement('div');
    element.classList.add('comment');
    element.id = 'comment_' + comment._id;
    element.dataset.commentId = comment._id;
    var user = User.getDetailsById(comment.userId);
    var username = user ? user.name : 'Anonymous';
    var timeago = moment(comment.createdAt).fromNow()
    element.innerHTML =
        '<h3 class="username">'+ username +' - '+ timeago +'</h3>'
      + '<div class="comment_message">'+ comment.message +'</div>'
      + '<p class="links">'
      + '<button class="replyTo" onclick="Comment.reply(\'' + comment._id + '\')">Reply</button>'
      + '<button class="share" onclick="Comment.share(\'' + comment._id + '\')">Share</button>'
      + '</p>'
      + '<div class="comment_replies"></div>';
    if (document.getElementById('comment_'+comment._id)) return;
    if (comment.parentId == null) {
      Comment.elCommentsWrapper.appendChild(element);
      delete comments[idx];
    } else if (document.getElementById('comment_'+comment.parentId)) {
      document.getElementById('comment_'+comment.parentId).getElementsByClassName('comment_replies')[0].appendChild(element);
      delete comments[idx];
    }
  }
};

Comment.reply = function (commentId) {
  console.log('[ ] Comment.reply()', commentId);
  if (!User.isLoggedIn()) return;
  Comment.replyId = commentId;
  var comment = Comment.getCommentById(commentId);
  var user = User.getDetailsById(comment.userId);
  var username = user ? user.name : 'Anonymous';
  Comment.elNewCommentReply.innerHTML = '@' + username + ' "' + comment.message.slice(0,15) + '..."';
  Comment.elNewCommentReply.classList.add('visible');
  Comment.elNewCommentText.focus();
};

Comment.share = function (commentId) {
  console.log('[ ] Comment.share()', commentId);
};

Comment.onNewComment = function (data) {
  console.log('[ ] Comment.onNewComment()', data);
  for(var idx=data.length; idx-->0;)
    Comment.comments.push(data[idx]);
  Comment.render();
};

document.addEventListener('DOMContentLoaded', function (e) {
  Comment.elCommentsWrapper = document.getElementById('commentsWrap');
  Comment.elNewCommentForm = document.getElementById('messageWrap');
  Comment.elNewCommentText = document.getElementById('message');
  Comment.elNewCommentSubmit = document.getElementById('messageSubmit');
  Comment.elNewCommentReply = document.getElementById('replyTo');
  Comment.elNewCommentSubmit.onclick = Comment.create;
});

var Interface = new Object();

Interface.autoGrowTextarea = function (textarea) {
  // Based on http://stackoverflow.com/a/19408351
  textarea.addEventListener('keydown', function(e){
    setTimeout(function (el) {
      var height = parseInt(el.scrollHeight);
      el.style.cssText = 'height:0; padding:0';
      el.style.cssText = 'height:' + height + 'px';
    }, 0, this);
  });
}

Interface.resizeParentFrame = function (content) {
  return function () {
    var msg = JSON.stringify({ action: 'OCB::resizeParentFrame', height: content.scrollHeight });
    parent.postMessage( msg, '*');
  }
}

document.addEventListener('DOMContentLoaded', function (e) {
  Interface.autoGrowTextarea(document.getElementById('message'));
  setInterval(Interface.resizeParentFrame(document.getElementById('content')), 1000);
});
'use strict';

var User = new Object();

User.elLoginWrapper = null;
User.elLogoutButton = null;

User.users = {};
User.user = null;

User.getDetailsById = function (userId) {
  console.log('[ ] User.getDetailsById()', userId);
  return User.users[userId];
};

User.validateToken = function () {
  // @FIXME Do come real validation
  console.log('[ ] User.validateToken()');
  return true;
};

User.isLoggedIn = function () {
  console.log('[ ] User.isLoggedIn()');
  User.user = JSON.parse(localStorage.getItem('user'));
  if (User.user){
    console.log()
    return User.validateToken();
  }
};

User.getId = function () {
  console.log('[ ] User.getId()');
  if (!User.isLoggedIn()) return;
  return User.user._id;
};

User.getToken = function () {
  console.log('[ ] User.getToken()');
  if (!User.isLoggedIn()) return;
  return User.user.token;
};

User.requestLogin = function (handler) {
  console.log('[ ] User.requestLogin()', handler);
  // @FIXME Replace Mock Data with Data From Real Handlers
  User.login({
    _id: '527ea4071e8bbc5bb6476835'
    ,token: 'user_token'
    ,name: 'Thanish'
  })
};

User.login = function (user) {
  console.log('[ ] User.login()', user);
  User.user = user;
  localStorage.setItem('user', JSON.stringify(User.user));
  User.elLoginWrapper.classList.remove('visible');
  User.elLogoutButton.classList.add('visible');
  Comment.elNewCommentSubmit.classList.add('visible');
};

User.logout = function () {
  console.log('[ ] User.logout()');
  User.user = null;
  localStorage.removeItem('user');
  Comment.elNewCommentSubmit.classList.remove('visible');
  User.elLogoutButton.classList.remove('visible');
  User.elLoginWrapper.classList.add('visible');
  Comment.elNewCommentText.value = '';
  Comment.replyId = null;
  Comment.elNewCommentReply.innerHTML = '';
  Comment.elNewCommentReply.classList.remove('visible');
};

document.addEventListener('DOMContentLoaded', function (e) {
  User.elLoginWrapper = document.getElementById('loginWrapper');
  User.elLogoutButton = document.getElementById('logoutButton');
  if (User.isLoggedIn()) {
    User.elLoginWrapper.classList.remove('visible');
    User.elLogoutButton.classList.add('visible');
    Comment.elNewCommentSubmit.classList.add('visible');
  } else {
    User.elLogoutButton.classList.remove('visible');
    Comment.elNewCommentSubmit.classList.remove('visible');
    User.elLoginWrapper.classList.add('visible');
  }
});
