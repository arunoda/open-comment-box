module.exports = function(app, db, env) {
  var passport = require('passport')
  var FacebookStrategy = require('passport-facebook').Strategy;

  var authModel = env.models.auth;
  var config = env.models.config;

  config.on('change', function(data) {
    passport.unuse('facebook');
    passport.use(new FacebookStrategy({
        clientID: data.passport.facebook.clientID,
        clientSecret: data.passport.facebook.clientSecret,
        callbackURL: config.get().url+"/auth/facebook/callback"
      },
      onStrategy
    ));
  });

  function onStrategy(accessToken, refreshToken, profile, done) {
      var user;
      var avatarUrl = "http://graph.facebook.com/" + profile.id + "/picture";
      var profileUrl = profile.profileUrl;

      authModel.getUser('facebook', profile.id, profile.displayName, avatarUrl, profileUrl, function(err, _user) {
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

  app.get('/auth/facebook', passport.authenticate('facebook'));

  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
      failureRedirect: '/login',
      session:false
    }),
    function(req, res) {
      res.render('browser_send.ejs', {user: req.user});
    });
}