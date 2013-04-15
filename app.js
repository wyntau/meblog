
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , MongoStore = require('connect-mongo')(express)
  , settings = require('./settings')
  , flash = require('connect-flash');

var sessionStore = new MongoStore({
                        db : settings.db
                    }, function() {
                            console.log('connect mongodb success...');
                    });

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(flash());
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({
        secret : settings.cookie_secret,
        cookie : {
            maxAge : 60000 * 20 //20 minutes
        },
        store : sessionStore
    }));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// app.get('/', routes.index);
// app.get('/users', user.list);
// 

// app.use(function(req,res,next){
//     var err = req.flash('error'),
//         success = req.flash('success');
//     res.locals.user = req.session.user;
//     res.locals.error = err.length ? err : null;
//     res.locals.success = success.length ? success : null;
//     next();
// });


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
routes(app);