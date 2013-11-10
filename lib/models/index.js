module.exports = function(db) {
  return {
    client: require('./client')(db),
    auth: require('./auth')(db),
    admin: require('./admin')(db),
    config: require('./config')(db)
  }
};