var mongodb = require('./db');
var settings = require('../settings');

function Comment(parentId,author,email,comment,time,id){
    this.parentId = parentId;
    this.author = author;
    this.email = email || '';
    this.comment = comment;
    if (time) {
        this.time = time;
    } else {
        this.time = new Date();
    }
    this.id = id;
}

module.exports = Comment;

Comment.getCollection = function getCollection(callback){
    mongodb.open(function(err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('comments', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            else {
                callback(null,collection);
            }
        });
    });
}


Comment.prototype.save = function save(callback){
    var comment = {
        parentId : this.parentId,
        author : this.author,
        email : this.email,
        comment : this.comment,
        time : this.time
    }
    Comment.getCollection(function(err,collection){
        if(err){
            callback(err);
        }else{
            collection.ensureIndex('parentId',function(err){
                if(err){
                    mongodb.close();
                    return callback(err);
                }
            });
            collection.insert(comment, {safe: true}, function(err, comment) {
                mongodb.close();
                callback(err, comment);
            });
        }
    });
};

Comment.getByParentId = function getByParentId(parentId,page,callback){
    var totalPage = 0;
    this.getCollection(function(err,collection){
        mongodb.close();
        if(err){
            callback(err);
        }else{
            var query = {};
            var _skip = 0;
            var _limit = settings.comentSize;
            query.parentId = parentId;
            if(page){
                _skip = (page-1) * settings.commentSize;
            }else{
                _skip = 0;
            }
            collection.find(query).count(function(err,commentsCount){
                if(err){
                    callback(err);
                }else if(commentsCount > 0){
                    pageCount = Math.ceil(commentsCount/settings.commentSize);
                    console.log(pageCount);
                    pageCount = pageCount > 0 ? pageCount : 1;
                    totalPage = pageCount;

                    collection.find(query,{limit:_limit,skip:_skip}).sort({time:-1}).toArray(function(err,docs){
                        if(err){
                            callback(err);
                        }
                        var comments = [];
                        docs.forEach(function(doc,index){
                            var comment = new Comment(doc.parentId,doc.author,doc.email,doc.comment,doc.time,doc._id);
                            comment.time = formatTime(comment.time);
                            comments.push(comment);
                        });
                        callback(null,comments,page,pageCount);
                    })
                }
            })
        }
    })
}

function formatTime(time){
    var now = time;
    time = now.getFullYear() + "-" + (now.getUTCMonth()+1) + "-" + now.getUTCDate();
    return time;
}