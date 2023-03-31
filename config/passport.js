const passport = require('passport');
const User = require('../models/user');
const { validatePassword } = require('../utils/passwordUtils');
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
var FacebookStrategy = require('passport-facebook');
require('dotenv').config();

const jwtStrategy = new JWTStrategy(
    {
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.jwt_secret, 
    },
    (payload, done) => {
        User.findOne({_id: payload.sub})
        .then((user) => {
            if(user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        })
        .catch(err => done(err, null));
    }
);
passport.use(jwtStrategy);

passport.use(new LocalStrategy(function (username, password, done) {
    User.findOne({ username: username })
        .then((user) => {

            if (user === null) {
                return done(null);
            }

            const isValid = validatePassword(password, user.hash, user.salt);

            if (isValid) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        })
        .catch((err) => {
            return done(err);
        }) 
}))

// Serialize
passport.serializeUser((user, done) => {
    done(null, user.id);
});
  
// Deserialize 
passport.deserializeUser((userId, done) => {
    User.findById(userId)
        .then((user) => {
            done(null, user);
        })
        .catch(err => done(err))
});

// Facebook Strategy
passport.use(new FacebookStrategy({
    clientID: process.env.fb_id,
    clientSecret: process.env.fb_secret,
    callbackURL: process.env.fb_callback_url, // TODO: CHANGE IN DEPLOYMENT
    profileFields: ['id', 'displayName', 'name', 'gender', 'picture.type(large)', 'email']
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
                        email,
                        jwtoken: `Bearer ${accessToken}`
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