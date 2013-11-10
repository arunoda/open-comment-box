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
  Comment.render();
  Interface.onReady();
};

document.addEventListener('DOMContentLoaded', function (e) {
  parent.postMessage(JSON.stringify({ action: 'OCB::getBaseDetails' }), '*');
  window.addEventListener('message', function handleMessage (e) {
    var data = e.data || {};
    if (data.action === 'OCB::baseDetails') {
      Channel.BASE_URL = data.base_url;
      Channel.API_TOKEN = data.api_key;
      Channel.SOCK_URL = Channel.BASE_URL+'/rt';
      Channel.REF_COMMENT = data.commentId;
      Channel.sock = new SockJS(Channel.SOCK_URL);
      Channel.initSock();
      Channel.getInitData();
    }
  }, false);
});

// SOCKJS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Channel.BASE_URL = null;
Channel.DOC_URL = (window.location != window.parent.location) ? document.referrer: document.location;
Channel.DOC_URL = Channel.DOC_URL.split('#')[0];
Channel.SOCK_URL = null;
Channel.API_TOKEN = null;
Channel.REF_COMMENT = null;
Channel.sock = null;

Channel.sockRoutes = {
  'commentsAdded' : function (data) {
    for (var idx=data.length; idx-->0;){
      data[idx].isNewComment = true;
      Comment.comments.push(data[idx]);
      User.users[data[idx].user._id] = data[idx].user;
      Comment.unreadCount++;
      Comment.showUnread();
    }
    Comment.render();
  }
  ,'commentsDeleted' : function (data) {
    for (var idx=data.length; idx-->0;)
      for (var idx2=Comment.comments.length; idx2-->0;)
        if (Comment.comments[idx2] && Comment.comments[idx2]._id === data[idx])
          delete Comment.comments[idx2];
    Comment.render();
  }
};

Channel.getInitData = function () {
  console.log('[ ] Channel.getInitData()');
  var url =
      Channel.BASE_URL
    + '/comments/init'
    + '?callback=Channel.onData'
    + '&apiToken=' + Channel.API_TOKEN
    + '&url=' + encodeURIComponent(Channel.DOC_URL);
  Channel.jsonp(url);
}

Channel.initSock = function () {

  Channel.sock.onopen = function (e) {
    console.log('[ ] Channel.sock.onopen()');
    Channel.sock.send(JSON.stringify({
      command: 'init'
      ,apiToken: Channel.API_TOKEN
      ,url: Channel.DOC_URL.split('#')[0]
    }));
  };

  Channel.sock.onclose = function (e) {
    console.log('[ ] Channel.sock.onclose()');
  };

  Channel.sock.onmessage = function (e) {
    console.log('[ ] Channel.sock.onmessage()', e);
    var data = JSON.parse(e.data);
    Channel.sockRoutes[data.event] && Channel.sockRoutes[data.event](data.data);
  };

}
