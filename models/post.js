var mongodb = require('./db');

function Post(username, title,post, time) {
    this.user = username;
    this.title = title;
    this.post = post;
    if (time) {
        this.time = time;
    } else {
        this.time = new Date();
    }
};
module.exports = Post;

Post.prototype.save = function save(callback) {
    // 存入 Mongodb 的文檔
    var post = {
        user: this.user,
        title: this.title,
        post: this.post,
        time: this.time
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

Post.get = function get(username, callback) {
    mongodb.open(function(err, db) {
        if (err) {
            return callback(err);
        }
    
        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }

            //查找user属性为username的文档，如果username为null则匹配全部
            var query = {};
            if (username) {
                query.user = username;
            }

            collection.find(query, {limit:9}).sort({time: -1}).toArray(function(err, docs) {
                mongodb.close();

                if (err) {
                    callback(err, null);
                }

                var posts = [];
                
                docs.forEach(function(doc, index) {
                    var post = new Post(doc.user, doc.title, doc.post, doc.time);
                    var now = post.time;
                    post.time = now.getFullYear() + "-" + (now.getUTCMonth()+1) + "-" + now.getUTCDate();
                    posts.push(post);
                });

                callback(null, posts);
            });
        });
    });
};
