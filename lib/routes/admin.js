var urlModule = require('url');
module.exports = function(app, db, env) {
  var adminModel = env.models.admin;
  var configModal = env.models.config;

  var configCollection = db.collection('config');

  app.get('/admin', function(req, res) {
    res.redirect('/admin/moderate')
  });

  app.get('/admin/login', function(req, res) {

    configCollection.findOne({_id: "admin"}, function(err,configs){
      if (!(configs && configs.admin && configs.admin.password && configs.admin.username)){
        res.redirect('/admin/createadmin');
      }
      if(req.user){
        res.redirect('/admin/moderate')
      }else{
        res.render('admin/login',{});
      }
    });
  });
  app.get('/admin/createadmin', function(req, res) {
    configCollection.findOne({_id: "admin"}, function(err,configs){
      if ((configs && configs.admin && configs.admin.password && configs.admin.username)){
        res.redirect('/admin/login');
        }else{
          res.render('admin/createadmin',{});
        }
      });
  });

  app.post('/admin/createadmin', function(req, res) {
    var username = req.body['username'];
    var password = req.body['password'];

    //TODO: use bcrypt and fix the docker installation issue
    configCollection.update({_id: "admin"}, 
      {$set:{"admin.username":username, "admin.password":password}}, 
      {upsert:true},
      function(err){
          if(!err){
            res.redirect('/admin/login')
          } 
      });
    // bcrypt.genSalt(10, function(err, salt) {
    //   bcrypt.hash(password, salt, function(err, hashpassword) {
    //   });
    // });
  });

  app.post('/admin/domains', function(req, res) {
    req.session.domain = req.body.domainId;
    res.json('success');
  });

  app.get('/admin/moderate', function(req, res) {
    if(!req.user){
      res.redirect('/admin/login');
    }
    
    var commentsPerPage = 10;
    var queryParams = urlModule.parse(req.url, true).query;
    var pageNum = parseInt(queryParams.page);

    var selectedDomain = req.session.domain;
    if (isNaN(pageNum)||!pageNum||pageNum < 0) {
      pageNum = 1;
    }
    var skip = commentsPerPage * (pageNum - 1)

    adminModel.getDomains(afterDomainsReceived) 

      function afterDomainsReceived(err,domains) {
      var domainName;

        if(selectedDomain){
          for (var i = 0; i < domains.length; i++) {
            if(domains[i]._id == selectedDomain ){
              domainName = domains[i].name;
            }
          };
        }
        
        adminModel.getComments(domainName, skip, commentsPerPage, afterCommentsReceived);
        function afterCommentsReceived(err, data) {

          res.render('admin/moderate', {
            comments: data.comments,
            users: data.users,
            selectedDomain:{id:selectedDomain,name:domainName},
            path: 'moderate',
            domains: domains,
            nextPage: pageNum + 1,
            prevPage: pageNum - 1
          });
        }
      }
  });

  app.get('/admin/settings', function(req, res) {
    if (!req.user){
      res.redirect('/admin/login');
    }else{
      res.render('admin/settings',{path:'settings',settings:configModal.get(),user:req.user});
    }
    if (req.body.domainId) {
      req.session.domain = req.body.domainId;
    }
    // if (req.user && req.username == 'demo') {
    //   res.render('admin/settings',{path:'settings',username:'demo'});
    // }else{
      // res.render('admin/settings',{path:'settings',settings:configModal.get()});
    // }

    
  });

  app.post('/admin/settings/submit',function(req,res){

    if (req.user && req.user.username=='demo') {
      res.json('Demo users cannot change settings');
      return;
    }

    var twConsumerKey = req.body['tw-consumerkey'];
    var twConsumerSecret = req.body['tw-consumer-secret'];
    var fbClientID = req.body['fb-client-id'];
    var fbClientSecret = req.body['fb-client-secret'];
    var googleClientID = req.body['google-client-id'];
    var googleClientSecret = req.body['google-client-secret'];
    var rootUrl = req.body['root-url'];

// console.log(twConsumerKey,twConsumerSecret,fbClientID,fbClientSecret,googleClientID,googleClientSecret)
    if(rootUrl  && twConsumerKey && twConsumerSecret && fbClientID && fbClientSecret && googleClientID && googleClientSecret){
        details = {};

        details.passport = {
                      "facebook":{
                        "clientID": fbClientID.trim(),
                        "clientSecret": fbClientSecret.trim()
                      },  
                      "google":{
                        "clientID": googleClientID.trim(),
                        "clientSecret": googleClientSecret.trim()
                      },  
                      "twitter":{
                        "consumerKey": twConsumerKey.trim(),
                        "consumerSecret": twConsumerSecret.trim()
                      }
                    };
      details.url = rootUrl;
      configModal.save(details);
      res.json('success');
    }else{
      res.json('failed');
    }
  });

}