var express = require('express');
var router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const { genPassword, validatePassword } = require('../utils/passwordUtils');
const jwtUtils = require('../utils/jwtUtils');

/*
* ------------------ HOME ------------------ 
*/
router.get('/', 
  passport.authenticate('jwt', {session: false}), 
  (req, res) => {
    const token = req.headers.authorization;
    const userToken = jwtUtils.jwtVerify(token);
    return res.status(200).json({auth: req.isAuthenticated(), userToken: userToken});
  },
  (err, req, res) => {
    return res.status(401).json({err, auth: req.isAuthenticated()});
  }
);

/*
* ------------------ REGISTER ------------------ 
*/
router.get('/register', (req, res, next) => {
  res.render('register');
})
router.post('/register', (req, res, next) => {

  // Check if username already exists
  User.findOne({ username: req.body.username })
    .then((user) => {

      // Username already exists
      if (user) {
        return res.status(401).json({success: false, message:'Username already exists'});
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
        .then(result => {
          return res.status(200).json({success: true, result: result})
        })
        .catch(err => res.status(401).json({success: false, error: err}))
    })
    .catch(err => res.status(401).json({success: false, error: err}))
})

/*
* ------------------ LOGIN ------------------ 
*/

router.get('/login', 
  passport.authenticate('jwt', {session: false}), 
  (req, res) => {
    return res.status(200).json({auth: req.isAuthenticated()});
  },
  (err, req, res) => {
    return res.status(401).json({err, auth: req.isAuthenticated()});
  }
)
// JWT Login
router.post('/login', (req, res, next) => {
    // Look for user in DB
    User.findOne({ username: req.body.username })
    .then((user) => {

      // If no user send error
      if (!user) {
        return res.status(401).json({success: false, error_message: "Could not find user"});
      }

      // Check if password is valid
      const isValid = validatePassword(req.body.password, user.hash, user.salt);

      // If password is valid send success
      if (isValid) {
        const tokenObject = jwtUtils.issueJWT(user);

        res.cookie('token', tokenObject.token); // Send token as cookie for the front end to use
        return res.status(200).json({success: true, user: user, token: tokenObject.token, expiresIn: tokenObject.expires});
      } 
      // If password is invalid send error message
      else {
        return res.status(401).json({success: false, error_message: "Invalid Username/Password Combination"})
      }
    })
})

/*
* ------------------ FACEBOOK ------------------ 
*/
router.get('/auth/facebook', passport.authenticate('facebook' , { session: false, scope : ['email'] }));
router.get("/auth/facebook/callback", passport.authenticate("facebook", {
  session: false,
}), 
  (req, res, next) => {
    // Look for user in DB
    User.findOne({ fbID: req.user.id })
    .then((user) => {
      // If no user redirect back to the front end which will not authenticate the user
      if (!user) {
        return res.redirect(process.env.client_url); 
      }
      // Create token
      const tokenObject = jwtUtils.issueJWT(user);

      // Send token as cookie for the front end to use
      res.cookie('token', tokenObject.token); 

      // Redirect to front end home page
      res.redirect(process.env.client_url); 
    })
  }
);

/*
* ------------------ ERROR ------------------ 
*/
router.get('/error', isLoggedIn, (req,res) => {
  res.send("Error");
});

/*
* ------------------ LOGOUT ------------------ 
*/
router.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.clearCookie("token"); // Delete token from cookies
    res.status(200).json('User Logged Out');
  });
})

// Function to check if user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json('Unauthenticated')
}

module.exports = router;
