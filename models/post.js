var mongodb = require('./db');
var settings = require('../settings');
var ObjectID = require('mongodb').ObjectID;
//console.log(ObjectID);


function Post(username, title,post, time,id) {
    this.user = username;
    this.title = title;
    this.post = post;
    if (time) {
        this.time = time;
    } else {
        this.time = new Date();
    }
    this.id = id || '';
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
        time: this.time
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
            collection.findOne({_id:ObjectID(id)},function(err,result){
                if(err){
                    callback(err);
                }else{
                    //console.log(result);
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
            } else {
                _skip = 0;
            } 
            //console.log(query);
            //first get posts totalcount
            collection.find(query).count(function(err,postsCount){
                if (err) { 
                    callback(err);
                }else if(postsCount > 0){
                    pageCount = Math.ceil(postsCount/settings.pageSize);
                    //console.log(pageCount);
                    pageCount = pageCount > 0 ? pageCount : 1;
                    totalPage = pageCount;
                    //console.log(totalPage);
                    collection.find(query,{limit:_limit,skip:_skip}).sort({time:-1}).toArray(function(err,docs){
                        if(err){
                            callback(err);
                        }
                        //console.log(docs);
                        var posts = [];
                        docs.forEach(function(doc,index){
                            //var post = new Post(doc.user, doc.title, doc.post, doc.time);
                            doc.time = formatTime(doc.time);
                            posts.push(doc);
                        });
                        callback(null,posts,page,totalPage);
                    });
                } else if(postsCount == 0){
                    callback(null,[],0,0);
                }
            });
        }
    })
};
function formatTime(time){
    var now = time;
    time = now.getFullYear() + "-" + (now.getUTCMonth()+1) + "-" + now.getUTCDate();
    return time;
}
