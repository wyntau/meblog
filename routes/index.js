
var  crypto = require('crypto');
var User = require('../models/user.js');
var Post = require('../models/post.js');
var Comment = require('../models/comment.js');


/*
 * GET home page.
 */

module.exports = function(app){
    //get homepage or pageX
    //app.get('/(page/:page)?',function(req,res){
    app.get(/^\/(?:page\/([1-9]+\d*))?$/,function(req,res){
        if(req.params[0]) page = req.params[0];
        else page = 1;
        Post.getBy(null, page,function(err, posts,page,totalPage) {
            if (err) {
                posts = [];
            }
            if(totalPage == 0 && posts.length == 0){
                //req.flash('error','没有文章可以显示,请先注册后发表文章');
            }else if(posts.length == 0){
                req.flash('error','您要查看的页码没有文章可以显示');
                //return res.redirect('/');
            }
            res.render('index', {
                title: '首页',
                posts : posts,
                user : req.session.user,
                page: page,
                totalPage:totalPage,
                success : req.flash('success').toString(),
                error : req.flash('error').toString()
            });
        });
    });
    app.get('/reg',function(req,res){
        res.render('reg', {
            title: '用户注册',
            user : req.session.user,
            success : req.flash('success').toString(),
            error : req.flash('error').toString()
        });
    });
    app.post('/reg',function(req,res){
        if(!req.body.username || !req.body.email || !req.body['password-repeat'] || !req.body['password']){
            req.flash('error', '请将必填项填写完整');
            res.render('reg', {
                title: '用户注册 - 错误',
                user : req.session.user,
                username: req.body.username,
                email:req.body.email,
                url:req.body.url,
                success : req.flash('success').toString(),
                error : req.flash('error').toString()
            });
        }else if (req.body['password-repeat'] != req.body['password']) {
            req.flash('error', '两次输入的密码不一致');
            res.render('reg', {
                title: '用户注册 - 错误',
                user : req.session.user,
                username: req.body.username,
                email:req.body.email,
                url:req.body.url,
                success : req.flash('success').toString(),
                error : req.flash('error').toString()
            });
        } else {
            //生成md5的密码
            var md5 = crypto.createHash('md5');
            var password = md5.update(req.body.password).digest('base64');
            
            var newUser = new User({
                name: req.body.username,
                password: password,
                email: req.body.email,
                url:req.body.url || ''
            });
            
            //检查用户名是否已经存在
            User.get(newUser.name, function(err, user) {
                if (user)
                    err = '用户名已存在';
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/reg');
                }
                //如果不存在則新增用戶
                newUser.save(function(err) {
                    if (err) {
                        req.flash('error', err);
                        return res.redirect('/reg');
                    }
                    req.session.user = newUser;
                    req.flash('success', '注册成功');
                    res.redirect('/');
                });
            });
        }
    });
    app.get('/login',function(req,res){
        if(!req.session.user){
            res.render('login', {
                title: '用户登录',
                user : req.session.user,
                success : req.flash('success').toString(),
                error : req.flash('error').toString()
            });
        } else{
            req.flash('error','您已经登录，请不要调皮');
            return res.redirect('/');
        }
            
    });
    app.post('/login',function(req,res){
        if(!req.session.user){
            //生成口令的散列值
            var md5 = crypto.createHash('md5');
            var password = md5.update(req.body.password).digest('base64');
            if(!req.body.username || !req.body.password){
                req.flash('error','请将用户名或密码填写完整');
                return res.redirect('/login');
            }
            User.get(req.body.username, function(err, user) {
                if (!user) {
                    req.flash('error', '用户不存在');
                    return res.redirect('/login');
                }
                if (user.password != password) {
                    req.flash('error', '密码错误');
                    return res.redirect('/login');
                }
                req.session.user = user;
                req.flash('success', '登录成功');
                res.redirect('/');
            });
        } else {
            req.flash('error','您已经登录，请不要调皮');
            return res.redirect('/');
        }
        
    });
    app.get('/logout',function(req,res){
        req.session.user = null;
        req.flash('success', '登出成功');
        res.redirect('/');
    });
    app.get('/post',function(req,res){
        if(req.session.user){
            res.render('post',{
                title:'发表',
                user:req.session.user,
                success:req.flash('success').toString(),
                error:req.flash('error').toString()
            });
        } else{
            req.flash('error','您没有发表权限，请先登录')
            return res.redirect('/login');
        }
         
    });
    app.post('/post',function(req,res){
        if(req.session.user){
            if(!req.body.title || !req.body.post){
                req.flash('error','请将标题或内容填写完整');
                return res.redirect('/post');
            }
            var currentUser = req.session.user;
            var post = new Post(currentUser.name, req.body.title, req.body.post);
            post.save(function(err) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/');
                }
                req.flash('success', '发表成功');
                res.redirect('/');
            });
        } else{
            req.flash('error','您没有发表权限，请先登录')
            return res.redirect('/login');
        }
        
    });
    //app.get('/u/:user/(page/:page)?',function(req,res){
    app.get(/^\/u\/(\w+)(?:\/page\/([1-9]+\d*))?$/,function(req,res){
        var page = 1;
        User.get(req.params[0], function(err, user) {
            if (!user) {
                req.flash('error', '您所要查看的用户不存在');
                return res.redirect('/');
            }
            if(req.params[1]) page = req.params[1];
            Post.getBy(user.name, page,function(err, posts,page,totalPage) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/');
                }
                if(totalPage > 0){
                    res.render('user', {
                        title: user.name + '文章',
                        author: user.name,
                        posts: posts,
                        page:page,
                        totalPage:totalPage,
                        user : req.session.user,
                        success : req.flash('success').toString(),
                        error : req.flash('error').toString()
                    });
                } else if(totalPage == 0 && req.session.user == user.name){
                    req.flash('error','您还没有文章可以显示，请先发表');
                    return res.redirect('/post');
                } else{
                    req.flash('error','您要查看的用户没有文章可以显示');
                    return res.redirect('/');
                }
            });
        });
    });
    // app.get('/p/:id',function(req,res){
    app.get(/^\/p\/(\w+)(?:\/comment\/page\/([1-9]+\d*))?$/,function(req,res){
        Post.getById(req.params[0],function(err,post){
            if(err){
                req.flash('error','您所要查看的文章不存在');
                return res.redirect('/');
            }
            var page = req.params[1] ? req.params[1] : 1;
            Comment.getByParentId(post._id.toString(),page,function(err,comments,page,totalPage,commentsCount){
                if(err || totalPage == 0){
                    comments = [];
                }
                if(page > totalPage){
                    req.flash('error','您要查看的页码没有评论可以显示');
                    res.redirect('/p/'+post._id+'');
                }
                res.render('article',{
                    title:post.title,
                    user:req.session.user,
                    post:post,
                    comments: comments,
                    page: page,
                    totalPage: totalPage,
                    author:req.cookies.author || '',
                    email : req.cookies.email || '',
                    url : req.cookies.url || '',
                    commentsCount:commentsCount,
                    success:req.flash('success').toString(),
                    error:req.flash('error').toString()
                });
            });
        })
    });

    app.post('/comment',function(req,res){
        if(!req.body.author || !req.body.email || !req.body.comment){
            req.flash('error','请将必填项填写完整');
            res.redirect('/p/'+req.body.parentId);
        }
        var comment = new Comment(req.body.parentId,req.body.author,req.body.email,req.body.url,req.body.comment);
        //console.log(comment);
        comment.save(function(err){
            if(err){
                req.flash('error','评论失败');
                return res.redirect('/p/'+req.body.parentId);
            }
            req.flash('success','评论成功');
            var expire = new Date(Date.now() + 30*32*60*60*1000); // a month expires
            //console.log('expire:' +expire);
            res.cookie('author',req.body.author,{ expires: expire });
            res.cookie('email',req.body.email,{ expires: expire });
            res.cookie('url',req.body.url,{ expires: expire });
            res.redirect('/p/' + req.body.parentId + '#comment');
        })
    })
};