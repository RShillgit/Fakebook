var express = require('express');
var router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const { genPassword } = require('../utils/passwordUtils');

// TODO: CHANGE SUCCESSREDIRECT & FAILUREREDIRECT TO JSON MESSAGES FOR THE FRONT END

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// GET REGISTER
router.get('/register', (req, res, next) => {
  res.render('register');
})
// POST REGISTER
router.post('/register', (req, res, next) => {

  // Check if passwords match
  if (req.body.password !== req.body.confirmPassword) {
    return res.json('Passwords Do Not Match')
  }

  // Check if username already exists
  User.findOne({ username: req.body.username })
    .then((user) => {

      // Username already exists
      if (user) {
        return res.json('Username already exists')
      }

      const saltHash = genPassword(req.body.password);

      const salt = saltHash.salt;
      const hash = saltHash.hash;

      // Create user with salt and hash
      const newUser = new User({
          username: req.body.username,
          name: `${req.body.firstName} ${req.body.lastName}`,
          hash: hash,
          salt: salt,
      })
      newUser.save()
        .then(result => res.json(result))
        .catch(err => res.json(err))

    })
    .catch(err => res.json(err))
})

// GET LOGIN
router.get('/login', (req, res, next) => {
  res.render('login')
})
// POST LOGIN
router.post('/login', passport.authenticate('local', {
  failureRedirect: '/login',
  successRedirect: '/profile'
}))

// GET FACEBOOK LOKIN
router.get('/auth/facebook', passport.authenticate('facebook' , { scope : ['email'] } ) );
// AUTHENITCATE FACEBOOK LOGIN
router.get("/auth/facebook/callback",passport.authenticate("facebook", {
  successRedirect: "/profile",
  failureRedirect: "/error",
  })
);

router.get('/profile', isLoggedIn, (req,res) => {
  res.json(req.user);
});
 
router.get('/error', isLoggedIn, (req,res) => {
  res.send("Error");
});

// LOGOUT
router.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
})

// Checks if user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
}

module.exports = router;
