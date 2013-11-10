$(document).ready(function() {

  $('#frm-settings').submit(function(event) {
    $.ajax({
      type: "POST",
      url: '/admin/settings/submit',
      data: $("#frm-settings").serialize(),
      success: function(result) {
        if (result == 'success') {
          growlAlert.success(" Settings Saved");
          setTimeout(function() {
            location.reload();
          }, 2000);
        } else {
          growlAlert.error(result);
        }
      }
    });
    event.preventDefault();

  });
});