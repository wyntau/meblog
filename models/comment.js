var mongodb = require('./db');
var settings = require('../settings');
var crypto = require('crypto');

function Comment(parentId,author,email,url,comment,time){
    this.parentId = parentId; //the post id
    this.author = author;
    this.email = email;
    this.url = url || ''
    this.comment = comment;
    if (time) {
        this.time = time;
    } else {
        this.time = new Date();
    }
    
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
        url:this.url,
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
                //console.log('save comment success:');
                //console.log(comment);
                callback(err, comment);
            });
        }
    });
};

Comment.getByParentId = function getByParentId(parentId,page,callback){
    var totalPage = 0;
    //console.log('parentId: '+parentId);
    this.getCollection(function(err,collection){
        mongodb.close();
        if(err){
            callback(err);
        }else{
            var query = {};
            var _skip = 0;
            var _limit = settings.commentSize;
            //console.log('limit:' +_limit);
            query.parentId = parentId;
            //console.log('query :');
            //console.log(query);
            if(page){
                _skip = (page-1) * settings.commentSize;
            }else{
                _skip = 0;
            }
            //console.log(collection.find(query));
            collection.find(query).count(function(err,commentsCount){
                //console.log('commentsCount:'+commentsCount);
                if(err){
                    callback(err);
                }else if(commentsCount > 0){
                    pageCount = Math.ceil(commentsCount/settings.commentSize);
                    //console.log(pageCount);
                    pageCount = pageCount > 0 ? pageCount : 1;
                    totalPage = pageCount;

                    collection.find(query,{limit:_limit,skip:_skip}).sort({time:-1}).toArray(function(err,docs){
                        if(err){
                            callback(err);
                        }
                        //console.log(docs);
                        var comments = [];
                        
                        docs.forEach(function(doc,index){
                            doc.time = formatTime(doc.time);
                            //生成md5加密过的邮箱地址,用于avatar取图
                            var md5 = crypto.createHash('md5');
                            doc.email = md5.update(String(doc.email).toLowerCase()).digest('hex');
                            //console.log(doc.email);
                            comments.push(doc);
                        });
                        callback(null,comments,page,totalPage,commentsCount);
                    })
                } else if( commentsCount == 0){
                    callback(null,[],0,0);
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