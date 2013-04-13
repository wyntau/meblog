
var  crypto = require('crypto');
var User = require('../models/user.js');
var Post = require('../models/post.js');


/*
 * GET home page.
 */

module.exports = function(app){
    app.get('/',function(req,res){
        Post.get(null, function(err, posts) {
            if (err) {
                posts = [];
            }
            res.render('index', {
                title: '首页',
                posts : posts,
                user : req.session.user,
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
        if (req.body['password-repeat'] != req.body['password']) {
            req.flash('error', '两次输入的密码不一致');
            return res.redirect('/reg');
        }
      
        //生成md5的密码
        var md5 = crypto.createHash('md5');
        var password = md5.update(req.body.password).digest('base64');
        
        var newUser = new User({
            name: req.body.username,
            password: password,
        });
        
        //检查用户名是否已经存在
        User.get(newUser.name, function(err, user) {
            if (user)
                err = 'Username already exists.';
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
    });
    app.get('/login',function(req,res){
            res.render('login', {
            title: '用户登录',
            user : req.session.user,
            success : req.flash('success').toString(),
            error : req.flash('error').toString()
        });
    });
    app.post('/login',function(req,res){
        //生成口令的散列值
        var md5 = crypto.createHash('md5');
        var password = md5.update(req.body.password).digest('base64');
        
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
    });
    app.get('/logout',function(req,res){
        req.session.user = null;
        req.flash('success', '登出成功');
        res.redirect('/');
    });
    app.get('/post',function(req,res){
        res.render('post',{
            title:'发表',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        }); 
    });
    app.post('/post',function(req,res){
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
    });
    app.get('/u/:user',function(req,res){
        User.get(req.params.user, function(err, user) {
            if (!user) {
                req.flash('error', '用户不存在');
                return res.redirect('/');
            }
            Post.get(user.name, function(err, posts) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/');
                }
                res.render('user', {
                    title: user.name,
                    posts: posts,
                    user : req.session.user,
                    success : req.flash('success').toString(),
                    error : req.flash('error').toString()
                });
            });
        });
    });
    app.get('/:user/:time/:title', function(req,res){
        User.get(req.params.user,function(err, user){
            if(!user){
                req.flash('error','用户不存在'); 
                return res.redirect('/');
            }
            Post.get(user.name, function(err, posts){
                if(err){
                    req.flash('err',err); 
                    return res.redirect('/');
                }
                var flag=false;
                posts.forEach(function (article) {
                    if(article.title==req.params.title){
                        flag=true;
                        res.render('article',{
                            title:article.title,
                            posts:article,
                            user : req.session.user,
                            success : req.flash('success').toString(),
                            error : req.flash('error').toString()
                        });
                    }
                });
                if(!flag){
                    req.flash('error','文章不存在'); 
                    return res.redirect('/');
                }  
            });
        }); 
    });
};