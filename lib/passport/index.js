module.exports = function(app, db, env) {
  require('./facebook')(app, db, env);
  require('./twitter')(app, db, env);
  require('./gmail')(app, db, env);
  require('./persona')(app, db, env);
  require('./local')(app, db, env);
};