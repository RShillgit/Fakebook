const passport = require('passport');
const User = require('../models/user');
require('dotenv').config();

const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

var FacebookStrategy = require('passport-facebook');


/**
* JWT Strategy
const jwtOptions = {
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.secret_string, 
};
const jwtStrategy = new JWTStrategy(jwtOptions, (payload, done) => {
    User.findOne({_id: payload.sub})
        .then((user) => {
            if(user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        })
        .catch(err => done(err, null));
});
passport.use(jwtStrategy);

passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
passport.deserializeUser((userId, done) => {
    User.findById(userId)
        .then((user) => {
            done(null, user);
        })
        .catch(err => done(err))
});
*/

passport.serializeUser(function (user, cb) {
    cb(null, user);
});
  
passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});

passport.use(new FacebookStrategy({
    clientID: process.env.fb_id,
    clientSecret: process.env.fb_secret,
    callbackURL: process.env.fb_callback_url, 
    profileFields: ['id', 'emails', 'name']
    },

    function(accessToken, refreshToken, profile, done) {
        const id = profile.id;
        const name = profile.displayName;
        const email = profile.emails[0].value;

        User.findOne({ fbID: id })
            .then((user) => {

                // If the Facebook account has not logged in to this app before, create a
                // new user record and link it to the Facebook account.
                if (!user) {
                    const user = new User({
                        fbID : id , 
                        name, 
                        email
                    });
                    user.save()
                        .then(console.log('Facebook profile data stored in database'))
                        .catch(err => console.log(err))
                }
            })
            .catch(err => console.log(err))

        done(null, profile);
    }
));