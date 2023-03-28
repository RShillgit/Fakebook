var express = require('express');
var router = express.Router();
const passport = require('passport');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// GET LOGIN
router.get('/login', (req, res, next) => {
  res.render('login')
})

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
  req.logout();
  res.redirect('/login')
})

// Checks if user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
}

module.exports = router;
