'use strict';

var User = new Object();

User.elLoginWrapper = null;
User.elUserAvatar = null;
User.elLogoutButton = null;

User.users = {};
User.user = null;
$
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
  return User.user.userToken;
};

User.requestLogin = function (handler) {
  console.log('[ ] User.requestLogin()', handler);
  var url = Channel.BASE_URL + '/auth/' + handler.toLowerCase();
  var popup = window.open(url, 'Open Comment Box Login', 'width=500,height=400');
  window.focus && popup.focus();
  window.addEventListener('message', function(e) {
    var data = JSON.parse(e.data);
    if( data.action === 'OCB:authResult' )
      User.login(data.data);
  }, false);
};

User.login = function (user) {
  console.log('[ ] User.login()', user);
  User.user = user;
  localStorage.setItem('user', JSON.stringify(User.user));
  User.elLoginWrapper.classList.remove('visible');
  User.elUserAvatar.src = User.user.avatar;
  User.elUserAvatar.classList.add('visible');
  User.elLogoutButton.classList.add('visible');
  Comment.elNewCommentSubmit.classList.add('visible');
  Comment.render();
};

User.logout = function () {
  console.log('[ ] User.logout()');
  User.user = null;
  localStorage.removeItem('user');
  Comment.elNewCommentSubmit.classList.remove('visible');
  User.elUserAvatar.classList.remove('visible');
  User.elLogoutButton.classList.remove('visible');
  User.elLoginWrapper.classList.add('visible');
  Comment.elNewCommentText.value = '';
  Comment.replyId = null;
  Comment.elNewCommentReply.innerHTML = '';
  Comment.elNewCommentReply.classList.remove('visible');
  Comment.render();
};

document.addEventListener('DOMContentLoaded', function (e) {
  User.elLoginWrapper = document.getElementById('loginWrapper');
  User.elUserAvatar = document.getElementById('avatar');
  User.elLogoutButton = document.getElementById('logoutButton');
  if (User.isLoggedIn()) {
    User.elLoginWrapper.classList.remove('visible');
    User.elUserAvatar.src = User.user.avatar;
    User.elUserAvatar.classList.add('visible');
    User.elLogoutButton.classList.add('visible');
    Comment.elNewCommentSubmit.classList.add('visible');
  } else {
    User.elUserAvatar.classList.remove('visible');
    User.elLogoutButton.classList.remove('visible');
    Comment.elNewCommentSubmit.classList.remove('visible');
    User.elLoginWrapper.classList.add('visible');
  }
});
