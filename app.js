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
var routes = require('./routes/index');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Setup your view templating engine
app.set('views', path.join(__dirname, 'views'));
var engine = require('ejs-locals');
app.engine('ejs', engine);
app.set('view engine', 'ejs');

// Setup KV database
var redis = require("redis");
DB = redis.createClient();  // Global

// Server boilerplate stuff
////////////////////////////////////////////
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
////////////////////////////////////////////

app.use('/', routes);

// Websocket setup
io.on('connection', function(socket){
    DB.set("user", "hello", redis.print);
    console.log('a user connected');
    DB.get("user", function(err, reply) {
        // reply is null when the key is missing
        console.log(reply);
    });

    // Socket events
    socket.on('tweet-input', function(msg) {
        console.log('You typed:' + msg);
    });
});

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
