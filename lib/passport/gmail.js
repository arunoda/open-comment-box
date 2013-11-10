module.exports = function(app, db,env) {
  var passport = require('passport')
  var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

  var authModel = env.models.auth;
  var config = env.models.config;

  config.on('change', function(data) {
    passport.unuse('google');
    passport.use(new GoogleStrategy({
        clientID: data.passport.google.clientID,
        clientSecret: data.passport.google.clientSecret,
        callbackURL: config.get().url +"/auth/google/callback"
      },
      onStrategy
    ));
  });

  function onStrategy(accessToken, refreshToken, profile, done) {
      var avatarUrl = "http://profiles.google.com/s2/photos/profile/" + profile.id + "?sz=50";
      var profileUrl = profile._json.link;
      
      authModel.getUser('google', profile.id, profile.displayName, avatarUrl, profileUrl, function(err, _user) {
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
  }

  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

  app.get('/auth/google', passport.authenticate('google', { scope: 'https://www.googleapis.com/auth/userinfo.profile' }));

  app.get('/auth/google/callback', 
     passport.authenticate('google', { failureRedirect: '/login' }),
      function(req, res) {
        res.render('browser_send.ejs', {user: req.user});
  });

}