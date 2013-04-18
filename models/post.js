var mongodb = require('./db');
var settings = require('../settings');


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

Post.prototype.save = function save(callback) {
    // 存入 Mongodb 的文檔
    var post = {
        user: this.user,
        title: this.title,
        post: this.post,
        time: this.time,
    };
    Post.getCollection(function(err,collection){
        if(err) {
            callback(err);
        } else{
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
        }
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
};

Post.getBy = function getBy(name,page,callback){
    //console.log('GET page:' + page);
    var totalPage = 0;
    this.getCollection(function(err,collection){
        mongodb.close();
        if(err){
            callback(err);
        }else{
            var query = {};
            var _skip = 0;
            var _limit = settings.pageSize;
            //console.log('limit: '+ _limit);
            if(name) query.user = name;
            if(page) {
                _skip = (page-1) * settings.pageSize;
                //console.log('skip: '+_skip);
            }
            else 
                _skip = 0;
            //console.log('settings.pageSize: '+settings.pageSize);
            //console.log('skip:'+_skip);
            collection.find(query).count(function(err,pageCount){
                if (err) { 
                    callback(err);
                }else{
                    totalPage = pageCount;
                    //console.log(totalPage);
                    collection.find(query,{limit:_limit,skip:_skip}).sort({time:-1}).toArray(function(err,docs){
                        if(err){
                            callback(err);
                        }
                        console.log(docs);
                        var posts = [];
                        docs.forEach(function(doc,index){
                            var post = new Post(doc.user, doc.title, doc.post, doc.time,doc._id);
                            post.time = formatTime(post.time);
                            posts.push(post);
                        });
                        callback(null,posts,page,totalPage);
                    });
                }
            });

            //totalPage = collection.find(query).count();
            //console.log(collection.find(query,{limit:_limit,skip:_skip}));
            
        }
    })
};
// Post.getTotalBy = function getTotalBy(name,callback){
//     var total = 0;
//     this.getCollection(function(err,collection){
//         if(err){
//             callback(err);
//         }else{
//             var query = {};
//             if(name) query.user = name;
//         }
//         total = collection.find(query).count(true);
//         callback()
//     })
// }
function formatTime(time){
    var now = time;
    time = now.getFullYear() + "-" + (now.getUTCMonth()+1) + "-" + now.getUTCDate();
    return time;
}
