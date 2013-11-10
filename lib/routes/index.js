module.exports = function(app, db, env) {
  require('./comments')(app, db, env);
  require('./admin')(app, db, env);
  require('./public')(app, db, env);
};