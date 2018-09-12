var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('hbs');

var session = require('express-session');
var FileStore = require('session-file-store')(session);
var passport = require('passport');
var authenticate = require('./authenticate');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var productRouter = require('./routes/productRouter');
var contactRouter = require('./routes/contactRouter');
var uploadRouter = require('./routes/uploadRouter');
var fetchRouter = require('./routes/fetchRouter');
var config = require('./config');
var authorRouter = require('./routes/authorRouter');

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

const User =  require('./models/user');

const url = config.mongoUrl;

const connect = mongoose.connect(url);
connect.then((db) => {
  console.log('Connected correctly to the server');
}, (err) => {console.log(err);});

var app = express();

app.all('*', (req, res, next) =>{
  if (req.secure){
    return next();
  }else{
    res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url);
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser());

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Access-Control-Allow-Headers, Authorization');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});


app.use(passport.initialize());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/products', productRouter);
app.use('/contacts', contactRouter);
app.use('/imageUpload', uploadRouter);
app.use('/authors', authorRouter);
app.use('/fetch', fetchRouter);


app.use(express.static(path.join(__dirname, 'public')));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
