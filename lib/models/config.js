var fs = require('fs');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var deepExtend = require('deep-extend');

function ConfigModel(db) {

  var configCollection = db.collection('config');
	var self = this;
	var Config= {};

	this.init= function(defaultConfigFilename){
		self.getConfigDB(function(err,res){
			if (res==null) {
				self.getConfigFile('config.json',function(res){
					Config = res;
					self.emit('change', res);
				});
			}else{
				details = res.details;
				Config = details;
				self.emit('change', details);
			}
		})
	}

	this.getConfigFile = function(defaultConfigFilename,callback){
		fs.exists(defaultConfigFilename, function(exists) {
	  		if (exists) {
	    		fs.readFile(defaultConfigFilename, function (err, data) {
					details=JSON.parse(data.toString());
					callback(details);
				}); 
	  		} else {
        			console.warn('Config not found');
	 	 	}
		});
	}

	this.getConfigDB = function(callback){
		configCollection.findOne({_id: "config"}, function(err,res){
			callback(err,res);
		});
	}

	// @use - 					
	// var mock = {passport:{ facebook:{clientID:"",clientSecret:"",callbackURL:""}}};
	// self.savePartial(Config,mock );

	this.savePartial  = function (a,b){
		deepExtend(a,b);
		self.save(a);
		return a;
	}

	this.save = function (details){
		configCollection.save({ _id: "config",details:details }, function(err,res){
			self.emit('change', details);
			Config = details;
		});
	}

	this.get = function(){
		return Config;
	}
}

util.inherits(ConfigModel, EventEmitter);

module.exports = function(db) {
  return new ConfigModel(db);
};

module.exports.model = ConfigModel;