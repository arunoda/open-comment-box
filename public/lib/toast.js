function showAlert(messageType,message){
   $.bootstrapGrowl(message, { type: messageType });
}
growlAlert = {};
growlAlert.error = function (message){
  showAlert('danger',message);
}
growlAlert.success = function (message){
  showAlert('success',message);
}
growlAlert.info = function (message){
  showAlert('info',message);
}