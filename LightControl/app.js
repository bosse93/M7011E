var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressHbs = require('express-handlebars');
var mongoose = require('mongoose');
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');
var validator = require('express-validator');
var connectMongo = require('connect-mongo')(session);
var cors = require('cors');

var expressJWT = require('express-jwt');


//routes

var app = express();

// connects to lightControlDB, if there isnt one its automaticly created
mongoose.connect('localhost:2222');

//CONFIGS
require('./config/passport')(passport);

// view engine setup
app.engine('.hbs', expressHbs({defaultLayout: 'layout', extname: '.hbs'}));
app.set('view engine', '.hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(validator());
app.use(cookieParser());
app.use(flash());
app.use(passport.initialize());
app.use(cors({origin: '*'}));
app.use(express.static(path.join(__dirname, 'public')));



/**
 * ROUTERS
 */
var api = express.Router();
require('./routes/API')(api, passport);
app.use('/api', api);

var auth = express.Router();
require('./routes/auth')(auth, passport);
app.use('/auth', auth);

var secure = express.Router();
require('./routes/secure')(secure, passport);
app.use('/', secure);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  //res.locals.message = err.message;
  //res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send("HTTP error: " + err.status + ". " + err.message);
});

module.exports = app;
