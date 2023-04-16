var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();

var indexRouter = require('./routes/index');
const postsRouter = require('./routes/posts');
const profileRouter = require('./routes/profile');
const friendsRouter = require('./routes/friends');
const messagesRouter = require('./routes/messages');

var app = express();

/** 
 * ---- MONGOOSE CONNECTION ----
 */
mongoose.set('strictQuery', false); 
const mongoDBURL = process.env.db_url;
const mongoDBOptions = { 
  useNewUrlParser: true,
  useUnifiedTopology: true
} 
mongoose.connect(mongoDBURL, mongoDBOptions)
  .catch((err) => console.log(`Error Connecting: ${err}`))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

/**
 * ----------------- SESSION -----------------
 */
app.use(session({
  secure: true, // SET SECURE TO TRUE FOR DEVELOPMENT ENVIROMENT
  resave: false,
  saveUninitialized: true,
  secret: process.env.session_secret, 
  name: 'session',
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
}));

/**
 * ----------- PASSPORT AUTHENTICATION ----------
 */
const passport = require('passport'); 
require('./config/passport');

app.use(passport.initialize());
app.use(passport.session());
/**
 * -----------------------------------------------
 */

app.use(logger('dev'));
app.use(express.json());
app.use(cors({origin: 'https://deadpan-meal-production.up.railway.app'}));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Prevent CORS Errors 
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'https://deadpan-meal-production.up.railway.app'); // Change in deployment 
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); //res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.use('/', indexRouter);
app.use('/posts', passport.authenticate('jwt', {session: false}), postsRouter);
app.use('/profile', passport.authenticate('jwt', {session: false}), profileRouter);
app.use('/friends', passport.authenticate('jwt', {session: false}), friendsRouter);
app.use('/messages', passport.authenticate('jwt', {session: false}), messagesRouter);

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
  res.status(err.status || 500).json({err});
});

module.exports = app;
