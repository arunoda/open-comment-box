process.chdir(__dirname)

var express = require('express');
var mongodb = require('mongodb');
var passport = require('passport');
var SocketManager = require('./lib/socketManager');

var http    = require('http');
var sockjs  = require('sockjs');

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}

var app = express();
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({ secret: 'keyboard cat' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(allowCrossDomain);
app.use('/static', express.static('static'));
app.use(function(req, res, next) {
    if(process.env.NKO) {
        req.user = {username: 'demo'}
    } else {
        //if not NKO redirect to the admin
        if(req.url == '/') {
            req.url = '/admin';
        }
    }
    next();
});

var isProduction = (process.env.NODE_ENV === 'production');
var http = require('http');
var port = process.env.PORT || (isProduction ? 80 : 8000);

var sockjs_opts = {sockjs_url: "http://cdn.sockjs.org/sockjs-0.3.min.js"};
var sockets = sockjs.createServer();

//listen to the app
var server = http.createServer(app);
sockets.installHandlers(server, {prefix:'/rt'});

console.info('open-comment-box starting on port:', port);
server.listen(port);

//Env
var env = {};
env.socketManager = new SocketManager();
env.sockets=sockets;

//connect to mongo
var MONGO_URL= process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || process.env.MONGO_URL || 'mongodb://localhost/ocb';
mongodb.MongoClient.connect(MONGO_URL, afterConnected);

function afterConnected(err, db) {
  if (err) {
    throw err;
  } else {
    //load models
    env.models = require('./lib/models')(db);
    env.models.config.init();

    //load Routes
    require('./lib/sockets')(app, db, env);
    require('./lib/routes')(app, db, env);
    require('./lib/passport')(app, db, env);
  }
}
