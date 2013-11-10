(function () {
  'use strict';

  var base_url = document.getElementById('ocb_script_loader').dataset.base_url;
  var api_key = document.getElementById('ocb_script_loader').dataset.api_key;

  var messageRoutes = {
    'OCB::resizeParentFrame' : function (e) {
      // console.log('OCB::resizeParentFrame');
      var data = JSON.parse(e.data);
      var iframe = document.getElementById('ocb_iframe');
      var height = parseInt(data.height) || 250;
      var height_buffer = 200;
      iframe.style.height = height + height_buffer + 'px';
    }
    ,'OCB::scrollToComment' : function (e) {
      console.log('OCB::scrollToComment', e);
      var data = JSON.parse(e.data);
      var offset = data.offset + ocb_iframe.offsetTop;
      setTimeout(function(){scrollTo(0,offset);}, 1000);
    }
    ,'OCB::getBaseDetails' : function (e) {
      console.log('OCB::getBaseDetails');
      var data = JSON.parse(e.data);
      var commentId = location.hash.substring(1,location.hash.length);
      e.source.postMessage({ base_url: base_url, api_key: api_key, commentId: commentId, action: 'OCB::baseDetails' }, '*');
    }
    ,'OCB::updateHash' : function (e) {
      console.log('OCB::updateHash');
      var data = JSON.parse(e.data);
      location.hash = data.hash;
    }
  };

  window.addEventListener('message', function handleMessage (e) {
    if (e.origin !== base_url) return;
    var data = JSON.parse(e.data) || {};
    var action = messageRoutes[data.action];
    action && action(e);
  }, false);

  var ocb_script_loader = document.getElementById('ocb_script_loader');
  var ocb_iframe = document.getElementById('ocb_iframe');
  ocb_iframe.src = base_url + '/static/comments.html';
  ocb_iframe.style.cssText = 'border-style: none; width: 100%; height: 0; margin-top: 0; margin-right: 0; margin-bottom: 0; margin-left: 0; padding-top: 0; padding-right: 0; padding-bottom: 0; padding-left: 0;';
  ocb_script_loader.parentNode.insertBefore(ocb_iframe, ocb_script_loader);

})();
