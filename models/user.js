var mongodb = require('./db');

function User(user) {
    this.name = user.name;
    this.password = user.password;
    this.email = user.email;
    this.url = user.url || '';
};

module.exports = User;

User.getCollection = function getCollection(callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('users',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            else{
                callback(null,collection);
            }
        });
    });
}

User.prototype.save = function save(callback) {
    var user = {
        name: this.name,
        password: this.password,
        email:this.email,
        url:this.url
    };
    
    User.getCollection(function(err,collection){
        if(err){
            mongodb.close();
            return callback(err);
        }else{
            //为name属性添加索引
            collection.ensureIndex('name', {unique: true},function(err){
                if(err){
                    mongodb.close();
                    return callback(err);
                }
            });
            //save
            collection.insert(user, {safe: true}, function(err, user) {
                mongodb.close();
                callback(err, user);
            });
        }
    });
};

User.get = function get(username, callback) {
    User.getCollection(function(err,collection){
        if(err){
            mongodb.close();
            return callback(err);
        }else{
            //find
            collection.findOne({name: username}, function(err, doc) {
                mongodb.close();
                //console.log('doc:');
                //console.log(doc);
                if (doc) {
                    var user = new User(doc);
                    //console.log('user:');
                    //console.log(user);
                    callback(err, user);
                } else {
                    callback(err, null);
                }
            });
        }
    });
};
