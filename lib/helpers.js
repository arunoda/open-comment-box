var crypto = require('crypto');

var helpers = module.exports = {};

helpers.urlToDomain = function(url) {
  var parsedUrl = require('url').parse(url);
  return parsedUrl.host;
};

helpers.urlToHash = function(url) {
  return helpers.md5(url);
};

helpers.md5 = function(data) {
  return crypto.createHash('md5').update(data).digest("hex");
};
