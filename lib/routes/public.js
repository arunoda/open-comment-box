module.exports = function(app, db, env) {
  app.get('/', function(req, res) {
    res.render('index.ejs');
  });  
}