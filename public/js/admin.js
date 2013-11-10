$(document).ready(function() {
  $('.action-btn').click(function(event) {
    if (this.id && !$(this).hasClass('nko-comment')) {
      var propertiesArray = this.id.split("-");
      var action = propertiesArray[0];
      var commentId = propertiesArray[1];

      if (!(action == 'approve' || action == 'delete' || action=='reject')) {
        return;
      }
      if (action == 'delete' && commentId) {
        bootbox.dialog({
          message: "Want to delete this comment ? Are you sure ?",
          title: "Delete Comment Confirm",
          buttons: {
            confirm: {
              label: "Delete",
              className: "btn-danger",
              callback: function() {
                $.ajax({
                  type: "POST",
                  url: "/comments/update/",
                  data: {
                    commentId: commentId,
                    action: action
                  }
                })
                  .done(function(msg) {
                    if (action == 'delete' && (msg.removedCount > 0)) {
                      $("#" + "delete-" + commentId).parent().parent().parent().remove();
                      growlAlert.success("Comment deleted ");
                    }
                  });
              }
            },
            success: {
              label: "Cancel",
              className: "btn-default",
              callback: function() {}
            }
          }
        });
      }

      if ( (action == 'approve'|| action=='reject') && commentId ) {
        $.ajax({
          type: "POST",
          url: "/comments/update/",
          data: {
            commentId: commentId,
            action: action
          }
        })
          .done(function(result) {
            if (action == 'approve') {
              if (result.updatedCount) {
                growlAlert.success("Comment Approved");
              }
            }

            if (action == 'reject') {
              if (result.updatedCount) {
                growlAlert.success("Comment Rejected");
              }
            }
            setTimeout(function(){
              location.reload();
            },3000);
          });
      }
    }else{
       growlAlert.error("You cannot moderate nodeknockout comments");
    }
  });

  $('.select-domain').click(function(event) {
    if (this.id) {
      var propertiesArray = this.id.split("-");
      var action = propertiesArray[0];
      var domainId = propertiesArray[1];

      if (action == 'domain' && domainId) {
        $.ajax({
          type: "POST",
          url: "/admin/domains/",
          data: {
            domainId: domainId
          }
        })
          .done(function(result) {
              window.location = "/admin/moderate/";
          });
      }
    }
  });

  $('#get-code').click(function(event){
    event.preventDefault();
    var domain = location.href.replace(/\/admin.*/, '');
    bootbox.dialog({
  message: '<textarea class="field span12" id="textarea" style="width:100%" rows="8"> <iframe id="ocb_iframe" frameborder="0" scrolling="no" src="about:blank"></iframe><script id="ocb_script_loader" type="text/javascript"> (function(base_url, api_key){document.getElementById("ocb_script_loader").dataset.base_url=base_url;document.getElementById("ocb_script_loader").dataset.api_key=api_key;document.addEventListener("DOMContentLoaded", function loadOCB (e){var ocb_script_tag=document.createElement("script");ocb_script_tag.src=base_url + "/static/client.js";document.head.appendChild(ocb_script_tag);})})("' + domain + '", "BHfsCjGa6hP3htF4F");</script> </textarea>',
  title: "Embed Open Comment Box",
  buttons: {
    success: {
      label: "Close",
      className: "btn-primary",
      callback: function() {

      }
    }
  }
});
  });

});