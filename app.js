// Boilerplate stuff
////////////////////////////////////////////
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
////////////////////////////////////////////

// Setup your server and sockets
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Setup your view templating engine
app.set('views', path.join(__dirname, 'views'));
var engine = require('ejs-locals');
app.engine('ejs', engine);
app.set('view engine', 'ejs');

// Setup KV database
REDIS = require('redis');
DB = REDIS.createClient();
DB.set('tweet', '');
DB.hmset('voting', {a : 0});

// Setup global config
CONFIG = require('./config/config.js')

// Server boilerplate stuff
////////////////////////////////////////////
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
////////////////////////////////////////////

var routes = require('./routes/index');
app.use('/', routes);

// Websocket setup, this will only happen for
// users who are served the client-side socket.io script.
var socketAPI = require('./io_events')(io);

http.listen(3000, function(){
  console.log('listening on *:3000');
});


// Don't worry about this stuff
////////////////////////////////////////////

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
