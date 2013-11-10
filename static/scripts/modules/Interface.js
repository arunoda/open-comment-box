
var Interface = new Object();

Interface.elLoadingAnimation = null;

Interface.autoGrowTextarea = function (textarea) {
  console.log('[ ] Interface.autoGrowTextarea()');
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
    parent.postMessage(msg, '*');
  }
}

Interface.onReady = function () {
  console.log('[ ] Interface.onReady()');
  Interface.elLoadingAnimation.classList.remove('visible');
  setTimeout(function(){Interface.elLoadingAnimation.style.display = 'none';},1000);
}

document.addEventListener('DOMContentLoaded', function (e) {
  Interface.elLoadingAnimation = document.getElementById('loadingAnimation');
  Interface.autoGrowTextarea(document.getElementById('message'));
  setInterval(Interface.resizeParentFrame(document.getElementById('content')), 1000);
  setInterval(function(){Comment.render()}, 30 * 1000);
});
