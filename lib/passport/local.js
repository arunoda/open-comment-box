module.exports = function(app, db, env) {
  var passport = require('passport');
  var bcrypt = require('bcrypt');
  var LocalStrategy = require('passport-local').Strategy;
  var configCollection = db.collection('config');

  passport.use(new LocalStrategy(
    function(username, password, done) {
    configCollection.findOne({_id: "admin"}, function(err,configs){
      if (configs.admin && configs.admin.password && configs.admin.username){
        bcrypt.compare(password, configs.admin.password, function(err, res) {
          if(err){
            done(err, false)
          }
          if (configs.admin && (username == configs.admin.username)) {
              done(null,{username:username})
          }else{
            done(null, false);
          }
        });
      }
    });
    }
  ));

  app.get('/admin/login/submit',
    passport.authenticate('local', {
      failureRedirect: '/admin/login'
    }),
    function(req, res) {
      res.redirect('/admin/moderate');
    });


}