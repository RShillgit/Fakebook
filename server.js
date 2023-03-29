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
/**
 * -----------------------------
 */

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

/**
 * ----------------- SESSION -----------------
 */
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: process.env.session_secret
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

app.use('/', indexRouter);
app.use('/posts', isLoggedIn, postsRouter);
app.use('/profile', isLoggedIn, profileRouter);

// Function to check if user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
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
