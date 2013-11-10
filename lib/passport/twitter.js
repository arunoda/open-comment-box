module.exports = function(app, db, env) {
  var passport = require('passport')
  var TwitterStrategy = require('passport-twitter').Strategy;

  var authModel = env.models.auth;

  var config = env.models.config;

  config.on('change', function(data) {
    passport.unuse('twitter');
    passport.use(new TwitterStrategy({
        consumerKey: data.passport.twitter.consumerKey,
        consumerSecret: data.passport.twitter.consumerSecret,
        callbackURL: config.get().url +"/auth/twitter/callback"
      },
      onStrategy
    ));
  });

  function onStrategy(accessToken, refreshToken, profile, done) {
      var user;
      var avatarUrl =profile.photos[0].value;
      var profileUrl = "https://twitter.com/" + profile.username;

      authModel.getUser('twitter', profile.id, profile.displayName, avatarUrl, profileUrl, function(err, _user) {
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

  app.get('/auth/twitter', passport.authenticate('twitter'));

  app.get('/auth/twitter/callback',
    passport.authenticate('twitter', {
      failureRedirect: '/login',
      session:false
    }),
    function(req, res) {
      res.render('browser_send.ejs', {user: req.user});
    });
}