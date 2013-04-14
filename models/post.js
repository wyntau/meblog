var mongodb = require('./db');


function Post(username, title,post, time,id) {
    this.user = username;
    this.title = title;
    this.post = post;
    if (time) {
        this.time = time;
    } else {
        this.time = new Date();
    }
    this.id = id;
};
module.exports = Post;

Post.prototype.save = function save(callback) {
    // 存入 Mongodb 的文檔
    var post = {
        user: this.user,
        title: this.title,
        post: this.post,
        time: this.time,
    };

    mongodb.open(function(err, db) {
        if (err) {
          return callback(err);
        }
        
        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.ensureIndex('user',function(err){
                if(err){
                    mongodb.close();
                    return callback(err);
                }
            });
            
            collection.insert(post, {safe: true}, function(err, post) {
                mongodb.close();
                callback(err, post);
            });
        });
    });
};

Post.getCollection = function getCollection(callback) {
    mongodb.open(function(err, db) {
        if (err) {
            return callback(err);
        }
    
        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            else {
                callback(null,collection);
            }
        });
    });
};
Post.getById = function getById(id,callback){

    this.getCollection(function(err,collection){
        mongodb.close();
        if(err){
            callback(err);
        }else{
            //console.log(collection);
            collection.findOne({_id:collection.db.pkFactory.createFromHexString(id)},function(err,result){
                if(err){
                    callback(err);
                }else{
                    result.time = formatTime(result.time);
                    callback(null,result);
                }
            });
        }
    });
}
Post.getBy = function getBy(name,callback){
    this.getCollection(function(err,collection){
        mongodb.close();
        if(err){
            callback(err);
        }else{
            var query = {};
            if(name) query.user = name;
            collection.find(query,{limit:5}).sort({time:-1}).toArray(function(err,docs){
                if(err){
                    callback(err);
                }
                var posts = [];
                docs.forEach(function(doc,index){
                    var post = new Post(doc.user, doc.title, doc.post, doc.time,doc._id);
                    post.time = formatTime(post.time);
                    posts.push(post);
                });
                callback(null,posts);
            })
        }
    })
}
function formatTime(time){
    var now = time;
    time = now.getFullYear() + "-" + (now.getUTCMonth()+1) + "-" + now.getUTCDate();
    return time;
}