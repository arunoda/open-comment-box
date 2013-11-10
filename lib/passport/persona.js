module.exports = function(app, db, env) {
  var passport = require('passport')
  var PersonaStrategy = require('passport-persona').Strategy;

  var authModel = env.models.auth;

  passport.use(new PersonaStrategy({
      audience: 'http://localhost:8000'
    },
     function(email, done) {
      console.log("asdasdasd",email, done);
    }

    /*function(email, done) {
      var user;
      var token = '';
      console.log(profile);
      var avatarUrl =  profile.id ;
      authModel.getUser('persona', profile.id, profile.displayName, avatarUrl, function(err, _user) {
        if(err) {
          done(err);
        } else {
          user = _user;
          authModel.getToken(user._id, withToken);
        }
      });

      function withToken(err, token) {
        if(err) {
          done(err);
        } else {
          user.userToken = token;
          done(null, user);
        }
      }
    }*/
  ));

  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

  app.get('/auth/persona', passport.authenticate('persona'));

  app.get('/auth/persona/callback',
    passport.authenticate('persona', {
      failureRedirect: '/login',
      session:false
    }),
    function(req, res) {
      res.render('browser_send.ejs', {user: req.user});
    });
}