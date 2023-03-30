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
  //secure: true, TODO: SET SECURE TO TRUE FOR DEVELOPMENT ENVIROMENT
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
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// TODO: MAYBE MAKE THIS THE SAME AS THE ONE IN INDEX.JS?
const jwtAuth = [
  
  (req, res, next) => {

    // If there is a token
    if(req.cookies.token) {
      // Set auth header to token
      req.headers.authorization = req.cookies.token;
      next();
    }
    // If there is not a token
    else {
      res.status(401).json({auth: req.isAuthenticated()});
    }
  },
  passport.authenticate('jwt', {session: false}), 
  (req, res) => {
    return res.status(200).json({auth: req.isAuthenticated()});
  }
]

app.use('/', indexRouter);
app.use('/posts', jwtAuth, postsRouter);
app.use('/profile', jwtAuth, profileRouter);

// Function to check if user is logged in
// REPLACED BY JWTAUTH
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json('Not Authorized')
}

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
